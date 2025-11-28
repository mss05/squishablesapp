const app = {
    state: {
        user: null, buddyImg: null, xp: 0, completedLevels: 0,
        timeLeft: 1200, timerInterval: null
    },

    init: () => {
        try {
            const saved = localStorage.getItem('squish_final_v2');
            if (saved) app.state = { ...app.state, ...JSON.parse(saved) };

            const buddyInput = document.getElementById('buddy-file-input');
            if(buddyInput) buddyInput.addEventListener('change', app.buddy.handleUpload);

            const wsInput = document.getElementById('ws-step-input');
            if(wsInput) wsInput.addEventListener('change', app.workshop.handleUpload);

            setTimeout(() => {
                if (app.state.user) {
                    app.nav.to('home');
                    app.ui.refresh();
                } else {
                    app.nav.to('onboarding');
                }
            }, 2500);
        } catch (e) { localStorage.clear(); location.reload(); }
    },

    save: () => {
        localStorage.setItem('squish_final_v2', JSON.stringify(app.state));
        app.ui.refresh();
    },

    nav: {
        to: (screenId) => {
            if (screenId === 'lessons') {
                if (!app.state.buddyImg) { alert("⚠️ Önce Buddy yükle!"); return; }
                app.lessons.updateGrid();
            }

            const island = document.getElementById('dynamic-island');
            if (['lessons', 'quiz', 'workshop'].includes(screenId)) {
                island.classList.remove('island-hidden');
                app.timer.start();
            } else {
                island.classList.add('island-hidden');
                app.timer.stop();
            }

            const botNav = document.getElementById('bottom-nav');
            if(['splash', 'onboarding'].includes(screenId)) botNav.classList.add('hidden');
            else botNav.classList.remove('hidden');

            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active-screen', 'hidden'));
            document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
            document.getElementById(`screen-${screenId}`).classList.remove('hidden');
            document.getElementById(`screen-${screenId}`).classList.add('active-screen');
        }
    },

    timer: {
        start: () => {
            if (app.state.timerInterval) return;
            app.state.timerInterval = setInterval(() => {
                app.state.timeLeft--;
                const min = Math.floor(app.state.timeLeft / 60);
                const sec = app.state.timeLeft % 60;
                const d = document.getElementById('task-timer');
                if(d) d.innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;
                if(app.state.timeLeft <= 0) { clearInterval(app.state.timerInterval); document.getElementById('overlay-time-up').classList.remove('hidden'); }
            }, 1000);
        },
        stop: () => { clearInterval(app.state.timerInterval); app.state.timerInterval = null; }
    },

    user: {
        tempAvatar: null,
        selectAvatar: (id, el) => {
            document.querySelectorAll('.avatar-item').forEach(e => e.classList.remove('selected'));
            el.classList.add('selected');
            app.user.tempAvatar = id;
        },
        register: () => {
            const name = document.getElementById('input-name').value;
            if (!name || !app.user.tempAvatar) { alert("Eksik bilgi!"); return; }
            app.state.user = { name, avatar: app.user.tempAvatar };
            app.save();
            app.nav.to('home');
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
                    alert("Buddy Yüklendi!");
                    app.nav.to('home');
                };
                reader.readAsDataURL(file);
            }
        }
    },

    workshop: {
        guide: null, stepIdx: 0,
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
            castle: { title: "Kale", steps: [{t:"1. Yap", i:"kale_adim1.jpg"}, {t:"2. Bitir", i:"kale_adim2.jpg"}] }
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
            document.getElementById('ws-modal-title').innerText = `Adım ${app.workshop.stepIdx+1}/${g.steps.length}`;
            document.getElementById('ws-step-text').innerText = s.t;
            document.getElementById('ws-guide-img').src = s.i;
            document.getElementById('ws-user-img').classList.add('hidden');
            document.getElementById('ws-upload-icon').classList.remove('hidden');
            document.getElementById('btn-ws-next').innerText = (app.workshop.stepIdx === g.steps.length-1) ? "Bitir" : "İleri";
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
                // Atölye Bitti -> Tebrikler Ekranına Git
                document.getElementById('overlay-workshop').classList.add('hidden');
                document.getElementById('summary-img').src = g.steps[g.steps.length-1].i;
                app.nav.to('workshop-summary'); // Özel ekrana yönlendir
            }
        },
        finish: () => {
            app.state.xp += 100;
            app.save();
            app.nav.to('home');
        },
        close: () => document.getElementById('overlay-workshop').classList.add('hidden')
    },

    lessons: {
        updateGrid: () => {
            for(let i=1; i<=10; i++) {
                const el = document.getElementById(`lvl-${i}`);
                if(el) {
                    el.className = 'level-node locked';
                    if(i <= app.state.completedLevels + 1) el.className = 'level-node';
                    if(i <= app.state.completedLevels) el.className = 'level-node completed';
                }
            }
        },
        start: (lvl) => {
            if(lvl > app.state.completedLevels + 1) return;
            app.nav.to('quiz');
            // 10 Farklı Seviye Sorusu
            const questions = [
                {q:"2 + 2 = ?", a:4}, {q:"5 + 3 = ?", a:8}, {q:"6 - 2 = ?", a:4}, {q:"3 + 3 = ?", a:6},
                {q:"10 - 5 = ?", a:5}, {q:"7 + 4 = ?", a:11}, {q:"9 - 3 = ?", a:6}, {q:"8 + 8 = ?", a:16},
                {q:"12 - 4 = ?", a:8}, {q:"15 + 5 = ?", a:20}
            ];
            const qObj = questions[lvl-1] || questions[0];
            document.getElementById('quiz-text').innerText = qObj.q;
            
            const grid = document.getElementById('quiz-options');
            grid.innerHTML = '';
            const ans = qObj.a;
            [ans, ans+1, ans-1, ans+2].sort(()=>Math.random()-0.5).forEach(o => {
                grid.innerHTML += `<button class="opt-btn squish" onclick="app.lessons.check(${o===ans}, ${lvl})">${o}</button>`;
            });
        },
        check: (isCorrect, lvl) => {
            const speech = document.getElementById('quiz-buddy-speech');
            if(isCorrect) {
                speech.innerText = "Harikasın! 🎉";
                setTimeout(() => {
                    if(lvl > app.state.completedLevels) app.state.completedLevels = lvl;
                    app.state.xp += 50;
                    app.save();
                    app.nav.to('lessons');
                }, 1000);
            } else {
                speech.innerText = "Tekrar dene! 💪";
            }
        }
    },

    shop: {
        buy: (cost, type) => {
            if(app.state.xp >= cost && confirm("Satın almak istiyor musun?")) {
                app.state.xp -= cost;
                app.save();
                if(type === 'code') document.getElementById('coupon-area').classList.remove('hidden');
                else alert("Ürün envanterine eklendi!");
            } else alert("Yetersiz XP!");
        }
    },

    ui: {
        refresh: () => {
            if(!app.state.user) return;
            document.getElementById('home-name').innerText = app.state.user.name;
            document.getElementById('home-lvl').innerText = app.state.completedLevels + 1;
            document.getElementById('home-avatar').src = `avatar${app.state.user.avatar}.png`;
            document.getElementById('header-xp').innerText = app.state.xp;
            document.getElementById('home-xp-display').innerText = app.state.xp;
            document.getElementById('shop-balance').innerText = app.state.xp;

            if(app.state.buddyImg) {
                const els = ['buddy-home-img', 'buddy-large-preview', 'quiz-buddy-visual'];
                els.forEach(id => {
                    const el = document.getElementById(id);
                    if(el) { el.src = app.state.buddyImg; el.classList.remove('hidden'); }
                });
                document.getElementById('buddy-home-placeholder').classList.add('hidden');
                document.getElementById('buddy-home-status').innerText = "Hazır!";
                document.getElementById('buddy-home-status').style.color = "#00b894";
                document.getElementById('buddy-large-placeholder').classList.add('hidden');
                document.getElementById('quiz-buddy-placeholder').classList.add('hidden');
            }
        }
    },
    resetApp: () => { if(confirm("Sıfırla?")) { localStorage.clear(); location.reload(); } }
};

document.addEventListener('DOMContentLoaded', app.init);
