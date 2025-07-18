//Arquivo responsável pela navegação entre os módulos do sistema.

export async function initNavigation() {
  const routes: Record<string, string> = {
    'btn-dashboard': '/dashboard/dashboard.html',
    'btn-products': '/products/products.html',
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