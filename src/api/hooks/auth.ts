import { useMutation } from "@tanstack/react-query";
import api from "../client";

export function useLogin() {
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const { data } = await api.post<{ token: string }>("/auth/token/", { username, password });
      localStorage.setItem("auth_token", data.token);
      return data;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("auth_token");
      return true;
    },
  });
}
