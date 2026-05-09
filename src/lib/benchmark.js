import { parseNaturalLanguage } from "./gemini";

// Altın Standart (Gold Standard) Test Senaryoları
// Amacı: Modelin zorlayıcı, dolaylı ve kültürel bağlamlı zaman ifadelerini nasıl çözdüğünü ölçmek.
const TEST_CASES = [
    {
        input: "Yarın öğleden sonra Ahmet ile toplantı ayarla",
        expectedType: "event",
        expectsDate: true
    },
    {
        input: "Haftaya cuma mesai bitiminde faturaları öde",
        expectedType: "task",
        expectsDate: true
    },
    {
        input: "Alınacaklar listesi: Süt, Yumurta, Ekmek, Peynir",
        expectedType: "note",
        expectsDate: false
    },
    {
        input: "Projeyi yarına kadar bitirmem lazım çok acil",
        expectedType: "task",
        expectsDate: true // "yarına kadar"
    },
    {
        input: "React için state management üzerine fikirlerim var, useMemo ve context",
        expectedType: "note",
        expectsDate: false
    },
    {
        input: "3 Nisan akşamı halı saha maçı",
        expectedType: "event",
        expectsDate: true
    },
    {
        input: "Akşama doğru çiçekleri sula",
        expectedType: "task",
        expectsDate: true
    }
];

/**
 * F1 Skoru ve Zaman Doğruluğu Hesaplayıcı
 * Precision (Hassasiyet) = Doğru Pozitif / (Doğru Pozitif + Yanlış Pozitif)
 * Recall (Hatırlama) = Doğru Pozitif / (Doğru Pozitif + Yanlış Negatif)
 * F1 Score = 2 * (Precision * Recall) / (Precision + Recall)
 */
export async function runBenchmark() {
    let correctTypes = 0;
    let correctDates = 0;
    
    // Confusion Matrix Metrics for "Tasks" conceptually, but we do macro-averaging for simplicity
    let exactMatches = 0;

    const results = [];

    for (const test of TEST_CASES) {
        try {
            // Rate limit (15 RPM) aşılmaması için her test arasında 5 saniye bekle
            if (results.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
            const result = await parseNaturalLanguage(test.input);
            
            const isTypeCorrect = result.type === test.expectedType;
            if (isTypeCorrect) exactMatches++;

            // Checking if the model realized there is a date context
            const returnedDate = result.type === "event" ? result.startDate : result.dueDate;
            const hasDate = !!returnedDate;
            const isDateCorrect = hasDate === test.expectsDate;
            if (isDateCorrect) correctDates++;

            results.push({
                input: test.input,
                expected: test.expectedType,
                actual: result.type,
                typeMatch: isTypeCorrect,
                dateMatch: isDateCorrect
            });
        } catch (err) {
            results.push({
                input: test.input,
                error: err.message
            });
        }
    }

    // Basit F1 Hesaplaması (Accuracy tabanlı macro avg)
    const total = TEST_CASES.length;
    // For a multi-class, accuracy is often a baseline. If we treat "Type" as the key metric:
    const typeAccuracy = exactMatches / total;
    
    // Precision & Recall varsayımları (Bütün tipleri doğru bildiği senaryoda)
    // Eşit ağırlıklı kabul edersek Precision == Recall == Accuracy
    const precision = typeAccuracy;
    const recall = typeAccuracy;
    
    const f1Score = (precision + recall) === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
    
    const temporalAccuracy = correctDates / total;

    return {
        metrics: {
            totalTests: total,
            f1Score: parseFloat(f1Score.toFixed(2)),
            temporalAccuracy: parseFloat((temporalAccuracy * 100).toFixed(1)),
            typeAccuracy: parseFloat((typeAccuracy * 100).toFixed(1))
        },
        details: results
    };
}
