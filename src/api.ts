import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ 쿠키 포함 (refresh token용)
});

// 요청 인터셉터: JWT 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 토큰 만료 시 refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry // 무한 루프 방지
    ) {
      originalRequest._retry = true;

      try {
        // ✅ refresh token으로 새 access token 요청
        const refreshRes = await axios.post(`${API_URL}/login/refresh`, {}, { withCredentials: true });
        const newToken = refreshRes.data.token;

        // ✅ 새 토큰 저장 및 기존 요청 재시도
        localStorage.setItem("jwt", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // ✅ refresh 토큰도 실패 → 로그인 페이지로 이동
        localStorage.removeItem("jwt");
        window.location.href = "/login"; // 또는 navigate("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
