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


// ======== Tratamento de token expirado. ====== ///
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      const refreshResponse = await fetch("https://localhost:3000/api/auth/refresh-token", {
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

  // ============ Tratamento de erros =========== //
  if (!response.ok) {
  let errorBody: any = null;

  try {
    // 🔹 Garante leitura segura do JSON, mesmo que o servidor retorne 400
    const text = await response.text();
    errorBody = text ? JSON.parse(text) : null;
  } catch {
    errorBody = { message: "Erro ao interpretar resposta do servidor." };
  }

  const message =
    errorBody?.message || `Erro na requisição (${response.status}).`;

  // 🔹 Inclui todo o corpo original do erro (para acessar detalhes no service)
  const error = new Error(message) as any;
  error.responseData = errorBody;

  throw error;
}

  return response;
};