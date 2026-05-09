// Yardimci (Utils) Fonksiyonlar Kutusu.
// Neden Yaptik: Projede tarih pars etmek, string operasyonlari yapmak, renkleri yonetmek gibi isler icin tekerrur (DRY kurali) olmamasi amaciyla bir utilities dosyasi sunduk.
// Gelecek Plani: Date fns gibi yardimci paketlerin fonksiyonlariyla genisleyebilir, AI'den gelen string tarihleri JavaScript Date objelerine eviren parser metodlar eklenebilir.

import { formatTurkeyDate, formatTurkeyDateTime, formatTurkeyTime } from "./turkey-date";

export function formatDate(date) {
    return formatTurkeyDate(date);
}

export function formatDateTime(date) {
    return formatTurkeyDateTime(date);
}

export function formatTime(date) {
    return formatTurkeyTime(date);
}

export function getPriorityLabel(priority) {
    const labels = {
        low: "Dusuk",
        normal: "Normal",
        high: "Yuksek",
        urgent: "Acil",
    };
    return labels[priority] || "Normal";
}

export function getCategoryColor(category) {
    const colors = {
        Is: "#6C63FF",
        Kisisel: "#00D9A6",
        Egitim: "#FFB347",
        Saglik: "#FF6B6B",
        Genel: "#A0A0B8",
    };
    return colors[category] || colors["Genel"];
}
