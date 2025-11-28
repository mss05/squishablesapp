/**
 * SQUISHABLES - FINAL MASTER LOGIC
 */

const app = {
    // STATE
    state: {
        user: null, // {name, avatar}
        buddyImg: null,
        xp: 0,
        completedLevels: 0,
        timeLeft: 1200,
        timerInterval: null
    },

    // INIT
    init: () => {
        try {
            const saved = localStorage.getItem('squish_master_save');
            if (saved) app.state = { ...app.state, ...JSON.parse(saved) };

            // Yükleme Listener'ları
            const buddyInput = document.getElementById('buddy-file-input');
            if(buddyInput) buddyInput.addEventListener('change', app.buddy.handleUpload);

            const wsInput = document.getElementById('ws-step-input');
            if(wsInput) wsInput.addEventListener('change', app.workshop.handleUpload);

            // Başlat
            setTimeout(() => {
                if (app.state.user) {
                    app.nav.to('home');
                    app.ui.refresh();
                } else {
                    app.nav.to('onboarding');
                }
            }, 2500);

        } catch (e) {
            console.error(e);
            localStorage.clear();
            location.reload();
        }
    },

    save: () => {
        localStorage.setItem('squish_master_save', JSON.stringify(app.state));
        app.ui.refresh();
    },

    // NAVIGASYON
    nav: {
        to: (screenId) => {
            // Buddy Kontrolü (Derslere Girerken)
            if (screenId === 'lessons') {
                if (!app.state.buddyImg) {
                    alert("⚠️ Önce Buddy yüklemelisin!");
                    return;
                }
                app.lessons.updateGrid();
            }

            // Ekran Değişimi
            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active-screen', 'hidden'));
            document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
            
            const target = document.getElementById(`screen-${screenId}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('active-screen');
            }

            // Timer (Dynamic Island) Kontrolü
            const island = document.getElementById('dynamic-island');
            if (['lessons', 'quiz', 'workshop'].includes(screenId)) {
                island.classList.remove('island-hidden');
                app.timer.start();
            } else {
                island.classList.add('island-hidden');
                app.timer.stop();
            }

            // Bottom Nav Kontrolü
            const botNav = document.getElementById('bottom-nav');
            if(['splash', 'onboarding'].includes(screenId)) {
                botNav.classList.add('hidden');
            } else {
                botNav.classList.remove('hidden');
            }
        }
    },

    // TIMER
    timer: {
        start: () => {
            if (app.state.timerInterval) return;
            app.state.timerInterval = setInterval(() => {
                app.state.timeLeft--;
                const min = Math.floor(app.state.timeLeft / 60);
                const sec = app.state.timeLeft % 60;
                const display = document.getElementById('task-timer');
                if(display) display.innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;

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

    // KULLANICI KAYDI
    tempAvatar: null,
    selectAvatar: (id, el) => {
        document.querySelectorAll('.avatar-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        app.tempAvatar = id;
    },
    registerUser: () => {
        const name = document.getElementById('input-name').value;
        if (!name || !app.tempAvatar) { alert("Lütfen isim yaz ve karakter seç!"); return; }
        app.state.user = { name, avatar: app.tempAvatar };
        app.save();
        app.nav.to('home');
    },

    // BUDDY (Hata Düzeltildi)
    buddy: {
        handleUpload: (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (res) => {
                    app.state.buddyImg = res.target.result;
                    app.save();
                    alert("Buddy Yüklendi! Artık derslere girebilirsin.");
                    app.nav.to('home');
                };
                reader.readAsDataURL(file);
            }
        }
    },

    // WORKSHOP (Adım Adım)
    workshop: {
        guide: null,
        stepIdx: 0,
        guides: {
            flower: {
                title: "Çiçek Yapımı",
                steps: [
                    { t: "1. Turuncu hamuru yuvarla.", i: "cicek_adim1.jpg" },
                    { t: "2. Pembe parçalar yap.", i: "cicek_adim2.jpg" },
                    { t: "3. Birleştirip çiçek yap.", i: "cicek_adim3.jpg" },
                    { t: "4. Yeşil sap ekle.", i: "cicek_adim4.jpg" },
                    { t: "5. Tamamla!", i: "cicek_adim5.jpg" }
                ]
            },
            castle: {
                title: "Kale Yapımı",
                steps: [
                    { t: "1. Temeli at.", i: "kale_adim1.jpg" },
                    { t: "2. Kuleleri dik.", i: "kale_adim2.jpg" }
                ]
            }
        },
        start: (id) => {
            app.workshop.guide = app.workshop.guides[id];
            app.workshop.stepIdx = 0;
            app.workshop.render();
            document.getElementById('overlay-workshop').classList.remove('hidden');
        },
        render: () => {
            const g = app.workshop.guide;
            const s = g.steps[app.workshop.stepIdx];
            document.getElementById('ws-modal-title').innerText = `${g.title} (${app.workshop.stepIdx+1}/${g.steps.length})`;
            document.getElementById('ws-step-text').innerText = s.t;
            document.getElementById('ws-guide-img').src = s.i;
            
            // User img reset
            document.getElementById('ws-user-img').classList.add('hidden');
            document.getElementById('ws-upload-icon').classList.remove('hidden');

            // Button text
            const nextBtn = document.getElementById('btn-ws-next');
            nextBtn.innerText = (app.workshop.stepIdx === g.steps.length - 1) ? "Bitir" : "İleri";
        },
        handleUpload: (e) => {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = (res) => {
                    document.getElementById('ws-user-img').src = res.target.result;
                    document.getElementById('ws-user-img').classList.remove('hidden');
                    document.getElementById('ws-upload-icon').classList.add('hidden');
                }
                reader.readAsDataURL(file);
            }
        },
        next: () => {
            const g = app.workshop.guide;
            if (app.workshop.stepIdx < g.steps.length - 1) {
                app.workshop.stepIdx++;
                app.workshop.render();
            } else {
                alert("Atölye Bitti! +100 XP");
                app.state.xp += 100;
                app.save();
                app.workshop.close();
            }
        },
        prev: () => {
            if(app.workshop.stepIdx > 0) {
                app.workshop.stepIdx--;
                app.workshop.render();
            }
        },
        close: () => {
            document.getElementById('overlay-workshop').classList.add('hidden');
        }
    },

    // DERSLER & QUIZ
    lessons: {
        updateGrid: () => {
            for(let i=1; i<=10; i++) {
                const el = document.getElementById(`lvl-${i}`);
                if(el) {
                    el.className = 'level-node locked';
                    if(i <= app.state.completedLevels + 1) el.className = 'level-node';
                    if(i <= app.state.completedLevels) el.className = 'level-node completed'; // CSS ekle
                }
            }
        },
        start: (lvl) => {
            if(lvl > app.state.completedLevels + 1) return;
            app.nav.to('quiz');
            // Basit Quiz Setup
            const n1 = Math.floor(Math.random()*10);
            const n2 = Math.floor(Math.random()*10);
            const ans = n1+n2;
            document.getElementById('quiz-text').innerText = `${n1} + ${n2} = ?`;
            
            const grid = document.getElementById('quiz-options');
            grid.innerHTML = '';
            [ans, ans+1, ans-1, ans+2].sort(()=>Math.random()-0.5).forEach(o => {
                grid.innerHTML += `<button class="opt-btn squish" onclick="app.lessons.check(${o===ans}, ${lvl})">${o}</button>`;
            });
        },
        check: (isCorrect, lvl) => {
            if(isCorrect) {
                alert("Doğru!");
                if(lvl > app.state.completedLevels) app.state.completedLevels = lvl;
                app.state.xp += 50;
                app.save();
                app.nav.to('lessons');
            } else {
                alert("Yanlış!");
            }
        }
    },

    // MARKET
    shop: {
        buy: (cost) => {
            if(app.state.xp >= cost && confirm("Almak istiyor musun?")) {
                app.state.xp -= cost;
                app.save();
                alert("Satın Alındı!");
            } else alert("Yetersiz XP");
        }
    },

    // UI REFRESH (BUDDY & PROFILE)
    ui: {
        refresh: () => {
            if(!app.state.user) return;
            document.getElementById('home-name').innerText = app.state.user.name;
            document.getElementById('home-lvl').innerText = app.state.completedLevels + 1;
            document.getElementById('home-avatar').src = `avatar${app.state.user.avatar}.png`;
            document.getElementById('header-xp').innerText = app.state.xp;
            document.getElementById('shop-balance').innerText = app.state.xp;

            if(app.state.buddyImg) {
                // Home
                const hImg = document.getElementById('buddy-home-img');
                if(hImg) { hImg.src = app.state.buddyImg; hImg.classList.remove('hidden'); }
                document.getElementById('buddy-home-placeholder').classList.add('hidden');
                
                const stat = document.getElementById('buddy-home-status');
                if(stat) { stat.innerText = "Hazır!"; stat.style.color = "#00b894"; }

                // Buddy Screen
                const bImg = document.getElementById('buddy-large-preview');
                if(bImg) { bImg.src = app.state.buddyImg; bImg.classList.remove('hidden'); }
                document.getElementById('buddy-large-placeholder').classList.add('hidden');

                // Quiz
                const qImg = document.getElementById('quiz-buddy-img');
                if(qImg) { qImg.src = app.state.buddyImg; qImg.classList.remove('hidden'); }
                document.getElementById('quiz-buddy-placeholder').classList.add('hidden');
            }
        }
    },

    resetApp: () => {
        if(confirm("Sıfırla?")) { localStorage.clear(); location.reload(); }
    }
};

document.addEventListener('DOMContentLoaded', app.init);
