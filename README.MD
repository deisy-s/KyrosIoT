# KYROS Web Platform - Dashboard Industrial

Interfaz gráfica de usuario (GUI) para la gestión, monitorización y control de la planta industrial. Diseñada con React, Vite y Tailwind CSS, ofreciendo una experiencia moderna, rápida y adaptable.

## 🟢 Funcionalidades Implementadas (Core Funcional)

* **Dashboard de Telemetría:** Visualización de métricas en tiempo real. Integración de gráficos SVG dinámicos conectados a la API que dibujan curvas de temperatura históricas.
* **Monitor de Dispositivos Activos:** Algoritmo que filtra direcciones MAC únicas provenientes de la base de datos para mostrar el número real de sensores operando en la planta.
* **Panel de Automatización (Override):** Interfaz industrial de control bidireccional. Permite al usuario accionar visualmente actuadores críticos y enviar la señal de activación/corte a la placa PCB física a través del backend.
* **Enrutamiento (React Router):** Navegación fluida entre las vistas de Dashboard, Telemetría, Automatización y submódulos de gestión.

## 🟡 Pendientes y Roadmap (Visión Comercial y Escalabilidad)

* **Widgets Dinámicos:** Refactorizar el panel principal para permitir al usuario agregar, mover o eliminar tarjetas de métricas según sus preferencias, reemplazando la cuadrícula estática actual.
* **Gestión de Sectores y Monitoreo de Conexión:** * Asignar visual y lógicamente cada KYROS Core v1 como un "Sector" independiente.
  * Implementar alertas visuales inmediatas en caso de pérdida de comunicación (desconexión) con un Core específico.
* **Onboarding Plug & Play de Nodos:** Crear un flujo de notificaciones donde el KYROS Core avise autónomamente a la interfaz web cuando detecte un nuevo módulo sensor en la zona. La UI debe permitir registrarlo, nombrarlo y comenzar su monitoreo continuo (incluyendo alertas de caída del sensor).
* **Creador de Automatizaciones Personalizadas:** Desarrollar un panel donde el usuario pueda registrar nuevas reglas lógicas (Ej. "Si Humedad > 60%, encender Relé 2"), en lugar de depender de reglas hardcodeadas.
* **Módulo Premium (Big Data & IA):** * Integrar automatizaciones inteligentes que analicen los últimos meses de operaciones para tomar decisiones predictivas (Ej. Mantenimiento preventivo).
  * Exclusivo para la capa Premium.
* **Gestor de Suscripciones (Paywall):** Implementar una sección de facturación clara que defina las limitantes del plan Gratuito y desbloquee las analíticas avanzadas del plan Premium.
* **Despliegue a Producción:** Subir la aplicación final compilada a Vercel o Netlify vinculando las variables de entorno a la API pública.