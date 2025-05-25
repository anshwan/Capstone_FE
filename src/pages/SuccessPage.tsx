import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Connection, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js";
import api from "../api";
import BackgroundCanvas from "../components/BackgroundCanvas";

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const provider = (window as any).solana;

    if (!storedToken || !provider?.publicKey) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    setToken(storedToken);
    setWallet(provider.publicKey.toString());

    const getBalance = async () => {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const pubkey = new PublicKey(provider.publicKey.toString());
      const lamports = await connection.getBalance(pubkey);
      setBalance(lamports / 1e9);
    };

    getBalance();
  }, [navigate]);

  if (!token || !wallet) return null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "visible", zIndex: 0,}}>
      <BackgroundCanvas showSphere={true} />
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "bold",
            background: "linear-gradient(90deg, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}
        >
          Agent Chain
        </h1>
        <p
          style={{
            fontWeight: 500,
            color: "#e5e7eb",
            marginTop: "1rem",
            fontSize: "1.1rem",
            marginBottom: 0,
          }}
        >
          블록체인을 이용해 AI 모델을 등록하고, 추론하고, 관리하세요.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;