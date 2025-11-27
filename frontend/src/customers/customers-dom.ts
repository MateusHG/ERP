import supplierModel from "./customer-model";
import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { formatCnpj, formatData } from "../utils/formatters";

//Navegação entre os módulos
window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
});

export function renderCustomersList(customers: supplierModel[]): void {
  const tbody = document.getElementById("customers-tbody") as HTMLTableSectionElement | null;
  if (!tbody) return;

  tbody.innerHTML = ""

  customers.forEach(customer => {
    const tr = document.createElement("tr");

    const textCell = (value: string | number | null | undefined): HTMLTableCellElement => {
      const td = document.createElement("td");
      td.textContent = value ? String(value): "-"
      return td;
    };

    tr.appendChild(textCell(customer.id));
    tr.appendChild(textCell(customer.nome_fantasia));
    tr.appendChild(textCell(customer.razao_social));
    tr.appendChild(textCell(customer.cnpj));
    tr.appendChild(textCell(customer.telefone));
    tr.appendChild(textCell(customer.email));
    tr.appendChild(textCell(customer.uf));
    tr.appendChild(textCell(customer.status));

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.dataset.id = customer.id.toString();
    btnEdit.innerHTML = `<img src="/erpicons/edit.svg" alt="Editar" class="icon-btn" />`;
    btnEdit.title = "Clique para editar este cliente"
    btnEdit.className = "btn-edit";

    const btnDelete = document.createElement("button");
    btnDelete.dataset.id = customer.id.toString();
    btnDelete.innerHTML = `<img src="/erpicons/delete.svg" alt="Editar" class="icon-btn" />`;
    btnDelete.title = "Clique para deletar este cliente"
    btnDelete.className = "btn-delete";

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
};

//Pega os valores dos campos de filtro.
export function getFilterValues() {
  return {
    id: (document.querySelector("#filtro-id") as HTMLInputElement)?.value || "",
    nome_fantasia: (document.querySelector("#filtro-nome-fantasia") as HTMLInputElement)?.value || "",
    razao_social: (document.querySelector("#filtro-razao-social") as HTMLInputElement)?.value || "",
    cnpj: (document.querySelector("#filtro-cnpj") as HTMLInputElement)?.value || "",
    email: (document.querySelector("#filtro-email") as HTMLInputElement)?.value || "",
    status: (document.querySelector("#filtro-status") as HTMLSelectElement)?.value || "",
  };
};

//Event listener para formatar os números no filtro do CNPJ.
window.addEventListener('DOMContentLoaded', () => {
  const cnpjInput = document.querySelector('#filtro-cnpj') as HTMLInputElement | null;
  
  if (cnpjInput) {
    cnpjInput.addEventListener("input", () => {
      const rawValue = cnpjInput.value;

      //Guarda a posição do cursor.
      const cursor = cnpjInput.selectionStart ?? 0;
      const beforeFormatLength = rawValue.length;

      const formatted = formatCnpj(rawValue);
      cnpjInput.value = formatted;

      const afterFormatLength = formatted.length;
      const diff = afterFormatLength - beforeFormatLength;
      cnpjInput.setSelectionRange(cursor + diff, cursor + diff);
    });
  }
});