const app = {
    // --- STATE MANAGEMENT ---
    state: {
        user: null, // {name, avatar}
        xp: 0,
        buddyImg: null, // base64
        completedLevels: { math: 0, colors: 0, shapes: 0 }, // Her ders için biten seviye sayısı
        timeLeft: 1200, // 20 Dakika (Saniye cinsinden)
        timerInterval: null
    },

    // --- INIT ---
    init: () => {
        try {
            // LocalStorage Yükleme
            const stored = localStorage.getItem('squishState');
            if (stored) app.state = { ...app.state, ...JSON.parse(stored) };

            // Yönlendirme Kontrolü
            if (app.state.user) {
                app.nav.switch('home');
                app.timer.start();
                app.ui.updateGlobal();
            } else {
                document.getElementById('screen-splash').classList.remove('hidden');
                setTimeout(() => {
                    document.getElementById('screen-splash').classList.add('hidden');
                    document.getElementById('screen-onboarding').classList.remove('hidden');
                }, 2500);
            }

            app.events.setup();
        } catch (e) {
            console.error("Başlatma hatası:", e);
            localStorage.clear(); // Hata varsa sıfırla
            location.reload();
        }
    },

    // --- NAVIGATION LOGIC ---
    nav: {
        switch: (targetId) => {
            // SÜRE KONTROLÜ
            if (app.state.timeLeft <= 0) return;

            // BUDDY KONTROLÜ (Dersler için zorunlu)
            if (targetId === 'lessons' && !app.state.buddyImg) {
                alert("Önce bir Buddy (Oyun Arkadaşı) oluşturmalısın! Atölyede hamurdan arkadaşını yap ve fotoğrafını yükle.");
                app.nav.switch('buddy');
                return;
            }

            // Ekranları Gizle
            document.querySelectorAll('section').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

            // Hedefi Göster
            const screen = document.getElementById(`screen-${targetId}`);
            if (screen) screen.classList.remove('hidden');

            // Nav Bar'ı Aktif Yap
            const navItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
            if (navItem) navItem.classList.add('active');

            // Nav Bar Görünürlüğü
            const navBar = document.getElementById('bottom-nav');
            const statusBar = document.getElementById('status-bar');
            if (['splash', 'onboarding'].includes(targetId)) {
                navBar.classList.add('hidden');
                statusBar.classList.add('hidden');
            } else {
                navBar.classList.remove('hidden');
                statusBar.classList.remove('hidden');
            }

            // Ekran özel yüklemeler
            if (targetId === 'lessons') app.lessons.renderSubjects();
            if (targetId === 'workshop') app.workshop.renderList();
            if (targetId === 'shop') app.shop.render();
            if (targetId === 'buddy') app.buddy.render();
        }
    },

    // --- TIMER SYSTEM ---
    timer: {
        start: () => {
            if (app.state.timerInterval) clearInterval(app.state.timerInterval);
            app.state.timerInterval = setInterval(() => {
                app.state.timeLeft--;
                app.ui.updateTime();
                
                if (app.state.timeLeft <= 0) {
                    clearInterval(app.state.timerInterval);
                    app.timer.blockScreen();
                }
                app.save();
            }, 1000);
        },
        blockScreen: () => {
            document.getElementById('screen-time-up').classList.remove('hidden');
        }
    },

    // --- LESSONS & 10 LEVELS SYSTEM ---
    lessons: {
        subjects: [
            { id: 'math', name: 'Matematik', icon: 'fa-calculator' },
            { id: 'colors', name: 'Renkler', icon: 'fa-palette' },
            { id: 'shapes', name: 'Şekiller', icon: 'fa-shapes' }
        ],
        currentSubject: null,

        renderSubjects: () => {
            const grid = document.getElementById('subject-grid');
            grid.innerHTML = '';
            app.lessons.subjects.forEach(sub => {
                grid.innerHTML += `
                    <div class="glass-card subject-card" onclick="app.lessons.openLevels('${sub.id}', '${sub.name}')">
                        <i class="fas ${sub.icon}"></i>
                        <h4>${sub.name}</h4>
                    </div>
                `;
            });
        },

        openLevels: (subId, subName) => {
            app.lessons.currentSubject = subId;
            document.getElementById('level-title').innerText = subName;
            
            // Ekran değiştir (Nav barı etkilemeden ara geçiş)
            document.getElementById('screen-lessons').classList.add('hidden');
            document.getElementById('screen-levels').classList.remove('hidden');

            const container = document.getElementById('levels-container');
            container.innerHTML = '';

            // 10 SEVİYE OLUŞTURMA DÖNGÜSÜ
            const unlocked = app.state.completedLevels[subId] || 0;

            for (let i = 1; i <= 10; i++) {
                let statusClass = 'locked'; // Varsayılan kilitli
                if (i <= unlocked + 1) statusClass = ''; // Açık
                if (i <= unlocked) statusClass = 'completed'; // Tamamlanmış

                const btn = document.createElement('div');
                btn.className = `lvl-box squish ${statusClass}`;
                btn.innerText = i;
                if(statusClass !== 'locked') {
                    btn.onclick = () => app.lessons.startQuiz(i);
                } else {
                    btn.innerHTML = '<i class="fas fa-lock"></i>';
                }
                container.appendChild(btn);
            }
        },

        startQuiz: (level) => {
            document.getElementById('screen-levels').classList.add('hidden');
            document.getElementById('screen-quiz').classList.remove('hidden');
            document.getElementById('quiz-level-indicator').innerText = `Seviye ${level}`;

            // Buddy Helper Yükle
            document.getElementById('quiz-buddy-img').src = app.state.buddyImg;

            // Basit Soru Üreteci
            const n1 = Math.floor(Math.random() * (level * 2)) + 1;
            const n2 = Math.floor(Math.random() * (level * 2)) + 1;
            const correct = n1 + n2;
            
            document.getElementById('quiz-question').innerText = `${n1} + ${n2} = ?`;

            const opts = document.getElementById('quiz-options');
            opts.innerHTML = '';
            
            // Şıklar (Doğru cevap + 3 rastgele)
            let answers = [correct, correct+1, correct-1, correct+2].sort(()=>Math.random()-0.5);
            
            answers.forEach(ans => {
                opts.innerHTML += `<button class="glass-card opt-btn squish" onclick="app.lessons.checkAnswer(${ans === correct}, ${level})">${ans}</button>`;
            });
        },

        checkAnswer: (isCorrect, level) => {
            if (isCorrect) {
                alert("Harika! Doğru Bildin! +20 XP");
                app.state.xp += 20;
                
                // Seviye İlerlemesi
                const currentProg = app.state.completedLevels[app.lessons.currentSubject] || 0;
                if (level > currentProg) {
                    app.state.completedLevels[app.lessons.currentSubject] = level;
                }
                
                app.save();
                app.lessons.openLevels(app.lessons.currentSubject, document.getElementById('level-title').innerText);
            } else {
                alert("Buddy diyor ki: Tekrar dene, başarabilirsin!");
            }
        }
    },

    // --- WORKSHOP SYSTEM ---
    workshop: {
        guides: [
            { id: 'flower', title: 'Çiçek Yapımı', img: 'cicek_adim1.jpg' },
            { id: 'castle', title: 'Kale Yapımı', img: 'kale_adim1.jpg' },
            { id: 'animal', title: 'Aslan Yapımı', img: 'hayvan_adim1.jpg' }
        ],
        current: null,

        renderList: () => {
            const list = document.getElementById('workshop-list');
            list.innerHTML = '';
            app.workshop.guides.forEach(g => {
                list.innerHTML += `
                    <div class="glass-card shop-item squish" onclick="app.workshop.openGuide('${g.id}')">
                        <img src="${g.img}" style="width:60px; height:60px; border-radius:10px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/60'">
                        <div style="flex:1; margin-left:15px;">
                            <h4>${g.title}</h4>
                            <small>Başlamak için tıkla</small>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `;
            });
        },

        openGuide: (id) => {
            const guide = app.workshop.guides.find(g => g.id === id);
            document.getElementById('guide-title').innerText = guide.title;
            // Statik resim
            document.getElementById('guide-step-img').src = guide.img; 
            document.getElementById('guide-step-img').onerror = function(){this.src='https://via.placeholder.com/300x200?text=Rehber'};
            
            // Reset
            document.getElementById('user-craft-preview').classList.add('hidden');
            document.getElementById('craft-placeholder').classList.remove('hidden');
            document.getElementById('btn-guide-finish').classList.add('disabled');
            document.getElementById('craft-upload').value = ""; // Input reset

            // Upload Listener
            document.getElementById('craft-upload').onchange = (e) => {
                const file = e.target.files[0];
                if(file) {
                    const reader = new FileReader();
                    reader.onload = (res) => {
                        document.getElementById('user-craft-preview').src = res.target.result;
                        document.getElementById('user-craft-preview').classList.remove('hidden');
                        document.getElementById('craft-placeholder').classList.add('hidden');
                        document.getElementById('btn-guide-finish').classList.remove('disabled');
                    };
                    reader.readAsDataURL(file);
                }
            };

            app.nav.switch('guide');
        },

        finish: () => {
            alert("Muhteşem iş çıkardın! +100 XP kazandın.");
            app.state.xp += 100;
            app.save();
            app.nav.switch('home');
        }
    },

    // --- SHOP SYSTEM (CRASH FIX) ---
    shop: {
        items: [
            { name: "Süper Hamur Seti", cost: 500, icon: "fa-cube" },
            { name: "Simli Boya", cost: 300, icon: "fa-paint-roller" },
            { name: "Buddy Şapkası", cost: 150, icon: "fa-hat-wizard" }
        ],
        render: () => {
            const container = document.getElementById('shop-container');
            container.innerHTML = '';
            app.shop.items.forEach(item => {
                const canBuy = app.state.xp >= item.cost;
                container.innerHTML += `
                    <div class="glass-card shop-item">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="background:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                <i class="fas ${item.icon}" style="color:orange"></i>
                            </div>
                            <b>${item.name}</b>
                        </div>
                        <button class="btn-small squish ${canBuy ? '' : 'disabled'}" onclick="app.shop.buy(${item.cost})">
                            ${item.cost} XP
                        </button>
                    </div>
                `;
            });
        },
        buy: (cost) => {
            if(app.state.xp >= cost) {
                if(confirm("Satın almak istiyor musun?")) {
                    app.state.xp -= cost;
                    app.save();
                    app.shop.render();
                    alert("Satın alındı!");
                }
            }
        }
    },

    // --- BUDDY SYSTEM ---
    buddy: {
        render: () => {
            const img = document.getElementById('buddy-main-img');
            const placeholder = document.getElementById('buddy-main-placeholder');
            
            if (app.state.buddyImg) {
                img.src = app.state.buddyImg;
                img.classList.remove('hidden');
                placeholder.classList.add('hidden');
            }

            // Upload Handler
            document.getElementById('buddy-upload').onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (res) => {
                        app.state.buddyImg = res.target.result;
                        app.save();
                        app.buddy.render();
                        alert("Harika! Buddy'n hazır.");
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
    },

    // --- GENERAL UTILS ---
    registerUser: () => {
        const name = document.getElementById('input-name').value;
        const avatar = document.querySelector('.avatar-opt.selected')?.dataset.id;
        
        if (!name || !avatar) {
            alert("Lütfen isim yaz ve avatar seç.");
            return;
        }

        app.state.user = { name, avatar };
        app.save();
        app.init();
    },

    ui: {
        updateGlobal: () => {
            if (!app.state.user) return;
            // Home Update
            document.getElementById('user-name-display').innerText = app.state.user.name;
            document.getElementById('user-avatar-display').src = `avatar${app.state.user.avatar}.png`;
            document.querySelectorAll('.xp-val').forEach(el => el.innerText = app.state.xp);
            document.getElementById('global-xp').innerText = app.state.xp;

            // Buddy Update
            if (app.state.buddyImg) {
                document.getElementById('home-buddy-img').src = app.state.buddyImg;
                document.getElementById('home-buddy-img').classList.remove('hidden');
                document.getElementById('home-buddy-icon').classList.add('hidden');
                document.getElementById('buddy-status-text').innerText = "Buddy Hazır!";
                document.getElementById('buddy-status-text').style.color = "green";
            }
        },
        updateTime: () => {
            const min = Math.floor(app.state.timeLeft / 60);
            const sec = app.state.timeLeft % 60;
            document.getElementById('time-display').innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;
        }
    },

    events: {
        setup: () => {
            document.querySelectorAll('.avatar-opt').forEach(el => {
                el.onclick = () => {
                    document.querySelectorAll('.avatar-opt').forEach(a => a.classList.remove('selected', 'active-avatar'));
                    el.classList.add('selected', 'active-avatar');
                }
            });
        }
    },

    save: () => {
        localStorage.setItem('squishState', JSON.stringify(app.state));
        app.ui.updateGlobal();
    }
};

// Başlat
document.addEventListener('DOMContentLoaded', app.init);
