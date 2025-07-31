import React, { useState, useRef } from "react";

const ParametresWithTheme = (props) => {
  const Parametres = props.Parametres || require('./Parametres').default;
  const animationTimerRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    setIsAnimating(true);
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    animationTimerRef.current = setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <Parametres {...props} />
      <button
        type="button"
        onClick={toggleTheme}
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          zIndex: 9999,
          padding: "0.5rem",
          borderRadius: "9999px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          background: theme === "dark" ? "#374151" : "#e5e7eb",
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          transition: "all 0.3s",
          outline: "none",
          border: "none",
          cursor: "pointer",
          transform: isAnimating ? "scale(1.1)" : "scale(1)",
          animation: isAnimating ? "rotate 0.5s ease" : "none"
        }}
        aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      >
        <span style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", width: "1.25rem", height: "1.25rem" }}>
          {theme === "dark" ? "☀️" : "🌙"}
        </span>
      </button>
      <style>{`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ParametresWithTheme;