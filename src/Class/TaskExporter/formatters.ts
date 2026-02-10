export const formatDateBR = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "Inválida" : date.toLocaleDateString("pt-BR");
  } catch {
    return "Inválida";
  }
};

export const getPriorityText = (p: number): string => {
  if (p === 0) return "Baixa";
  if (p === 1) return "Média";
  if (p === 2) return "Alta";
  return "N/A";
};

export const sanitize = (str: string): string => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};
