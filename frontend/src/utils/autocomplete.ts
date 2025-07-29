import { authorizedFetch } from "./fetch-helper";

export async function setupSupplierAutoComplete(
  inputId: string,
  hiddenInputId: string,
  suggestionsId: string
) {
  const input = document.getElementById(inputId) as HTMLInputElement;
  const hiddenInput = document.getElementById(hiddenInputId) as HTMLInputElement | null;
  const suggestions = document.getElementById(suggestionsId) as HTMLUListElement;

  if (!input || !hiddenInput || !suggestions) {
    console.error("Autocomplete: Elementos não encontrados.");
    return;
  }

  let selectedSupplierName = "";
  let currentController: AbortController | null = null;

  async function loadSuppliers(query: string) {
    if (currentController) {
      currentController.abort();
    }

    currentController = new AbortController();

    try {
      const res = await authorizedFetch(
        `https://localhost:3000/api/fornecedores?nome_fantasia=${encodeURIComponent(query)}`,
        { signal: currentController.signal }
      );

      const suppliers = await res.json();
      suggestions.innerHTML = "";

      suppliers.forEach((supplier: any) => {
        const li = document.createElement("li");
        li.textContent = `${supplier.nome_fantasia} (ID: ${supplier.id})`;
        li.classList.add("suggestion-item");

        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          input.value = supplier.nome_fantasia;
          input.dataset.id = String(supplier.id)
          selectedSupplierName = supplier.nome_fantasia;
          suggestions.classList.add("hidden");
        });

        suggestions.appendChild(li);
      });

      suggestions.classList.toggle("hidden", suppliers.length === 0);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Erro ao buscar fornecedores:", err);
      }
      suggestions.classList.add("hidden");
    }
  }

  input.addEventListener("input", () => {
    const query = input.value.trim();
    hiddenInput.value = "";
    selectedSupplierName = "";

    if (query.length >= 2) {
      loadSuppliers(query);
    } else {
      suggestions.classList.add("hidden");
    }
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target as Node) && !suggestions.contains(e.target as Node)) {
      suggestions.classList.add("hidden");
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (input.value !== selectedSupplierName) {
        hiddenInput.value = "";
        suggestions.classList.add("hidden");
      }
    }, 300);
  });
}
