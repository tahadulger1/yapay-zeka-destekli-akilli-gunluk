import { parseNaturalLanguage } from './src/lib/gemini.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log("--- TEST 1: Specified Time ---");
    const res1 = await parseNaturalLanguage("Salı günü saat 10.00'da zararlı yazılım analizi sınavım var.", "2026-04-12T11:00:00+03:00");
    console.log("Input: Salı günü saat 10.00'da...");
    console.log("Result:", JSON.stringify(res1, null, 2));
    
    console.log("\n--- TEST 2: No Time Specified (Date Only) ---");
    const res2 = await parseNaturalLanguage("Yarın sınavım var.", "2026-04-12T11:00:00+03:00");
    console.log("Input: Yarın sınavım var.");
    console.log("Result:", JSON.stringify(res2, null, 2));
}

test().catch(console.error);
