import { showNotAuthorizedMessage } from "./messages";

export async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let isRefreshing = false;

  const finalOptions: RequestInit = {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include', // envia cookies httpOnly
  };

  let response = await fetch(url, finalOptions);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      const refreshResponse = await fetch("http://localhost:3000/api/auth/refresh-token", {
        method: "POST",
        credentials: "include"
      });

      isRefreshing = false;

      if (refreshResponse.ok) {
        // Token renovado com sucesso, refaz a requisição original
        response = await fetch(url, finalOptions);
      } else {
        showNotAuthorizedMessage();
        throw new Error('Sessão não autorizada.');
      }
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || "Erro na requisição.");
    } else {
      const fallbackText = await response.text();
      throw new Error(fallbackText || "Erro desconhecido.");
    }
  }

  return response;
}