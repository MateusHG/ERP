import { formatCurrency } from "../utils/formatters";

document.addEventListener("itemsUpdated", (e: any) => {
  console.log("Evento itemsUpdated recebido:", e.detail);
  updateTotalPurchaseDisplay();
});

export function calcTotalPurchase(
  totalItemsWithDiscount: number,
  descontoFinanceiro: number,
  descontoComercial: number,
): number {
  return totalItemsWithDiscount - descontoComercial - descontoFinanceiro;
}

export function updateTotalPurchaseDisplay() {
  const totalItemsWithDiscount = parseFloat(
    (document.getElementById("total-items-final")?.textContent?.replace(/[^\d.,-]/g, "").replace(",", ".") || "0")
  );

  const descontoFinanceiro = parseFloat(
    (document.getElementById("desconto-financeiro") as HTMLInputElement)?.value || "0"
  );

  const descontoComercial = parseFloat(
    (document.getElementById("desconto-comercial") as HTMLInputElement)?.value || "0"
  );


  console.log({
    totalItemsWithDiscount,
    descontoFinanceiro,
    descontoComercial,
  });

  const totalCabecalho = calcTotalPurchase(
    totalItemsWithDiscount,
    descontoFinanceiro,
    descontoComercial
  );

  const valorTotalEl = document.getElementById("valor-total");
  if (valorTotalEl) {
    valorTotalEl.textContent = formatCurrency(totalCabecalho);
  }
}
