#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>

// ==========================================
// 🌐 INSFORGE — URLs de producción en la nube
// ==========================================
const String BASE = "https://hy3va9vj.functions.insforge.app";

const String urlPing       = BASE + "/iot-ping";
const String urlTelemetria = BASE + "/telemetry-ingest";
const String urlDescubrir  = BASE + "/iot-discover";
// urlControl se construye en setup() después de generar corePIN

String urlControl = "";

// --- PINES FÍSICOS DE LA PCB (EasyEDA) ---
const int LED_VERDE    = 12;
const int LED_AMARILLO = 13;
const int LED_ROJO     = 14;
const int BUZZER       = 27;

// Relés de potencia
const int RELE_1 = 26; // Corte de Máquina
const int RELE_2 = 25; // Extractores
const int RELE_3 = 33; // Sirena
const int RELE_4 = 32; // Luces de seguridad

// --- ESTADOS Y TEMPORIZADORES ---
String corePIN = "";
unsigned long ultimoLatido = 0;
const long intervaloLatido = 10000; // Ping cada 10s

unsigned long tiempoAnteriorControl = 0;
const long intervaloControl = 2000; // Consulta a la BD cada 2s

String mensajeNube = "";
bool hayMensajeNube = false;
uint8_t macNodoPendiente[6];
bool hayNuevoNodo = false;

// ==========================================
// 🔒 Cliente HTTPS (sin verificación de cert para demo)
// ==========================================
WiFiClientSecure secureClient;

// Helper para POST con HTTPS
int httpsPost(const String& url, const String& body) {
  HTTPClient http;
  secureClient.setInsecure();
  http.begin(secureClient, url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  http.end();
  return code;
}

// Helper para GET con HTTPS, devuelve el body
String httpsGet(const String& url) {
  HTTPClient http;
  secureClient.setInsecure();
  http.begin(secureClient, url);
  int code = http.GET();
  String payload = "";
  if (code == 200) payload = http.getString();
  http.end();
  return payload;
}

// ==========================================
// 📡 CALLBACK ESP-NOW (Recepción de Satélites)
// ==========================================
void OnDataRecv(const esp_now_recv_info_t *esp_now_info, const uint8_t *incomingData, int len) {
  String jsonRecibido = "";
  for (int i = 0; i < len; i++) {
    jsonRecibido += (char)incomingData[i];
  }

  JsonDocument doc;
  if(!deserializeJson(doc, jsonRecibido)) {
    String accion = doc["accion"].as<String>();

    if (accion == "emparejamiento") {
      memcpy(macNodoPendiente, esp_now_info->src_addr, 6);
      hayNuevoNodo = true;
    } else if (accion == "telemetria") {
      char macStr[18];
      snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
               esp_now_info->src_addr[0], esp_now_info->src_addr[1], esp_now_info->src_addr[2],
               esp_now_info->src_addr[3], esp_now_info->src_addr[4], esp_now_info->src_addr[5]);
      doc["mac_origen"] = String(macStr);
      doc["sectorId"]   = corePIN;  // Para que InsForge resuelva el company_id
      serializeJson(doc, mensajeNube);
      hayMensajeNube = true;
    }
  }
}

// ==========================================
// 🚀 SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  // 1. Configuración de Pines
  pinMode(LED_VERDE, OUTPUT); pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);  pinMode(BUZZER, OUTPUT);
  pinMode(RELE_1, OUTPUT);    pinMode(RELE_2, OUTPUT);
  pinMode(RELE_3, OUTPUT);    pinMode(RELE_4, OUTPUT);

  digitalWrite(LED_VERDE, HIGH); digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_ROJO, LOW);   digitalWrite(BUZZER, LOW);
  digitalWrite(RELE_1, LOW);     digitalWrite(RELE_2, LOW);
  digitalWrite(RELE_3, LOW);     digitalWrite(RELE_4, LOW);

  // 2. Generar PIN de Core
  String mac = WiFi.macAddress();
  mac.replace(":", "");
  corePIN = "KY-" + mac.substring(mac.length() - 4);
  corePIN.toUpperCase();

  // 3. Construir URL de control con sectorId
  urlControl = BASE + "/iot-control?sectorId=" + corePIN;

  Serial.println("\n=================================");
  Serial.println("🚀 INICIANDO KYROSYS CORE v2");
  Serial.println("🔑 PIN DEL DISPOSITIVO: " + corePIN);
  Serial.println("☁️  Backend: InsForge (nube)");
  Serial.println("=================================");

  // 4. Portal Cautivo Wi-Fi
  WiFiManager wm;
  String apName = "KYROS_" + corePIN;

  // wm.resetSettings(); // Descomenta para borrar credenciales Wi-Fi guardadas

  Serial.println("Iniciando conexión Wi-Fi o creando Portal Cautivo...");
  if (!wm.autoConnect(apName.c_str(), "kyrosadmin")) {
    Serial.println("Fallo al conectar. Reiniciando...");
    delay(3000);
    ESP.restart();
  }

  Serial.println("\n✅ ¡Conectado al Wi-Fi!");
  Serial.print("📡 IP Local: "); Serial.println(WiFi.localIP());
  Serial.print("📡 Canal Wi-Fi: "); Serial.println(WiFi.channel());

  // 5. Iniciar ESP-NOW asegurando el mismo canal que el Wi-Fi
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error inicializando ESP-NOW");
    return;
  }
  esp_now_register_recv_cb(OnDataRecv);
}

// ==========================================
// 🔄 LOOP PRINCIPAL
// ==========================================
void loop() {
  unsigned long tiempoActual = millis();

  // --- A. WATCHDOG PING (Supervivencia) ---
  if (WiFi.status() == WL_CONNECTED && (tiempoActual - ultimoLatido >= intervaloLatido)) {
    ultimoLatido = tiempoActual;
    String body = "{\"sectorId\":\"" + corePIN + "\"}";
    int code = httpsPost(urlPing, body);
    if (code > 0) Serial.println("💓 Latido enviado → InsForge (código: " + String(code) + ")");
    else Serial.println("⚠️  Error de latido: " + String(code));
  }

  // --- B. PLUG & PLAY (Handshake con nuevo satélite) ---
  if (hayNuevoNodo) {
    hayNuevoNodo = false;

    esp_now_peer_info_t peerInfo = {};
    memcpy(peerInfo.peer_addr, macNodoPendiente, 6);
    peerInfo.channel = 0;
    peerInfo.encrypt = false;
    if (!esp_now_is_peer_exist(macNodoPendiente)) esp_now_add_peer(&peerInfo);

    JsonDocument docConf;
    docConf["accion"] = "confirmacion";
    String jsonConfirmacion;
    serializeJson(docConf, jsonConfirmacion);
    esp_now_send(macNodoPendiente, (uint8_t *)jsonConfirmacion.c_str(), jsonConfirmacion.length());

    if (WiFi.status() == WL_CONNECTED) {
      char macStr[18];
      snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
               macNodoPendiente[0], macNodoPendiente[1], macNodoPendiente[2],
               macNodoPendiente[3], macNodoPendiente[4], macNodoPendiente[5]);

      JsonDocument docAviso;
      docAviso["mac"] = String(macStr);
      docAviso["tipo"] = "Módulo Satélite ESP-NOW";
      String jsonAviso;
      serializeJson(docAviso, jsonAviso);

      httpsPost(urlDescubrir, jsonAviso);
      Serial.println("🔌 Nuevo nodo reportado a InsForge.");
    }
  }

  // --- C. PROCESAMIENTO FÍSICO DE TELEMETRÍA ---
  if (hayMensajeNube && WiFi.status() == WL_CONNECTED) {
    hayMensajeNube = false;

    JsonDocument docFisico;
    deserializeJson(docFisico, mensajeNube);
    String tipo = docFisico["tipo"].as<String>();
    int valor = docFisico["valor"].as<int>();

    // Reseteamos visualización local
    digitalWrite(LED_VERDE, HIGH); digitalWrite(LED_AMARILLO, LOW);
    digitalWrite(LED_ROJO, LOW);   digitalWrite(BUZZER, LOW);
    digitalWrite(RELE_1, LOW);     digitalWrite(RELE_2, LOW);
    digitalWrite(RELE_3, LOW);     digitalWrite(RELE_4, LOW);

    // EVALUACIÓN DE RIESGOS (Tolerancia a fallos local)
    if (tipo == "humo" && valor > 200) {
      digitalWrite(LED_VERDE, LOW);  digitalWrite(LED_ROJO, HIGH);
      digitalWrite(BUZZER, HIGH);    digitalWrite(RELE_1, HIGH);
      digitalWrite(RELE_2, HIGH);    digitalWrite(RELE_3, HIGH);
    } else if (tipo == "temperatura" && valor > 35) {
      digitalWrite(LED_VERDE, LOW);  digitalWrite(LED_AMARILLO, HIGH);
      digitalWrite(RELE_2, HIGH);
    } else if (tipo == "movimiento" && valor == 1) {
      digitalWrite(LED_VERDE, LOW);  digitalWrite(LED_ROJO, HIGH);
      digitalWrite(BUZZER, HIGH);    digitalWrite(RELE_3, HIGH);
      digitalWrite(RELE_4, HIGH);
    }

    // Subir a InsForge
    httpsPost(urlTelemetria, mensajeNube);
    Serial.println("📤 Telemetría subida a InsForge: " + mensajeNube);
  }

  // --- D. RECIBIR OVERRIDE MANUAL (Panel de Automatización React) ---
  if (WiFi.status() == WL_CONNECTED && (tiempoActual - tiempoAnteriorControl >= intervaloControl)) {
    tiempoAnteriorControl = tiempoActual;

    String payload = httpsGet(urlControl);
    if (payload.length() > 0) {
      JsonDocument docControl;
      if (!deserializeJson(docControl, payload)) {
        digitalWrite(RELE_1, docControl["1"].as<bool>() ? HIGH : LOW);
        digitalWrite(RELE_2, docControl["2"].as<bool>() ? HIGH : LOW);
        digitalWrite(RELE_3, docControl["3"].as<bool>() ? HIGH : LOW);
        digitalWrite(RELE_4, docControl["4"].as<bool>() ? HIGH : LOW);
      }
    }
  }
}
