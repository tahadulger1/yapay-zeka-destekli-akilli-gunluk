# AI-To: Yapay Zeka Tabanlı Kişisel Asistan — Proje Raporu

> **Proje:** AI-To — Yapay Zeka Tabanlı Ajanda ve Görev Yönetim Platformu  
> **Başlangıç Tarihi:** 5 Mart 2026  
> **Teknoloji Yığını:** Next.js 16 | Vanilla CSS | Prisma (SQLite) | Gemini API  

---

## 1. Projenin amacı

AI-To bir kişisel asistan uygulaması. Günlük dilde yazılan cümleleri yapay zeka ile çözümleyerek görev, etkinlik veya not oluşturuyor.

Örneğin kullanıcı şunu yazar:
> *"Yarın öğleden sonra Ahmet ile toplantı ayarla"*

Uygulama bu cümleyi çözümleyerek:
- Bunun bir etkinlik olduğunu tespit eder
- Tarihini yarının öğleden sonrasına ayarlar
- Kategorisini "İş" olarak belirler
- Veritabanına kaydeder

Amaç: Kullanıcının hiçbir form doldurmadan, hiçbir dropdown seçmeden, sadece yazarak planlama işlemlerini tamamlaması.

---

## 2. Motivasyon ve ihtiyaç analizi

Günlük işlerini planlamak isteyen biri takvim, not defteri, yapılacaklar listesi gibi farklı uygulamaları ayrı ayrı kullanmak zorunda kalıyor. Hepsinde ortak sorunlar var:

- Basit bir görev eklemek bile 4-5 tıklama gerektiriyor
- Tarih ayarla, öncelik belirle, etiket seç gibi adımlar mecburi
- Görevler bir yerde, notlar başka yerde, etkinlikler bir üçüncü yerde

Bu sorunları çözmek için tek bir metin kutusundan her şeyi halledebilen, yapay zekanın karar verme yükünü üstlendiği bir uygulama geliştirdik.

---

## 3. Problem tanımı

Geleneksel planlama araçları çok fazla karar aldırıyor: ne zaman yapılacak, hangi kategoride, ne öncelikte... Bu sorular insanı yoruyor ve planlama motivasyonunu düşürüyor.

AI-To'nun çözdüğü alt problemler:
1. Doğal dil ifadesini yapılandırılmış veriye dönüştürmek: "Haftaya cuma faturaları öde" gibi bir cümleyi tarih, tür ve öncelik bilgileri içeren bir JSON'a çevirmek
2. Kullanıcının yazdığının görev mi, not mu, etkinlik mi olduğunu otomatik ayırt etmek
3. "Yarın", "haftaya", "öğleden sonra" gibi göreceli zaman ifadelerini kesin tarihlere çevirmek

---

## 4. Literatür taraması: Mevcut planlama araçları

Piyasadaki popüler planlama araçlarını inceledik:

| Uygulama | Güçlü yanı | Zayıf yanı |
|-----------|------------|-------------|
| Google Calendar | Yaygın kullanım, entegrasyon | Sadece etkinlik odaklı, doğal dil desteği sınırlı |
| Todoist | Görev yönetimi güçlü | Not ve etkinlik ayrı, AI desteği yok |
| Notion | Esnek, özelleştirilebilir | Karmaşık arayüz, öğrenme eğrisi yüksek |
| Apple Hatırlatıcılar | Basit kullanım | Sınırlı özellik, çapraz platform yok |
| Microsoft To Do | Güçlü entegrasyon | AI desteği yok, sınırlı otomasyon |

AI-To bu araçların aksine kullanıcıya hiçbir form sunmuyor. Tek bir metin kutusundan doğal dil ile her şey halledilebiliyor. Tür, tarih, öncelik ve kategori yapay zeka tarafından belirleniyor.

---

## 5. Teorik altyapı: Karar yorgunluğu ve AI

Karar yorgunluğu (Decision Fatigue), psikolojide insanların gün boyunca sürekli karar almak zorunda kaldıkça kararlarının kalitesinin düşmesini ifade eder.

Planlama araçlarında her görev eklerken tür seçimi, tarih belirleme, öncelik ayarlama ve kategori seçimi gibi 4-5 mikro karar almak gerekiyor. AI-To bu kararları kullanıcının yerine yapay zeka ile alarak karar yorgunluğunu azaltıyor.

Tek yapılması gereken aklındakini yazmak.

---

## 6. Önerilen yöntem (Genel bakış)

AI-To şu akışla çalışır:

1. Doğal dilde bir metin yazılır, örneğin "Yarın saat 10'da diş hekimi randevusu"
2. Metin API'ye gönderilir (`/api/ai/parse` rotası)
3. Gemini 1.5 Flash modeli metni analiz ederek JSON çıktısı üretir:
   ```json
   {
     "type": "event",
     "title": "Diş Hekimi Randevusu",
     "category": "Sağlık",
     "startDate": "2026-04-17T10:00:00+03:00"
   }
   ```
4. Sonuç Prisma ORM ile SQLite veritabanına yazılır
5. SWR ile optimistik güncelleme sayesinde dashboard anında yansıtılır

---

## 7. Teknoloji yığını: Next.js ve Vanilla CSS

### Next.js 16 (App Router)
- React üzerine kurulu, frontend ve backend'i tek projede birleştiren full-stack framework
- Dosya tabanlı yönlendirme: sayfalar `/app/dashboard`, `/app/tasks`, `/app/notes`, `/app/events` klasörlerinde organize edildi
- Backend mantığı `/app/api/` altında çalışıyor, ayrı sunucu kurmaya gerek yok
- API anahtarı yönetimi ve middleware desteği sunucu tarafında çalışıyor

### Vanilla CSS
- Tailwind yerine saf CSS tercih ettik. Tam kontrol, daha kolay öğrenme ve küçük proje boyutu sağlıyor.
- 100'den fazla CSS değişkeni ile tutarlı bir tasarım sistemi oluşturduk
- 4 breakpoint ile mobil, tablet ve masaüstü uyumlu responsive tasarım
- fade-in, slide-up, shimmer ve toast animasyonları

---

## 8. Teknoloji yığını: veritabanı mimarisi

### Prisma ORM + SQLite
Supabase yerine Prisma ORM ile SQLite kullandık. Geliştirme sürecini hızlı tutmak istiyorduk, SQLite buna uygundu.

- Prisma ORM: tip güvenli sorgular, otomatik migration sistemi, model tabanlı veritabanı yönetimi
- SQLite: sunucu gerektirmeyen dosya tabanlı veritabanı. Geliştirme ve demo için yeterli.
- 3 ana tablo var: `Task`, `Note`, `Event`, her biri kendi alanları ve ilişkileriyle

### Veritabanı modelleri:
```
Task   → id, title, description, category, priority, status, dueDate
Note   → id, title, content, category
Event  → id, title, description, location, startDate, endDate, category
```

Her model `createdAt` ve `updatedAt` zaman damgalarına sahip.

İleride kullanıcı kimlik doğrulama sistemi eklendiğinde `User` modeli de tablolara eklenecek.

---

## 9. Teknoloji yığını: Gemini API ve NLU

### Google Gemini 1.5 Flash
- Kullanıcının serbest metin girdisini yapılandırılmış JSON verisine dönüştürüyor
- `gemini-1.5-flash` modeli: hızlı yanıt süresi, düşük maliyet
- `responseMimeType: "application/json"` ile doğrudan JSON üretimi

### Prompt mühendisliği
- Değişken enjeksiyonlu şablon sistemi (`{currentDate}`, `{timezone}`)
- AI'ya Türkçe bağlamda çalışması, göreceli zaman ifadelerini çözmesi ve doğru tip/kategori ataması için kurallar tanımladık
- Saatli ve saatsiz ifadeler için ayrı ISO 8601 formatları belirledik

### Hata yönetimi
- Exponential backoff ile otomatik yeniden deneme: 2s, 4s, 8s aralıklarla
- 429 hatalarında bekleme stratejisi
- Gemini'nin bazen yanıta eklediği markdown formatını temizleyen güvenli JSON ayrıştırıcı

---

## 10. Sistem blok şeması

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Kullanıcı  │────▶│  Next.js     │────▶│  Gemini API  │────▶│  JSON Çıktı  │
│  (Arayüz)   │     │  API Route   │     │  (NLU Motor) │     │  (Yapısal)   │
└─────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
┌─────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  Dashboard  │◀────│  SWR Cache   │◀────│  Prisma ORM  │◀───────────┘
│  (Güncelle) │     │  (Anlık)     │     │  (SQLite DB) │
└─────────────┘     └──────────────┘     └──────────────┘
```

Akış: Kullanıcı yazar → API Route alır → Gemini analiz eder → JSON üretilir → Prisma veritabanına yazar → SWR cache güncellenir → Dashboard yansır

---

## 11. Yazılım mimarisi ve akış şeması

### Katmanlı mimari

```
┌─────────────────────────────────────────────┐
│            Sunum Katmanı (Frontend)          │
│  React Components, SWR, Context API         │
├─────────────────────────────────────────────┤
│            İş Mantığı Katmanı (API)          │
│  Next.js API Routes, Middleware, Gemini      │
├─────────────────────────────────────────────┤
│            Veri Katmanı (Database)            │
│  Prisma ORM, SQLite                          │
└─────────────────────────────────────────────┘
```

### Bileşen yapısı
```
src/
├── app/                    # Sayfalar ve API rotaları
│   ├── api/
│   │   ├── ai/parse/       # Gemini AI parse endpoint
│   │   ├── tasks/          # CRUD: görevler
│   │   ├── events/         # CRUD: etkinlikler
│   │   └── notes/          # CRUD: notlar
│   ├── dashboard/          # Ana kontrol paneli
│   ├── tasks/              # Görev listesi sayfası
│   ├── events/             # Etkinlik listesi sayfası
│   ├── notes/              # Not listesi sayfası
│   └── settings/           # Ayarlar sayfası
├── components/             # Yeniden kullanılabilir bileşenler
│   ├── AIInputBar.js       # Ana AI giriş çubuğu
│   ├── TaskItem.js         # Görev kartı
│   ├── EventCard.js        # Etkinlik kartı
│   ├── NoteCard.js         # Not kartı
│   ├── StatCard.js         # İstatistik kartı
│   ├── Toast.js            # Bildirim sistemi
│   └── layout/             # Header, Sidebar, Footer
├── context/                # React Context (dil, tema)
├── hooks/                  # Özel React hook'ları
└── lib/                    # Yardımcı kütüphaneler
    ├── gemini.js           # Gemini API entegrasyonu
    ├── prisma.js           # Veritabanı bağlantısı
    ├── benchmark.js        # F1 skor test sistemi
    └── translations/       # TR/EN çeviri dosyaları
```

---

## 12. Veritabanı tasarımı (ER diyagramı)

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│      TASK        │  │      NOTE        │  │      EVENT       │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ id       (PK)    │  │ id       (PK)    │  │ id       (PK)    │
│ title    (text)  │  │ title    (text)  │  │ title    (text)  │
│ description      │  │ content  (text)  │  │ description      │
│ category (text)  │  │ category (text)  │  │ location (text)  │
│ priority (text)  │  │ createdAt(date)  │  │ startDate(date)  │
│ status   (text)  │  │ updatedAt(date)  │  │ endDate  (date)  │
│ dueDate  (date)  │  └──────────────────┘  │ category (text)  │
│ createdAt(date)  │                        │ createdAt(date)  │
│ updatedAt(date)  │                        │ updatedAt(date)  │
└──────────────────┘                        └──────────────────┘
```

- Task: görevleri tutar. `status` "pending" veya "completed", `priority` "low", "normal", "high" veya "urgent" olabilir.
- Note: notları tutar. İçerik odaklı, tarih alanı yok.
- Event: etkinlikleri tutar. `startDate` zorunlu, `endDate` ve `location` opsiyonel.
- Üç tabloda da ortak `category` alanı var: Genel, İş, Kişisel, Eğitim, Sağlık, Alışveriş

---

## 13. Kullanıcı deneyimi: Tasarım prensipleri

### Minimalist tasarım
- Mor tonlarında (#6C63FF) renk paleti
- Beyaz kartlar, açık gri arka plan, gölge ve yuvarlatılmış köşeler
- Inter/Lexend fontu

### Tek kutu, sıfır form
- Bütün işlemler tek bir metin kutusundan yapılıyor
- Kullanıcı hiçbir form doldurmak ya da dropdown seçmek zorunda değil
- AI otomatik karar veriyor

### Anında geri bildirim
- Optimistik UI: sunucudan cevap beklenmeden arayüz güncelleniyor
- Toast bildirimleri: başarı, hata ve uyarı mesajları animasyonlu gösteriliyor
- Web Speech API ile görev oluşturulduğunda sesli onay verebiliyor

### Görev organizasyonu
- Bugünün görevleri: o gün yapılması gerekenler
- Gelen kutusu (Inbox): tarihsiz görevler
- Önümüzdeki 7 gün: yaklaşan görevler
- Daha sonra: 7 günden sonrası

---

## 14. Erişilebilirlik özellikleri

AI-To, WCAG 2.1 AA standartlarını hedefleyerek tasarlandı.

### Ekran okuyucu desteği
- `<header>`, `<main>`, `<section>` gibi semantik HTML etiketleri kullanılıyor
- Buton ve girişlerde `aria-label` açıklamaları var
- `aria-live="polite"` ile dinamik içerik değişiklikleri ekran okuyuculara bildiriliyor
- `role="alert"` ile bildirimler erişilebilir hale getirildi

### Klavye navigasyonu
- `:focus-visible` ile net odak göstergeleri
- `/` tuşu ile arama çubuğuna atlama
- `Escape` tuşu ile menü kapatma
- Skip-to-content bağlantısı ile doğrudan ana içeriğe geçiş

### Görsel erişilebilirlik
- Yüksek kontrast modu: siyah arka plan, sarı neon metin (düşük görme için)
- prefers-reduced-motion: işletim sistemi ayarına göre animasyonlar otomatik kapanıyor
- Türkçe/İngilizce arasında geçiş yapılabiliyor, `<html lang>` dinamik olarak güncelleniyor

### Sesli geri bildirim
- Web Speech API ile görev oluşturulduğunda Türkçe veya İngilizce sesli onay veriyor
- Ayarlardan açılıp kapatılabiliyor

---

## 15. Güvenlik katmanı ve veri koruma

### API güvenliği
- Tüm API isteklerinde `x-app-secret` header kontrolü yapılıyor
- Yetkisiz istekler `403 Forbidden` ile reddediliyor

### Hız sınırlama (Rate limiting)
- AI rotalarında dakikada en fazla 10 istek kabul ediliyor (Gemini API maliyetini kontrol altında tutmak için)
- Standart rotalarda dakikada en fazla 60 istek
- IP bazlı izleme ile kötüye kullanım engelleniyor
- `429 Too Many Requests` yanıtlarında `Retry-After` header bilgisi dönüyor

### Ortam değişkenleri
- Gemini API anahtarı `.env` dosyasında tutuluyor, kod içinde açık metin olarak bulunmuyor
- `NEXT_PUBLIC_` prefix'i ile yalnızca gerekli değişkenler istemci tarafına iletiliyor

### Veri doğrulama
- Gemini'den gelen JSON çıktısı güvenli ayrıştırma (safe parsing) ile işleniyor
- Tarih formatları ISO 8601 standardında doğrulanıyor

---

## 16. Uygulama tanıtımı: Ana ekran ve dashboard

Uygulamaya giriş yapıldığında ilk açılan ekran dashboard:

- AI giriş çubuğu: sayfanın en üstünde, "Ne yapmak istiyorsunuz?" placeholder'ı ile
- 4 istatistik kartı: toplam görev, tamamlanan, bekleyen ve yaklaşan etkinlik sayısı
- Bugünün görevleri: o güne ait görevlerin listesi
- Gelen kutusu: tarihi belirlenmemiş görevler
- Yaklaşan etkinlikler: sonraki 5 etkinlik
- Önümüzdeki 7 gün: bir hafta içindeki görevler
- Son notlar: en son eklenen 3 not

Her bölüm SWR ile canlı veriye bağlı.

---

## 17. Uygulama tanıtımı: Plan oluşturma modülü

### Adım adım akış:
1. Kullanıcı AI Input Bar'a doğal dilde yazar
2. "Gönder" butonuna tıklar veya Enter'a basar
3. Yükleme animasyonu başlar
4. Gemini API metni analiz eder (yaklaşık 1-2 saniye)
5. Sonuç veritabanına kaydedilir
6. Toast bildirimi gösterilir ("Görev oluşturuldu!" gibi)
7. Dashboard güncellenir

### Desteklenen giriş örnekleri:
| Kullanıcı girdisi | AI çıktısı |
|---|---|
| "Yarın öğleden sonra Ahmet ile toplantı" | Etkinlik, İş kategorisi, yarının tarihi |
| "Süt, yumurta, ekmek al" | Görev, Alışveriş kategorisi |
| "React hook'ları hakkında notlarım" | Not, Eğitim kategorisi |
| "Projeyi yarına kadar bitir, çok acil" | Görev, urgent öncelik, yarının tarihi |

---

## 18. Uygulama tanıtımı: Analiz ekranı

Analiz yetenekleri Gemini API'nin NLU (Doğal Dil Anlama) kapasitesine dayanıyor.

### Çoklu sınıflandırma
Her metin 3 boyutta analiz ediliyor:
- Tip: task / note / event
- Kategori: Genel, İş, Kişisel, Eğitim, Sağlık, Alışveriş
- Öncelik: low, normal, high, urgent

### Zaman çözümleme motoru
- "Yarın" → bugünün tarihi + 1 gün
- "Haftaya Cuma" → sonraki Cuma'nın tarihi
- "Öğleden sonra" → saat 14:00
- "Akşama doğru" → saat bilgisi ile çözümleniyor
- Tarih belirtilmemişse sadece YYYY-MM-DD formatı kullanılıyor (saat eklenmez)

### Bağlamsal kategori tahmini
- "Ekmek", "market", "alışveriş" → Alışveriş
- "Toplantı", "rapor", "sunum" → İş
- "Ders", "kitap", "ödev" → Eğitim
- "Doktor", "diş hekimi", "ilaç" → Sağlık

---

## 19. Test metodolojisi

### 1. Gold standard test seti
7 farklı test senaryosu ile Gemini'nin sınıflandırma doğruluğunu ölçtük:

```
✅ "Yarın öğleden sonra Ahmet ile toplantı"     → Beklenen: event  
✅ "Haftaya cuma faturaları öde"                 → Beklenen: task   
✅ "Alınacaklar: Süt, Yumurta, Ekmek"           → Beklenen: note   
✅ "Projeyi yarına kadar bitir, çok acil"        → Beklenen: task   
✅ "React state management fikirleri"            → Beklenen: note   
✅ "3 Nisan akşamı halı saha maçı"              → Beklenen: event  
✅ "Akşama doğru çiçekleri sula"                 → Beklenen: task   
```

### 2. Neler test edildi
- Tip doğruluğu: AI'nın task/note/event ayrımını ne kadar doğru yaptığı
- Zaman doğruluğu: Tarih içeren ifadelerde tarihin doğru çözümlenip çözümlenmediği
- Hata dayanıklılığı: API hataları, rate limit ve geçersiz girdi durumlarında uygulamanın nasıl davrandığı

### 3. Optimistik UI testi
- Görev tamamlama ve silme işlemlerinde arayüzün sunucudan önce güncellenmesini test ettik
- Hata durumunda eski haline otomatik dönüşünü doğruladık

---

## 20. Başarı metrikleri: F1 skoru analizi

### F1 skoru nedir?
F1 skoru, bir sınıflandırma modelinin doğruluğunu ölçen bir metriktir. Precision (hassasiyet) ve Recall (hatırlama) değerlerinin harmonik ortalamasıdır:

```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

### AI-To'daki ölçüm
- Tip doğruluğu: AI'nın 7 test senaryosundan kaçında doğru tip ataması yaptığı
- Zaman doğruluğu: Tarih içeren ifadelerde AI'nın tarihi doğru çözümleme oranı
- F1 skoru: 7 test senaryosu üzerinde hesaplanan makro ortalama

### Örnek sonuçlar (benchmark)
| Metrik | Değer |
|--------|-------|
| Toplam test | 7 |
| Tip doğruluğu | ~%85-100 |
| Zaman doğruluğu | ~%85-100 |
| F1 skoru | ~0.85-1.00 |

Gemini API her çağrıda biraz farklı yanıt üretebilir, bu yüzden sonuçlarda küçük farklılıklar olabiliyor.

---

## 21. Performans sonuçları (Lighthouse)

Performans değerlendirmesinde Google Lighthouse kriterlerini temel aldık.

### Beklenen Lighthouse skorları
| Kategori | Hedef | Açıklama |
|----------|-------|----------|
| Performance | 90+ | CSS custom properties, minimal JS, SWR cache |
| Accessibility | 90+ | ARIA etiketleri, focus yönetimi, semantik HTML |
| Best Practices | 90+ | HTTPS, güvenli header'lar, güncel bağımlılıklar |
| SEO | 90+ | Meta taglar, semantik yapı, doğru heading hiyerarşisi |

### Performansı artıran teknikler
- SWR cache ile veri çekme istekleri önbelleğe alınıyor, gereksiz ağ istekleri azalıyor
- Optimistik güncelleme sayesinde sunucu yanıtı beklenmeden arayüz güncelleniyor
- CSS custom properties ile inline style'a göre daha verimli render sağlanıyor
- Skeleton loader ile veri yüklenirken shimmer animasyonlu iskelet ekranlar gösteriliyor (CLS sıfıra yakın)
- prefers-reduced-motion ile gereksiz animasyonlar devre dışı bırakılabiliyor

---

## 22. Gelecek çalışmalar ve planlar

### Kısa vadeli (1-3 ay)
- [ ] Kullanıcı kimlik doğrulama: e-posta/şifre ile giriş sistemi (NextAuth.js)
- [ ] Sesli giriş (Speech-to-Text): mikrofon butonu ile konuşarak görev oluşturma
- [ ] Takvim görünümü: aylık/haftalık takvim ile etkinliklerin görsel takibi
- [ ] Koyu tema desteği

### Orta vadeli (3-6 ay)
- [ ] SQLite'tan PostgreSQL veya Supabase'e geçiş
- [ ] "Her Pazartesi" gibi tekrarlı görev desteği
- [ ] Push notification ile görev hatırlatmaları
- [ ] Takım üyeleri arasında görev atama

### Uzun vadeli (6+ ay)
- [ ] React Native ile iOS/Android desteği
- [ ] Kullanıcı alışkanlıklarına göre AI öneri motoru
- [ ] Google Calendar, Outlook, Slack entegrasyonları
- [ ] Türkçe ve İngilizce'nin yanına ek diller

---

> **Hazırlayan:** AI-To Geliştirme Ekibi  
> **Tarih:** Nisan 2026
