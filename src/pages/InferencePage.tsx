import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import { Player } from "@lottiefiles/react-lottie-player";

interface Model {
  id: number;
  model_name: string;
}

interface Message {
  role: "user" | "model";
  content: string;
}

const InferencePage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get("/model/owned");
        setModels(res.data);
        if (res.data.length > 0) {
          setSelectedModelId(res.data[0].id); // 기본 모델 선택
        }
      } catch (err) {
        console.error("모델 불러오기 실패", err);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!selectedModelId || !prompt.trim()) return;

    const selectedModel = models.find((model) => model.id === selectedModelId);
    if (!selectedModel) return;

    const userMsg: Message = { role: "user", content: prompt };
    const loadingMsg: Message = { role: "model", content: "__LOADING__" };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setPrompt("");

    try {
      const res = await api.post("/inference", {
        model_name: selectedModel.model_name,
        prompt,
      });

      const modelMsg: Message = { role: "model", content: res.data.generate_text };

      setMessages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex(
          (m) => m.role === "model" && m.content === "__LOADING__"
        );
        if (idx !== -1) updated[idx] = modelMsg;
        return updated;
      });
    } catch (err) {
      console.error("추론 실패", err);
      setMessages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex(
          (m) => m.role === "model" && m.content === "__LOADING__"
        );
        if (idx !== -1) {
          updated[idx] = { role: "model", content: "❌ 추론 중 오류 발생" };
        }
        return updated;
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "white",
      }}
    >
      {/* 모델 선택 바 */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0 1.5rem",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "#000000",
          zIndex: 5,
        }}
      >
        <label htmlFor="model-select" style={{ marginRight: "0.5rem", fontWeight: 500 }}>
          사용 모델:
        </label>
        <select
          id="model-select"
          value={selectedModelId ?? ""}
          onChange={(e) => setSelectedModelId(Number(e.target.value))}
          disabled={models.length === 0}
          style={{
            padding: "0.5rem",
            borderRadius: "5px",
            backgroundColor: "#2c2c2c",
            color: "white",
            border: "1px solid #555",
            fontSize: "1rem",
            width: "200px",
          }}
        >
          <option value="" disabled>
            {models.length === 0 ? "모델 없음" : "모델 선택"}
          </option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.model_name}
            </option>
          ))}
        </select>
      </div>

      {/* 대화 영역 */}
      <div
        style={{
          flex: 1,
          padding: "1rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {models.length === 0 && (
          <p style={{ color: "#888", padding: "1rem" }}>
            보유한 모델이 없습니다. 모델을 구매한 후 사용해보세요.
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "0.75rem",
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                backgroundColor: msg.role === "user" ? "#4a4a4a" : "#2a2a2a",
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content === "__LOADING__" ? (
                <div style={{ width: "60px", height: "32px" }}>
                  <Player
                    autoplay
                    loop
                    src="/lottie/chat-waiting.json" // 원하는 Lottie 애니메이션 파일로 교체
                  />
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* 입력창 */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#1e1e1e",
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #333",
        }}
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="프롬프트를 입력하세요..."
          disabled={!selectedModelId}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "5px",
            border: "none",
            outline: "none",
            backgroundColor: "#2c2c2c",
            color: "white",
            marginRight: "0.5rem",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!selectedModelId || !prompt.trim()}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: selectedModelId && prompt.trim() ? "#4CAF50" : "#666",
            border: "none",
            borderRadius: "5px",
            color: "white",
            cursor: selectedModelId && prompt.trim() ? "pointer" : "not-allowed",
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default InferencePage;
