import supplierModel from "./supplier-model";
import { formatData, initNavigation } from "./utils";

//Navegação entre os módulos
window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
});

window.addEventListener('DOMContentLoaded', async () => {
  const dateTimeElement = document.getElementById('datetime');
  const loggedUser = document.getElementById('logged-user');
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
  
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

if (dateTimeElement) {
  setInterval(() => {
    const now = new Date();
    dateTimeElement.textContent = now.toLocaleDateString('pt-BR');
  }, 1000);
}

if (loggedUser) {
  loggedUser.textContent = username || 'Desconhecido';
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    console.log('Saindo do sistema...');
    window.location.href = 'auth/login.html';
  });
}
});

export function renderSuppliersList(suppliers: supplierModel[]): void {
  const tbody = document.getElementById("suppliers-tbody") as HTMLTableSectionElement | null;
  if (!tbody) return;

  tbody.innerHTML = ""

  suppliers.forEach(supplier => {
    const tr = document.createElement("tr");

    const textCell = (value: string | number | null | undefined): HTMLTableCellElement => {
      const td = document.createElement("td");
      td.textContent = value ? String(value): "-"
      return td;
    };

    tr.appendChild(textCell(supplier.id));
    tr.appendChild(textCell(supplier.nome_fantasia));
    tr.appendChild(textCell(supplier.razao_social));
    tr.appendChild(textCell(supplier.cnpj));
    tr.appendChild(textCell(supplier.telefone));
    tr.appendChild(textCell(supplier.email));
    tr.appendChild(textCell(supplier.uf));
    tr.appendChild(textCell(supplier.status));
    tr.appendChild(textCell(formatData(supplier.data_cadastro)));
    tr.appendChild(textCell(formatData(supplier.data_atualizacao)));

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "✏️";
    btnEdit.dataset.id = supplier.id.toString();

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.textContent = "❌";
    btnDelete.dataset.id = supplier.id.toString();

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
};