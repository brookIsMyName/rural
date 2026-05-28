// src/layouts/Nav.jsx

import { useState, useRef, useEffect } from "react";
import { useLang } from "../utils/useLang";
import { t } from "../utils/translate";
import { LANGUAGES } from "../data/languages";

export default function Nav({
  page,
  setPage,
  user,
  onLogout,
  goToChat,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [moreOpen, setMoreOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const { lang, changeLang } = useLang();

  const moreRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = (id) => {
    id === "chat"
      ? goToChat()
      : setPage(id);

    setMenuOpen(false);
    setMoreOpen(false);
  };

  useEffect(() => {
    const close = (e) => {
      if (
        moreRef.current &&
        !moreRef.current.contains(e.target)
      ) {
        setMoreOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };

    window.addEventListener("click", close);

    return () =>
      window.removeEventListener(
        "click",
        close
      );
  }, []);

  return (
    <>
      <style>{`
        .nav-link {
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: #10b981 !important;
          background: rgba(16,185,129,0.08) !important;
        }

        .dropdown-item:hover {
          background: rgba(255,255,255,0.06);
        }

        .lang-select option {
          background: #111827;
          color: white;
        }

        @media (max-width: 900px) {
          .desktop-only {
            display: none !important;
          }

          .mobile-btn {
            display: flex !important;
          }
        }

        @media (min-width: 901px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5000,

          background:
            "rgba(29, 33, 37, 0.92)",

          backdropFilter: "blur(18px)",

          borderBottom:
            "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1300,

            margin: "0 auto",

            height: 62,

            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

            padding: "0 10px",
          }}
        >
          {/* LEFT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* LOGO */}

            <button
              onClick={() =>
                setPage("home")
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",

                display: "flex",
                alignItems: "center",

                gap: 6,

                padding: 0,
              }}
            >
              <div
                style={{
                  marginLeft: 10,
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                }}
              >
                <img src="../faviconphoto.png" width="30px" height="30px" alt="Logo.png" />
              </div>

              <span
                style={{
                  color: "#fff",

                  fontWeight: 700,

                  fontSize: 16,

                  fontFamily:
                    "'DM Sans', sans-serif",

                  whiteSpace: "nowrap",
                }}
              >
                Salvia{" "}
                <span
                  style={{
                    color: "#10b981",
                  }}
                >
                  AI
                </span>
              </span>
            </button>

            {/* DESKTOP NAV */}

            <div
              className="desktop-only"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginLeft: 8,
              }}
            >
              <button
                onClick={() =>
                  navigate("home")
                }
                className="nav-link"
                style={{
                  background:
                    page === "home"
                      ? "rgba(16,185,129,0.12)"
                      : "none",

                  border: "none",

                  color:
                    page === "home"
                      ? "#10b981"
                      : "rgba(255,255,255,0.65)",

                  padding:
                    "8px 12px",

                  borderRadius: 8,

                  cursor: "pointer",

                  fontSize: 13,
                }}
              >
                {t("home")}
              </button>

              <button
                onClick={() =>
                  navigate("chat")
                }
                className="nav-link"
                style={{
                  background:
                    page === "chat"
                      ? "rgba(16,185,129,0.12)"
                      : "none",

                  border: "none",

                  color:
                    page === "chat"
                      ? "#10b981"
                      : "rgba(255,255,255,0.65)",

                  padding:
                    "8px 12px",

                  borderRadius: 8,

                  cursor: "pointer",

                  fontSize: 13,
                }}
              >
                {t("healthChat")}
              </button>

              {/* MORE DROPDOWN */}

              <div
                ref={moreRef}
                style={{
                  position: "relative",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setMoreOpen(
                      !moreOpen
                    );
                  }}
                  className="nav-link"
                  style={{
                    background:
                      "none",

                    border: "none",

                    color:
                      "rgba(255,255,255,0.65)",

                    padding:
                      "8px 12px",

                    borderRadius: 8,

                    cursor: "pointer",

                    fontSize: 13,
                  }}
                >
                  {t("more")} ▾
                </button>

                {moreOpen && (
                  <div
                    style={{
                      position:
                        "absolute",

                      top: 44,

                      left: 0,

                      width: 220,

                      background:
                        "#0f172a",

                      border:
                        "1px solid rgba(255,255,255,0.08)",

                      borderRadius: 14,

                      padding: 8,

                      boxShadow:
                        "0 10px 40px rgba(0,0,0,0.35)",
                    }}
                  >
                    {[
                      {
                        id: "bodymap",
                        label:
                          t(
                            "bodyMap"
                          ),
                      },

                      {
                        id: "firstaid",
                        label:
                          t(
                            "firstAid"
                          ),
                      },

                      {
                        id: "caregivers",
                        label:
                          t(
                            "findCare"
                          ),
                      },

                      {
                        id: "outbreaks",
                        label:
                          t(
                            "alerts"
                          ),
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          navigate(
                            item.id
                          )
                        }
                        className="dropdown-item"
                        style={{
                          width: "100%",

                          textAlign:
                            "left",

                          background:
                            "none",

                          border:
                            "none",

                          padding:
                            "11px 12px",

                          borderRadius: 10,

                          color:
                            "rgba(255,255,255,0.78)",

                          cursor:
                            "pointer",

                          fontSize: 13,
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* LANGUAGE */}

            <div
              className="desktop-only"
              style={{
                display: "flex",
                alignItems: "center",

                gap: 6,

                height: 34,

                borderRadius: 10,

                padding: "0 10px",

                background:
                  "rgba(255,255,255,0.05)",

                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              🌍

              <select
                value={lang}
                onChange={(e) =>
                  changeLang(
                    e.target.value
                  )
                }
                className="lang-select"
                style={{
                  background:
                    "transparent",

                  border: "none",

                  outline: "none",

                  color:
                    "rgba(255,255,255,0.8)",

                  cursor: "pointer",

                  fontSize: 12,
                }}
              >
                {LANGUAGES.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                  >
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PROFILE */}

            {user ? (
              <div
                ref={profileRef}
                style={{
                  position: "relative",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setProfileOpen(
                      !profileOpen
                    );
                  }}
                  style={{
                    background:
                      "rgba(255,255,255,0.05)",

                    border:
                      "1px solid rgba(255,255,255,0.08)",

                    borderRadius: 999,

                    padding:
                      "4px 10px 4px 4px",

                    display: "flex",

                    alignItems: "center",

                    gap: 8,

                    cursor: "pointer",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{
                        width: 30,
                        height: 30,

                        borderRadius:
                          "50%",

                        objectFit:
                          "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 30,
                        height: 30,

                        borderRadius:
                          "50%",

                        background:
                          "linear-gradient(135deg,#10b981,#0ea5e9)",

                        display: "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        color: "#fff",

                        fontWeight: 700,

                        fontSize: 12,
                      }}
                    >
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <span
                    className="desktop-only"
                    style={{
                      color:
                        "rgba(255,255,255,0.72)",

                      fontSize: 13,
                    }}
                  >
                    {
                      user.name?.split(
                        " "
                      )[0]
                    }
                  </span>
                </button>

                {profileOpen && (
                  <div
                    style={{
                      position:
                        "absolute",

                      top: 48,

                      right: 0,

                      width: 180,

                      background:
                        "#0f172a",

                      border:
                        "1px solid rgba(255,255,255,0.08)",

                      borderRadius: 14,

                      padding: 8,

                      boxShadow:
                        "0 10px 40px rgba(0,0,0,0.35)",
                    }}
                  >
                    <button
                      onClick={
                        onLogout
                      }
                      className="dropdown-item"
                      style={{
                        width: "100%",

                        textAlign:
                          "left",

                        background:
                          "none",

                        border:
                          "none",

                        color:
                          "#f87171",

                        padding:
                          "12px",

                        borderRadius: 10,

                        cursor:
                          "pointer",
                      }}
                    >
                      {t("signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="desktop-only"
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                <button
                  onClick={() =>
                    setPage("login")
                  }
                  style={{
                    background:
                      "none",

                    border:
                      "1px solid rgba(255,255,255,0.12)",

                    borderRadius: 8,

                    padding:
                      "7px 14px",

                    color:
                      "rgba(255,255,255,0.75)",

                    cursor: "pointer",
                  }}
                >
                  {t("signIn")}
                </button>

                <button
                  onClick={() =>
                    setPage(
                      "register"
                    )
                  }
                  style={{
                    background:
                      "linear-gradient(135deg,#10b981,#059669)",

                    border: "none",

                    borderRadius: 8,

                    padding:
                      "7px 14px",

                    color: "#fff",

                    fontWeight: 600,

                    cursor: "pointer",
                  }}
                >
                  {t("signUp")}
                </button>
              </div>
            )}

            {/* MOBILE BUTTON */}

            <button
              className="mobile-btn"
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              style={{
                display: "none",

                background:
                  "none",

                border: "none",

                color:
                  "rgba(255,255,255,0.8)",

                fontSize: 22,

                cursor: "pointer",
              }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div
            className="mobile-menu"
            style={{
              background:
                "rgba(10,14,20,0.98)",

              borderTop:
                "1px solid rgba(255,255,255,0.06)",

              padding: 18,
            }}
          >
            {[
              "home",
              "chat",
              "bodymap",
              "firstaid",
              "caregivers",
              "outbreaks",
            ].map((id) => (
              <button
                key={id}
                onClick={() =>
                  navigate(id)
                }
                style={{
                  display: "block",

                  width: "100%",

                  textAlign: "left",

                  background:
                    "none",

                  border: "none",

                  color:
                    "rgba(255,255,255,0.78)",

                  padding:
                    "12px 0",

                  borderBottom:
                    "1px solid rgba(255,255,255,0.04)",

                  cursor: "pointer",
                }}
              >
                {t(id)}
              </button>
            ))}

            <div
              style={{
                marginTop: 16,
              }}
            >
              <select
                value={lang}
                onChange={(e) =>
                  changeLang(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",

                  background:
                    "rgba(255,255,255,0.06)",

                  border:
                    "1px solid rgba(255,255,255,0.08)",

                  borderRadius: 10,

                  padding: 10,

                  color: "#fff",
                }}
              >
                {LANGUAGES.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                  >
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}