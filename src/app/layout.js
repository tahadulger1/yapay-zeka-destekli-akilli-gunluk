import "./globals.css";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "AI-To | Yapay Zeka Destekli Görev Yönetimi",
  description: "Doğal dilde yazarak görevlerinizi oluşturun. Yapay zeka ile otomatik kategorizasyon ve akıllı planlama.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">İçeriğe atla</a>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
