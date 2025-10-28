import productModel from "./product-model";
import { formatData } from "../utils/formatters";
import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";

window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
});

// ** Funções de manipulação do DOM(Document Object Model), inserir, limpar, preencher formulário, etc. ** //

//Renderiza produtos na tela.
export function renderProductsList(products: productModel[]): void {
  const tbody = document.getElementById("produtos-tbody") as HTMLTableSectionElement | null;
  if (!tbody) return;

  tbody.innerHTML = "" // limpa o conteúdo anterior

  products.forEach(product => {
    const tr = document.createElement("tr");
    
    const textCell = (value: string | number): HTMLTableCellElement => {
      const td = document.createElement("td");
      td.textContent = String(value);
      return td;
    };

    tr.appendChild(textCell(product.id));
    tr.appendChild(textCell(product.codigo));
    tr.appendChild(textCell(product.nome));
    tr.appendChild(textCell(product.descricao));
    tr.appendChild(textCell(product.preco));
    tr.appendChild(textCell(product.categoria));
    tr.appendChild(textCell(product.status));
    tr.appendChild(textCell(product.estoque_minimo));
    tr.appendChild(textCell(product.estoque_maximo));
    tr.appendChild(textCell(formatData(product.data_cadastro)));
    tr.appendChild(textCell(formatData(product.data_atualizacao)));

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "✏️";
    btnEdit.dataset.id = product.id.toString();

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.textContent = "❌";
    btnDelete.dataset.id = product.id.toString();

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
};

//Pega os valores dos campos de filtro.
export function getFilterValues() {
  return {
    id: (document.querySelector('#filtro-id') as HTMLInputElement)?.value || "",
    nome: (document.querySelector('#filtro-nome') as HTMLInputElement)?.value || "",
    categoria: (document.querySelector('#filtro-categoria') as HTMLInputElement)?.value || "",
    status: (document.querySelector('#filtro-status') as HTMLSelectElement)?.value || ""
  }
};