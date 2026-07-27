export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatAmd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "To be confirmed by manager";
  }
  return `${Math.round(amount).toLocaleString("en-US")} AMD`;
}

export function formatKm(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return "N/A";
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return "N/A";
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours} h ${remaining} min` : `${hours} h`;
}
