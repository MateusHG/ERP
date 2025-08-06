import { fetchProductSuggestions } from "../purchases/purchases-service";
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

//Autocomplete para itens na compra.
export function attachItemAutoComplete(input: HTMLInputElement, onSelect: (item: any) => void) {
  let suggestionBox: HTMLUListElement | null = null;

  const closeSuggestions = () => {
    if (suggestionBox) {
      suggestionBox.remove();
      suggestionBox = null;
    }
  };

  const showSuggestions = async () => {
    closeSuggestions();

    const term = input.value.trim();
    if (!term) return;

    const suggestions = await fetchProductSuggestions(term); // implementa a API

    if (!suggestions.length) return;

    suggestionBox = document.createElement("ul");
    suggestionBox.className = "autocomplete-list";
    suggestionBox.style.position = "absolute";
    suggestionBox.style.zIndex = "1000";
    suggestionBox.style.backgroundColor = "white";
    suggestionBox.style.border = "1px solid #ccc";
    suggestionBox.style.width = input.offsetWidth + "px";

    const rect = input.getBoundingClientRect();
    suggestionBox.style.left = rect.left + window.scrollX + "px";
    suggestionBox.style.top = rect.bottom + window.scrollY + "px";

    suggestions.forEach((item: any) => {
      const li = document.createElement("li");
      li.textContent = `${item.codigo} - ${item.nome}`;
      li.style.padding = "4px";
      li.style.cursor = "pointer";

      li.addEventListener("click", () => {
        onSelect(item);
        input.value = item.nome;
        closeSuggestions();
      });

      suggestionBox!.appendChild(li);
    });

    document.body.appendChild(suggestionBox);
  };

  const debouncedFetch = debounce(showSuggestions, 300);

  input.addEventListener("input", debouncedFetch);
  input.addEventListener("blur", () => setTimeout(closeSuggestions, 200));
}

/**
 * Debounce - Aguarda o usuário parar de disparar eventos antes de executar a função.
 *
 * @param func Função a ser chamada após o atraso.
 * @param delay Tempo de espera em milissegundos.
 * @returns Uma nova função que aplica debounce.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | undefined;

  return (...args: Parameters<T>) => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      func(...args);
    }, delay);
  };
}