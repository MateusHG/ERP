import { fetchProductSuggestions } from "../purchases/purchases-service";
import { authorizedFetch } from "./fetch-helper";

export async function setupSupplierAutoComplete(
  input: HTMLInputElement,
  hiddenInput: HTMLInputElement,
  suggestionsList: HTMLUListElement,
  initialSupplierName: string = ""
) {
  let selectedSupplierName = initialSupplierName;
  let currentController: AbortController | null = null;

  if (initialSupplierName && hiddenInput.value) {
    selectedSupplierName = initialSupplierName;
  }

  async function loadSuppliers(query: string) {
    if (currentController) currentController.abort();
    currentController = new AbortController();

    try {
      const res = await authorizedFetch(
        `https://localhost:3000/api/fornecedores?nome_fantasia=${encodeURIComponent(query)}`,
        { signal: currentController.signal }
      );

      const suppliers = await res.json();
      suggestionsList.innerHTML = "";

      suppliers.forEach((supplier: any) => {
        const li = document.createElement("li");
        li.textContent = `${supplier.nome_fantasia} (ID: ${supplier.id})`;
        li.classList.add("suggestion-item");

        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          input.value = supplier.nome_fantasia;
          hiddenInput.value = String(supplier.id); // ✅ ID salvo para backend
          selectedSupplierName = supplier.nome_fantasia;
          suggestionsList.classList.add("hidden");
        });

        suggestionsList.appendChild(li);
      });

      suggestionsList.classList.toggle("hidden", suppliers.length === 0);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Erro ao buscar fornecedores:", err);
      }
      suggestionsList.classList.add("hidden");
    }
  }

  input.addEventListener("input", () => {
    const query = input.value.trim();

    // Limpa o id sempre que o usuário digita manualmente
    if (query !== selectedSupplierName) {
      hiddenInput.value = "";
    }
    
    if (query.length >= 2) {
      loadSuppliers(query);
    } else {
      suggestionsList.classList.add("hidden");
    }
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target as Node) && !suggestionsList.contains(e.target as Node)) {
      suggestionsList.classList.add("hidden");
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      // Se o valor do input não corresponder ao fornecedor selecionado, limpa o id
      if (input.value !== selectedSupplierName) {
        hiddenInput.value = "";
        selectedSupplierName = "";
        suggestionsList.classList.add("hidden");
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

    const filters: { id?: string, codigo?: string, nome?: string} = {};
    if (input.name === "item-product-id") filters.id = term;
    else if (input.name === "item-code") filters.codigo = term;
    else filters.nome = term;

    const suggestions = await fetchProductSuggestions(filters); // implementa a API

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
      li.textContent = `${item.id} - ${item.codigo} - ${item.nome}`;
      li.style.padding = "4px";
      li.style.cursor = "pointer";

      li.addEventListener("click", () => {
        onSelect(item);

        if(input.name === "item-code") {
          input.value = item.codigo;

        } else if (input.name === "item-product-id") {
          input.value = item.id;
          
        } else {
          input.value = item.nome;
        }

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