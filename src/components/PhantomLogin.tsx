import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom";
import "./PhantomLogin.css";

window.Buffer = Buffer;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const PhantomLogin: React.FC = () => {
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 만료된 JWT 제거 (초기 진입 시)
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      localStorage.removeItem("jwt"); // 강제 로그아웃 효과
    }
  }, []);

  const connectPhantom = async () => {
    setError("");
    const provider = (window as any).solana;

    if (!provider?.isPhantom) {
      setError("Phantom 지갑이 설치되어 있지 않습니다!");
      return;
    }

    try {
      // Phantom 지갑 연결
      const resp = await provider.connect();
      const publicKey = resp.publicKey.toString();
      setWallet(publicKey);

      // 서버에서 nonce 요청
      const nonceRes = await fetch(`${API_URL}/login/nonce?wallet=${publicKey}`, {
        credentials: "include",
      });
      const { nonce } = await nonceRes.json();

      // 메시지 서명
      const encodedMessage = new TextEncoder().encode(nonce);
      const signed = await provider.signMessage(encodedMessage, "utf8");
      const signatureBase64 = Buffer.from(signed.signature).toString("base64");

      // 서버에 서명 검증 요청
      const verifyRes = await fetch(`${API_URL}/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ 쿠키(리프레시 토큰) 포함
        body: JSON.stringify({ wallet: publicKey, signature: signatureBase64 }),
      });

      const data = await verifyRes.json();

      if (verifyRes.ok) {
        localStorage.setItem("jwt", data.token); // ✅ accessToken 저장
        navigate("/success");
      } else {
        localStorage.removeItem("jwt");
        setError(data.error || "로그인 실패");
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      setError("로그인 중 오류 발생");
    }
  };

  return (
    <div
      className="login-fullscreen"
      style={{
        backgroundImage: "url('/space.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "5rem", marginBottom: "32rem" }}>Agent Chain</h1>
      <button onClick={connectPhantom} className="phantom-button">
        <img src="/phantom.svg" alt="Phantom" style={{ width: "24px", marginRight: "8px" }} />
        Phantom으로 로그인
      </button>
      {wallet && <p className="wallet">🔑 {wallet}</p>}
      {error && <p className="error">⚠️ {error}</p>}
    </div>
  );
};

export default PhantomLogin;
