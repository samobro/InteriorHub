import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("interiorrhub_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalConfig = error.config as typeof error.config & { _retry?: boolean };
      const isTokenRequest = originalConfig?.url?.includes("/connect/token");

      if (!isTokenRequest && !originalConfig?._retry) {
        const refreshToken = localStorage.getItem("interiorrhub_refresh_token");

        if (refreshToken) {
          try {
            const payload = new URLSearchParams();
            payload.set("grant_type", "refresh_token");
            payload.set("refresh_token", refreshToken);

            const refreshResponse = await axios.post(
              "/connect/token",
              payload.toString(),
              {
                baseURL: apiClient.defaults.baseURL,
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            );

            const newAccessToken = refreshResponse.data?.access_token;
            if (!newAccessToken) {
              throw new Error("The refresh response did not include an access token.");
            }

            const newRefreshToken = refreshResponse.data?.refresh_token;
            localStorage.setItem("interiorrhub_token", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("interiorrhub_refresh_token", newRefreshToken);
            }

            originalConfig._retry = true;
            originalConfig.headers = originalConfig.headers ?? {};
            originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

            return apiClient(originalConfig);
          } catch (refreshError) {
            localStorage.removeItem("interiorrhub_token");
            localStorage.removeItem("interiorrhub_refresh_token");
            // Redirect to login using window.location so it works outside React context if needed
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }
      }

      localStorage.removeItem("interiorrhub_token");
      localStorage.removeItem("interiorrhub_refresh_token");
      // Redirect to login using window.location so it works outside React context if needed
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
