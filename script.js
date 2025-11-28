const app = {
    // --- STATE ---
    state: {
        user: null, buddyImg: null, xp: 0, completedLevels: 0,
        timeLeft: 1200, timerInterval: null
    },

    // --- INIT ---
    init: () => {
        try {
            const saved = localStorage.getItem('squish_final_v3');
            if (saved) app.state = { ...app.state, ...JSON.parse(saved) };

            // Yükleme Listener'ları (Önemli: ID'ler HTML ile aynı)
            const buddyInput = document.getElementById('buddy-file-input');
            if(buddyInput) buddyInput.addEventListener('change', app.buddy.handleUpload);

            const wsInput = document.getElementById('ws-upload-input');
            if(wsInput) wsInput.addEventListener('change', app.workshop.handleUpload);

            setTimeout(() => {
                if (app.state.user) {
                    app.nav.to('home');
                    app.ui.refreshAll();
                } else {
                    app.nav.to('onboarding');
                }
            }, 2500);
        } catch (e) { localStorage.clear(); location.reload(); }
    },

    save: () => {
        localStorage.setItem('squish_final_v3', JSON.stringify(app.state));
        app.ui.refreshAll();
    },

    // --- NAVIGASYON ---
    nav: {
        to: (screenId) => {
            // Buddy Zorunluluğu
            if (screenId === 'lessons') {
                if (!app.state.buddyImg) { alert("⚠️ Önce Buddy yüklemelisin!"); return; }
                app.lessons.renderGrid();
            }

            // Dynamic Island Timer
            const island = document.getElementById('dynamic-island');
            if (['lessons', 'quiz', 'workshop'].includes(screenId)) {
                island.classList.remove('island-hidden');
                app.timer.start();
            } else {
                island.classList.add('island-hidden');
                app.timer.stop();
            }

            // Bottom Nav
            const nav = document.getElementById('bottom-nav');
            if(['splash', 'onboarding'].includes(screenId)) nav.classList.add('hidden');
            else nav.classList.remove('hidden');

            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active-screen', 'hidden'));
            document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
            document.getElementById(`screen-${screenId}`).classList.remove('hidden');
            document.getElementById(`screen-${screenId}`).classList.add('active-screen');
            
            // Bottom Nav Aktiflik
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            // Basit mantık: sırayla home, lessons, workshop, buddy
            const map = {'home':0, 'lessons':1, 'workshop':2, 'buddy':3};
            if(map[screenId] !== undefined) document.querySelectorAll('.nav-btn')[map[screenId]].classList.add('active');
        }
    },

    // --- TIMER ---
    timer: {
        start: () => {
            if (app.state.timerInterval) return;
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
        stop: () => { clearInterval(app.state.timerInterval); app.state.timerInterval = null; }
    },

    // --- KULLANICI ---
    user: {
        tempAvatar: null,
        selectAvatar: (id, el) => {
            document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            app.user.tempAvatar = id;
        },
        register: () => {
            const name = document.getElementById('input-name').value;
            if (!name || !app.user.tempAvatar) { alert("Lütfen seçim yap!"); return; }
            app.state.user = { name, avatar: app.user.tempAvatar };
            app.save();
            app.nav.to('home');
        }
    },

    // --- BUDDY (YENİLENMİŞ UPLOAD) ---
    buddy: {
        handleUpload: (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (res) => {
                    // 1. State'e kaydet
                    app.state.buddyImg = res.target.result;
                    // 2. Kaydet
                    app.save();
                    // 3. UI anında yenile
                    app.ui.refreshAll();
                    alert("Buddy Yüklendi! Harika görünüyor.");
                    app.nav.to('home');
                };
                reader.readAsDataURL(file);
            }
        }
    },

    // --- WORKSHOP (5 ADIMLI WIZARD) ---
    workshop: {
        guide: null, step: 0,
        guides: {
            flower: {
                title: "Çiçek Yapımı",
                steps: [
                    { t: "1. Turuncu hamuru yuvarla.", i: "cicek_adim1.jpg" },
                    { t: "2. Pembe parçalar yap.", i: "cicek_adim2.jpg" },
                    { t: "3. Birleştirip çiçek yap.", i: "cicek_adim3.jpg" },
                    { t: "4. Yeşil sap ekle.", i: "cicek_adim4.jpg" },
                    { t: "5. Hepsini birleştir.", i: "cicek_adim5.jpg" }
                ]
            },
            castle: { title: "Kale", steps: [{t:"Temel", i:"kale_adim1.jpg"}, {t:"Kuleler", i:"kale_adim2.jpg"}] }
        },
        start: (id) => {
            app.workshop.guide = app.workshop.guides[id];
            app.workshop.step = 0;
            app.workshop.render();
            document.getElementById('overlay-workshop').classList.remove('hidden');
        },
        render: () => {
            const g = app.workshop.guide;
            const s = g.steps[app.workshop.step];
            document.getElementById('ws-step-title').innerText = `Adım ${app.workshop.step+1}/${g.steps.length}`;
            document.getElementById('ws-desc').innerText = s.t;
            document.getElementById('ws-target-img').src = s.i;
            
            // Kullanıcı resmi reset
            document.getElementById('ws-user-img').classList.add('hidden-img');
            document.getElementById('ws-upload-icon').classList.remove('hidden');

            // Dots
            let dots = '';
            for(let i=0; i<g.steps.length; i++) dots += `<div class="dot ${i===app.workshop.step ? 'active' : ''}"></div>`;
            document.getElementById('ws-dots').innerHTML = dots;

            document.getElementById('btn-ws-next').innerText = (app.workshop.step === g.steps.length-1) ? "Bitir" : "İleri";
        },
        handleUpload: (e) => {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = (res) => {
                    document.getElementById('ws-user-img').src = res.target.result;
                    document.getElementById('ws-user-img').classList.remove('hidden-img');
                    document.getElementById('ws-upload-icon').classList.add('hidden');
                }
                reader.readAsDataURL(file);
            }
        },
        next: () => {
            const g = app.workshop.guide;
            if (app.workshop.step < g.steps.length - 1) {
                app.workshop.step++;
                app.workshop.render();
            } else {
                alert("Atölye Bitti! +100 XP");
                app.state.xp += 100;
                app.save();
                app.workshop.close();
            }
        },
        prev: () => {
            if(app.workshop.step > 0) {
                app.workshop.step--;
                app.workshop.render();
            }
        },
        close: () => document.getElementById('overlay-workshop').classList.add('hidden')
    },

    // --- DERSLER & QUIZ ---
    lessons: {
        renderGrid: () => {
            for(let i=1; i<=10; i++) {
                const el = document.getElementById(`lvl-${i}`);
                if(el) {
                    el.className = 'lvl-box locked';
                    if(i <= app.state.completedLevels + 1) el.className = 'lvl-box';
                    if(i <= app.state.completedLevels) el.className = 'lvl-box completed'; // CSS'e eklenebilir
                }
            }
        },
        start: (lvl) => {
            if(lvl > app.state.completedLevels + 1) return;
            app.nav.to('quiz');
            
            const n1 = Math.floor(Math.random()*10);
            const n2 = Math.floor(Math.random()*10);
            const ans = n1+n2;
            document.getElementById('quiz-question').innerText = `${n1} + ${n2} = ?`;
            
            const grid = document.getElementById('quiz-options');
            grid.innerHTML = '';
            [ans, ans+1, ans-1, ans+2].sort(()=>Math.random()-0.5).forEach(o => {
                grid.innerHTML += `<button class="opt-btn squish" onclick="app.lessons.check(${o===ans}, ${lvl})">${o}</button>`;
            });
        },
        check: (isCorrect, lvl) => {
            const bubble = document.getElementById('buddy-speech');
            if(isCorrect) {
                bubble.innerText = "Harikasın! 🎉";
                setTimeout(() => {
                    if(lvl > app.state.completedLevels) app.state.completedLevels = lvl;
                    app.state.xp += 50;
                    app.save();
                    app.nav.to('lessons');
                }, 1000);
            } else {
                bubble.innerText = "Tekrar dene! 💪";
            }
        }
    },

    shop: {
        buy: (cost, type) => {
            if(app.state.xp >= cost && confirm("Satın al?")) {
                app.state.xp -= cost;
                app.save();
                if(type === 'code') document.getElementById('coupon-area').classList.remove('hidden');
                else alert("Envantere eklendi!");
            } else alert("Yetersiz XP!");
        }
    },

    // --- MERKEZİ GÜNCELLEME (En Önemli Kısım) ---
    ui: {
        refreshAll: () => {
            if(!app.state.user) return;
            document.getElementById('home-name').innerText = app.state.user.name;
            document.getElementById('home-lvl').innerText = app.state.completedLevels + 1;
            document.getElementById('home-avatar').src = `avatar${app.state.user.avatar}.png`;
            document.getElementById('header-xp').innerText = app.state.xp;
            document.getElementById('shop-balance').innerText = app.state.xp;

            // BUDDY KONTROLÜ
            if(app.state.buddyImg) {
                // 1. Ana Ekran
                const homeImg = document.getElementById('buddy-home-img');
                const homeIcon = document.getElementById('buddy-home-icon');
                const status = document.getElementById('buddy-home-status');
                
                if(homeImg) { homeImg.src = app.state.buddyImg; homeImg.classList.remove('hidden-img'); }
                if(homeIcon) homeIcon.classList.add('hidden');
                if(status) { status.innerText = "Hazır!"; status.className = "status-green"; }

                // 2. Buddy Yükleme Ekranı
                const largeImg = document.getElementById('buddy-large-img');
                const largeIcon = document.getElementById('buddy-large-icon');
                if(largeImg) { largeImg.src = app.state.buddyImg; largeImg.classList.remove('hidden-img'); }
                if(largeIcon) largeIcon.classList.add('hidden');

                // 3. Quiz Ekranı
                const quizImg = document.getElementById('quiz-buddy-img');
                const quizPh = document.getElementById('quiz-buddy-placeholder');
                if(quizImg) { quizImg.src = app.state.buddyImg; quizImg.classList.remove('hidden-img'); }
                if(quizPh) quizPh.classList.add('hidden');

                // 4. Alt Bar (Bottom Nav)
                const navImg = document.getElementById('nav-buddy-img');
                const navIcon = document.getElementById('nav-buddy-icon');
                if(navImg) { navImg.src = app.state.buddyImg; navImg.classList.remove('hidden-img'); }
                if(navIcon) navIcon.classList.add('hidden');
            }
        }
    },

    resetData: () => { if(confirm("Sıfırla?")) { localStorage.clear(); location.reload(); } }
};

document.addEventListener('DOMContentLoaded', app.init);
