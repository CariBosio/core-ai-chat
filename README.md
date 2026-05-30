



# Choco: Agente de IA para RRHH
Asistente virtual autónomo diseñado para la gestión de consultas de Recursos Humanos en **ChocolaTech**. 

<img src="src/assets/Choco_frame.png" width="200" alt="Avatar de Choco">

## 🚀 Acerca del Proyecto
Choco nació durante la **Inmersión en Agentes de IA de Alura Latam y ONE Oracle Next Education**. Ante las dificultades técnicas para implementar la integración con Telegram, este proyecto evolucionó hacia una **aplicación web propia**, permitiéndome integrar mi formación en Psicología con el desarrollo Frontend y la Inteligencia Artificial.

El objetivo fue crear un asistente que no solo sea funcional, sino **empático y seguro**, implementando un flujo de validación "anti-ansiedad" que prioriza la experiencia del usuario (UX) antes de procesar información sensible.

## 🛠️ Stack Tecnológico
*   **Frontend:** React, Vite, JavaScript, CSS Moderno (@scope), GSAP (animaciones).
*   **Backend & Orquestación:** n8n (flujos de IA), Railway (MySQL Database).
*   **Despliegue:** Vercel.

## 🧠 Características Principales
*   **Validación de Identidad:** Flujo conversacional que asegura la autenticación del usuario antes de exponer datos.
*   **Contexto Híbrido:** Integración inteligente que combina una **Base de Conocimientos (RAG)** para políticas generales y consultas dinámicas a **MySQL** para datos personales de empleados.
*   **UX Responsiva:** Interfaz optimizada para dispositivos móviles, garantizando fluidez incluso durante la interacción con teclados virtuales.

## 📽️ Demo Visual

## Demo Desktop

https://github.com/user-attachments/assets/e9c59d07-1cfc-4ae0-bf86-5f4b4548cdb3

## Demo Mobile

https://github.com/user-attachments/assets/238b9c5f-7bef-4c9a-a2b7-bdca0d71be3e


## 📂 Estructura del Repositorio
*   `/src`: Código fuente del frontend (React).
*   `/assets`: Animaciones y componentes de diseño.
*   `/database`: `schema.sql` (Estructura de la tabla de empleados).
*   `/n8n`: `workflow.json` (Flujo lógico de orquestación - *Nota: sin credenciales*).

## 🚀 Cómo probarlo
Puedes interactuar con Choco en tiempo real aquí:
👉 **[URL de la app](https://core-ai-chat.vercel.app/)**

**Datos de prueba:**
Puedes consultar por empleados como: *"Juan Silva"*, *"Ana Lima"*, *"Bruno Álvarez"*.
*Tip: Para cambiar de empleado en la misma sesión, escribe "Quiero consultar por otra persona".*

## 💡 Sobre el Diseño Conversacional
Como profesional de la psicología, el diseño de Choco se centró en la **humanización de la tecnología**. La insistencia en la identidad y el tono cálido son decisiones deliberadas de UX para generar confianza y reducir la fricción en entornos corporativos.

---
*Desarrollado por [CariBosio](https://github.com/CariBosio) | Psicóloga + Frontend Developer*
