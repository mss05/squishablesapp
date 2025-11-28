/**
 * SQUISHABLES - CORE LOGIC
 * Professional Edition
 * Stabilite Odaklı Yaklaşım
 */

const app = {
    // --- UYGULAMA VERİSİ ---
    state: {
        user: null, // {name, avatar}
        buddyImg: null,
        xp: 0,
        level: 1,
        maxLevel: 10,
        completedLevels: 0,
        timeLeft: 1200, // 20 Dakika (Saniye)
        timerInterval: null
    },

    // --- BAŞLATMA ---
    init: () => {
        try {
            // Veriyi Çek
            const saved = localStorage.getItem('squish_pro_data');
            if (saved) {
                app.state = { ...app.state, ...JSON.parse(saved) };
            }

            // Duruma Göre Yönlendir
            setTimeout(() => {
                if (app.state.user) {
                    app.nav.to('home');
                    app.timer.start();
                    app.ui.updateDashboard();
                } else {
                    app.nav.to('onboarding');
                }
            }, 2500); // Splash süresi

        } catch (error) {
            console.error("Boot Error:", error);
            localStorage.clear();
            location.reload();
        }
    },

    // --- VERİ KAYDETME ---
    save: () => {
        localStorage.setItem('squish_pro_data', JSON.stringify(app.state));
        app.ui.updateDashboard();
    },

    // --- NAVİGASYON ---
    nav: {
        to: (screenId) => {
            // SÜRE KONTROLÜ
            if (app.state.timeLeft <= 0) return;

            // BUDDY KONTROLÜ (Dersler için zorunlu)
            if (screenId === 'lessons') {
                if (!app.state.buddyImg) {
                    alert("⚠️ Dikkat!\nDerslere girmek için önce bir Oyun Arkadaşı (Buddy) yapmalısın. Ana ekrandaki 'Oyun Arkadaşın' kutusuna tıkla!");
                    return;
                }
                app.lessons.renderGrid();
            }

            // Ekran Geçişi
            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active-screen', 'hidden'));
            document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
            
            const target = document.getElementById(`screen-${screenId}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('active-screen');
            }
        }
    },

    // --- KULLANICI KAYDI ---
    selectAvatar: (id, element) => {
        // Görsel Seçim Efekti
        document.querySelectorAll('.avatar-circle-wrapper').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        app.tempAvatar = id;
    },

    registerUser: () => {
        const name = document.getElementById('input-name').value;
        if (!name || !app.tempAvatar) {
            alert("Lütfen ismini yaz ve bir karakter seç!");
            return;
        }
        app.state.user = { name: name, avatar: app.tempAvatar };
        app.save();
        app.nav.to('home');
        app.timer.start();
    },

    // --- ZAMANLAYICI (TIMER) ---
    timer: {
        start: () => {
            if (app.state.timerInterval) clearInterval(app.state.timerInterval);
            app.state.timerInterval = setInterval(() => {
                app.state.timeLeft--;
                
                // Header güncelleme (Dynamic Island)
                const min = Math.floor(app.state.timeLeft / 60);
                document.getElementById('island-time').innerText = `${min} dk kaldı`;

                if (app.state.timeLeft <= 0) {
                    clearInterval(app.state.timerInterval);
                    document.getElementById('overlay-time-up').classList.remove('hidden');
                }
                
                // Her 30 saniyede bir auto-save
                if(app.state.timeLeft % 30 === 0) app.save();

            }, 1000);
        }
    },

    // --- DERSLER VE LEVEL SİSTEMİ ---
    lessons: {
        filter: (subject) => {
            document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            // Gerçek uygulamada soruları konuya göre filtreleriz
            // Şimdilik sadece görsel feedback
        },
        
        renderGrid: () => {
            // Statik HTML Grid'ini güncelle
            for (let i = 1; i <= 10; i++) {
                const node = document.getElementById(`lvl-${i}`);
                node.className = 'level-node locked'; // Reset
                
                if (i <= app.state.completedLevels + 1) {
                    node.className = 'level-node'; // Açık
                }
                if (i <= app.state.completedLevels) {
                    node.className = 'level-node completed'; // Tamamlandı
                }
            }
        },

        startLevel: (lvl) => {
            if (lvl > app.state.completedLevels + 1) return; // Kilitli
            
            app.currentLevel = lvl;
            app.nav.to('quiz');
            
            // Buddy Helper Yükle
            document.getElementById('quiz-buddy-visual').src = app.state.buddyImg;
            
            // Soru Üret
            const n1 = Math.floor(Math.random() * (lvl * 2)) + 1;
            const n2 = Math.floor(Math.random() * (lvl * 2)) + 1;
            const correct = n1 + n2;
            document.getElementById('quiz-question-text').innerText = `${n1} + ${n2} = ?`;

            // Şıklar
            const area = document.getElementById('quiz-options-area');
            area.innerHTML = '';
            let opts = [correct, correct+1, correct-1, correct+2].sort(()=>Math.random()-0.5);
            
            opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn squish-btn';
                btn.innerText = opt;
                btn.onclick = () => {
                    if (opt === correct) {
                        alert("Harika! Seviye Geçildi!");
                        if (lvl > app.state.completedLevels) app.state.completedLevels = lvl;
                        app.state.xp += 50;
                        app.save();
                        app.nav.to('lessons');
                    } else {
                        alert("Buddy ipucu veriyor: Biraz daha dikkatli ol!");
                    }
                };
                area.appendChild(btn);
            });
        }
    },

    // --- ATÖLYE SİSTEMİ ---
    workshop: {
        activeGuide: null,
        guides: {
            flower: { img: 'cicek_adim5.jpg' },
            castle: { img: 'kale_adim2.jpg' }
        },
        
        open: (id) => {
            app.workshop.activeGuide = id;
            document.getElementById('overlay-guide').classList.remove('hidden');
            document.getElementById('modal-guide-img').src = app.workshop.guides[id].img;
            document.getElementById('modal-user-img').classList.add('hidden');
            document.getElementById('modal-upload-icon').classList.remove('hidden');
            document.getElementById('btn-guide-complete').classList.add('disabled');
            document.getElementById('btn-guide-complete').disabled = true;

            // Yükleme Dinleyici
            document.getElementById('craft-upload').onchange = (e) => {
                const file = e.target.files[0];
                if(file){
                    const reader = new FileReader();
                    reader.onload = (res) => {
                        document.getElementById('modal-user-img').src = res.target.result;
                        document.getElementById('modal-user-img').classList.remove('hidden');
                        document.getElementById('modal-upload-icon').classList.add('hidden');
                        document.getElementById('btn-guide-complete').classList.remove('disabled');
                        document.getElementById('btn-guide-complete').disabled = false;
                    }
                    reader.readAsDataURL(file);
                }
            }
        },

        close: () => {
            document.getElementById('overlay-guide').classList.add('hidden');
        },

        finish: () => {
            alert("Atölye Çalışması Başarılı! +100 XP");
            app.state.xp += 100;
            app.save();
            app.workshop.close();
            app.nav.to('home');
        }
    },

    // --- MARKET ---
    shop: {
        buy: (cost) => {
            if (app.state.xp >= cost) {
                if(confirm("Bu ürünü satın almak istiyor musun?")) {
                    app.state.xp -= cost;
                    app.save();
                    alert("Satın alma başarılı!");
                }
            } else {
                alert("Yetersiz XP! Ders yaparak kazanabilirsin.");
            }
        }
    },

    // --- BUDDY YÖNETİMİ ---
    ui: {
        updateDashboard: () => {
            if (!app.state.user) return;
            
            document.getElementById('display-name').innerText = app.state.user.name;
            document.getElementById('display-lvl').innerText = app.state.completedLevels + 1;
            document.getElementById('display-avatar').src = `avatar${app.state.user.avatar}.png`;
            document.getElementById('global-xp').innerText = app.state.xp;
            document.getElementById('shop-balance').innerText = app.state.xp;

            // Buddy UI
            if (app.state.buddyImg) {
                document.getElementById('buddy-home-preview').src = app.state.buddyImg;
                document.getElementById('buddy-home-preview').classList.remove('hidden');
                document.getElementById('buddy-missing-icon').classList.add('hidden');
                document.getElementById('buddy-status-msg').innerText = "Hazır!";
                document.getElementById('buddy-status-msg').className = "text-success"; // style.css'te eklenebilir
                
                // Buddy Ekranındaki Önizleme
                document.getElementById('buddy-preview-large').src = app.state.buddyImg;
                document.getElementById('buddy-preview-large').classList.remove('hidden');
                document.getElementById('buddy-placeholder-large').classList.add('hidden');
            }
        }
    }
};

// Buddy Yükleme (Ana Ekran)
document.getElementById('buddy-upload-input').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (res) => {
            app.state.buddyImg = res.target.result;
            app.save();
            alert("Harika! Buddy sisteme kaydedildi.");
            app.nav.to('home');
        };
        reader.readAsDataURL(file);
    }
};

// Başlat
document.addEventListener('DOMContentLoaded', app.init);
