const app = {
    state: {
        user: null,
        buddyImg: null,
        xp: 0,
        completedLevels: 0,
        timeLeft: 1200, // 20 Dakika
        timerInterval: null
    },

    init: () => {
        // Veriyi Yükle
        const saved = localStorage.getItem('squish_final_data');
        if (saved) app.state = { ...app.state, ...JSON.parse(saved) };

        // Buddy ve Step Upload Dinleyicileri
        const buddyInput = document.getElementById('buddy-upload-input');
        if(buddyInput) buddyInput.addEventListener('change', app.buddy.handleUpload);

        const stepInput = document.getElementById('step-upload');
        if(stepInput) stepInput.addEventListener('change', app.workshop.handleStepUpload);

        // Başlangıç Kontrolü
        setTimeout(() => {
            if (app.state.user) {
                app.nav.to('home');
                app.ui.refreshAll();
            } else {
                app.nav.to('onboarding');
            }
        }, 2000);
    },

    save: () => {
        localStorage.setItem('squish_final_data', JSON.stringify(app.state));
        app.ui.refreshAll();
    },

    nav: {
        to: (screenId) => {
            // Buddy Kontrolü (Dersler İçin)
            if (screenId === 'lessons') {
                if (!app.state.buddyImg) {
                    alert("⚠️ Lütfen önce bir Buddy yükle!");
                    return;
                }
                app.lessons.renderGrid();
            }

            // Timer Başlat/Durdur Mantığı
            const timerEl = document.getElementById('dynamic-island');
            if (screenId === 'lessons' || screenId === 'workshop' || screenId === 'quiz') {
                timerEl.classList.remove('hidden-island'); // Timer'ı göster
                app.timer.start(); // Sayacı başlat
            } else {
                timerEl.classList.add('hidden-island'); // Timer'ı gizle
                app.timer.stop(); // Sayacı durdur (veya arka planda devam etsin istersen bunu sil)
            }

            // Alt Bar Kontrolü
            const bottomNav = document.getElementById('bottom-nav-bar');
            if(screenId === 'splash' || screenId === 'onboarding') {
                bottomNav.classList.add('hidden');
            } else {
                bottomNav.classList.remove('hidden');
            }

            // Ekran Geçişi
            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active-screen', 'hidden'));
            document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
            document.getElementById(`screen-${screenId}`).classList.remove('hidden');
            document.getElementById(`screen-${screenId}`).classList.add('active-screen');

            // Alt Bar İkon Aktifliği
            document.querySelectorAll('.nav-icon').forEach(el => el.classList.remove('active'));
            // Basit bir eşleştirme (home, lessons, workshop, buddy)
            // (Gerçek projede data-target ile daha temiz yapılabilir)
        }
    },

    timer: {
        start: () => {
            if (app.state.timerInterval) return; // Zaten çalışıyorsa tekrar başlatma
            app.state.timerInterval = setInterval(() => {
                app.state.timeLeft--;
                const min = Math.floor(app.state.timeLeft / 60);
                const sec = app.state.timeLeft % 60;
                document.getElementById('task-timer').innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;
                
                if(app.state.timeLeft <= 0) {
                    clearInterval(app.state.timerInterval);
                    document.getElementById('overlay-time-up').classList.remove('hidden');
                }
            }, 1000);
        },
        stop: () => {
            clearInterval(app.state.timerInterval);
            app.state.timerInterval = null;
        }
    },

    workshop: {
        currentGuideId: null,
        currentStepIndex: 0,
        // İŞTE 5 ADIMLI ÇİÇEK REHBERİ
        guides: {
            flower: {
                title: "Çiçek Yapımı",
                steps: [
                    { text: "1. Turuncu hamuru yuvarla.", img: "cicek_adim1.jpg" },
                    { text: "2. Pembe hamurdan 5 küçük parça yap.", img: "cicek_adim2.jpg" },
                    { text: "3. Parçaları birleştirip çiçek yap.", img: "cicek_adim3.jpg" },
                    { text: "4. Yeşil hamurdan sap yap.", img: "cicek_adim4.jpg" },
                    { text: "5. Hepsini birleştir. Harika!", img: "cicek_adim5.jpg" }
                ]
            }
        },

        start: (id) => {
            app.workshop.currentGuideId = id;
            app.workshop.currentStepIndex = 0;
            app.workshop.renderStep();
            document.getElementById('overlay-guide').classList.remove('hidden');
            // Timer başlasın (Nav fonksiyonu workshop ekranında başlatıyor ama modal overlay olduğu için manuel tetikleyelim emin olmak için)
            app.timer.start();
        },

        renderStep: () => {
            const guide = app.workshop.guides[app.workshop.currentGuideId];
            const step = guide.steps[app.workshop.currentStepIndex];
            
            document.getElementById('modal-guide-title').innerText = `${guide.title} (${app.workshop.currentStepIndex + 1}/${guide.steps.length})`;
            document.getElementById('modal-step-desc').innerText = step.text;
            document.getElementById('modal-guide-img').src = step.img;
            
            // Kullanıcı resmi sıfırla
            document.getElementById('modal-user-img').classList.add('hidden');
            document.getElementById('modal-upload-icon').classList.remove('hidden');

            // Butonlar
            const nextBtn = document.getElementById('btn-next-step');
            if (app.workshop.currentStepIndex === guide.steps.length - 1) {
                nextBtn.innerText = "Bitir";
            } else {
                nextBtn.innerText = "İleri";
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
                alert("Tebrikler! Çiçeği tamamladın. +100 XP");
                app.state.xp += 100;
                app.save();
                app.workshop.close();
            }
        },

        prevStep: () => {
            if(app.workshop.currentStepIndex > 0) {
                app.workshop.currentStepIndex--;
                app.workshop.renderStep();
            }
        },

        close: () => {
            document.getElementById('overlay-guide').classList.add('hidden');
        }
    },

    buddy: {
        handleUpload: (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (res) => {
                    app.state.buddyImg = res.target.result;
                    app.save();
                    
                    // DOM GÜNCELLEME (ANINDA GÖRÜNMESİ İÇİN)
                    const previews = ['buddy-preview-large', 'buddy-home-preview', 'quiz-buddy-visual'];
                    previews.forEach(id => {
                        const el = document.getElementById(id);
                        if(el) { el.src = res.target.result; el.classList.remove('hidden'); }
                    });
                    
                    document.getElementById('buddy-placeholder-large').classList.add('hidden');
                    document.getElementById('buddy-missing-icon').classList.add('hidden');
                    const msg = document.getElementById('buddy-status-msg');
                    if(msg) { msg.innerText = "Hazır!"; msg.style.color = "green"; }
                    
                    alert("Buddy yüklendi!");
                };
                reader.readAsDataURL(file);
            }
        }
    },

    lessons: {
        renderGrid: () => {
            let html = '';
            for(let i=1; i<=10; i++) {
                let status = 'locked';
                if(i <= app.state.completedLevels + 1) status = '';
                if(i <= app.state.completedLevels) status = 'completed';
                
                html += `<div class="level-node ${status}" onclick="app.lessons.start(${i})">${i}</div>`;
            }
            document.getElementById('levels-container').innerHTML = html;
        },
        start: (lvl) => {
            if(lvl > app.state.completedLevels + 1) return;
            app.nav.to('quiz');
            document.getElementById('quiz-question-text').innerText = `${Math.floor(Math.random()*10)} + ${Math.floor(Math.random()*10)} = ?`;
            // Quiz detayları basitleştirildi, önemli olan akış
        }
    },

    ui: {
        refreshAll: () => {
            if(!app.state.user) return;
            document.getElementById('display-name').innerText = app.state.user.name;
            document.getElementById('display-lvl').innerText = app.state.completedLevels + 1;
            document.getElementById('display-avatar').src = `avatar${app.state.user.avatar}.png`;
            document.getElementById('global-xp').innerText = app.state.xp;

            if(app.state.buddyImg) {
                // Home
                document.getElementById('buddy-home-preview').src = app.state.buddyImg;
                document.getElementById('buddy-home-preview').classList.remove('hidden');
                document.getElementById('buddy-missing-icon').classList.add('hidden');
                document.getElementById('buddy-status-msg').innerText = "Hazır!";
                document.getElementById('buddy-status-msg').style.color = "green";
                
                // Buddy Screen
                document.getElementById('buddy-preview-large').src = app.state.buddyImg;
                document.getElementById('buddy-preview-large').classList.remove('hidden');
                document.getElementById('buddy-placeholder-large').classList.add('hidden');

                // Quiz
                document.getElementById('quiz-buddy-visual').src = app.state.buddyImg;
                document.getElementById('quiz-buddy-visual').classList.remove('hidden');
                document.getElementById('quiz-buddy-placeholder').classList.add('hidden');
            }
        }
    },

    // User Registration Helper
    selectAvatar: (id, el) => {
        document.querySelectorAll('.avatar-circle-wrapper').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        app.tempAvatar = id;
    },
    registerUser: () => {
        const name = document.getElementById('input-name').value;
        if(!name || !app.tempAvatar) return alert("Seçim yap!");
        app.state.user = { name, avatar: app.tempAvatar };
        app.save();
        app.nav.to('home');
    },
    resetApp: () => {
        localStorage.clear();
        location.reload();
    }
};

document.addEventListener('DOMContentLoaded', app.init);
