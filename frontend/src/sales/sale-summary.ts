import { formatCurrency } from "../utils/formatters";

document.addEventListener("itemsUpdated", (e: any) => {
  const prefix = e.detail?.prefix || "new";
  updateTotalSaleDisplay(prefix);
});

/** Converte texto de moeda (R$ 1.234,56) para número */
function parseCurrency(value: string | null | undefined): number {
  if (!value) return 0;
  const num = parseFloat(value.replace(/[^\d,-]/g, "").replace(",", "."));
  return isNaN(num) ? 0 : num;
};

export function calcTotalSale(
  gross: number,
  descontoVolume: number,
  descontoFinanceiro: number,
  descontoComerical: number
) {
  const totalDiscounts = descontoVolume + descontoComerical + descontoFinanceiro;
  const total = gross - totalDiscounts;
  return { totalDiscounts, total };
};

export function updateTotalSaleDisplay(prefix: "new" | "edit" = "new") {
  const valorBruto = parseCurrency(
    (document.getElementById(`${prefix}-valor-bruto`) as HTMLInputElement)?.value ||
    document.getElementById(`${prefix}-valor-bruto`)?.textContent
  )

  const descontoVolume = parseCurrency(
    (document.getElementById(`${prefix}-desconto-itens`) as HTMLInputElement)?.value ||
    document.getElementById(`${prefix}-desconto-itens`)?.textContent
  );

  const descontoFinanceiro = parseCurrency(
    (document.getElementById(`${prefix}-desconto-financeiro`) as HTMLInputElement)?.value ||
    document.getElementById(`${prefix}-desconto-financeiro`)?.textContent
  );

  const descontoComercial = parseCurrency(
    (document.getElementById(`${prefix}-desconto-comercial`) as HTMLInputElement)?.value ||
    document.getElementById(`${prefix}-desconto-comercial`)?.textContent
  );

  console.log("Valores numéricos convertidos:", {
    valorBruto,
    descontoVolume,
    descontoFinanceiro,
    descontoComercial
  });

  const { totalDiscounts, total } = calcTotalSale(
    valorBruto,
    descontoVolume,
    descontoFinanceiro,
    descontoComercial
  );

  const descontosTotaisEl = document.getElementById(`${prefix}-descontos-totais`) as HTMLInputElement;
  if (descontosTotaisEl) {
    descontosTotaisEl.value = formatCurrency(totalDiscounts);
  }

  const valorTotalEl = document.getElementById(`${prefix}-valor-total`) as HTMLInputElement;
  if (valorTotalEl) {
    valorTotalEl.value = formatCurrency(total);
  }
};
