# KYROS Web Platform - Dashboard Industrial

Interfaz gráfica de usuario (GUI) para la gestión, monitorización y control de la planta industrial. Diseñada con React, Vite y Tailwind CSS, ofreciendo una experiencia moderna, rápida y adaptable.

## 🟢 Funcionalidades Implementadas (Core Funcional)

* **Dashboard de Telemetría:** Visualización de métricas en tiempo real. Integración de gráficos SVG dinámicos conectados a la API que dibujan curvas de temperatura históricas.
* **Monitor de Dispositivos Activos:** Algoritmo que filtra direcciones MAC únicas provenientes de la base de datos para mostrar el número real de sensores operando en la planta.
* **Panel de Automatización (Override):** Interfaz industrial de control bidireccional. Permite al usuario accionar visualmente actuadores críticos y enviar la señal de activación/corte a la placa PCB física a través del backend.
* **Enrutamiento (React Router):** Navegación fluida entre las vistas de Dashboard, Telemetría, Automatización y submódulos de gestión.

## 🟡 Pendientes y Roadmap (Visión Comercial y Escalabilidad)

* **Gestión de Sectores y Monitoreo de Conexión:** 
  * Implementar alertas visuales inmediatas en caso de pérdida de comunicación (desconexión) con un Core específico.
* **Monitoreo de sensores:** 
  * Mostrar datos en tiempo real de módulos sensores
  * Mostrar alertas visuales al detectar valores fuera del valor umbral
  * Verificar conexión entre módulo sensor y módulo hub
* **Onboarding Plug & Play de Nodos:** Crear un flujo de notificaciones donde el KYROS Core avise autónomamente a la interfaz web cuando detecte un nuevo módulo sensor en la zona. La UI debe permitir registrarlo, nombrarlo y comenzar su monitoreo continuo (incluyendo alertas de caída del sensor).
* **Creador de Automatizaciones Personalizadas:** 
  * Desarrollar una interfaz donde el usuario puede seleccionar un sector y sensor para el cual se agrega una regla lógica
  * Vincular automatizaciones con esp32 
* **Despliegue a Producción:** Subir la aplicación final compilada a Render o Vercel