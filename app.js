// --- Application Modes ---
const modes = {
    name: {
        title: "Name Spelling Test",
        desc: "A random full name will be announced and spelled out.<br>Type the correct spelling! (10 Questions)",
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
            return `, , , , ${parts[0]}. , , , ${spelledFirst}, , , , ${parts[1]}. , , , ${spelledLast}`;
        },
        normalizeInput: (input) => input.replace(/\s+/g, ' ').toLowerCase()
    },
    number: {
        title: "Number Dictation",
        desc: "A random number (10 - 999,999) will be announced.<br>Type the exact number! (10 Questions)",
        placeholder: "e.g. 12345",
        note: "* Commas are optional (1234 or 1,234)",
        generate: () => {
            const num = Math.floor(Math.random() * 999990) + 10;
            return { display: num.toString(), answer: num.toString() };
        },
        getAudioText: (q) => {
            const n = Number(q.display);
            const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
            const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
            const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

            function sayNumber(num) {
                if (num < 10) return ones[num];
                if (num < 20) return teens[num - 10];
                if (num < 100) {
                    const t = Math.floor(num / 10);
                    const u = num % 10;
                    return u === 0 ? tens[t] : `${tens[t]} ${ones[u]}`;
                }
                if (num < 1000) {
                    const h = Math.floor(num / 100);
                    const rem = num % 100;
                    if (rem === 0) return `${ones[h]} hundred`;
                    const useAnd = Math.random() < 0.5;
                    return `${ones[h]} hundred${useAnd ? ' and ' : ' '}${sayNumber(rem)}`;
                }
                if (num < 1000000) {
                    const th = Math.floor(num / 1000);
                    const rem = num % 1000;
                    if (rem === 0) return `${sayNumber(th)} thousand`;
                    const useAnd = Math.random() < 0.5;
                    return `${sayNumber(th)} thousand${useAnd ? ' and ' : ' '}${sayNumber(rem)}`;
                }
                return String(num);
            }

            return `, , , , ${sayNumber(n)}`;
        },
        normalizeInput: (input) => input.replace(/[,\s]+/g, '')
    },
    postcode: {
        title: "Post Code Dictation",
        desc: "A UK Post Code will be announced.<br>Type the correct post code! (10 Questions)",
        placeholder: "e.g. SW1A 1AA",
        note: "",
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
        desc: "A UK phone number will be announced.<br>Type the correct number! (10 Questions)",
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
        desc: "A street address will be announced and the street name spelled out.<br>Type the full address! (10 Questions)",
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
    },
    mix: {
        title: "Mix Dictation",
        desc: "A random question will be picked from all categories.<br>Type the correct answer! (10 Questions)",
        placeholder: "Type the answer",
        note: "* A random mix of Name, Number, Post Code, Phone, and Address",
        generate: () => {
            const categoryKeys = Object.keys(modes).filter(key => key !== 'mix');
            const selectedMode = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
            const generated = modes[selectedMode].generate();
            return { ...generated, mode: selectedMode };
        },
        getAudioText: (q) => {
            const selectedMode = q && q.mode ? q.mode : currentMode;
            return modes[selectedMode] ? modes[selectedMode].getAudioText(q) : '';
        },
        normalizeInput: (input) => input.trim()
    }
};

// --- State ---
const totalQuestions = 10;
let currentMode = 'name';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentQObj = null;

// --- Functions ---
function switchTab(mode) {
    if (!mode || !modes[mode]) {
        console.warn('Unknown mode requested:', mode);
        return;
    }

    currentMode = mode;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const tab = document.getElementById(`tab-${mode}`);
    if (tab) tab.classList.add('active');
    
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
    if (!modes[currentMode]) {
        console.warn('No valid mode selected for startGame:', currentMode);
        return;
    }

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
    const activeMode = currentQObj && currentQObj.mode ? currentQObj.mode : currentMode;
    inputEl.value = "";
    inputEl.disabled = false;
    inputEl.style.textTransform = (activeMode === 'name' || activeMode === 'address') ? "capitalize" : "none";
    
    document.getElementById("feedback-text").innerText = "";
    document.getElementById("submit-btn").classList.remove("hidden");
    document.getElementById("next-btn").classList.add("hidden");

    playAudio();
    inputEl.focus();
}

function getBritishVoice() {
    const voices = window.speechSynthesis.getVoices();
    const britishCandidates = [
        /en-gb|en_uk|english.*united kingdom|united kingdom.*english|british/i,
        /david|hazel|susan|jenny|rachel|george|serena|heather|martin/i,
        /en-us|en-au|en-ca/i
    ];

    const priorityVoice = voices.find(voice => {
        const name = (voice.name || '').toLowerCase();
        const lang = (voice.lang || '').toLowerCase();
        return britishCandidates[0].test(lang) || britishCandidates[0].test(name);
    });

    if (priorityVoice) return priorityVoice;

    const englishVoice = voices.find(voice => {
        const lang = (voice.lang || '').toLowerCase();
        return lang.startsWith('en') || /english/.test((voice.name || '').toLowerCase());
    });

    return englishVoice || null;
}

function playAudio() {
    if (!('speechSynthesis' in window)) {
        alert("Your browser does not support text-to-speech.");
        return;
    }

    const activeMode = currentQObj && currentQObj.mode ? currentQObj.mode : currentMode;

    if (!currentQObj || !modes[activeMode]) {
        return;
    }

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = getBritishVoice();

    if (!voices.length || !englishVoice) {
        const feedback = document.getElementById("feedback-text");
        if (feedback) {
            feedback.innerText = "";
            feedback.className = "feedback incorrect";
        } else {
            alert("No English TTS voice is installed in this browser. Install English (United Kingdom) in Windows/Chrome to enable IELTS audio.");
        }
        return;
    }

    window.speechSynthesis.cancel(); 
    
    const textToSpeak = modes[activeMode].getAudioText(currentQObj);
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-GB';
    const britishVoice = getBritishVoice();
    if (britishVoice) {
        utterance.voice = britishVoice;
    }
    
    const speedInput = document.getElementById("speed-range");
    const selectedSpeed = speedInput && speedInput.value ? speedInput.value : "1.5";
    utterance.rate = parseFloat(selectedSpeed);
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
}

function handleEnter(event) {
    (event.key === "Enter") && (!document.getElementById("submit-btn").classList.contains("hidden") ? checkAnswer() : nextQuestion());
}

function checkAnswer() {
    let input = document.getElementById("answer-input").value.trim();
    if (input === "") return; 

    const activeMode = currentQObj && currentQObj.mode ? currentQObj.mode : currentMode;
    const normalizedInput = modes[activeMode].normalizeInput(input);
    const correctAnswer = modes[activeMode].normalizeInput(currentQObj.answer);
    
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