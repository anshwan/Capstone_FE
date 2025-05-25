import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import PhantomLogin from "./components/PhantomLogin";
import SuccessPage from "./pages/SuccessPage";
import RegisterModelPage from "./pages/RegisterModelPage";
import ModelListPage from "./pages/ModelListPage";
import InferencePage from "./pages/InferencePage";
import RagPage from "./pages/RagPage";
import FineTuningPage from "./pages/FineTuningPage";
import Layout from "./components/Layout";
import BackgroundCanvas from "./components/BackgroundCanvas";
import RegisterDatasetPage from "./pages/RegisterDatasetPage";

// 로그인 화면에만 배경만 있고 메뉴바 없음
const BackgroundOnlyWrapper: React.FC = () => (
  <div style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
    <BackgroundCanvas />
    <div style={{ position: "relative", zIndex: 10 }}>
      <Outlet />
    </div>
  </div>
);

// 로그인 이후 모든 페이지는 Layout + Background 포함
const LayoutWrapper: React.FC = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 로그인 전용 화면 */}
        <Route element={<BackgroundOnlyWrapper />}>
          <Route path="/" element={<PhantomLogin />} />
        </Route>

        {/* 로그인 후 메뉴 + 배경 포함 레이아웃 */}
        <Route element={<LayoutWrapper />}>
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/register-model" element={<RegisterModelPage />} />
          <Route path="/register-dataset" element={<RegisterDatasetPage/>} />
          <Route path="/model-list" element={<ModelListPage />} />
          <Route path="/inference" element={<InferencePage />} />
          <Route path="/fine-tune" element={<FineTuningPage />} />
          <Route path="/rag" element={<RagPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
