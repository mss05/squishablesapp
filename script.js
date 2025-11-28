/**
 * SQUISHABLES - CORE LOGIC
 * ULTIMATE EDITION (Settings & Step-by-Step Fix)
 */

const app = {
    // --- UYGULAMA VERİSİ ---
    state: {
        user: null, // {name, avatar}
        buddyImg: null,
        xp: 0,
        completedLevels: 0,
        timeLeft: 1200,
        settings: { sound: true, notifications: true },
        timerInterval: null
    },

    // --- BAŞLATMA ---
    init: () => {
        try {
            const saved = localStorage.getItem('squish_ultimate_data');
            if (saved) app.state = { ...app.state, ...JSON.parse(saved) };

            // Yükleme Dinleyicileri
            const buddyInput = document.getElementById('buddy-upload-input');
            if(buddyInput) buddyInput.addEventListener('change', app.buddy.handleUpload);

            const stepInput = document.getElementById('step-upload');
            if(stepInput) stepInput.addEventListener('change', app.workshop.handleStepUpload);

            // Başlangıç Yönlendirmesi
            setTimeout(() => {
                if (app.state.user) {
                    app.nav.to('home');
                    app.timer.start();
                    app.ui.refreshAll();
                } else {
                    app.nav.to('onboarding');
                }
            }, 2500);

        } catch (error) {
            console.error("Boot Error:", error);
            localStorage.clear();
            location.reload();
        }
    },

    save: () => {
        localStorage.setItem('squish_ultimate_data', JSON.stringify(app.state));
        app.ui.refreshAll();
    },

    // --- NAVİGASYON ---
    nav: {
        to: (screenId) => {
            if (app.state.timeLeft <= 0) return;

            // Buddy Kontrolü
            if (screenId === 'lessons') {
                if (!app.state.buddyImg) {
                    alert("⚠️ Önce Buddy'ni yüklemelisin!");
                    return;
                }
                app.lessons.renderGrid();
            }

            // Settings ekranına girerken verileri doldur
            if (screenId === 'settings') {
                app.settings.loadUI();
            }

            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active-screen', 'hidden'));
            document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
            
            const target = document.getElementById(`screen-${screenId}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('active-screen');
            }
        }
    },

    // --- KULLANICI & AVATAR ---
    selectAvatar: (id, element) => {
        document.querySelectorAll('.avatar-circle-wrapper').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        app.tempAvatar = id;
    },

    registerUser: () => {
        const name = document.getElementById('input-name').value;
        if (!name || !app.tempAvatar) {
            alert("Lütfen isim yaz ve avatar seç.");
            return;
        }
        app.state.user = { name: name, avatar: app.tempAvatar };
        app.save();
        app.nav.to('home');
        app.timer.start();
    },

    // --- AYARLAR (YENİLENEN KISIM) ---
    settings: {
        tempSettingsAvatar: null,
        
        loadUI: () => {
            document.getElementById('edit-name-input').value = app.state.user.name;
            app.settings.tempSettingsAvatar = app.state.user.avatar;
            // Avatar seçimini görsel olarak işaretle
            document.querySelectorAll('#screen-settings .avatar-circle-wrapper').forEach((el, index) => {
                el.classList.remove('selected');
                if((index + 1) == app.state.user.avatar) el.classList.add('selected');
            });
        },

        setAvatar: (id, element) => {
            document.querySelectorAll('#screen-settings .avatar-circle-wrapper').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
            app.settings.tempSettingsAvatar = id;
        },

        saveProfile: () => {
            const newName = document.getElementById('edit-name-input').value;
            if(newName) {
                app.state.user.name = newName;
                app.state.user.avatar = app.settings.tempSettingsAvatar;
                app.save();
                alert("Profil güncellendi!");
                app.nav.to('home');
            }
        },

        toggleSound: () => {
            app.state.settings.sound = !app.state.settings.sound;
            app.save();
            // Burada gerçek ses kontrol kodları olabilir
        },

        resetApp: () => {
            if(confirm("Tüm ilerlemen silinecek! Emin misin?")) {
                localStorage.clear();
                location.reload();
            }
        }
    },

    // --- ZAMANLAYICI ---
    timer: {
        start: () => {
            if (app.state.timerInterval) clearInterval(app.state.timerInterval);
            app.state.timerInterval = setInterval(() => {
                app.state.timeLeft--;
                const min = Math.floor(app.state.timeLeft / 60);
                const islandTime = document.getElementById('island-time');
                if(islandTime) islandTime.innerText = `${min} dk kaldı`;

                if (app.state.timeLeft <= 0) {
                    clearInterval(app.state.timerInterval);
                    document.getElementById('overlay-time-up').classList.remove('hidden');
                }
                if(app.state.timeLeft % 30 === 0) app.save();
            }, 1000);
        }
    },

    // --- ATÖLYE (ADIM ADIM SİSTEMİ) ---
    workshop: {
        currentGuideId: null,
        currentStepIndex: 0,
        guides: {
            flower: {
                title: "Çiçek Yapımı",
                steps: [
                    { text: "Hamuru yuvarla ve gövde yap.", img: "cicek_adim1.jpg" },
                    { text: "Yaprakları ekle.", img: "cicek_adim2.jpg" },
                    { text: "Renkli taç yaprakları hazırla.", img: "cicek_adim5.jpg" }
                ]
            },
            castle: {
                title: "Kale Yapımı",
                steps: [
                    { text: "Temeli oluştur.", img: "kale_adim1.jpg" },
                    { text: "Kuleleri dik.", img: "kale_adim2.jpg" }
                ]
            }
        },

        start: (id) => {
            app.workshop.currentGuideId = id;
            app.workshop.currentStepIndex = 0;
            app.workshop.renderStep();
            document.getElementById('overlay-guide').classList.remove('hidden');
        },

        renderStep: () => {
            const guide = app.workshop.guides[app.workshop.currentGuideId];
            const step = guide.steps[app.workshop.currentStepIndex];
            const totalSteps = guide.steps.length;

            // UI Güncelle
            document.getElementById('modal-guide-title').innerText = `${guide.title} (${app.workshop.currentStepIndex + 1}/${totalSteps})`;
            document.getElementById('modal-step-desc').innerText = step.text;
            document.getElementById('modal-guide-img').src = step.img;
            
            // Kullanıcı Upload Kısmını Sıfırla
            document.getElementById('modal-user-img').src = "";
            document.getElementById('modal-user-img').classList.add('hidden');
            document.getElementById('modal-upload-icon').classList.remove('hidden');
            
            // Buton Durumları
            document.getElementById('btn-prev-step').style.visibility = app.workshop.currentStepIndex === 0 ? 'hidden' : 'visible';
            
            const nextBtn = document.getElementById('btn-next-step');
            if (app.workshop.currentStepIndex === totalSteps - 1) {
                nextBtn.innerText = "Bitir ve Kazan";
            } else {
                nextBtn.innerText = "Sonraki Adım";
            }
        },

        handleStepUpload: (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (res) => {
                    document.getElementById('modal-user-img').src = res.target.result;
                    document.getElementById('modal-user-img').classList.remove('hidden');
                    document.getElementById('modal-upload-icon').classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        },

        nextStep: () => {
            const guide = app.workshop.guides[app.workshop.currentGuideId];
            if (app.workshop.currentStepIndex < guide.steps.length - 1) {
                app.workshop.currentStepIndex++;
                app.workshop.renderStep();
            } else {
                // Bitir
                alert("Atölye Başarıyla Tamamlandı! +100 XP");
                app.state.xp += 100;
                app.save();
                app.workshop.close();
            }
        },

        prevStep: () => {
            if (app.workshop.currentStepIndex > 0) {
                app.workshop.currentStepIndex--;
                app.workshop.renderStep();
            }
        },

        close: () => {
            document.getElementById('overlay-guide').classList.add('hidden');
        }
    },

    // --- DERSLER ---
    lessons: {
        renderGrid: () => {
            for (let i = 1; i <= 10; i++) {
                const node = document.getElementById(`lvl-${i}`);
                if(node) {
                    node.className = 'level-node locked';
                    if (i <= app.state.completedLevels + 1) node.className = 'level-node';
                    if (i <= app.state.completedLevels) node.className = 'level-node completed';
                }
            }
        },
        startLevel: (lvl) => {
            if (lvl > app.state.completedLevels + 1) return;
            app.currentLevel = lvl;
            app.nav.to('quiz');
            // Soru üretimi
            const n1 = Math.floor(Math.random() * (lvl * 2)) + 1;
            const n2 = Math.floor(Math.random() * (lvl * 2)) + 1;
            const correct = n1 + n2;
            document.getElementById('quiz-question-text').innerText = `${n1} + ${n2} = ?`;
            const area = document.getElementById('quiz-options-area');
            area.innerHTML = '';
            let opts = [correct, correct+1, correct-1, correct+2].sort(()=>Math.random()-0.5);
            opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn squish-btn';
                btn.innerText = opt;
                btn.onclick = () => {
                    if (opt === correct) {
                        alert("Doğru! 🎉");
                        if (lvl > app.state.completedLevels) app.state.completedLevels = lvl;
                        app.state.xp += 50;
                        app.save();
                        app.nav.to('lessons');
                    } else alert("Yanlış!");
                };
                area.appendChild(btn);
            });
        }
    },

    // --- BUDDY ---
    buddy: {
        handleUpload: (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (res) => {
                    app.state.buddyImg = res.target.result;
                    app.save();
                    alert("Buddy yüklendi!");
                    app.nav.to('home');
                };
                reader.readAsDataURL(file);
            }
        }
    },

    // --- SHOP ---
    shop: {
        buy: (cost) => {
            if(app.state.xp >= cost && confirm("Satın al?")) {
                app.state.xp -= cost;
                app.save();
                alert("Satın alındı!");
            } else alert("Yetersiz XP.");
        }
    },

    // --- UI GÜNCELLEME ---
    ui: {
        refreshAll: () => {
            if (!app.state.user) return;
            document.getElementById('display-name').innerText = app.state.user.name;
            document.getElementById('display-lvl').innerText = app.state.completedLevels + 1;
            document.getElementById('display-avatar').src = `avatar${app.state.user.avatar}.png`;
            document.getElementById('global-xp').innerText = app.state.xp;
            document.getElementById('shop-balance').innerText = app.state.xp;

            if (app.state.buddyImg) {
                document.getElementById('buddy-home-preview').src = app.state.buddyImg;
                document.getElementById('buddy-home-preview').classList.remove('hidden');
                document.getElementById('buddy-missing-icon').classList.add('hidden');
                document.getElementById('buddy-status-msg').innerText = "Hazır!";
                document.getElementById('buddy-status-msg').style.color = "#00b894";
                document.getElementById('buddy-preview-large').src = app.state.buddyImg;
                document.getElementById('buddy-preview-large').classList.remove('hidden');
                document.getElementById('buddy-placeholder-large').classList.add('hidden');
                const quizBuddy = document.getElementById('quiz-buddy-visual');
                if(quizBuddy) quizBuddy.src = app.state.buddyImg;
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', app.init);
