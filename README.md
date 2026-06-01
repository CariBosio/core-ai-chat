



# Choco: Agente de IA para RRHH
Asistente virtual autónomo diseñado para la gestión de consultas de Recursos Humanos en **ChocolaTech**. 

<img src="src/assets/Choco_frame.png" width="200" alt="Avatar de Choco">

## 🚀 Acerca del Proyecto
Choco nació durante la **Inmersión en Agentes de IA de Alura Latam y ONE Oracle Next Education**. Ante las dificultades técnicas para implementar la integración con Telegram, este proyecto evolucionó hacia una **aplicación web propia**, permitiéndome integrar mi formación en Psicología con el desarrollo Frontend y la Inteligencia Artificial.

El objetivo fue crear un asistente que no solo sea funcional, sino **empático y seguro**, implementando un flujo de validación "anti-ansiedad" que prioriza la experiencia del usuario (UX) antes de procesar información sensible.

## 🛠️ Stack Tecnológico
| **Frontend** | React, Vite, JavaScript, CSS Moderno (@scope), GSAP |
| **Orquestación** | n8n (flujos de IA) |
| **IA & Lenguaje** | Cohere (LLM + Embeddings) |
| **Base de Datos** | MySQL (alojada en Railway) |
| **Despliegue** | Vercel |

## 🧠 Características Principales
*   **Validación de Identidad:** Flujo conversacional que asegura la autenticación del usuario antes de exponer datos.
*   **Contexto Híbrido:** Integración inteligente que combina una **Base de Conocimientos (RAG)** para políticas generales y consultas dinámicas a **MySQL** para datos personales de empleados.
*   **UX Responsiva:** Interfaz optimizada para dispositivos móviles, garantizando fluidez incluso durante la interacción con teclados virtuales.

## 🏗️ Arquitectura del Flujo (n8n)
El asistente utiliza un flujo en n8n diseñado para priorizar la seguridad, requiriendo validación de identidad antes de acceder a herramientas de base de datos.

<img width="1396" height="693" alt="Workflow n8n" src="https://github.com/user-attachments/assets/8e1a17bf-2dc2-42e0-9aef-2748ee077878" />

## 📂 Estructura del Repositorio
*   `/src`: Código fuente del frontend (React).
*   `/assets`: Animaciones y componentes de diseño.
*   `/database`: `schema.sql` (Estructura de la tabla de empleados).
*   `/n8n`: `workflow.json` (Flujo lógico de orquestación - *Nota: sin credenciales*).

## 💡 Desafíos Técnicos
*   **Humanización:** Aplicación de conceptos psicológicos para reducir la fricción en la interacción máquina-humano.
*   **Seguridad:** Implementación de reglas de validación estricta para evitar la exposición de datos personales sin autenticación previa.
*   **Integración:** Orquestación de múltiples servicios (MySQL + Vector Store) dentro de un único agente conversacional.

## 📽️ Demo Visual

## Experiencia en Desktop
<a href="https://github.com/user-attachments/assets/d32442ff-57a9-420e-b9b4-a317f493ea0f" target="_blank" rel="noopener noreferrer">
  <img width="600" src="https://github.com/user-attachments/assets/304581ec-7403-4870-a4e6-172702a3fe8b" alt="Demo Desktop">
</a>
<p>
  <i><small>Haz clic para ver el video (o presiona Ctrl + Clic para abrir en una pestaña nueva).</small></i>
</p>

### Experiencia en Mobile
<a href="https://github.com/user-attachments/assets/238b9c5f-7bef-4c9a-a2b7-bdca0d71be3e" target="_blank" rel="noopener noreferrer">
  <img width="300" src="https://github.com/user-attachments/assets/18c27a70-30cf-4588-b45e-17a0c486f04e" alt="Demo Mobile">
</a>
<p>
  <i><small>Haz clic para ver el video (o presiona Ctrl + Clic para abrir en una pestaña nueva).</small></i>
</p>

## 🚀 Cómo probarlo
Puedes interactuar con Choco en tiempo real aquí:
👉 **[URL de la app](https://core-ai-chat.vercel.app/)**

**Datos de prueba:**
Puedes consultar por empleados como: *"Juan Silva"*, *"Ana Lima"*, *"Bruno Álvarez"*.
*Tip: Para cambiar de empleado en la misma sesión, escribe "Quiero consultar por otra persona".*

---
*Desarrollado por [CariBosio](https://github.com/CariBosio) | Psicóloga + Frontend Developer*
