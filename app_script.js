/* app_script.js */

document.addEventListener('DOMContentLoaded', () => {
    switchTab('home');
});

// Sekme Değiştirme
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-center').forEach(el => el.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    
    // Alt menüyü aktif yap
    const navBtn = document.querySelector(`.nav-item[onclick="switchTab('${tabId}')"]`);
    if(navBtn) navBtn.classList.add('active');
    
    // Orta buton (Buddy) kontrolü
    if(tabId === 'buddy') {
        document.querySelector('.nav-center').classList.add('active');
    }
}

// FOTOĞRAF YÜKLEME SİMÜLASYONU
function uploadBuddy() {
    const uploadText = document.getElementById('upload-text');
    const loading = document.getElementById('upload-loading');
    const image = document.getElementById('my-buddy-img');
    const actionBtn = document.getElementById('buddy-action-btn');

    // 1. Yükleniyor efekti
    uploadText.style.display = 'none';
    loading.style.display = 'block';
    loading.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Character Scanning...';

    // 2. 2 saniye sonra fotoğrafı göster
    setTimeout(() => {
        loading.style.display = 'none';
        image.style.display = 'block'; // FOTOĞRAFI GÖSTER
        
        // Butonu "Ders Çalış" moduna çevir
        actionBtn.innerText = "Start Learning Together!";
        actionBtn.setAttribute("onclick", "startLesson()");
        actionBtn.style.backgroundColor = "#C4DFD9";
        actionBtn.style.color = "#3b6b3b";
        
        alert("Harika! Arkadaşın 'Doughy' başarıyla yüklendi. Artık beraber ders çalışabilirsiniz!");
    }, 2000);
}

// DERS ÇALIŞMA MODUNU BAŞLAT
function startLesson() {
    // Buddy ekranını gizle, ders ekranını aç
    document.getElementById('buddy-home').style.display = 'none';
    document.getElementById('lesson-mode').classList.add('active');
}

// CEVAP KONTROLÜ
function checkAnswer(btn, isCorrect) {
    if(isCorrect) {
        btn.style.background = '#C4DFD9'; // Yeşil
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Correct!';
        setTimeout(() => {
            alert("Tebrikler! Doughy seninle gurur duyuyor! +50 Puan");
            switchTab('rewards'); // Ödül sayfasına at
        }, 1000);
    } else {
        btn.style.background = '#FFD1BA'; // Kırmızımsı
        btn.innerText = 'Try Again';
    }
}

// DETAY SAYFALARI (Guide vb.)
function openPage(pageId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function goBack(toTab) {
    switchTab(toTab);
}
