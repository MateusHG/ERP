// Funções para travar / destravar campos dos modais de compra/venda
// Caso já tenha movimentado estoque(status finalizado/entregue/recebido), bloqueia a edição dos campos

export function lockFormFields(
  form: HTMLFormElement,
  helperMessage: string,
  options?: {
    allowNames?: string[]; // campos que permanecem editávies mesmo bloqueado(apenas status)
  }
) {
  const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");

  fields.forEach(field => {
    // Ignora inputs que estão dentro da tabela de itens
    if (field.closest("#items-table")) return;


    // Campos que devem continuar editávies
    if (options?.allowNames?.includes(field.name)) return;


    if (field instanceof HTMLInputElement) {
      field.readOnly = true;
      field.style.cursor = "not-allowed";
    
    } else if (field instanceof HTMLSelectElement) {
      field.dataset.locked = "true";
      field.style.pointerEvents = "none";
      field.style.background = "#f5f5f5";
      field.style.color = "#777";
    }

    field.title = helperMessage;
  });
};

// Destrava os campos dos forms
export function unlockFormFields(
  form: HTMLFormElement,
  options?: {
    readOnlyNames?: string[]; // campos que devem ficar sempre como readonly
  }
) {
  const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");

  fields.forEach(field => {
    if (field.closest("#items-table")) return;
    
    // Nunca desbloquear o ID
    if (field.name === "edit-id") return;

    // Campos que continuarão readonly
    if (options?.readOnlyNames?.includes(field.name)) {
      field.title = "Campo de visualização - calculado automaticamente.";

      if (field instanceof HTMLInputElement) {
        field.readOnly = true;
        field.style.cursor = "not-allowed";
      }

      return;
    }

    // Desbloquear inputs
    if (field instanceof HTMLInputElement) {
      field.readOnly = false;
      field.style.cursor = "text";
    
    } else if (field instanceof HTMLSelectElement) {
      field.dataset.locked = "false";
      field.style.pointerEvents = "auto";
      field.style.background = "";
      field.style.color = "";
    }

    field.title = "";
  });
};

// Bloqueia edição de itens (inputs + selects + botões)
export function lockItemRows(
  container: HTMLElement,
  helperMessage: string,
  options?: {
    addButtonSelector?: string; // seletor do botão de adicionar item
  }
) {
  const { addButtonSelector } = options || {};

  container.querySelectorAll("tr").forEach(tr => {
    tr.dataset.locked = "true"
  });

  // Bloquear botão de adicionar item
  if (addButtonSelector) {
    const addBtn = document.querySelector(addButtonSelector);
    if (addBtn instanceof HTMLButtonElement) {
      addBtn.disabled = true;
      addBtn.title = helperMessage;
      addBtn.style.cursor = "not-allowed";
    }
  }

  // Bloquear botões dentro do container
  const buttons = container.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.title = helperMessage;
    btn.style.cursor = "not-allowed";
  });

  // Bloquear inputs
  const inputs = container.querySelectorAll("input");
  inputs.forEach(inp => {
    inp.readOnly = true;
    inp.style.background = "#f5f5f5";
    inp.title = helperMessage;
    inp.style.cursor = "not-allowed";
  });

  // Bloquear selects
  const selects = container.querySelectorAll("select");
  selects.forEach(sel => {
    sel.disabled = true;
    sel.title = helperMessage;
    sel.style.cursor = "not-allowed";
    sel.style.background = "#f5f5f5";
    sel.style.color = "#777";
  });
};


// Desbloqueia itens (inputs + selects + botões)
export function unlockItemRows(
  container: HTMLElement,
  options?: {
    addButtonSelector?: string;
  }
) {
  const { addButtonSelector } = options || {};

  container.querySelectorAll("tr").forEach(tr => {
    delete tr.dataset.locked;
  });

  const rows = container.querySelectorAll("tr");

  rows.forEach(row => {
    const inputs = row.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");

    inputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.readOnly = false;
      }

      if (input instanceof HTMLSelectElement) {
        input.disabled = false;
      }

      input.style.pointerEvents = "auto";
      input.style.background = "";
      input.style.color = "";
      input.title = "";
      input.style.cursor = "text";
    });

    const buttons = row.querySelectorAll("button");
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.title = "";
      btn.style.cursor = "pointer";
    });
  });

  // Desbloquear botão "Adicionar item"
  if (addButtonSelector) {
    const addBtn = document.querySelector(addButtonSelector);
    if (addBtn instanceof HTMLButtonElement) {
      addBtn.disabled = false;
      addBtn.title = "";
      addBtn.style.cursor = "pointer";
    }
  }
};