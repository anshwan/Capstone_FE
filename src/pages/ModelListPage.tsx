import React, { useEffect, useState } from "react";
import api from "../api";

interface Model {
  id: number;
  model_name: string;
  description: string;
  is_derivative: boolean;
  royalty: number;
  wallet_address: string;
  created_at: string;
}

const ModelListPage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [purchasedModelIds, setPurchasedModelIds] = useState<number[]>([]);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await api.get("/model/list");
        setModels(response.data);
      } catch (error) {
        console.error("모델 목록 불러오기 실패", error);
      }
    };

    const fetchLicenses = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const wallet = localStorage.getItem("wallet"); // 로그인 시 저장된 값

        const response = await api.get(`/user/licenses`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { wallet },
        });
        setPurchasedModelIds(response.data.map((l: any) => l.modelId));
      } catch (error) {
        console.error("라이선스 정보 불러오기 실패", error);
      }
    };

    fetchModels();
    fetchLicenses();
  }, []);

  const handleBuy = async (modelId: number) => {
    setBuyingId(modelId);
    const token = localStorage.getItem("jwt");

    try {
      await api.post(
        "/model/buy",
        { modelId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ 구매 완료!");
      setPurchasedModelIds((prev) => [...prev, modelId]);
    } catch (error: any) {
      alert(error?.response?.data?.message || "❌ 구매 실패");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "64px",
        bottom: 0,
        left: 0,
        right: 0,
        overflowY: "auto",
        padding: "2rem",
        color: "white",
        boxSizing: "border-box",
        backgroundColor: "black",
      }}
    >
      <h1>📋 전체 모델 목록</h1>
      {models.length === 0 ? (
        <p>등록된 모델이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {models.map((model) => (
            <li
              key={model.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "1rem",
                margin: "1rem 0",
                padding: "1rem",
                backgroundColor: "#333",
              }}
            >
              <h2>{model.model_name}</h2>
              <p>{model.description}</p>
              <p>👤 등록자: {model.wallet_address}</p>
              <p>🎨 2차 창작: {model.is_derivative ? "Y" : "N"}</p>
              <p>💰 로열티: {model.royalty / 100}%</p>
              <p>📅 등록일: {new Date(model.created_at).toLocaleString()}</p>
              <button
                onClick={() => handleBuy(model.id)}
                disabled={purchasedModelIds.includes(model.id) || buyingId === model.id}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  backgroundColor: "#6c5ce7",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                {purchasedModelIds.includes(model.id)
                  ? "✅ 구매 완료"
                  : buyingId === model.id
                  ? "구매 중..."
                  : "🛒 구매하기"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModelListPage;
