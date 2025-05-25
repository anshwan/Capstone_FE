import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // ProgressBar용

export type Status =
  | "idle"
  | "uploading"
  | "generatingTx"
  | "signing"
  | "submitting"
  | "done";

const statusSteps: { key: Status; label: string; animation: string; doneAnimation: string }[] = [
  { key: "uploading", label: "AI 모델 업로드 중...", animation: "/lottie/loading.json", doneAnimation: "/lottie/success.json" },
  { key: "generatingTx", label: "트랜잭션 생성 중...", animation: "/lottie/loading.json", doneAnimation: "/lottie/success.json" },
  { key: "signing", label: "지갑 서명 대기 중...", animation: "/lottie/loading.json", doneAnimation: "/lottie/success.json" },
  { key: "submitting", label: "온체인 전송 중...", animation: "/lottie/loading.json", doneAnimation: "/lottie/success.json" }
];

export const StatusModal: React.FC<{ status: Status; onClose?: () => void }> = ({ status, onClose }) => {
  if (status === "idle") return null;

  const currentIndex = statusSteps.findIndex((s) => s.key === status);
  const isDone = status === "done";

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {isDone ? (
          <div style={{ textAlign: "center" }}>
            <Player autoplay keepLastFrame src="/lottie/success.json" style={{ height: "80px", width: "80px", marginBottom: "1rem" }} />
            <h3 style={{ color: "white" }}>🎉 AI 모델 업로드 성공!</h3>
            <button
              onClick={onClose}
              style={{ marginTop: "1.5rem", padding: "0.6rem 1.2rem", backgroundColor: "#a855f7", border: "none", borderRadius: "8px", color: "white", fontWeight: 600, cursor: "pointer" }}
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ marginBottom: "1.5rem", color: "white" }}>잠시만 기다려주세요</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {statusSteps.map((step, index) => (
                <div key={step.key} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Player
                    autoplay
                    loop={index === currentIndex}
                    keepLastFrame
                    src={index < currentIndex ? step.doneAnimation : step.animation}
                    style={{ height: "60px", width: "60px" }}
                  />
                  <span style={{ fontSize: "1.1rem", color: "white" }}>{step.label}</span>
                </div>
              ))}
            </div>

            <ProgressBar
              now={((currentIndex + 1) / (statusSteps.length + 1)) * 100}
              animated
              striped
              className="bg-custom-purple"
              style={{ height: "10px" }}
              label=""
            />

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                onClick={onClose}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#6b7280", border: "none", borderRadius: "8px", color: "white", fontWeight: 500, cursor: "pointer" }}
              >
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ✅ 스타일 정의
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#1e1e1e",
  borderRadius: "10px",
  padding: "2rem 3rem",
  textAlign: "left",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  minWidth: "350px",
};


