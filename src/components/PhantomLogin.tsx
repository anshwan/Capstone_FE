import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom";
import "./PhantomLogin.css";

window.Buffer = Buffer;

const API_URL = process.env.REACT_APP_API_URL;

const PhantomLogin: React.FC = () => {
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ 진입 시 기존 JWT 삭제
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      localStorage.removeItem("jwt");
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
      const resp = await provider.connect();
      const publicKey = resp.publicKey.toString();
      setWallet(publicKey);
      console.log("🔑 Wallet 연결:", publicKey);

      // ✅ 서버에서 nonce 요청
      const nonceRes = await fetch(`${API_URL}/login/nonce?wallet=${publicKey}`, {
        credentials: "include",
      });
      const { nonce } = await nonceRes.json();
      console.log("📩 받은 nonce:", nonce);

      // ✅ 메시지 서명
      const encodedMessage = new TextEncoder().encode(nonce);
      const signed = await provider.signMessage(encodedMessage, "utf8");
      const signatureBase64 = Buffer.from(signed.signature).toString("base64");

      // ✅ 서버에 서명 검증 요청
      const verifyRes = await fetch(`${API_URL}/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ wallet: publicKey, signature: signatureBase64 }),
      });

      const data = await verifyRes.json();
      console.log("🎯 verify 응답:", data);

      if (verifyRes.ok) {
        localStorage.setItem("jwt", data.token); // access token 저장
        console.log("✅ accessToken 저장 완료");

        // ✅ access token 갱신 테스트
        try {
          const refreshRes = await fetch(`${API_URL}/login/refresh`, {
            method: "POST",
            credentials: "include", // refresh token 쿠키 포함
          });
          const refreshData = await refreshRes.json();

          if (refreshRes.ok) {
            localStorage.setItem("jwt", refreshData.token); // 갱신된 access token 저장
            console.log("🔁 access token 갱신 성공");
          } else {
            console.warn("❌ access token 갱신 실패:", refreshData.error);
          }
        } catch (e) {
          console.error("🔁 토큰 갱신 요청 중 오류:", e);
        }

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
