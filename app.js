// --- Application Modes ---
const modes = {
    name: {
        title: "Name Spelling Test",
        desc: "A random full name will be announced and spelled out.<br>Type the correct spelling! (5 Questions)",
        placeholder: "First Last",
        note: "* Include a space between first and last name",
        generate: () => {
            let f = firstNames[Math.floor(Math.random() * firstNames.length)];
            let l = lastNames[Math.floor(Math.random() * lastNames.length)];
            return { display: `${f} ${l}`, answer: `${f} ${l}`.toLowerCase() };
        },
        getAudioText: (q) => {
            const parts = q.display.split(' ');
            const spelledFirst = parts[0].toUpperCase().split('').join(', ');
            const spelledLast = parts[1].toUpperCase().split('').join(', ');
            return `, , , , ${q.display}. , , , ${spelledFirst}, , , , ${spelledLast}`;
        },
        normalizeInput: (input) => input.replace(/\s+/g, ' ').toLowerCase()
    },
    number: {
        title: "Number Dictation",
        desc: "A random number (10 - 999,999) will be announced.<br>Type the exact number! (5 Questions)",
        placeholder: "e.g. 12345",
        note: "* Commas are optional (1234 or 1,234)",
        generate: () => {
            const num = Math.floor(Math.random() * 999990) + 10;
            return { display: num.toString(), answer: num.toString() };
        },
        getAudioText: (q) => `, , , , ${q.display}`,
        normalizeInput: (input) => input.replace(/[,\s]+/g, '')
    },
    postcode: {
        title: "Post Code Dictation",
        desc: "A UK Post Code will be announced.<br>Type the correct post code! (5 Questions)",
        placeholder: "e.g. SW1A 1AA",
        note: "* Space in the middle is optional",
        generate: () => {
            let pc = postcodes[Math.floor(Math.random() * postcodes.length)];
            return { display: pc, answer: pc.toLowerCase() };
        },
        getAudioText: (q) => {
            const spelledOut = q.display.toUpperCase().split('').map(char => {
                return char === ' ' ? ', , ' : char;
            }).join(', ');
            return `, , , , ${spelledOut}`;
        },
        normalizeInput: (input) => input.replace(/[\s]+/g, '').toLowerCase()
        },
    phone: {
        title: "Phone Number Dictation",
        desc: "A UK phone number will be announced.<br>Type the correct number! (5 Questions)",
        placeholder: "e.g. 07700 900077",
        note: "* Spaces in numbers are optional",
        generate: () => {
            let ph = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
            return { display: ph, answer: ph };
        },
        getAudioText: (q) => `, , , , ${q.display}`,
        normalizeInput: (input) => input.replace(/[\s]+/g, '')
    },
    address: {
        title: "Address & Street Name Dictation",
        desc: "A street address will be announced and the street name spelled out.<br>Type the full address! (5 Questions)",
        placeholder: "e.g. 15 Sparrow Lane",
        note: "* e.g. Number followed by street name",
        generate: () => {
            let addr = addresses[Math.floor(Math.random() * addresses.length)];
            let full = `${addr.num} ${addr.street}`;
            return { display: full, answer: full.toLowerCase() };
        },
        getAudioText: (q) => {
            const parts = q.display.split(' ');
            const streetWords = parts.slice(1).join(' ');
            const spelledStreet = streetWords.toUpperCase().split('').join(', ');
            return `, , , , ${q.display}. , , , ${spelledStreet}`;
        },
        normalizeInput: (input) => input.replace(/\s+/g, ' ').toLowerCase()
    }
};

// --- State ---
const totalQuestions = 5;
let currentMode = 'name';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentQObj = null;

// --- Functions ---
function switchTab(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${mode}`).classList.add('active');
    
    const m = modes[mode];
    document.getElementById("mode-title").innerText = m.title;
    document.getElementById("mode-desc").innerHTML = m.desc;
    document.getElementById("answer-input").placeholder = m.placeholder;
    document.getElementById("mode-note").innerText = m.note;
    
    document.getElementById("start-screen").classList.remove("hidden");
    document.getElementById("play-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.add("hidden");
}

function startGame() {
    score = 0;
    currentQuestionIndex = 0;
    questions = [];
    
    for(let i = 0; i < totalQuestions; i++) {
        questions.push(modes[currentMode].generate());
    }
    
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.add("hidden");
    document.getElementById("play-screen").classList.remove("hidden");
    
    loadQuestion();
}

function loadQuestion() {
    currentQObj = questions[currentQuestionIndex];
    document.getElementById("progress-text").innerText = `Question ${currentQuestionIndex + 1} / ${totalQuestions}`;
    
    const inputEl = document.getElementById("answer-input");
    inputEl.value = "";
    inputEl.disabled = false;
    inputEl.style.textTransform = (currentMode === 'name' || currentMode === 'address') ? "capitalize" : "none";
    
    document.getElementById("feedback-text").innerText = "";
    document.getElementById("submit-btn").classList.remove("hidden");
    document.getElementById("next-btn").classList.add("hidden");
    inputEl.focus();
    
    setTimeout(playAudio, 500);
}

function playAudio() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        
        const textToSpeak = modes[currentMode].getAudioText(currentQObj);
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-GB'; 
        
        const selectedSpeed = document.getElementById("speed-select").value;
        utterance.rate = parseFloat(selectedSpeed); 
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Your browser does not support text-to-speech.");
    }
}

function handleEnter(event) {
    (event.key === "Enter") && (!document.getElementById("submit-btn").classList.contains("hidden") ? checkAnswer() : nextQuestion());
}

function checkAnswer() {
    let input = document.getElementById("answer-input").value.trim();
    if (input === "") return; 

    const normalizedInput = modes[currentMode].normalizeInput(input);
    const correctAnswer = currentQObj.answer;
    
    const feedback = document.getElementById("feedback-text");

    document.getElementById("answer-input").disabled = true;
    document.getElementById("submit-btn").classList.add("hidden");
    document.getElementById("next-btn").classList.remove("hidden");

    if (normalizedInput === correctAnswer) {
        feedback.innerText = "⭕ Correct!";
        feedback.className = "feedback correct";
        score++;
    } else {
        feedback.innerText = `❌ Incorrect! The answer is ${currentQObj.display}`;
        feedback.className = "feedback incorrect";
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById("play-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.remove("hidden");
    document.getElementById("score-text").innerText = `${score} / ${totalQuestions}`;
}

// 初期化
switchTab('name');