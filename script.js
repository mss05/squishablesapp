/**
 * SQUISHABLES CORE LOGIC
 * Senior Developer Notes:
 * - Module Pattern used for namespace protection.
 * - LocalStorage is wrapped in try-catch blocks for safety.
 * - Dynamic generation used for scalability.
 */

// Global State
const state = {
    user: {
        name: null,
        avatar: null,
        xp: 0,
        level: 1,
        buddyImage: null // Base64 string for the playdough buddy
    },
    currentLesson: null,
    currentStep: 0
};

// --- DATA MANAGEMENT ---
const Storage = {
    save: () => {
        try {
            localStorage.setItem('squish_user', JSON.stringify(state.user));
            View.updateStats();
        } catch (e) {
            console.error("Storage Error:", e);
            alert("Veriler kaydedilemedi! Tarayıcı belleği dolu olabilir.");
        }
    },
    load: () => {
        const data = localStorage.getItem('squish_user');
        if (data) {
            state.user = JSON.parse(data);
            return true;
        }
        return false;
    }
};

// --- VIEW / UI HANDLERS ---
const View = {
    screens: ['onboarding', 'dashboard', 'lesson-screen', 'guide-screen', 'shop-screen'],
    
    navigate: (screenId) => {
        View.screens.forEach(s => document.getElementById(s).classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
        window.scrollTo(0,0);
    },

    updateStats: () => {
        document.getElementById('xp-display').innerText = state.user.xp;
        document.getElementById('level-display').innerText = state.user.level;
        document.querySelectorAll('.xp-val').forEach(el => el.innerText = state.user.xp);
        
        // Show/Hide Header Stats
        if(state.user.name) {
            document.getElementById('user-stats').classList.remove('hidden');
        }
    },

    renderDashboard: () => {
        document.getElementById('greeting').innerText = `Merhaba, ${state.user.name}!`;
        document.getElementById('dashboard-avatar').src = `avatar${state.user.avatar}.png`;
        
        // Render Buddy
        const buddyContainer = document.getElementById('buddy-container');
        if(state.user.buddyImage) {
            buddyContainer.innerHTML = `<img src="${state.user.buddyImage}" alt="My Buddy">`;
        }

        // Render Categories
        const categories = [
            { id: 'math', name: 'Matematik', icon: '🔢' },
            { id: 'colors', name: 'Renkler', icon: '🎨' },
            { id: 'shapes', name: 'Şekiller', icon: '🔺' },
            { id: 'space', name: 'Uzay', icon: '🚀' },
            { id: 'music', name: 'Müzik', icon: '🎵' },
            { id: 'animals', name: 'Hayvanlar', icon: '🦁' }
        ];

        const grid = document.querySelector('.category-grid');
        grid.innerHTML = '';
        categories.forEach((cat, index) => {
            const isLocked = index > state.user.level; // Simple unlock logic
            const el = document.createElement('div');
            el.className = `cat-card squish-effect ${isLocked ? 'locked' : ''}`;
            el.innerHTML = `<h1>${cat.icon}</h1><p>${cat.name}</p>`;
            el.onclick = () => !isLocked ? LessonEngine.start(cat.id) : alert("Önceki seviyeleri tamamla!");
            grid.appendChild(el);
        });
    }
};

// --- APP LOGIC ---
const app = {
    init: () => {
        // Squish Animation Listener
        document.addEventListener('click', (e) => {
            if(e.target.classList.contains('squish-effect')) {
                e.target.classList.add('squish-active');
                setTimeout(() => e.target.classList.remove('squish-active'), 400);
            }
        });

        if (Storage.load()) {
            View.updateStats();
            View.renderDashboard();
            View.navigate('dashboard');
        } else {
            View.navigate('onboarding');
        }
    },

    register: () => {
        const nameInput = document.getElementById('username-input');
        const selectedAvatar = document.querySelector('.avatar-option.selected');

        try {
            if (!nameInput.value.trim()) throw new Error("Lütfen ismini gir.");
            if (!selectedAvatar) throw new Error("Lütfen bir avatar seç.");

            state.user.name = nameInput.value;
            state.user.avatar = selectedAvatar.dataset.id;
            
            Storage.save();
            View.renderDashboard();
            View.navigate('dashboard');
        } catch (err) {
            alert("Hata: " + err.message);
        }
    },

    goHome: () => View.navigate('dashboard'),
    showGuide: () => View.navigate('guide-screen'),
    showShop: () => View.navigate('shop-screen'),

    handleBuddyUpload: (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                state.user.buddyImage = e.target.result; // Save base64
                Storage.save();
                alert("Harika! Buddy'nin fotoğrafı kaydedildi.");
                View.renderDashboard(); // Refresh UI
            };
            reader.readAsDataURL(file);
        }
    },

    buyCoupon: () => {
        if(state.user.xp >= 500) {
            state.user.xp -= 500;
            Storage.save();
            document.getElementById('coupon-area').classList.remove('hidden');
        } else {
            alert("Yeterli XP yok! (500 XP gerekli)");
        }
    }
};

// --- LESSON ENGINE ---
const LessonEngine = {
    start: (category) => {
        state.currentLesson = category;
        View.navigate('lesson-screen');
        document.getElementById('lesson-title').innerText = category.toUpperCase();
        
        // Buddy Check
        if(state.user.buddyImage) {
            document.getElementById('quiz-buddy-area').classList.remove('hidden');
            document.getElementById('quiz-buddy-img').src = state.user.buddyImage;
        }

        LessonEngine.generateQuestion(category);
    },

    generateQuestion: (category) => {
        const area = document.getElementById('question-area');
        
        // Basit Random Generator (Gerçek app'te veritabanından gelir)
        let html = '';
        if (category === 'math') {
            const n1 = Math.floor(Math.random() * 10);
            const n2 = Math.floor(Math.random() * 10);
            html = `
                <h1 style="font-size:3rem; text-align:center;">${n1} + ${n2} = ?</h1>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">
                    <button class="btn-primary squish-effect" onclick="LessonEngine.checkAnswer(${n1+n2}, ${n1+n2})">${n1+n2}</button>
                    <button class="btn-primary squish-effect" onclick="LessonEngine.checkAnswer(${n1+n2}, ${n1+n2+1})">${n1+n2+1}</button>
                </div>
            `;
        } else {
            html = `<p style="text-align:center;">Bu kategori için örnek soru hazırlanıyor...</p>
                    <button class="btn-primary" onclick="app.goHome()">Geri Dön</button>`;
        }
        
        // Eğer kategori "shapes" ise Buddy upload göster (Örnek mantık)
        const buddyUp = document.getElementById('buddy-upload-area');
        if(category === 'shapes') buddyUp.classList.remove('hidden');
        else buddyUp.classList.add('hidden');

        area.innerHTML = html;
    },

    checkAnswer: (correct, selected) => {
        if(correct === selected) {
            alert("Tebrikler! Doğru Cevap! 🎉 +10 XP");
            state.user.xp += 10;
            Storage.save();
            app.goHome();
        } else {
            alert("Tekrar dene! 💪");
        }
    }
};

// --- GUIDE SYSTEM ---
const guide = {
    data: {
        flower: ['cicek_adim1.jpg', 'cicek_adim2.jpg', 'cicek_adim5.jpg'],
        castle: ['kale_adim1.jpg', 'kale_adim2.jpg'],
        animal: ['hayvan_adim1.jpg']
    },
    currentType: null,
    stepIndex: 0,

    load: (type) => {
        guide.currentType = type;
        guide.stepIndex = 0;
        document.getElementById('step-container').classList.remove('hidden');
        guide.renderStep();
    },

    renderStep: () => {
        const steps = guide.data[guide.currentType];
        const img = document.getElementById('step-image');
        img.src = steps[guide.stepIndex];
        img.style.width = "100%";
        img.style.borderRadius = "15px";
        
        document.getElementById('step-desc').innerText = `Adım ${guide.stepIndex + 1} / ${steps.length}`;
        
        // Buton Yönetimi
        document.getElementById('prev-step').disabled = guide.stepIndex === 0;
        document.getElementById('next-step').innerText = guide.stepIndex === steps.length - 1 ? "Bitir" : "İleri";
    }
};

// Guide Event Listeners
document.getElementById('next-step').addEventListener('click', () => {
    const total = guide.data[guide.currentType].length;
    if (guide.stepIndex < total - 1) {
        guide.stepIndex++;
        guide.renderStep();
    } else {
        alert("Harika iş çıkardın! +50 XP");
        state.user.xp += 50;
        Storage.save();
        app.goHome();
    }
});

document.getElementById('prev-step').addEventListener('click', () => {
    if (guide.stepIndex > 0) {
        guide.stepIndex--;
        guide.renderStep();
    }
});

// Avatar Selection Logic
document.querySelectorAll('.avatar-option').forEach(img => {
    img.addEventListener('click', function() {
        document.querySelectorAll('.avatar-option').forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Start Button Logic
document.getElementById('start-btn').addEventListener('click', app.register);

// Buddy Upload Listener (Quiz Screen)
document.getElementById('buddy-file').addEventListener('change', app.handleBuddyUpload);

// Initialize App
document.addEventListener('DOMContentLoaded', app.init);
