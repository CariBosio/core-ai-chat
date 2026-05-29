import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Info, CircleX } from "lucide-react";
import "./ChatStyles.css";

import chocoVideoWelcome from "../assets/Animated_avatar_3.mp4";
import chocoVideoGoodbye from "../assets/Choco_goodbye.mp4";
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

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [welcomeVideoActive, setWelcomeVideoActive] = useState(false);

  // Preload avatar image to prevent flicker
  useEffect(() => {
    const img = new Image();
    img.src = chocoStaticAvatarIcon;
  }, []);

  // 1. Altura dinámica robusta para móviles (usando visualViewport si está disponible)
  useEffect(() => {
    const doc = document.documentElement;
    const updateHeight = () => {
      const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setWindowHeight(height);
      doc.style.setProperty('--app-height', `${height}px`);
    };
    
    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener('resize', updateHeight);
      viewport.addEventListener('scroll', updateHeight);
    } else {
      window.addEventListener('resize', updateHeight);
    }
    updateHeight();
    
    return () => {
      if (viewport) {
        viewport.removeEventListener('resize', updateHeight);
        viewport.removeEventListener('scroll', updateHeight);
      } else {
        window.removeEventListener('resize', updateHeight);
      }
    };
  }, []);

  // 1b. Bloquear desplazamiento del viewport del navegador para que no empuje el header hacia arriba
  useEffect(() => {
    const preventViewportScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', preventViewportScroll);
    return () => window.removeEventListener('scroll', preventViewportScroll);
  }, []);

  // 2. Scroll inteligente (solo baja si el contenido lo requiere o al cambiar la altura)
  useEffect(() => {
    if (messages.length > 0) {
      const container = containerRef.current;
      if (container && container.scrollHeight > container.clientHeight) {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        });
      }
    }
  }, [messages, isTyping, windowHeight]);

  // 3. Limpieza del timer al desmontar
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  const startExperience = () => {
    setIntroStage("welcome");
    setWelcomeVideoActive(true);

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
          duration: 7.5,
          onStart: () => {
            chocoVideoRef.current.play().catch(() => {});

            gsap.to(chocoVideoRef.current, {
              volume: 0,
              duration: 2,
              delay: 6,
              ease: "power1.out",
            });
          },
        });

        // Callback en la línea de tiempo de GSAP para iniciar el encogimiento y el cambio de vista
        tl.call(() => {
          // Primero renderizamos la vista de chat para poder medir la posición exacta del avatar mini
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

          // Esperamos un tick del render de React para medir la posición del elemento en el DOM
          setTimeout(() => {
            const avatarEl = document.querySelector(".choco-avatar-mini-inline");
            const workspaceEl = document.querySelector(".chat-workspace");

            if (avatarEl && workspaceEl && chocoVideoRef.current) {
              const avatarRect = avatarEl.getBoundingClientRect();
              const workspaceRect = workspaceEl.getBoundingClientRect();

              const targetLeft = avatarRect.left - workspaceRect.left;
              const targetTop = avatarRect.top - workspaceRect.top;
              const targetWidth = avatarRect.width;
              const targetHeight = avatarRect.height;

              // Animamos el video de bienvenida hasta la posición EXACTA calculada
              gsap.to(chocoVideoRef.current, {
                top: `${targetTop}px`,
                left: `${targetLeft}px`,
                width: `${targetWidth}px`,
                height: `${targetHeight}px`,
                duration: 0.9,
                ease: "power2.inOut",
                onComplete: () => {
                  if (chocoVideoRef.current) {
                    chocoVideoRef.current.pause();
                    chocoVideoRef.current.volume = 1.0;
                  }

                  // Transición suave de opacidad del video antes de desmontarlo
                  gsap.to(chocoVideoRef.current, {
                    opacity: 0,
                    duration: 0.15,
                    onComplete: () => {
                      setWelcomeVideoActive(false);
                    },
                  });

                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 50);
                },
              });
            } else {
              // Fallback por si los elementos no están disponibles en el DOM
              gsap.to(chocoVideoRef.current, {
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
                  setWelcomeVideoActive(false);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 50);
                },
              });
            }
          }, 35);
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

    const sidebarMobile = modalRef.current.querySelector(".sidebar-mobile");

    if (showInfoModal) {
      gsap.set(modalRef.current, { display: "flex" });

      gsap.to(modalRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.fromTo(
        sidebarMobile,
        { x: "100%" },
        { x: "0%", duration: 0.5, ease: "back.out(1)" },
      );
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(modalRef.current, { display: "none" });
        },
      });

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

  const handleGoodbyeTimeUpdate = () => {
    if (chocoGoodbyeRef.current) {
      const video = chocoGoodbyeRef.current;
      const { currentTime, duration } = video;

      if (currentTime >= 6.5) {
        setShowRestartButton(true);
      }

      const fadeDuration = 3;
      if (duration - currentTime < fadeDuration) {
        const newVolume = Math.max(0, (duration - currentTime) / fadeDuration);
        video.volume = newVolume;
      } else {
        if (video.volume !== 1.0) video.volume = 1.0;
      }
    }
  };

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
            Asistente virtual autónomo para la gestión de consultas de Recursos
            Humanos en ChocolaTech.
          </p>
        </footer>
      </aside>

      <main className="chat-workspace">
        <header className="chat-header">
          <div className="agent-profile">
            <div className="pulse-indicator"></div>
            <div>
              <h2>
                Agente Autónomo -<span className="chocola-part"> Chocola</span>
                <div className="tech-container">
                  <span className="tech-part">Tech</span>
                </div>
              </h2>
              <p>
                {introStage === "goodbye"
                  ? "Conversación finalizada"
                  : isTyping
                    ? "Escribiendo..."
                    : "En línea • Listo para interactuar"}
              </p>
            </div>
          </div>

          {introStage === "chat" && (
            <button
              type="button"
              className="info-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setShowInfoModal(true);
              }}
            >
              <Info size={24} strokeWidth={1} />
            </button>
          )}
        </header>

        {/* PRELOAD STATE */}
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

        {/* WELCOME STATE */}
        {(introStage === "welcome" || welcomeVideoActive) && (
          <video
            ref={chocoVideoRef}
            src={chocoVideoWelcome}
            autoPlay
            playsInline
            className="choco-permanent-fly-avatar"
            style={{
              pointerEvents: welcomeVideoActive ? "none" : "auto",
            }}
          />
        )}

        {/* GOODBYE STATE */}
        {introStage === "goodbye" && (
          <div className="goodbye-overlay">
            <video
              ref={chocoGoodbyeRef}
              src={chocoVideoGoodbye}
              playsInline
              className="choco-goodbye-avatar"
              onTimeUpdate={handleGoodbyeTimeUpdate}
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
            <div
              key={msg.id}
              className={`message-row ${msg.sender}`}
              style={{
                opacity: msg.id === 1 && welcomeVideoActive ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
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

        {introStage === "chat" && (
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
                disabled={
                  !inputValue.trim() || isTyping || introStage !== "chat"
                }
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
        )}
      </main>

      <div
        ref={modalRef}
        className="info-overlay"
        onClick={() => setShowInfoModal(false)}
        style={{ display: "none", opacity: 0 }}
      >
        <aside className="sidebar-mobile" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="close-sidebar"
            onClick={() => setShowInfoModal(false)}
          >
            <CircleX size={24} strokeWidth={1.5} />
          </button>
          <h3>Información del Sistema</h3>
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
          <p>
            Asistente virtual autónomo para la gestión de consultas de Recursos
            Humanos en ChocolaTech.
          </p>
        </aside>
      </div>
    </div>
  );
}
