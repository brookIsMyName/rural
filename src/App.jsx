// src/App.jsx
import { useState, useEffect } from "react";
import Nav            from "./layouts/Nav";
import HomePage       from "./pages/HomePage";
import ChatPage       from "./pages/ChatPage";
import OutbreaksPage  from "./pages/OutbreaksPage";
import FirstAidPage   from "./pages/FirstAidPage";
import CaregiversPage from "./pages/CaregiversPage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import BodyMap from "./pages/BodyMap"; 
import ContactPage from "./pages/contact";
import { resolveLocation } from "./utils/useLocation";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  
  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem("rc_user");
    const token  = localStorage.getItem("rc_token");
    if (stored && token) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        // Resolve location silently on load — IP fallback first, no prompt
        resolveLocation(u).then((loc) => {
          if (loc) {
            // Update user object in memory with location so pages can read it
            setUser((prev) => prev ? { ...prev, location: loc } : prev);
          }
        });
      } catch {}
    } else {
      // Not logged in — still try IP location silently
      resolveLocation(null).catch(() => {});
    }
  }, []);

  // Handle Google OAuth callback
  useEffect(() => {
    if (window.location.pathname === "/auth/callback") {
      const hash   = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const token  = params.get("token");
      const raw    = params.get("user");
      if (token && raw) {
        try {
          const u = JSON.parse(decodeURIComponent(raw));
          localStorage.setItem("rc_token", token);
          localStorage.setItem("rc_user",  JSON.stringify(u));
          setUser(u);
          window.history.replaceState({}, "", "/");
          setPage("home");
        } catch {}
      }
    }
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    // Resolve location after login — use saved location from server first
    resolveLocation(u).then((loc) => {
      if (loc) setUser((prev) => prev ? { ...prev, location: loc } : prev);
    });
    setPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("rc_token");
    localStorage.removeItem("rc_user");
    setUser(null);
    setPage("home");
  };

  const goToChat = () => {
    if (!user) { setPage("login"); return; }
    setPage("chat");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e14", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {page !== "login" && page !== "register" && (
        <Nav page={page} setPage={setPage} user={user} onLogout={handleLogout} goToChat={goToChat} />
      )}
      {
  page === "bodymap" && (
    <BodyMap />
  )
}
      {page === "login"      && <LoginPage    setPage={setPage} onLogin={handleLogin} />}
      {page === "register"   && <RegisterPage setPage={setPage} onLogin={handleLogin} />}
      {page === "home"       && <HomePage     setPage={setPage} goToChat={goToChat} />}
      {page === "chat"       && <ChatPage     user={user} />}
      {page === "outbreaks"  && <OutbreaksPage user={user} />}
      {page === "firstaid"   && <FirstAidPage />}
      {page === "caregivers" && <CaregiversPage user={user} />}
      {page === "ContactPage" && <ContactPage /> }
    </div>
  );
}
