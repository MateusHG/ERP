import supplierModel from "./supplier-model";
import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { capitalize, formatCnpj } from "../utils/formatters";

//Navegação entre os módulos
window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
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
    tr.appendChild(textCell(capitalize(supplier.status)));

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.dataset.id = supplier.id.toString();
    btnEdit.innerHTML = `<img src="/erpicons/edit.svg" alt="Editar Fornecedor" class="icon-btn" />`;
    btnEdit.title = "Clique para editar este fornecedor"

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.dataset.id = supplier.id.toString();
    btnDelete.innerHTML = `<img src="/erpicons/delete.svg" alt="Deletar Fornecedor" class="icon-btn" />`;
    btnDelete.title = "Clique para deletar este fornecedor"

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