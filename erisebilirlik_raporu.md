# AI-To Projesi: Erişilebilirlik (Accessibility - a11y) Raporu

Bu rapor, AI-To uygulamasının mevcut erişilebilirlik durumunu değerlendirir ve gelecekte yapılabilecek iyileştirmelere dair öneriler sunar (WCAG 2.1 AA ve AAA standartları göz önünde bulundurularak hazırlanmıştır).

##  Mevcut Erişilebilirlik (a11y) Özellikleri

### 1. Ekran Okuyucu (Screen Reader) Uyumluluğu
- **Semantik HTML Etiket kullanımı:** `<header>`, `<main>`, `<form>`, `<section>` gibi etiketler arayüz yapısını destekliyor ve makine okuyucularının gezinmesini kolaylaştırıyor.
- **ARIA Label (aria-label):** Hem Header component'inde (örneğin butonlar) hem de Input barında açıklayıcı `aria-label` attribute'ları eklendi. (örn: `aria-label="Menüyü aç/kapat"`, `aria-label="Bildirimler"`)
- **Rol Bildirimleri (role):** Form elementlerine ve toast mesajlarına uygun roller atandı `role="search"`, `role="alert"`.
- **Canlı Bölge Bildirimleri (aria-live):** Toast (uyarı ve hata) mesajlarının çıktığında ekran okuyucu tarafından anında okunması için `aria-live` kullanılıyor.
- **Sadece Ekran Okuyucu Metinleri (.sr-only):** `globals.css` içerisinde, görsel olarak gizlenen ancak ekran okuyucular tarafından okunabilen gizli metin sınıfları bulunuyor.

### 2. Klavye ile Gezinme (Keyboard Navigation)
- Tam odaklanma yönetimi için `:focus-visible` CSS seçicisi kullanılarak her öğenin nereye odaklandığını açıkça gösteren mavi renkli çerçeve (`outline`) tanımlamaları yapıldı.
- Özelleştirilmiş bir klavye dinleme yapısı (`useKeyboardNav` hook'u) ile sayfanın herhangi bir yerindeyken anında "Ara" girişine atlanması sağlandı.
- Form alanları "Enter" tuşu form submit (gönderimi) yapacak şekilde düzgünce kaplandı.
- İçeriğe atlamak için CSS tarafında `skip-link` özelliği var, UI tarafına eklenmeye hazır.

### 3. Görsel Tasarım ve Kavrama (Visual / Cognitive)
- **Yeni Eklenen Yüksek Kontrast (High Contrast) Modu:** Renk körlüğü veya düşük görme keskinliğine sahip kullanıcılar için üst bar'daki Göz ikonu ile koyu temada ve tam siyah/sarı neon formunda WCAG 2.1 AA kontrast oranı barajını rahatça geçen özel bir görünüm seçeneği aktifleştirildi.
- **İnsanileştirilmiş Hata Yönetimi:** Özellikle bilişsel stresi azaltmak için teknik terimler içeren veya çok düz hatalar yerine, "Lütfen ne yapmak istediğinizi biraz daha detaylandırır mısınız?" gibi anlaşılır yönlendirmeli geri dönüş mesajları entegre edildi.
- **Odak Tasarımı:** `Reduced Motion` (Hareketleri azalt) destekli kullanıcının işletim sisteminden gelen ayarlara göre animasyonlar iptal ediliyor.

---

##  Önerilen Geliştirmeler (Neler Eklenebilir?)

### 1. Gelişmiş Klavye Yönetimi (Focus Trapping & Tab Index)
- **Modal ve Yan Menü İçi Odaklama (Focus Trapping):** Mobil menü (Sidebar) açıldığında veya ekranda bir Modal pencere (Popup) göründüğünde Tab tuşu ile arkadaki (arka plandaki) öğelere geçiş olması engellenmeli, odaklar sadece arayüz kapatılana kadar aktif pencere içinde hapsedilmelidir.
- **Aşırı Kullanımdan Kaçınma:** Her bir butonda uygun `tabindex` olduğu kontrol edilmeli.

### 2. Form İçin Gelişmiş Doğrulamalar
- Kullanıcı herhangi bir form doldururken hata yapmışsa, anında ekran okuyucuya bu hata sesli okunmalı (`aria-invalid="true"`) ve hatanın olduğu kısımla odak (focus) doğrudan hatalı kutucuğa götürülmelidir. Şu anda Toasts aracılığıyla veriliyor.
- `aria-describedby` gibi attributelar ile input altındaki küçük açıklayıcı "hint" metinleri doğrudan input ile ilişkilendirilmelidir.

### 3. Sesli Arayüz Karşılıkları (Voice Assistant Integration)
- Çok büyük harika bir "Sesli Okuma (Text-to-Speech)" altyapısı zaten uygulamanızda var (Volume ikonu). Ancak aynı şekilde **Sesli Girdi (Speech-to-Text)** eklenerek, fiziksel klavye kullanmakta zorlanan insanların sisteme yapay zeka tarafından algılanacak metinleri direkt kendi sesleriyle vermeleri sağlanabilir (Web Speech API'nin `SpeechRecognition` özelliğiyle).

### 4. Alternatif Metinler
- Projedeki logo ikonları ve resimler (Örn: Eğer event resimleri olursa) mutlaka açıklayıcı `alt="Etkinlik posteri"` metinlerine sahip olmalıdır. Şu anda SVG'ler için de `aria-hidden="true"` eklenebilir çünkü yanlarında çoğunlukla metin var.

### 5. Yazı Tipi Ölçekleme (Font Scaling)
- Yüksek kontrast moduna entegre bir özellik olarak, kullanıcıların sadece renkleri değil, arayüzdeki yazı puntosunu (%120, %150 vs.) büyütmesine (Text Inclusivity) imkan sunacak bir ayar paneli eklenebilir.
