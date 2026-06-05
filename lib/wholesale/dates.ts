const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function fromDateString(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function getMinimumWholesaleDeliveryDate(today = new Date()) {
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const day = current.getDay();
  const daysToSaturday = day <= 4 ? 6 - day : 13 - day;

  return toDateString(new Date(current.getTime() + daysToSaturday * DAY_IN_MS));
}

export function getWholesaleDeliveryOptions(weeks = 8, today = new Date()) {
  const firstSaturday = fromDateString(getMinimumWholesaleDeliveryDate(today));

  if (!firstSaturday) {
    return [];
  }

  return Array.from({ length: weeks }, (_, index) => {
    const date = new Date(firstSaturday.getTime() + index * 7 * DAY_IN_MS);
    const value = toDateString(date);

    return {
      value,
      label: date.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
    };
  });
}

export function isAllowedWholesaleDeliveryDate(dateString: string) {
  const date = fromDateString(dateString);

  if (!date || date.getDay() !== 6) {
    return false;
  }

  return dateString >= getMinimumWholesaleDeliveryDate();
}
