/* app_script.js */

document.addEventListener('DOMContentLoaded', () => {
    // İlk açılışta Home sekmesini göster
    switchTab('home');
});

// Sekme Değiştirme Fonksiyonu
function switchTab(tabId) {
    // 1. Tüm içerikleri gizle
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });

    // 2. Tüm menü ikonlarını pasif yap
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });

    // 3. Seçilen içeriği göster
    const selectedContent = document.getElementById(tabId);
    if(selectedContent) selectedContent.classList.add('active');

    // 4. Seçilen menü ikonunu aktif yap
    const activeNav = document.querySelector(`.nav-item[onclick="switchTab('${tabId}')"]`);
    if(activeNav) activeNav.classList.add('active');
}

// "Start" butonuna basınca Detay sayfasına gitme
function openGuide(guideName) {
    // Normalde guideName'e göre içerik değişir ama şimdilik demo
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('guide-detail').classList.add('active');
}

// Geri butonu
function goBack() {
    switchTab('challenges');
}

// Bildirimleri aç
function toggleNotifications() {
    // Basitçe bildirim sekmesine gitsin
    switchTab('notifications');
}
