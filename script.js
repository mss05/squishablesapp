/**
 * SQUISHABLES - MOODMAKERS APP
 * Logic Controller
 */

const app = {
    // --- STATE MANAGEMENT (Veri Yönetimi) ---
    data: {
        user: null, // {name, avatar, xp, level}
        buddy: null // Base64 image
    },

    // Uygulama Başlatıcı
    init: () => {
        // Splash ekranını bekle
        setTimeout(() => {
            const stored = localStorage.getItem('squishUser');
            if (stored) {
                app.data.user = JSON.parse(stored);
                app.navTo('screen-home');
                app.updateUI();
            } else {
                app.navTo('screen-profile');
            }
        }, 3000); // 3 saniye splash
        
        app.setupEventListeners();
    },

    save: () => {
        localStorage.setItem('squishUser', JSON.stringify(app.data.user));
        app.updateUI();
    },

    // --- NAVIGATION (Geçişler) ---
    navTo: (screenId) => {
        // Tüm section'ları gizle
        document.querySelectorAll('section').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('section').forEach(el => el.classList.remove('active'));
        
        // Hedef ekranı aç
        const target = document.getElementById(screenId);
        target.classList.remove('hidden');
        
        // Animasyon için active ekle
        setTimeout(() => target.classList.add('active'), 10);
        
        // Eğer dersler ekranıysa içeriği yükle
        if(screenId === 'screen-lessons') app.loadLessons();
    },

    // --- UI UPDATES ---
    updateUI: () => {
        if (!app.data.user) return;
        
        // Home verilerini güncelle
        document.getElementById('home-name').innerText = app.data.user.name;
        document.getElementById('home-xp').innerText = app.data.user.xp;
        document.getElementById('home-avatar').src = `avatar${app.data.user.avatar}.png`;
        
        // Avatar hata verirse placeholder koy
        document.getElementById('home-avatar').onerror = function() {
            this.src = 'https://via.placeholder.com/50';
        };
    },

    // --- CORE FEATURES ---
    
    // 1. Profil Oluşturma
    createProfile: () => {
        const nameInput = document.getElementById('input-name').value;
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        
        if (!nameInput || !selectedAvatar) {
            alert("Lütfen bir isim yaz ve avatar seç!");
            return;
        }

        app.data.user = {
            name: nameInput,
            avatar: selectedAvatar.dataset.id,
            xp: 0,
            level: 1
        };
        
        app.save();
        app.navTo('screen-home');
    },

    // 2. Ders/Oyun Yükleme
    loadLessons: () => {
        const list = document.getElementById('lessons-list');
        list.innerHTML = '';
        
        const topics = [
            { id: 1, title: 'Matematik', icon: 'fa-calculator' },
            { id: 2, title: 'Renkler', icon: 'fa-palette' },
            { id: 3, title: 'Şekiller', icon: 'fa-shapes' }
        ];

        topics.forEach(t => {
            const div = document.createElement('div');
            div.className = 'glass-card squish-effect';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '15px';
            div.style.cursor = 'pointer';
            div.innerHTML = `<i class="fas ${t.icon}" style="font-size:1.5rem; color:var(--text-dark)"></i> <b>${t.title}</b>`;
            div.onclick = () => app.startQuiz(t.id);
            list.appendChild(div);
        });
    },

    // 3. Quiz Mantığı
    startQuiz: (topicId) => {
        app.navTo('screen-quiz');
        const qBox = document.getElementById('quiz-q');
        const optBox = document.getElementById('quiz-options');
        optBox.innerHTML = '';

        // Basit Matematik Örneği
        const n1 = Math.floor(Math.random() * 10);
        const n2 = Math.floor(Math.random() * 10);
        const correct = n1 + n2;
        
        qBox.innerText = `${n1} + ${n2} = ?`;
        
        // Şıklar
        const options = [correct, correct+1, correct-1, correct+2].sort(() => Math.random() - 0.5);
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'glass-card squish-effect';
            btn.style.border = 'none';
            btn.style.fontSize = '1.2rem';
            btn.style.fontWeight = 'bold';
            btn.innerText = opt;
            btn.onclick = () => {
                if(opt === correct) {
                    alert("Harika! +10 XP");
                    app.data.user.xp += 10;
                    app.save();
                    app.navTo('screen-home');
                } else {
                    alert("Tekrar dene! 💪");
                }
            };
            optBox.appendChild(btn);
        });
    },

    // 4. Workshop / Upload Mantığı
    startWorkshop: (type) => {
        app.navTo('screen-workshop-detail');
        // Örnek statik veri
        document.getElementById('ws-guide-img').src = 'cicek_adim1.jpg';
        document.getElementById('ws-guide-img').onerror = function(){this.src='https://via.placeholder.com/300x200?text=Cicek+Adim+1'};
        
        // Reset
        document.getElementById('preview-img').classList.add('hidden');
        document.getElementById('upload-icon').classList.remove('hidden');
        document.getElementById('btn-complete-step').disabled = true;
    },

    handleFileUpload: (event) => {
        const file = event.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('preview-img');
                img.src = e.target.result;
                img.classList.remove('hidden');
                document.getElementById('upload-icon').classList.add('hidden');
                document.getElementById('btn-complete-step').disabled = false;
            };
            reader.readAsDataURL(file);
        }
    },

    // --- EVENT LISTENERS ---
    setupEventListeners: () => {
        // Avatar Seçimi
        document.querySelectorAll('.avatar-option').forEach(el => {
            el.addEventListener('click', function() {
                document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Başla Butonu
        document.getElementById('btn-start').addEventListener('click', app.createProfile);

        // Dosya Yükleme
        document.getElementById('file-upload').addEventListener('change', app.handleFileUpload);

        // Atölye Tamamla
        document.getElementById('btn-complete-step').addEventListener('click', () => {
            alert("Tebrikler! Fotoğraf yüklendi. +50 XP kazandın.");
            app.data.user.xp += 50;
            app.save();
            app.navTo('screen-home');
        });
    }
};

// Uygulamayı Başlat
document.addEventListener('DOMContentLoaded', app.init);
