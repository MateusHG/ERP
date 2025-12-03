export function lockProductFormFields(form: HTMLFormElement, helperMessage: string) {
  const lockedFields = ["id", "codigo"];

  lockedFields.forEach(fieldName => {
    const field = form.elements.namedItem(fieldName) as HTMLInputElement | HTMLSelectElement | null;

    if (!field) return;

    if (field.name === "status") return;

    if (field instanceof HTMLInputElement) {
      field.readOnly = true;
      field.style.cursor = "not-allowed";
      field.style.background = "#f5f5f5";
      field.style.color = "#000000ff";
      field.title = helperMessage;
      return;
    }

    if (field instanceof HTMLSelectElement) {
      field.disabled = true;
      field.style.pointerEvents = "none";
      field.style.background = "#f5f5f5";
      field.style.color = "#777";
      field.title = helperMessage;
      return;
    }
  });
};


export function unlockProductFormFields(form: HTMLFormElement) {
  const lockedFields = ["id", "codigo"];

  lockedFields.forEach(fieldName => {
    const field = form.elements.namedItem(fieldName) as | HTMLInputElement | HTMLSelectElement | null;

    if (!field) return;

    // Não desbloqueia ID
    if (fieldName === "id") return;

    // INPUTS --------------------------------------------------------
    if (field instanceof HTMLInputElement) {
      field.readOnly = false;
      field.style.cursor = "";
      field.style.background = "";
      field.style.color = "";
      field.title = "";
      return;
    }

    // SELECTS --------------------------------------------------------
    if (field instanceof HTMLSelectElement) {
      field.disabled = false;
      field.style.pointerEvents = "auto";
      field.style.background = "";
      field.style.color = "";
      field.title = "";
      return;
    }
  });
};