// Navegação entre abas dos modais do sistema.

export function initTabs(container: HTMLElement) {
  const tabs = container.querySelectorAll('.tab'); 
  const contents = container.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabId = (tab as HTMLElement).dataset.tab;
      if (!tabId) return;

      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");

      const content = container.querySelector(`#${tabId}`);
      if (content) content.classList.add("active");
    });
  });
}