import productModel from "./product-model";
import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { capitalize } from "../utils/formatters";

window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
});

// ** Funções de manipulação do DOM(Document Object Model), inserir, limpar, preencher formulário, etc. ** //

//Renderiza produtos na tela.
export function renderProductsList(products: productModel[]): void {
  const tbody = document.getElementById("products-tbody") as HTMLTableSectionElement | null;
  if (!tbody) return;

  tbody.innerHTML = "" // limpa o conteúdo anterior

  products.forEach(product => {
    const tr = document.createElement("tr");
    
    const textCell = (value: string | number): HTMLTableCellElement => {
      const td = document.createElement("td"); // td = table data
      td.textContent = String(value);
      return td;
    };

    tr.appendChild(textCell(product.id));
    tr.appendChild(textCell(product.codigo));
    tr.appendChild(textCell(product.nome));
    tr.appendChild(textCell(product.descricao));
    tr.appendChild(textCell(product.categoria));
    tr.appendChild(textCell(product.estoque_minimo));
    tr.appendChild(textCell(product.estoque_maximo));
    tr.appendChild(textCell(capitalize(product.status)));

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.dataset.id = product.id.toString(); // Guarda o id do produto vindo do backend no botão de editar.
    btnEdit.innerHTML = `<img src="/erpicons/edit-file.svg" alt="Editar Produto" class="icon-btn" />`;
    btnEdit.title = "Clique para editar este produto"

    const btnDelete = document.createElement("button");
    btnDelete.dataset.id = product.id.toString();
    btnDelete.innerHTML = `<img src="/erpicons/delete.svg" alt="Deletar Produto" class="icon-btn" />`;

    if (product.has_movements) {
      //Bloqueado deletar se já movimentou no sistema.
      btnDelete.className = "btn-delete disabled-delete";
      btnDelete.disabled = true;
      btnDelete.title = "Este produto já foi movimentado no sistema e não pode ser excluído.";
    } else {
      btnDelete.className = "btn-delete";
      btnDelete.title = "Clique para deletar este produto.";
    }

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