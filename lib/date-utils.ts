export function parseDate(value: unknown): Date | null {
  if (!value) return null;

  // Wenn es bereits ein Date-Objekt ist
  if (value instanceof Date) return value;

  // Wenn es ein Firebase Timestamp ist
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }

  // Wenn es ein String ist
  if (typeof value === "string") {
    // Entferne mögliche Leerzeichen
    const cleanDate = value.trim();

    // Versuche verschiedene Datumsformate
    const formats = [
      // ISO Format
      /^\d{4}-\d{2}-\d{2}$/,
      // yyyy/mm/dd
      /^\d{4}\/\d{2}\/\d{2}$/,
      // dd/mm/yyyy
      /^\d{2}\/\d{2}\/\d{4}$/,
      // mm/dd/yyyy
      /^\d{2}\/\d{2}\/\d{4}$/
    ];

    for (const format of formats) {
      if (format.test(cleanDate)) {
        const date = new Date(cleanDate);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    // Versuche das Datum direkt zu parsen
    const date = new Date(cleanDate);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Wenn es eine Zahl ist (Unix Timestamp)
  if (typeof value === "number") {
    return new Date(value);
  }

  return null;
}

export function formatDateForAPI(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export function formatDateForDisplay(date: Date | null, locale = "de-DE"): string {
  if (!date) return "";
  return date.toLocaleDateString(locale);
}