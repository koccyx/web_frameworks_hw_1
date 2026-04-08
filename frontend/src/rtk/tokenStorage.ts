const ACCESS_TOKEN_KEY = "accessToken";

export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem("token");
  },
  setAccess(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem("token", token);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("token");
  },
};

