import { formatCurrency } from "../utils/formatters";

document.addEventListener("itemsUpdated", (e: any) => {
  console.log("Evento itemsUpdated recebido:", e.detail);
  updateTotalPurchaseDisplay();
});

/** Converte texto de moeda (R$ 1.234,56) para número */
function parseCurrency(value: string | null | undefined): number {
  if (!value) return 0;
  const num = parseFloat(value.replace(/[^\d,-]/g, "").replace(",", "."));
  return isNaN(num) ? 0 : num;
}

export function calcTotalPurchase(
  gross: number,
  descontoVolume: number,
  descontoFinanceiro: number,
  descontoComercial: number
) {
  const totalDiscounts = descontoVolume + descontoFinanceiro + descontoComercial;
  const total = gross - (descontoFinanceiro + descontoComercial);
  return { totalDiscounts, total };
}

export function updateTotalPurchaseDisplay() {
  const totalItemsWithDiscount = parseCurrency(
    document.getElementById("total-items-final")?.textContent
  );

  const descontoVolume = parseCurrency(
    (document.getElementById("new-desconto-itens") as HTMLInputElement)?.value ||
    document.getElementById("new-desconto-itens")?.textContent
  );

  const descontoFinanceiro = parseCurrency(
    (document.getElementById("new-desconto-financeiro") as HTMLInputElement)?.value ||
    document.getElementById("new-desconto-financeiro")?.textContent
  );

  const descontoComercial = parseCurrency(
    (document.getElementById("new-desconto-comercial") as HTMLInputElement)?.value ||
    document.getElementById("new-desconto-comercial")?.textContent
  );

  console.log("Valores numéricos convertidos:", {
    totalItemsWithDiscount,
    descontoVolume,
    descontoFinanceiro,
    descontoComercial
  });

  const { totalDiscounts, total } = calcTotalPurchase(
    totalItemsWithDiscount,
    descontoVolume,
    descontoFinanceiro,
    descontoComercial
  );

  const descontosTotaisEl = document.getElementById("new-descontos-totais") as HTMLInputElement;
  if (descontosTotaisEl) {
    descontosTotaisEl.value = formatCurrency(totalDiscounts);
  }

  const valorTotalEl = document.getElementById("new-valor-total") as HTMLInputElement;
  if (valorTotalEl) {
    valorTotalEl.value = formatCurrency(total);
  }
}
