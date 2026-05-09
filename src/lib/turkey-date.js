export const TURKEY_TIME_ZONE = "Europe/Istanbul";
export const TURKEY_OFFSET = "+03:00";

const WEEKDAYS = [
  "pazar",
  "pazartesi",
  "sali",
  "carsamba",
  "persembe",
  "cuma",
  "cumartesi",
];

const TIME_PERIODS = [
  { key: "sabah", hour: 9, minute: 0 },
  { key: "oglen", hour: 12, minute: 0 },
  { key: "aksam", hour: 19, minute: 0 },
  { key: "gece", hour: 22, minute: 0 },
];

function pad(value) {
  return String(value).padStart(2, "0");
}

export function normalizeTurkishText(text) {
  return String(text || "")
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export function getTurkeyDateParts(referenceDate = new Date()) {
  const date = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TURKEY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const rawParts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  const weekday = new Intl.DateTimeFormat("tr-TR", {
    timeZone: TURKEY_TIME_ZONE,
    weekday: "long",
  }).format(date);

  return {
    year: Number(rawParts.year),
    month: Number(rawParts.month),
    day: Number(rawParts.day),
    hour: Number(rawParts.hour),
    minute: Number(rawParts.minute),
    second: Number(rawParts.second),
    weekday,
  };
}

export function getTurkeyDateContext(referenceDate = new Date()) {
  const parts = getTurkeyDateParts(referenceDate);
  return {
    ...parts,
    timeZone: TURKEY_TIME_ZONE,
    offset: TURKEY_OFFSET,
    isoDate: `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`,
    isoDateTime: formatTurkeyIsoDateTime(parts),
  };
}

export function formatTurkeyIsoDateTime(parts) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour || 0)}:${pad(parts.minute || 0)}:${pad(parts.second || 0)}${TURKEY_OFFSET}`;
}

function isValidDateParts(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function addDays(parts, days) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function isoWeekday(parts) {
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

function findExplicitTime(normalizedText) {
  const withMinutes = normalizedText.match(/\b(?:saat\s*)?(\d{1,2})[:.](\d{2})\s*(?:'?\s*(?:da|de|ta|te))?\b/);
  if (withMinutes) {
    const hour = Number(withMinutes[1]);
    const minute = Number(withMinutes[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute, source: "explicit" };
    }
  }

  const hourOnly = normalizedText.match(/\bsaat\s*(\d{1,2})\s*(?:'?\s*(?:da|de|ta|te))?\b/);
  if (hourOnly) {
    const hour = Number(hourOnly[1]);
    if (hour >= 0 && hour <= 23) {
      return { hour, minute: 0, source: "explicit" };
    }
  }

  return null;
}

function findTimePeriod(normalizedText) {
  return TIME_PERIODS.find((period) => normalizedText.includes(period.key)) || null;
}

function findWeekday(normalizedText) {
  return WEEKDAYS.findIndex((weekday) =>
    new RegExp(`\\b${weekday}\\b`).test(normalizedText)
  );
}

export function resolveTurkishDateTime(text, referenceDate = new Date()) {
  const normalizedText = normalizeTurkishText(text);
  const today = getTurkeyDateParts(referenceDate);
  const result = {
    hasDate: false,
    hasTime: false,
    iso: null,
    dateOnlyIso: null,
    missingFields: [],
    clarification: null,
    rule: null,
  };

  let dateParts = null;
  let time = findExplicitTime(normalizedText);
  const timePeriod = findTimePeriod(normalizedText);

  if (!time && timePeriod) {
    time = { hour: timePeriod.hour, minute: timePeriod.minute, source: timePeriod.key };
  }

  if (normalizedText.includes("bugun")) {
    dateParts = { year: today.year, month: today.month, day: today.day };
    result.rule = "bugun";
  }

  if (normalizedText.includes("yarin")) {
    dateParts = addDays(today, 1);
    result.rule = "yarin";
  }

  if (normalizedText.includes("bu aksam")) {
    dateParts = { year: today.year, month: today.month, day: today.day };
    time = findExplicitTime(normalizedText) || { hour: 19, minute: 0, source: "bu aksam" };
    result.rule = "bu aksam";
  }

  if (normalizedText.includes("bu gece")) {
    dateParts = { year: today.year, month: today.month, day: today.day };
    time = findExplicitTime(normalizedText) || { hour: 22, minute: 0, source: "bu gece" };
    result.rule = "bu gece";
  }

  const weekdayIndex = findWeekday(normalizedText);
  if (normalizedText.includes("haftaya") && weekdayIndex > -1) {
    const currentIsoWeekday = isoWeekday(today);
    const daysUntilNextMonday = currentIsoWeekday === 1 ? 7 : 8 - currentIsoWeekday;
    const targetIsoWeekday = weekdayIndex === 0 ? 7 : weekdayIndex;
    dateParts = addDays(today, daysUntilNextMonday + targetIsoWeekday - 1);
    result.rule = `haftaya ${WEEKDAYS[weekdayIndex]}`;
  } else if (normalizedText.includes("haftaya") || normalizedText.includes("gelecek hafta")) {
    dateParts = addDays(today, 7);
    result.rule = "haftaya";
  } else if (!dateParts && weekdayIndex > -1) {
    const currentDay = new Date(Date.UTC(today.year, today.month - 1, today.day)).getUTCDay();
    let diff = weekdayIndex - currentDay;
    if (diff < 0) diff += 7;
    dateParts = addDays(today, diff);
    result.rule = WEEKDAYS[weekdayIndex];
  }

  if (dateParts) {
    result.hasDate = true;
    result.hasTime = Boolean(time);
    result.dateOnlyIso = `${dateParts.year}-${pad(dateParts.month)}-${pad(dateParts.day)}`;
    result.iso = formatTurkeyIsoDateTime({
      ...dateParts,
      hour: time?.hour || 0,
      minute: time?.minute || 0,
      second: 0,
    });
    return result;
  }

  if (time) {
    result.hasTime = true;
    result.missingFields = ["date"];
    result.clarification = "Tarih belirsiz. Hangi gun icin oldugunu belirtin.";
    result.rule = time.source;
  }

  return result;
}

export function normalizeTurkeyIsoDate(value) {
  if (!value) return null;
  if (typeof value !== "string") return null;

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    if (!isValidDateParts(year, month, day)) return null;
    return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}T00:00:00${TURKEY_OFFSET}`;
  }

  const dateTime = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d{1,3})?(\+03:00)$/
  );
  if (!dateTime) return null;

  const year = Number(dateTime[1]);
  const month = Number(dateTime[2]);
  const day = Number(dateTime[3]);
  const hour = Number(dateTime[4]);
  const minute = Number(dateTime[5]);
  const second = Number(dateTime[6] || 0);

  if (
    !isValidDateParts(year, month, day) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }

  return formatTurkeyIsoDateTime({ year, month, day, hour, minute, second });
}

export function formatTurkeyDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TURKEY_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTurkeyTime(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TURKEY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatTurkeyDateTime(date) {
  return `${formatTurkeyDate(date)} ${formatTurkeyTime(date)}`;
}
