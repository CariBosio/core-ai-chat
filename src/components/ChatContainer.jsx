import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "./ChatStyles.css";

import chocoVideoWelcome from "../assets/Choco_welcome_square.mp4";
import chocoVideoGoodbye from "../assets/Choco_goodbye_square.mp4";
import chocoStaticAvatarIcon from "../assets/Choco_frame.png";

const N8N_WEBHOOK_URL =
  "https://n8n-production-2cc1.up.railway.app/webhook/chat-agente";

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // "preload" -> "welcome" -> "chat" -> "goodbye"
  const [introStage, setIntroStage] = useState("preload");
  const [showRestartButton, setShowRestartButton] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const modalRef = useRef(null);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const chocoVideoRef = useRef(null);
  const chocoGoodbyeRef = useRef(null);
  const inputRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const startExperience = () => {
    setIntroStage("welcome");

    setTimeout(() => {
      if (chocoVideoRef.current) {
        chocoVideoRef.current.muted = false;
        chocoVideoRef.current.volume = 1.0;
        chocoVideoRef.current
          .play()
          .catch((err) => console.log("El navegador bloqueó el audio:", err));

        const tl = gsap.timeline();

        tl.fromTo(
          chocoVideoRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.1)" },
        );

        tl.to(chocoVideoRef.current, {
          duration: 8,
          onStart: () => {
            chocoVideoRef.current.play().catch(() => {});
          },
        });

        tl.to(chocoVideoRef.current, {
          top: "135px",
          left: "32px",
          width: "44px",
          height: "44px",
          duration: 0.9,
          ease: "power2.inOut",
          onComplete: () => {
            if (chocoVideoRef.current) {
              chocoVideoRef.current.pause();
            }

            setMessages([
              {
                id: 1,
                sender: "agent",
                text: "Por favor, para comenzar, decime tu nombre y apellido completo.",
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);

            setIntroStage("chat");
            resetInactivityTimer();

            setTimeout(() => {
              inputRef.current?.focus();
            }, 50);
          },
        });
      }
    }, 50);
  };

  const triggerGoodbyeSequence = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    setShowRestartButton(false);
    setIntroStage("goodbye");

    setTimeout(() => {
      if (chocoGoodbyeRef.current) {
        chocoGoodbyeRef.current.muted = false;
        chocoGoodbyeRef.current.volume = 1.0;
        chocoGoodbyeRef.current.play().catch(() => {});

        gsap.fromTo(
          chocoGoodbyeRef.current,
          {
            position: "absolute",
            top: "135px",
            left: "32px",
            width: "44px",
            height: "44px",
            scale: 1,
            opacity: 0,
          },
          {
            top: "50%",
            left: "50%",
            xPercent: -50,
            yPercent: -50,
            width: "400px",
            height: "400px",
            opacity: 1,
            duration: 0.8,
            ease: "power2.inOut",
          },
        );
      }
    }, 50);
  };

  const handleGoodbyeTimeUpdate = () => {
    if (chocoGoodbyeRef.current) {
      const currentTime = chocoGoodbyeRef.current.currentTime;
      if (currentTime >= 6.5) {
        setShowRestartButton(true);
      }
    }
  };

  const resetToChatMode = () => {
    setShowRestartButton(false);

    if (chocoGoodbyeRef.current) {
      gsap.to(chocoGoodbyeRef.current, {
        top: "135px",
        left: "32px",
        xPercent: 0,
        yPercent: 0,
        width: "44px",
        height: "44px",
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          setIntroStage("chat");
          resetInactivityTimer();
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        },
      });
    } else {
      setIntroStage("chat");
      resetInactivityTimer();
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    if (introStage === "chat") {
      inactivityTimerRef.current = setTimeout(() => {
        triggerGoodbyeSequence();
      }, 60000);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    const userText = inputValue.trim();
    setInputValue("");

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

    const cleanText = userText
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=_`~()-]/g, "")
      .trim();

    const esNegativa =
      cleanText === "no" ||
      cleanText.startsWith("no ") ||
      cleanText.includes("nada mas") ||
      cleanText.includes("eso es todo") ||
      cleanText.includes("chau") ||
      cleanText.includes("adios") ||
      cleanText.includes("listo");

    if (esNegativa) {
      setTimeout(() => {
        triggerGoodbyeSequence();
      }, 800);
      return;
    }

    setIsTyping(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: userText }),
      });

      if (!response.ok) throw new Error("Error de red al conectar con n8n");

      const data = await response.json();
      const actualData = Array.isArray(data) ? data[0] : data;

      const agentText =
        actualData.output ||
        (actualData.body && actualData.body.output) ||
        actualData.response ||
        actualData.text ||
        "No se recibió una respuesta estructurada.";

      const finalAgentMsg = {
        id: Date.now() + 1,
        sender: "agent",
        text: agentText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, finalAgentMsg]);

      resetInactivityTimer();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error("Error de comunicación con n8n:", error);
      setIsTyping(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  useEffect(() => {
    if (!modalRef.current) return;

    // Buscamos el panel interno para animarlo de forma independiente
    const sidebarMobile = modalRef.current.querySelector(".sidebar-mobile");

    if (showInfoModal) {
      // 🚀 ANIMACIÓN DE ENTRADA
      // 1. Forzamos a que el contenedor principal sea visible
      gsap.set(modalRef.current, { display: "flex" });

      // 2. Animamos el fondo negro (fade in)
      gsap.to(modalRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      // 3. El panel lateral aparece desde la derecha con un leve rebote
      gsap.fromTo(
        sidebarMobile,
        { x: "100%" },
        { x: "0%", duration: 0.5, ease: "back.out(1)" },
      );
    } else {
      // 🍂 ANIMACIÓN DE SALIDA
      const tl = gsap.timeline({
        onComplete: () => {
          // Cuando termina de ocultarse, lo sacamos del flujo visual
          gsap.set(modalRef.current, { display: "none" });
        },
      });

      // El panel se va a la derecha y el fondo se desvanece en simultáneo
      tl.to(
        sidebarMobile,
        { x: "100%", duration: 0.4, ease: "power2.in" },
        0,
      ).to(
        modalRef.current,
        { opacity: 0, duration: 0.4, ease: "power2.in" },
        0,
      );
    }
  }, [showInfoModal]);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <h1 className="project-title">Core.AI</h1>
          <span className="project-tag">ONE | INMERSIÓN AGENTES DE IA</span>
        </div>
        <div className="meta-group">
          <div className="meta-item">
            <span className="meta-label">Orquestador</span>
            <span className="meta-value status-online">n8n Webhook</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Base de Datos</span>
            <span className="meta-value">MySQL / Railway</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Arquitectura</span>
            <span className="meta-value">React / Vite</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Animaciones</span>
            <span className="meta-value">GSAP / CSS</span>
          </div>
        </div>
        <footer className="sidebar-footer">
          <p>
            Interfaz customizada lista para pruebas en vivo de agentes de IA
            aplicados a Recursos Humanos.
          </p>
        </footer>
      </aside>

      <main className="chat-workspace">
        <header className="chat-header">
          <div className="agent-profile">
            <div className="pulse-indicator"></div>
            <div>
              <h2>Agente Autónomo - ChocolaTech</h2>
              <p>
                {introStage === "goodbye"
                  ? "Conversación finalizada"
                  : isTyping
                    ? "Escribiendo..."
                    : "En línea • Listo para interactuar"}
              </p>
            </div>
          </div>
          {/* 👁️ Opcional 1: El botón "i" SOLO aparece cuando ya se puede chatear */}
          {introStage === "chat" && (
            <button
              type="button"
              className="info-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setShowInfoModal(true);
              }}
            >
              i
            </button>
          )}
        </header>

        {/* ESTADO PRELOAD */}
        {introStage === "preload" && (
          <div className="preload-overlay">
            <video
              src={chocoVideoWelcome}
              muted
              playsInline
              className="choco-permanent-fly-avatar"
            />
            <button
              type="button"
              className="start-experience-button"
              onClick={startExperience}
            >
              Comenzar
            </button>
          </div>
        )}

        {/* ESTADO WELCOME */}
        {introStage === "welcome" && (
          <video
            ref={chocoVideoRef}
            src={chocoVideoWelcome}
            autoPlay
            playsInline
            className="choco-permanent-fly-avatar"
          />
        )}

        {/* ESTADO GOODBYE */}
        {introStage === "goodbye" && (
          <div className="goodbye-overlay">
            <video
              ref={chocoGoodbyeRef}
              src={chocoVideoGoodbye}
              playsInline
              className="choco-goodbye-avatar"
              onTimeUpdate={handleGoodbyeTimeUpdate}
              style={{
                position: "absolute",
                top: "135px",
                left: "32px",
                width: "44px",
                height: "44px",
                opacity: 0,
              }}
            />

            {showRestartButton && (
              <button
                type="button"
                className="restart-chat-button"
                onClick={resetToChatMode}
              >
                Nueva consulta
              </button>
            )}
          </div>
        )}

        <div className="messages-container" ref={containerRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              {msg.sender === "agent" && (
                <div className="choco-avatar-mini-inline">
                  <img
                    src={chocoStaticAvatarIcon}
                    alt="Choco"
                    className="choco-mini-img"
                  />
                </div>
              )}
              <div className="message-bubble-wrapper">
                <div className="message-bubble">
                  <p>{msg.text}</p>
                </div>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-row agent typing-row">
              <div className="choco-avatar-mini-inline">
                <img
                  src={chocoStaticAvatarIcon}
                  alt="Choco"
                  className="choco-mini-img"
                />
              </div>
              <div className="message-bubble-wrapper">
                <div className="message-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="chat-footer">
          <form onSubmit={handleSend} className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              onKeyDown={resetInactivityTimer}
              placeholder={
                introStage === "goodbye"
                  ? "Sesión finalizada."
                  : "Escribe un mensaje para el agente..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={
                isTyping ||
                introStage === "welcome" ||
                introStage === "preload" ||
                introStage === "goodbye"
              }
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputValue.trim() || isTyping || introStage !== "chat"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </footer>
      </main>

      {/* 💡 CORRECCIÓN CRÍTICA: El modal ahora vive en la raíz del app-container */}
      <div
        ref={modalRef}
        className="info-overlay"
        onClick={() => setShowInfoModal(false)}
        style={{ display: "none", opacity: 0 }} // Arranca oculto
      >
        <aside className="sidebar-mobile" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="close-sidebar"
            onClick={() => setShowInfoModal(false)}
          >
            X
          </button>
          <h3
            style={{
              color: "var(--accent-color)",
              marginBottom: "16px",
              fontSize: "1.2rem",
            }}
          >
            Información del Sistema
          </h3>
          <div className="meta-group">
            <div className="meta-item">
              <span className="meta-label">Orquestador</span>
              <span className="meta-value status-online">n8n Webhook</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Base de Datos</span>
              <span className="meta-value">MySQL / Railway</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Arquitectura</span>
              <span className="meta-value">React / Vite</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Animaciones</span>
              <span className="meta-value">GSAP / CSS</span>
            </div>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: "20px",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            Core.AI - Asistente virtual autónomo para la gestión de consultas de
            Recursos Humanos en ChocolaTech.
          </p>
        </aside>
      </div>
    </div>
  );
}
