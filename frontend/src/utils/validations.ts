//Pega os dados do cadastro atual, para comparar depois se houve alteração.
export function getFormDataSnapshot(form: HTMLFormElement): Record<string, string> {
  const data: Record<string, string> = {};
  const elements = form.elements;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLInputElement | HTMLSelectElement;
    if (el.name) {
      data[el.name] = el.value.trim();
    }
  }
    return data;
};

//Valida se os dados originais foram alterados comparando com os atuais.
export function isFormChanged(form: HTMLFormElement, originalData: Record<string, string>): boolean {
  const currentData = getFormDataSnapshot(form);
  const ignoreFields = ["data_cadastro, data_atualizacao"];

  console.log("originalData:", originalData);
  console.log("currentData:", currentData);

  return Object.keys(originalData).some(key => {
    if (ignoreFields.includes(key)) return false;

    const orig = originalData[key]?.trim();
    const curr = currentData[key]?.trim();

    return orig !== curr;
  })
};