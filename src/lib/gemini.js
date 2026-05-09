import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    TURKEY_OFFSET,
    TURKEY_TIME_ZONE,
    getTurkeyDateContext,
    normalizeTurkeyIsoDate,
    normalizeTurkishText,
    resolveTurkishDateTime,
} from "./turkey-date.js";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// --- 1. Prompt Template Pattern ---
class PromptTemplate {
    constructor(template, variables) {
        this.template = template;
        this.variables = variables;
    }

    format(kwargs) {
        const missing = this.variables.filter(v => !(v in kwargs));
        if (missing.length > 0) {
            throw new Error(`Eksik değişkenler: ${missing.join(", ")}`);
        }
        
        let result = this.template;
        for (const [key, value] of Object.entries(kwargs)) {
            // Replace all occurrences of {key}
            result = result.replace(new RegExp(`{${key}}`, "g"), value);
        }
        return result;
    }
}

const OLD_PARSE_INSTRUCTION_TEMPLATE = new PromptTemplate(
    `Sen, Türkçe bilen akıllı bir görev ve zaman yönetimi asistanısın. 
Kullanıcının zaman dilimi: {timezone}.
Referans tarihi ve saati: {currentDate}. Bu zaman bilgisini baz alarak kullanıcı metnindeki 'yarın', 'haftaya', 'öğleden sonra' gibi göreceli zaman ifadelerini kesin ISO 8601 tarihlerine dönüştür.

ÖNEMLİ KURALLAR:
1. Eğer kullanıcı metinde SAAT belirtmişse (örn: "saat 10:00'da", "15:30'da"), o saati kullan ve sonucu {timezone} offseti ile ISO 8601 formatında dön (Örn: YYYY-MM-DDTHH:mm:ss{timezone}).
2. Eğer kullanıcı metinde tarih belirtmiş ama SAAT belirtmemişse, sonucu SADECE tarih olarak dön (Örn: "YYYY-MM-DD"). Kesinlikle "T" harfi veya saat/dakika ekleme.
3. Tüm zaman hesaplamalarını Referans Saati'ni baz alarak yap.

Kullanıcının girdiği metnin bir 'task' (görev/yapılacak iş), 'note' (not/bilgi/fikir) veya 'event' (etkinlik/randevu/toplantı) olduğunu analiz et.

KATEGORİLEŞTİRME:
Metin içeriğine göre şu kategorilerden birini seç: "Genel", "İş", "Kişisel", "Eğitim", "Sağlık", "Alışveriş".
Örn: "Ekmek", "Market", "Yemek" -> "Alışveriş"; "Rapor", "Toplantı" -> "İş"; "Ders", "Kitap" -> "Eğitim".

SADECE "application/json" formatında yanıt ver. Extradan markdown (\`\`\`json ... \`\`\`) veya herhangi bir text ekleme. JSON yapısı tam olarak şöyle olmalıdır:

{
  "type": "task" | "note" | "event",
  "title": "Ana eylem veya konu özeti",
  "description": "Metinde varsa ekstra detaylar, yoksa boş string",
  "priority": "low" | "normal" | "high" | "urgent",
  "category": "Genel" | "İş" | "Kişisel" | "Eğitim" | "Sağlık" | "Alışveriş",
  "dueDate": "ISO 8601 formatında tarih veya null (Sadece 'task' ise)",
  "startDate": "ISO 8601 formatında tarih veya null (Sadece 'event' ise. 'task' ve 'note' tiplerinde null olmalıdır)"
}`,
    ["currentDate", "timezone"]
);

const PARSE_INSTRUCTION_TEMPLATE = new PromptTemplate(
    `Sen, Turkce bilen akilli bir gorev ve zaman yonetimi asistanisin.
Sistem Turkiye'de kullanilacak.
IANA timezone: {timezoneName}.
Timezone offset: {timezoneOffset}.
Bugunun tarihi: {todayDate}.
Bugunun gun adi: {todayWeekday}.
Referans tarih/saat: {currentDate}.

Tum tarih/saat hesaplarini Europe/Istanbul'a gore yap. Sunucu veya kullanici cihazinin yerel timezone'una gore hesap yapma.

TARIH/SAAT KURALLARI:
1. "bugun" = Bugunun tarihi.
2. "yarin" = Bugunden sonraki gun.
3. "bu aksam" = Bugun saat 19:00.
4. "bu gece" = Bugun saat 22:00.
5. "haftaya" = Referans tarihten 7 gun sonrasi.
6. "haftaya pazartesi" = Bir sonraki haftanin pazartesi gunu.
7. "cuma gunu" gibi gun adlari = en yakin gelecek o gun; eger bugun ayni gunse bugun.
8. "sabah" = 09:00, "oglen" = 12:00, "aksam" = 19:00, "gece" = 22:00.
9. "sabah", "oglen", "aksam" veya "gece" tek basina gelirse tarih belirsizdir. Tarih uydurma; dueDate/startDate null olsun ve missingFields veya clarification alaninda tarih istendigini belirt.
10. Kullanici net saat verirse onu kullan. Ornek: "saat 10'da" = 10:00, "18:30'da" = 18:30.
11. Tarih/saat ISO 8601 olarak don. Saatli degerlerde mutlaka +03:00 offseti kullan: YYYY-MM-DDTHH:mm:ss+03:00.
12. Tarih varsa ama saat yoksa YYYY-MM-DD formatinda donebilirsin; backend bunu Europe/Istanbul gece yarisi olarak normalize edecek.

Kullanicinin girdigi metnin bir 'task' (gorev/yapilacak is), 'note' (not/bilgi/fikir) veya 'event' (etkinlik/randevu/toplanti) oldugunu analiz et.

KATEGORILESTIRME:
Metin icerigine gore su kategorilerden birini sec: "Genel", "Is", "Kisisel", "Egitim", "Saglik", "Alisveris".
Orn: "Ekmek", "Market", "Yemek" -> "Alisveris"; "Rapor", "Toplanti" -> "Is"; "Ders", "Kitap" -> "Egitim".

SADECE "application/json" formatinda yanit ver. Markdown veya ek metin ekleme. JSON yapisi tam olarak soyle olmalidir:

{
  "type": "task" | "note" | "event",
  "title": "Ana eylem veya konu ozeti",
  "description": "Metinde varsa ekstra detaylar, yoksa bos string",
  "priority": "low" | "normal" | "high" | "urgent",
  "category": "Genel" | "Is" | "Kisisel" | "Egitim" | "Saglik" | "Alisveris",
  "dueDate": "ISO 8601 formatinda tarih veya null (Sadece 'task' ise)",
  "startDate": "ISO 8601 formatinda tarih veya null (Sadece 'event' ise. 'task' ve 'note' tiplerinde null olmalidir)",
  "missingFields": ["date"] | [],
  "clarification": "Tarih belirsizse kisa netlestirme sorusu veya null"
}`,
    ["currentDate", "todayDate", "todayWeekday", "timezoneName", "timezoneOffset"]
);

// --- 2. LLMOps Logging ---
class LLMLogger {
    static logRequest(requestId, prompt) {
        // console.log(`[LLM_REQUEST ${requestId}] Prompt: "${prompt.substring(0, 50)}..."`);
    }

    static logResponse(requestId, durationMs, usageMetadata, success = true, error = null) {
        if (!success) {
            console.error(`[LLM_ERROR ${requestId}] Süre: ${durationMs}ms, Hata:`, error?.message || error);
            return;
        }

        const promptTokens = usageMetadata?.promptTokenCount || 0;
        const completionTokens = usageMetadata?.candidatesTokenCount || 0;
        const totalTokens = usageMetadata?.totalTokenCount || 0;
        
        console.log(`[LLM_RESPONSE ${requestId}] Başarılı. Süre: ${durationMs}ms | Token: Çıktı ${completionTokens}, Girdi ${promptTokens}, Toplam ${totalTokens}`);
    }
}

// --- 3. Retry Strategy (Exponential Backoff) ---
class RateLimitError extends Error {
    constructor(message) {
        super(message);
        this.name = "RateLimitError";
        this.status = 429;
    }
}

async function withRetry(operation, maxRetries = 3, initialDelayMs = 2000) {
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error) {
            attempt++;
            
            // 429 Too Many Requests durumunu yakala
            const status = error.status || error.response?.status;
            const isRateLimit = error.message?.includes("429") || status === 429;
            const isRetryableStatus = [408, 429, 500, 502, 503, 504].includes(status);
            
            if (isRateLimit) {
                console.warn(`[RETRY] Rate Limit (429) tespit edildi, deneme ${attempt}/${maxRetries}.`);
                if (attempt >= maxRetries) {
                    throw new RateLimitError("Gemini API limitine ulaşıldı. Lütfen biraz bekleyin.");
                }
            } else {
                console.warn(`[RETRY] İşlem başarısız, deneme ${attempt}/${maxRetries}. Sebep: ${error.message}`);
                if (!isRetryableStatus || attempt >= maxRetries) throw error;
            }
            
            // Exponential backoff: 2s, 4s, 8s... (429 durumunda daha agresif bekleme)
            const delay = initialDelayMs * Math.pow(2, attempt - 1);
            console.log(`[RETRY] ${delay}ms bekleniyor...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

export function getGeminiModel() {
    if (!genAI) {
        throw new Error("Gemini API Key is not configured.");
    }
    // Model adı düzeltildi: 2.5 yerine 1.5-flash
    return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-flash-latest" });
}

function getTimezoneOffset(date) {
    const offsetMinutes = -date.getTimezoneOffset();
    const absOffsetMinutes = Math.abs(offsetMinutes);
    const offsetSign = offsetMinutes >= 0 ? "+" : "-";
    const offsetHH = String(Math.floor(absOffsetMinutes / 60)).padStart(2, '0');
    const offsetMM = String(absOffsetMinutes % 60).padStart(2, '0');
    return `${offsetSign}${offsetHH}:${offsetMM}`;
}

function localDateTimeString(date, timezone) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${timezone}`;
}

function parseLocalDate(text, referenceDate, timezone) {
    const lower = text.toLocaleLowerCase("tr-TR");
    const date = new Date(referenceDate);

    if (lower.includes("yarin") || lower.includes("yarın")) {
        date.setDate(date.getDate() + 1);
    } else if (lower.includes("bugun") || lower.includes("bugün")) {
        // keep today
    } else if (lower.includes("haftaya") || lower.includes("gelecek hafta")) {
        date.setDate(date.getDate() + 7);
    } else {
        return null;
    }

    const timeMatch = lower.match(/(?:saat\s*)?(\d{1,2})(?::|\.|[ ]?)(\d{2})?\s*(?:da|de|te|ta)?\b/);
    if (timeMatch) {
        const hour = Number(timeMatch[1]);
        const minute = Number(timeMatch[2] || 0);
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            date.setHours(hour, minute, 0, 0);
            return localDateTimeString(date, timezone);
        }
    }

    date.setHours(0, 0, 0, 0);
    return localDateTimeString(date, timezone);
}

function fallbackParseNaturalLanguage(text, referenceDate = null, reason = null) {
    const now = referenceDate ? new Date(referenceDate) : new Date();
    const timezone = getTimezoneOffset(now);
    const lower = text.toLocaleLowerCase("tr-TR");
    const parsedDate = parseLocalDate(text, now, timezone);
    const isEvent = /(randevu|toplanti|toplantı|etkinlik|gorusme|görüşme|rezervasyon|ders|doktor)/i.test(lower);
    const isNote = /(not|fikir|bilgi|kaydet)/i.test(lower) && !parsedDate;
    const category = /(doktor|saglik|sağlık|hastane)/i.test(lower)
        ? "Sağlık"
        : /(market|alisveris|alışveriş|ekmek|sut|süt)/i.test(lower)
            ? "Alışveriş"
            : /(toplanti|toplantı|rapor|is|iş|proje)/i.test(lower)
                ? "İş"
                : "Genel";

    return {
        type: isEvent ? "event" : isNote ? "note" : "task",
        title: text,
        description: "",
        priority: /(acil|urgent|onemli|önemli)/i.test(lower) ? "urgent" : "normal",
        category,
        dueDate: !isEvent && !isNote ? parsedDate : null,
        startDate: isEvent ? (parsedDate || localDateTimeString(now, timezone)) : null,
        fallback: true,
        fallbackReason: reason?.message || reason || "Gemini unavailable",
    };
}

function fallbackParseNaturalLanguageV2(text, referenceDate = null, reason = null) {
    const now = referenceDate ? new Date(referenceDate) : new Date();
    const lower = normalizeTurkishText(text);
    const dateResolution = resolveTurkishDateTime(text, now);
    const parsedDate = dateResolution.hasDate ? dateResolution.iso : null;
    const isEvent = /(randevu|toplanti|etkinlik|gorusme|rezervasyon|ders|doktor)/i.test(lower);
    const isNote = /(not|fikir|bilgi|kaydet)/i.test(lower) && !parsedDate;
    const category = /(doktor|saglik|hastane)/i.test(lower)
        ? "Sağlık"
        : /(market|alisveris|ekmek|sut)/i.test(lower)
            ? "Alışveriş"
            : /(toplanti|rapor|is|proje|staj)/i.test(lower)
                ? "İş"
                : /(ders|sunum|okul|sinav|odev)/i.test(lower)
                    ? "Eğitim"
                    : "Genel";
    const requiresClarification = Boolean(dateResolution.clarification || (isEvent && !parsedDate));

    return {
        type: isEvent ? "event" : isNote ? "note" : "task",
        title: text,
        description: "",
        priority: /(acil|urgent|onemli)/i.test(lower) ? "urgent" : "normal",
        category,
        dueDate: !isEvent && !isNote ? parsedDate : null,
        startDate: isEvent ? parsedDate : null,
        missingFields: requiresClarification ? ["date"] : [],
        clarification: requiresClarification
            ? (dateResolution.clarification || "Etkinlik tarihi belirsiz. Lutfen tarih ve saat belirtin.")
            : null,
        requiresClarification,
        fallback: true,
        fallbackReason: reason?.message || reason || "Gemini unavailable",
    };
}

function normalizeParsedCategory(category) {
    const lower = normalizeTurkishText(category || "");
    if (lower === "is") return "İş";
    if (lower === "kisisel") return "Kişisel";
    if (lower === "egitim") return "Eğitim";
    if (lower === "saglik") return "Sağlık";
    if (lower === "alisveris") return "Alışveriş";
    return category || "Genel";
}

function buildValidatedParseResult(parsedData, text, referenceDate) {
    const type = ["task", "event", "note"].includes(parsedData.type) ? parsedData.type : "task";
    const dateResolution = resolveTurkishDateTime(text, referenceDate);
    let dueDate = normalizeTurkeyIsoDate(parsedData.dueDate);
    let startDate = normalizeTurkeyIsoDate(parsedData.startDate);

    if ((parsedData.dueDate && !dueDate) || (parsedData.startDate && !startDate)) {
        throw new Error("Gemini gecersiz veya Europe/Istanbul disi tarih dondurdu.");
    }

    if (dateResolution.hasDate) {
        if (type === "event") {
            startDate = dateResolution.iso;
            dueDate = null;
        } else if (type === "task") {
            dueDate = dateResolution.iso;
            startDate = null;
        } else {
            dueDate = null;
            startDate = null;
        }
    }

    const missingFields = Array.isArray(parsedData.missingFields)
        ? parsedData.missingFields.filter(Boolean)
        : [];
    let clarification = parsedData.clarification || null;
    let requiresClarification = Boolean(parsedData.requiresClarification);

    if (dateResolution.clarification) {
        dueDate = null;
        startDate = null;
        requiresClarification = true;
        if (!missingFields.includes("date")) missingFields.push("date");
        clarification = dateResolution.clarification;
    }

    if (type === "event" && !startDate) {
        requiresClarification = true;
        if (!missingFields.includes("date")) missingFields.push("date");
        clarification = clarification || "Etkinlik tarihi belirsiz. Lutfen tarih ve saat belirtin.";
    }

    return {
        type,
        title: parsedData.title || text,
        description: parsedData.description || "",
        priority: parsedData.priority || "normal",
        category: normalizeParsedCategory(parsedData.category),
        dueDate,
        startDate,
        missingFields,
        clarification,
        requiresClarification,
        timeZone: TURKEY_TIME_ZONE,
    };
}

export async function parseNaturalLanguage(text, referenceDate = null) {
    if (!genAI) {
        return fallbackParseNaturalLanguageV2(text, referenceDate, "Missing GEMINI_API_KEY");
    }

    if (!genAI) {
        throw new Error("Gemini API Key eksik. Lütfen .env dosyanızı kontrol edin.");
    }

    const model = getGeminiModel();
    
    const now = referenceDate ? new Date(referenceDate) : new Date();
    const turkeyContext = getTurkeyDateContext(now);
    
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    const systemInstruction = PARSE_INSTRUCTION_TEMPLATE.format({ 
        currentDate: turkeyContext.isoDateTime,
        todayDate: turkeyContext.isoDate,
        todayWeekday: turkeyContext.weekday,
        timezoneName: TURKEY_TIME_ZONE,
        timezoneOffset: TURKEY_OFFSET,
    });

    LLMLogger.logRequest(requestId, text);
    const startTime = performance.now();

    try {
        // Retry katmanı ile Gemini API çağrısı
        const result = await withRetry(async () => {
            return await model.generateContent({
                contents: [{ role: "user", parts: [{ text }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                },
                systemInstruction: {
                    role: "system",
                    parts: [{ text: systemInstruction }]
                }
            });
        }, 3, 2000);

        const durationMs = Math.round(performance.now() - startTime);
        const usageMetadata = result.response.usageMetadata;
        const responseText = result.response.text();

        LLMLogger.logResponse(requestId, durationMs, usageMetadata, true);
        
        // --- 4. Safe JSON Parsing ---
        let jsonStr = responseText.trim();
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        let parsedData;
        try {
            parsedData = JSON.parse(jsonStr);
            return buildValidatedParseResult(parsedData, text, now);
        } catch (parseError) {
            throw new Error(`JSON ayrıştırma hatası: ${parseError.message}. Gelen yanıt: ${jsonStr}`);
        }

        // --- 4. Safe Date Handling ---
        // Eğer Gemini sadece tarih döndüyse (YYYY-MM-DD), bunu yerel saat diliminde 
        // gece yarısı olarak kabul edelim (UTC karmaşasını önlemek için).
        const fixDate = (dateStr) => {
            if (!dateStr) return null;
            if (dateStr.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return `${dateStr}T00:00:00${timezone}`;
            }
            return dateStr;
        };

        return {
            type: parsedData.type || "task",
            title: parsedData.title || text,
            description: parsedData.description || "",
            priority: parsedData.priority || "normal",
            category: parsedData.category || "Genel",
            dueDate: fixDate(parsedData.dueDate),
            startDate: fixDate(parsedData.startDate),
        };

    } catch (error) {
        const durationMs = Math.round(performance.now() - startTime);
        LLMLogger.logResponse(requestId, durationMs, null, false, error);
        return fallbackParseNaturalLanguageV2(text, referenceDate, error);
        
        // Hata durumunda eskisi gibi dummy bir object FAKAT dönmek yerine
        // Hatayı yukarı fırlatarak (throw) API'nin bunu düzgün 500 dönmesini sağlıyoruz.
        throw error;
    }
}
