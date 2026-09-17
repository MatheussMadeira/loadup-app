export function formatFullDate(dateStr: string): string {
  // Uma string "YYYY-MM-DD" pura é interpretada como meia-noite UTC; em
  // fusos atrás do UTC (ex.: America/Sao_Paulo) isso vira o dia anterior ao
  // converter pro horário local na hora de exibir. Ancorar ao meio-dia evita
  // cruzar a virada de dia nesse fuso.
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? new Date(`${dateStr}T12:00:00`)
    : new Date(dateStr);
  return safeDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
