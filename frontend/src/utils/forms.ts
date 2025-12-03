/**
 * Inicializa contador de caracteres para um textarea.
 * @param textareaId - ID do textarea
 * @param counterId - ID do elemento que exibirá o contador
 * @param maxLength - máximo de caracteres permitido
 */
export function initCharCounter(
  textareaId: string,
  counterId: string,
  maxLength: number
) {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  const counter = document.getElementById(counterId);

  if (!textarea || !counter) return;

  const updateCounter = () => {
    // Limita tamanho
    if (textarea.value.length > maxLength) {
      textarea.value = textarea.value.substring(0, maxLength);
    }
    // Atualiza contador
    counter.textContent = `${textarea.value.length} / ${maxLength}`;

    // Auto-grow
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Atualiza inicialmente (caso já haja valor)
  updateCounter();

  // Listener
  textarea.addEventListener('input', updateCounter);
};
