// src/pages/ContactPage.jsx

import { useEffect } from "react";
import Nav from "../layouts/Nav";

export default function ContactPage({
  page,
  setPage,
  user,
  onLogout,
  goToChat,
}) {
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes glow {
        0% {
          box-shadow: 0 0 0 rgba(16,185,129,0);
        }

        50% {
          box-shadow: 0 0 40px rgba(16,185,129,0.18);
        }

        100% {
          box-shadow: 0 0 0 rgba(16,185,129,0);
        }
      }

      .founder-card {
        animation: fadeUp 0.8s ease forwards;
        opacity: 0;
      }

      .founder-card:hover {
        transform: translateY(-8px);
        transition: 0.3s ease;
      }

      .founder-card img {
        transition: 0.4s ease;
      }

      .founder-card:hover img {
        transform: scale(1.04);
      }

      .glass-card {
        backdrop-filter: blur(18px);
        animation: glow 4s infinite ease-in-out;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const founders = [
    {
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
      role: "Founder",
      delay: "0s",
    },

    {
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
      role: "Co-Founder",
      delay: "0.15s",
    },

    {
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop",
      role: "Lead Engineer",
      delay: "0.3s",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #10221d 0%, #07110f 45%, #040807 100%)",
        overflow: "hidden",
      }}
    >
      <Nav
        page={page}
        setPage={setPage}
        user={user}
        onLogout={onLogout}
        goToChat={goToChat}
      />

      {/* HERO */}

      <section
        style={{
          paddingTop: 130,
          paddingLeft: 24,
          paddingRight: 24,
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(16,185,129,0.08)",
              border:
                "1px solid rgba(16,185,129,0.18)",
              padding: "8px 16px",
              borderRadius: 999,
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 14 }}>✦</span>

            <span
              style={{
                color: "#9be7cb",
                fontSize: 13,
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
            >
              Meet the Visionaries Behind Salvia AI
            </span>
          </div>

          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(42px,7vw,76px)",
              lineHeight: 1.05,
              marginBottom: 24,
              fontWeight: 700,
              letterSpacing: "-2px",
              fontFamily:
                "'Playfair Display', serif",
            }}
          >
            Building the Future
            <br />
            of Intelligent Healthcare
          </h1>

          <p
            style={{
              maxWidth: 760,
              margin: "0 auto",
              color: "rgba(255,255,255,0.58)",
              fontSize: 18,
              lineHeight: 1.8,
              fontFamily:
                "'DM Sans', sans-serif",
            }}
          >
            Salvia AI is a next-generation
            healthcare platform focused on
            AI-assisted rural care, symptom
            intelligence, first aid guidance,
            and accessible medical support for
            underserved communities.
          </p>
        </div>
      </section>

      {/* FOUNDERS */}

      <section
        style={{
          padding: "90px 24px 120px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            maxWidth: 1250,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(300px,1fr))",
            gap: 28,
          }}
        >
          {founders.map((founder, index) => (
            <div
              key={index}
              className="founder-card glass-card"
              style={{
                animationDelay: founder.delay,
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                borderRadius: 28,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* IMAGE */}

              <div
                style={{
                  height: 420,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={founder.image}
                  alt="Founder"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(7,17,15,0.92), rgba(7,17,15,0.1))",
                  }}
                />
              </div>

              {/* CONTENT */}

              <div
                style={{
                  padding: 28,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background:
                      "rgba(16,185,129,0.08)",
                    border:
                      "1px solid rgba(16,185,129,0.14)",
                    padding: "7px 14px",
                    borderRadius: 999,
                    marginBottom: 18,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                  />

                  <span
                    style={{
                      color: "#9be7cb",
                      fontSize: 12,
                      fontFamily:
                        "'DM Sans', sans-serif",
                    }}
                  >
                    {founder.role}
                  </span>
                </div>

                <h2
                  style={{
                    color: "#fff",
                    fontSize: 28,
                    marginBottom: 14,
                    fontFamily:
                      "'Playfair Display', serif",
                  }}
                >
                  Founder Name
                </h2>

                <p
                  style={{
                    color:
                      "rgba(255,255,255,0.56)",
                    lineHeight: 1.8,
                    fontSize: 15,
                    fontFamily:
                      "'DM Sans', sans-serif",
                  }}
                >
                  Visionary leader driving the
                  future of intelligent healthcare
                  systems and AI-powered medical
                  accessibility across emerging
                  communities.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT PANEL */}

      <section
        style={{
          padding: "0 24px 120px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          className="glass-card"
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            borderRadius: 36,
            padding: "60px 40px",
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.04))",

            border:
              "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: "clamp(34px,5vw,56px)",
              marginBottom: 18,
              fontFamily:
                "'Playfair Display', serif",
              lineHeight: 1.1,
            }}
          >
            Let’s Build Something
            Extraordinary
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.58)",
              maxWidth: 700,
              margin: "0 auto 36px",
              lineHeight: 1.8,
              fontSize: 16,
              fontFamily:
                "'DM Sans', sans-serif",
            }}
          >
            We are passionate about building
            impactful healthcare technology for
            the next billion people.
          </p>

          <button
            style={{
              background:
                "linear-gradient(135deg,#10b981,#059669)",
              border: "none",
              borderRadius: 16,
              padding: "16px 34px",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily:
                "'DM Sans', sans-serif",
              boxShadow:
                "0 10px 30px rgba(16,185,129,0.25)",
            }}
          >
            Contact The Team
          </button>
        </div>
      </section>

      {/* BACKGROUND GLOWS */}

      <div
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "rgba(16,185,129,0.12)",
          filter: "blur(120px)",
          top: -100,
          left: -120,
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "fixed",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "rgba(14,165,233,0.08)",
          filter: "blur(120px)",
          bottom: -80,
          right: -80,
          zIndex: 0,
        }}
      />
    </div>
  );
}