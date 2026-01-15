import Chart from "chart.js/auto";

// =============================================
// PLUGIN DE HOVER SEGURO (REAPROVEITADO)
// =============================================
export const hoverPlugin = {
  id: "barHoverEffect",
  afterEvent(chart: Chart, args: any) {
    const event = args.event;
    if (!event) return;

    const active = chart.getActiveElements();
    const canvas = chart.canvas;

    let highlight = canvas.parentElement?.querySelector(".hover-bar-highlight") as HTMLElement;

    if (!highlight) {
      highlight = document.createElement("div");
      highlight.className = "hover-bar-highlight";
      highlight.style.position = "absolute";
      highlight.style.left = "0";
      highlight.style.right = "0";
      highlight.style.pointerEvents = "none";
      highlight.style.background = "rgba(54,162,235,0.15)";
      highlight.style.borderRadius = "6px";
      highlight.style.transition = "all .15s ease";
      highlight.style.opacity = "0";
      highlight.style.zIndex = "10";
      canvas.parentElement?.appendChild(highlight);
    }

    if (!active.length) {
      highlight.style.opacity = "0";
      return;
    }

    const bar = active[0];
    const element: any = bar.element;
    const chartArea = chart.chartArea;

    const top = element.y - element.height / 2 - 12;
    const height = element.height;

    if (!element) {
      highlight.style.opacity = "0";
      return;
    }

    highlight.style.opacity = "1";
    highlight.style.top = `${chartArea.top + top}px`;
    highlight.style.height = `${height}px`;
  }
};

Chart.register(hoverPlugin);