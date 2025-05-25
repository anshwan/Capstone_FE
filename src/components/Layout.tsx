import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackgroundCanvas from "./BackgroundCanvas";
import DropdownPortal from "./DropdownPortal";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);

  const handleNavigate = (path: string) => () => navigate(path);
  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (active: boolean) => ({
    background: "transparent",
    border: "none",
    color: active ? "#9b6dc6" : "white",
    fontWeight: active ? 700 : 600,
    fontSize: "1.1rem",
    fontFamily: "'Segoe UI', sans-serif",
    cursor: "pointer",
    padding: "0.25rem 0.5rem",
    margin: 0,
    transition: "color 0.3s ease"
  });

  return (
    <div style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
      <BackgroundCanvas />

      {/* 메뉴바 */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        zIndex: 10,
        fontSize: "1.2rem",
        fontWeight: 500,
        color: "white"
      }}>
        <div onClick={handleNavigate("/success")} style={{ fontWeight: 700, fontSize: "1.5rem", cursor: "pointer" }}>
          Agent Chain
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: "8rem", position: "relative" }}>
          <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button
              ref={uploadButtonRef}
              style={linkStyle(
                isActive("/register-model") || isActive("/register-dataset")
              )}
            >
              Upload
            </button>

            <DropdownPortal anchorRef={uploadButtonRef} show={showDropdown}>
              <button onClick={() => navigate("/register-model")} style={linkStyle(false)}>Model</button>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.15)", margin: "0.3rem 0" }} />
              <button onClick={() => navigate("/register-dataset")} style={linkStyle(false)}>Dataset</button>
            </DropdownPortal>
          </div>

          <button onClick={handleNavigate("/model-list")} style={linkStyle(isActive("/model-list"))}>ModelList</button>
          <button onClick={handleNavigate("/inference")} style={linkStyle(isActive("/inference"))}>Inference</button>
          <button onClick={handleNavigate("/fine-tune")} style={linkStyle(isActive("/fine-tune"))}>Fine-Tuning</button>
          <button onClick={handleNavigate("/rag")} style={linkStyle(isActive("/rag"))}>RAG</button>
          <button onClick={handleNavigate("/")} style={linkStyle(isActive("/"))}>Logout</button>
        </div>
      </div>

      {/* 본문 콘텐츠 */}
      <div style={{ position: "relative", zIndex: 10, marginTop: "6rem", height: "calc(100vh - 6rem)", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
