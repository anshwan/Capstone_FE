import React, { useState } from "react";
import api from "../api";
import { Connection, Transaction } from "@solana/web3.js";
import { StatusModal, Status } from "../components/StatusModal";

const connection = new Connection("https://api.devnet.solana.com");

const RegisterModelPage: React.FC = () => {
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [isDerivative, setIsDerivative] = useState("");
  const [royalty, setRoyalty] = useState("");
  const [folderFiles, setFolderFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFolderFiles(files);
      console.log("선택된 파일 수:", files.length);
    }
  };

  const handleCloseModal = () => {
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!modelName || !description || !isDerivative || !royalty || !folderFiles) {
      alert("모든 입력과 폴더 선택이 필요합니다.");
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("modelName", modelName);
    formData.append("description", description);
    formData.append("isDerivative", isDerivative);
    formData.append("royalty", royalty);
    formData.append("created_at", new Date().toISOString());

    Array.from(folderFiles).forEach((file) => {
      if (file.webkitRelativePath) {
        formData.append("files", file, file.webkitRelativePath);
      }
    });

    try {
      setStatus("uploading");
      const response = await api.post("/model/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const { s3_key } = response.data;

      setStatus("generatingTx");
      const txResponse = await api.post(
        "/model/transaction",
        {
          s3_key,
          royalty: Number(royalty) * 100,
          is_derivative: isDerivative === "Y",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { transaction: txBase64 } = txResponse.data;

      const provider = (window as any).solana;
      if (!provider || !provider.isPhantom) {
        alert("Phantom 지갑이 연결되어 있지 않습니다.");
        return;
      }

      const walletPublicKey = provider.publicKey;

      const originalTx = Transaction.from(Buffer.from(txBase64, "base64"));
      const [ix] = originalTx.instructions;

      const { blockhash } = await connection.getLatestBlockhash("finalized");

      const tx = new Transaction({
        feePayer: walletPublicKey,
        recentBlockhash: blockhash,
      }).add(ix);

      setStatus("signing");
      const signedTx = await provider.signTransaction(tx);

      setStatus("submitting");
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "finalized");

      console.log("✅ 트랜잭션 전송 성공:", signature);
      setStatus("done");

      console.log(`✅ 모델 업로드 성공! 파일 수: ${response.data.uploadedCount}`);
      console.log(`🎉 온체인 등록 완료! Tx: ${signature}`);

      // ✅ DB에 모델 정보 최종 저장
      await api.post(
        "/model/complete",
        {
          modelName,
          description,
          is_derivative: isDerivative === "Y",
          royalty,
          s3_key,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },      
        }
      );
      console.log("✅ 모델 정보 DB 저장 완료");
    } catch (error) {
      console.error("❌ 처리 실패", error);
      setStatus("idle");
      alert("업로드 또는 트랜잭션 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <StatusModal status={status} onClose={handleCloseModal} />
      <div style={{ padding: "2rem", color: "white", display: "flex", justifyContent: "center" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "400px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label>모델 이름</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label>모델 설명</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label>2차 창작 여부</label>
            <select
              value={isDerivative}
              onChange={(e) => setIsDerivative(e.target.value)}
              style={inputStyle}
            >
              <option value="">선택하세요</option>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label>로열티 비율 (%)</label>
            <input
              type="number"
              value={royalty}
              onChange={(e) => setRoyalty(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label>모델 폴더 선택</label>
            <input
              type="file"
              multiple
              //@ts-ignore
              webkitdirectory="true"
              onChange={handleFolderChange}
              style={inputStyle}
            />
          </div>

          <button type="submit" style={buttonStyle}>모델 등록 및 온체인 트랜잭션</button>
        </form>
      </div>
    </>
  );
};

const inputStyle: React.CSSProperties = {
  padding: "0.75rem",
  borderRadius: "1rem",
  border: "none",
  backgroundColor: "#d1d5db",
  fontSize: "1rem"
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#d1d5db",
  border: "none",
  borderRadius: "1rem",
  padding: "0.75rem",
  color: "#000",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "1rem",
  marginTop: "1rem"
};

export default RegisterModelPage;
