import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap"; // Importamos GSAP
import "./ChatStyles.css";

// 1. Declaramos la URL del Webhook de PRODUCCIÓN de tu n8n
const N8N_WEBHOOK_URL = "https://n8n-production-2cc1.up.railway.app/webhook/chat-agente";

export default function ChatContainer() {
  // Dejamos solo el mensaje de bienvenida para arrancar limpios
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "agent",
      text: "¡Hola! 👋 Soy Choco, tu asistente virtual de Recursos Humanos. Por favor, para comenzar, decime tu nombre y apellido completo.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Estado para los puntitos de carga de la IA
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null); // Ref para el contenedor principal de mensajes

  // Auto-scroll al recibir mensajes nuevos o cambiar el estado de carga
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // EFECTO GSAP: Animar el último mensaje que ingresa al DOM (o el indicador de carga)
  useEffect(() => {
    if (containerRef.current) {
      const messageRows = containerRef.current.querySelectorAll(".message-row");
      if (messageRows.length > 0) {
        const lastMessage = messageRows[messageRows.length - 1];

        gsap.fromTo(
          lastMessage,
          {
            opacity: 0,
            y: 20,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.4)",
          },
        );
      }
    }
  }, [messages, isTyping]);

  // Función asíncrona conectada a n8n
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setInputValue("");

    // A. Renderizar el mensaje del usuario en la pantalla
    const newMsg = {
      id: Date.now(),
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMsg]);

    // B. Activar los tres puntitos del loader del agente
    setIsTyping(true);

    try {
      // C. Envío de datos HTTP POST a n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatInput: userText }),
      });

      if (!response.ok) throw new Error("Error de red al conectar con n8n");

      const data = await response.json();

      // LOG TEMPORAL: Para inspeccionar el objeto real en la consola de desarrollo (F12)
      console.log("Datos recibidos de n8n:", data);

      // 1. n8n suele devolver un array de objetos [{...}]. Si es así, extraemos el primero de forma segura.
      const actualData = Array.isArray(data) ? data[0] : data;

      // 2. Extraer la respuesta priorizando la raíz que ya validamos con éxito en la consola
      const agentText =
        actualData.output || // Salida directa estándar del nodo AI Agent
        (actualData.body && actualData.body.output) || // Por si viniera anidado en el body
        actualData.response || // Variación común según modelo de chat
        actualData.text || // Formato alternativo de texto plano
        "No se recibió una respuesta estructurada.";

      // E. Renderizar la respuesta de la IA en la interfaz
      const agentMsg = {
        id: Date.now() + 1,
        sender: "agent",
        text: agentText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error("Error de comunicación con n8n:", error);
      // Mensaje de feedback visual con instrucciones para el entorno de producción
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "agent",
          text: '⚠️ Ocurrió un error al intentar comunicar con n8n. Asegúrate de que el flujo general esté activado (en modo "Active / Published").',
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      // F. Apagar el loader de los puntitos
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Informativa */}
      <aside className="sidebar">
        <div className="brand">
          <h1 className="project-title">Core.AI</h1>
          <span className="project-tag">ONE Immersion Agent</span>
        </div>

        <div className="meta-group">
          <div className="meta-item">
            <span className="meta-label">Conectividad</span>
            <span className="meta-value status-online">n8n Webhook</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Arquitectura</span>
            <span className="meta-value">React / Next.js</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Animaciones</span>
            <span className="meta-value">GSAP / CSS</span>
          </div>
        </div>

        <footer className="sidebar-footer">
          <p>
            Interfaz customizada lista para pruebas en vivo de agentes de IA.
          </p>
        </footer>
      </aside>

      {/* Panel del Chat */}
      <main className="chat-workspace">
        <header className="chat-header">
          <div className="agent-profile">
            <div className="pulse-indicator"></div>
            <div>
              <h2>Agente Autónomo</h2>
              <p>
                {isTyping
                  ? "Escribiendo..."
                  : "En línea • Listo para interactuar"}
              </p>
            </div>
          </div>
        </header>

        {/* Contenedor de Mensajes */}
        <div className="messages-container" ref={containerRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              <div className="message-bubble">
                <p>{msg.text}</p>
              </div>
              <span className="message-time">{msg.time}</span>
            </div>
          ))}

          {/* 🔥 Nuevo: Burbuja con los tres puntos de carga */}
          {isTyping && (
            <div className="message-row agent typing-row">
              <div className="message-bubble typing-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <footer className="chat-footer">
          <form onSubmit={handleSend} className="input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder={
                isTyping
                  ? "Procesando respuesta..."
                  : "Escribe un mensaje para el agente..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping} // Bloquear input mientras piensa la IA
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputValue.trim() || isTyping}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
