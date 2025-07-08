const dtElement = document.getElementById('date-time');
setInterval(() => {
  const now = new Date();
  dtElement!.textContent = now.toLocaleString('pt-BR');
}, 1000);