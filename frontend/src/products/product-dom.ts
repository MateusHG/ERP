import productModel from "./product-model";
import { formatData, initNavigation } from "./utils";

window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
});

// ** Funções de manipulação do DOM(Document Object Model), inserir, limpar, preencher formulário, etc. ** //
window.addEventListener('DOMContentLoaded', async () => {
  const dateTimeElement = document.getElementById('datetime');
  const loggedUser = document.getElementById('logged-user');
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement; 

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  // Atualiza a data atual no topo
  if (dateTimeElement) {
    setInterval(() => {
      const now = new Date();
      dateTimeElement.textContent = now.toLocaleDateString('pt-BR');
    }, 1000);
  }

  // Exibe o nome do usuário logado.
  if (loggedUser) {
    loggedUser.textContent = username || 'Desconhecido.';
  }

  //Fazer logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      console.log('Saindo do sistema...');
      window.location.href = '/auth/login.html';
    });
  }
});

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
    tr.appendChild(textCell(product.estoque));
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