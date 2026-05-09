import { NextResponse } from "next/server";
import { runBenchmark } from "@/lib/benchmark";

// Neden Yaptik: Arayuzdeki (UI) Geliştirici Modu sekmesinin bu metrikleri disariya cekebilmesi icin bir kopru endpoint.
export async function GET() {
    try {
        const report = await runBenchmark();
        return NextResponse.json(report);
    } catch (error) {
        console.error("Benchmark error:", error);
        return NextResponse.json(
            { error: "Benchmarking failed", details: error.message },
            { status: 500 }
        );
    }
}
