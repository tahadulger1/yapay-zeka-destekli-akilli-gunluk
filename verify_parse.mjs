import {
  formatTurkeyDate,
  formatTurkeyDateTime,
  formatTurkeyTime,
  resolveTurkishDateTime,
} from "./src/lib/turkey-date.js";

const referenceDate = "2026-05-09T12:00:00+03:00"; // Cumartesi

const cases = [
  {
    text: "bugün saat 18:00'de ders çalış",
    expectedIso: "2026-05-09T18:00:00+03:00",
  },
  {
    text: "yarın saat 10'da proje sunumuna hazırlan",
    expectedIso: "2026-05-10T10:00:00+03:00",
  },
  {
    text: "haftaya pazartesi 14:00'te toplantı var",
    expectedIso: "2026-05-11T14:00:00+03:00",
  },
  {
    text: "bu akşam raporu tamamla",
    expectedIso: "2026-05-09T19:00:00+03:00",
  },
  {
    text: "cuma günü staja başvur",
    expectedIso: "2026-05-15T00:00:00+03:00",
  },
  {
    text: "sabah kahvaltı yap",
    expectedMissingField: "date",
  },
];

let failures = 0;

for (const item of cases) {
  const result = resolveTurkishDateTime(item.text, referenceDate);
  const passed = item.expectedIso
    ? result.iso === item.expectedIso
    : result.missingFields.includes(item.expectedMissingField);

  if (!passed) failures += 1;

  console.log(`${passed ? "PASS" : "FAIL"}: ${item.text}`);
  console.log(JSON.stringify(result, null, 2));
}

console.log("\n--- UI format check ---");
console.log(`Date: ${formatTurkeyDate("2026-05-09T18:30:00+03:00")}`);
console.log(`Time: ${formatTurkeyTime("2026-05-09T18:30:00+03:00")}`);
console.log(`DateTime: ${formatTurkeyDateTime("2026-05-09T18:30:00+03:00")}`);

if (formatTurkeyDate("2026-05-09T18:30:00+03:00") !== "09.05.2026") {
  failures += 1;
  console.error("FAIL: Turkey date format should be 09.05.2026");
}

if (formatTurkeyTime("2026-05-09T18:30:00+03:00") !== "18:30") {
  failures += 1;
  console.error("FAIL: Turkey time format should be 18:30");
}

if (failures > 0) {
  console.error(`\n${failures} verification case(s) failed.`);
  process.exit(1);
}

console.log("\nAll parse verification cases passed.");
