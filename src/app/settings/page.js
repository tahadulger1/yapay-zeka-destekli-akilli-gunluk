import { runBenchmark } from "@/lib/benchmark";

export const dynamic = 'force-dynamic'; // Ensure benchmark runs fresh

export default async function SettingsPage() {
    let report = null;
    let error = null;

    try {
        report = await runBenchmark();
    } catch (e) {
        error = e.message;
    }

    return (
        <main className="animate-fade-in" style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-1)' }}>Ayarlar</h1>
            <p style={{ color: 'var(--text-2)', marginBottom: '2rem' }}>Hesap ve sistem metriklerinizi buradan takip edin.</p>

            <section style={{ backgroundColor: 'var(--surface-1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <span role="img" aria-label="robot">🤖</span> AI Model Analizi (Geliştirici Modu)
                </h2>
                
                {error ? (
                    <div style={{ color: 'red' }}>Metrikler yüklenirken hata oluştu: {error}</div>
                ) : report ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-2)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--success)', marginBottom: '0.5rem' }}>{report.metrics.f1Score}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tip F1 Skoru</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-2)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.5rem' }}>%{report.metrics.temporalAccuracy}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zaman Doğruluğu</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-2)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-1)', marginBottom: '0.5rem' }}>{report.metrics.totalTests}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test Sayısı</div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-1)' }}>Test Detayları</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-2)' }}>Test Girdisi</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-2)' }}>Beklenen</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-2)' }}>Sonuç</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-2)' }}>Tarih Eşleşmesi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.details.map((detail, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-1)' }}>{detail.input} {detail.error && <strong style={{color:'red'}}>({detail.error})</strong>}</td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-2)' }}>{detail.expected}</td>
                                            <td style={{ padding: '0.75rem', fontWeight: '500', color: detail.typeMatch ? 'var(--success)' : 'var(--danger)' }}>
                                                {detail.actual} {detail.typeMatch ? "✅" : "❌"}
                                            </td>
                                            <td style={{ padding: '0.75rem', color: detail.dateMatch ? 'var(--success)' : 'var(--danger)' }}>
                                                {detail.dateMatch ? "Geçti ✅" : "Kaldı ❌"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div>Yükleniyor...</div>
                )}
            </section>
        </main>
    );
}
