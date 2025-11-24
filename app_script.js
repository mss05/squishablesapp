// SPLASH SCREEN TIMER
setTimeout(() => {
    // 2.5 Saniye sonra Splash ekranı kalkar, Welcome gelir
    document.getElementById('welcome-screen').style.display = 'flex';
}, 2500);

// UYGULAMAYI BAŞLAT (Home'a Geç)
function startApp() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('app-header').style.display = 'flex';
    document.getElementById('content-area').style.display = 'block';
    document.getElementById('bottom-nav').style.display = 'flex';
    switchTab('home');
}

// TAB DEĞİŞTİRME
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    
    // Alt menüyü güncelle
    const navItem = document.querySelector(`.nav-item[onclick="switchTab('${tabId}')"]`);
    if(navItem) navItem.classList.add('active');
}

// GUIDE DETAY MANTIĞI (ADIM ADIM)
let currentStep = 1;
const totalSteps = 3;
const steps = [
    { title: "Step 1: Roll the Ball", desc: "Take orange dough and roll it into a smooth ball.", img: "step1.jpg" },
    { title: "Step 2: Create Petals", desc: "Make 5 small pink balls and flatten them for petals.", img: "step2.jpg" },
    { title: "Step 3: Assemble", desc: "Attach petals to the center and add a green stem!", img: "step3.jpg" }
];

function openGuideDetail(guideId) {
    // Şimdilik sadece 'flower' var
    switchTab('guide-detail');
    currentStep = 1;
    updateStepUI();
}

function nextStep() {
    if(currentStep < totalSteps) {
        currentStep++;
        updateStepUI();
    } else {
        alert("Challenge Complete! +50 Points");
        switchTab('rewards');
    }
}

function prevStep() {
    if(currentStep > 1) {
        currentStep--;
        updateStepUI();
    }
}

function updateStepUI() {
    const step = steps[currentStep - 1];
    document.getElementById('step-title').innerText = step.title;
    document.getElementById('step-desc').innerText = step.desc;
    document.getElementById('step-image').src = step.img;
    
    // Bar güncelleme
    for(let i=1; i<=3; i++) {
        document.getElementById(`bar-${i}`).className = i <= currentStep ? 'step-bar active' : 'step-bar';
    }
}

// BUDDY UPLOAD & MATH
function triggerUpload() {
    document.getElementById('upload-placeholder').style.display = 'none';
    document.getElementById('loading-spinner').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('uploaded-buddy').style.display = 'block';
        
        const btn = document.getElementById('btn-start-lesson');
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.style.background = '#424874';
    }, 2000);
}

function startMathLesson() {
    document.getElementById('buddy-upload-screen').style.display = 'none';
    document.getElementById('math-screen').style.display = 'block';
}

function checkAnswer(btn, isCorrect) {
    if(isCorrect) {
        btn.style.background = '#C4DFD9';
        setTimeout(() => alert("Correct! Great job!"), 500);
    } else {
        btn.style.background = '#FFD1BA';
    }
}

function goBack(tab) {
    switchTab(tab);
}
