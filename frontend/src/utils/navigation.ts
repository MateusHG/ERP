import { authorizedFetch } from "./fetch-helper";

//Arquivo responsável pela navegação entre os módulos do sistema
export async function initNavigation() {
  const routes: Record<string, string> = {
    'btn-dashboard': '/dashboard/dashboard.html',
    'btn-products': '/products/products.html',
    'btn-suppliers': '/suppliers/suppliers.html',
    'btn-purchases': '/purchases/purchases.html',
    'btn-customers': '/customers/customers.html',
    'btn-sales': '/sales/sales.html'
  };

  Object.entries(routes).forEach(([btnId, path]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        window.location.href = path;
      });
    }
  });
};

export async function initHeaderData() {
  const dateTimeElement = document.getElementById('datetime');
  if (dateTimeElement) {
    setInterval(() => {
      const now = new Date();
      dateTimeElement.textContent = now.toLocaleDateString('pt-BR');
    }, 100);
  }

  const loggedUser = document.getElementById('logged-user');

  try {
    const response = await authorizedFetch('https://localhost:3000/api/auth/me-info', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error();

    const data = await response.json();
    if (loggedUser) {
      loggedUser.textContent = data.name || data.username || 'Usuário';
    }
  } catch (err) {
    if (loggedUser) {
      loggedUser.textContent = 'Desconhecido';
    }
  }
};

export async function initLogout() {
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const response = await authorizedFetch("https://localhost:3000/api/auth/logout", {
          method: "POST"
        });

        if (response.ok) {
          sessionStorage.clear();
          console.log("Logout realizado com sucesso.");
          console.log("Redirecionando para:", `${window.location.origin}/auth/login.html`);
          window.location.replace(`${window.location.origin}/auth/login.html`);
        } else {
          console.error("Erro ao fazer logout:", await response.text());
        }
      } catch (err) {
        console.error("Erro de rede ao fazer logout:", err)
      }
    });
  }
};