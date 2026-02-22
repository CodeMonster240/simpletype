// Word list for typing test
const wordList = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having',
    'may', 'should', 'could', 'own', 'such', 'before', 'through', 'between', 'both', 'under',
    'during', 'since', 'without', 'again', 'further', 'once', 'here', 'where', 'why', 'while',
    'being', 'made', 'found', 'every', 'still', 'might', 'never', 'always', 'become', 'became',
    'across', 'another', 'around', 'place', 'right', 'world', 'going', 'point', 'system', 'order'
];

// Game state
let gameState = {
    mode: 'words',
    value: 10,
    words: [],
    currentWordIndex: 0,
    typedChars: 0,
    correctChars: 0,
    incorrectChars: 0,
    correctWords: 0,
    incorrectWords: 0,
    startTime: null,
    endTime: null,
    timer: null,
    timerInterval: null,
    wpmTrackingInterval: null,
    wpmHistory: [],
    started: false,
    finished: false
};

// DOM elements
const wordsDisplay = document.getElementById('words-display');
const wordsViewport = document.getElementById('words-viewport');
const caret = document.getElementById('caret');
const inputField = document.getElementById('input-field');
const wpmElement = document.getElementById('wpm');
const rawWpmElement = document.getElementById('raw-wpm');
const accuracyElement = document.getElementById('accuracy');
const timerElement = document.getElementById('timer');
const timerDisplay = document.getElementById('timer-display');
const resultsModal = document.getElementById('results-modal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    generateWords();
    renderWords();
});

function setupEventListeners() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            gameState.mode = btn.dataset.mode;
            
            // Show/hide appropriate options
            document.querySelectorAll('.options').forEach(opt => opt.classList.remove('active'));
            document.querySelector(`.${gameState.mode}-options`).classList.add('active');
            
            // Update value to first option in new mode
            const firstOption = document.querySelector(`.${gameState.mode}-options .option-btn`);
            gameState.value = parseInt(firstOption.dataset.value);
            
            // Update timer display visibility
            if (gameState.mode === 'time') {
                timerDisplay.classList.add('active');
            } else {
                timerDisplay.classList.remove('active');
            }
            
            resetTest();
        });
    });
    
    // Option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from siblings
            btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            gameState.value = parseInt(btn.dataset.value);
            resetTest();
        });
    });
    
    // Input field
    inputField.addEventListener('input', handleInput);
    inputField.addEventListener('keydown', handleKeydown);
    
    // Focus input on page load
    inputField.focus();
    
    // Refocus input when clicking anywhere
    document.addEventListener('click', () => {
        if (!gameState.finished) {
            inputField.focus();
        }
    });

    window.addEventListener('resize', () => {
        updateScroll();
        updateCaret();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resetTest();
        } else if (e.key === 'Tab') {
            e.preventDefault();
        }
    });
}

function generateWords() {
    gameState.words = [];
    const wordCount = gameState.mode === 'words' ? gameState.value : 200; // Generate more for time mode
    
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        gameState.words.push(wordList[randomIndex]);
    }
}

function renderWords() {
    wordsDisplay.innerHTML = '';
    gameState.words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';

        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });

        if (index === 0) {
            wordSpan.classList.add('current');
        }
        wordsDisplay.appendChild(wordSpan);
    });

    updateScroll();
    updateCaret();
}

function updateCurrentWordChars(inputValue) {
    const wordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = wordElements[gameState.currentWordIndex];
    if (!currentWordElement) return;

    const charSpans = currentWordElement.querySelectorAll('.char');
    charSpans.forEach(span => span.classList.remove('correct', 'incorrect'));

    const maxIndex = Math.min(inputValue.length, charSpans.length);
    for (let i = 0; i < maxIndex; i++) {
        if (inputValue[i] === charSpans[i].textContent) {
            charSpans[i].classList.add('correct');
        } else {
            charSpans[i].classList.add('incorrect');
        }
    }
}

function finalizeWordChars(wordIndex, inputValue) {
    const wordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = wordElements[wordIndex];
    if (!currentWordElement) return;

    const charSpans = currentWordElement.querySelectorAll('.char');
    for (let i = 0; i < charSpans.length; i++) {
        if (inputValue[i] === charSpans[i].textContent) {
            charSpans[i].classList.add('correct');
            charSpans[i].classList.remove('incorrect');
        } else {
            charSpans[i].classList.add('incorrect');
            charSpans[i].classList.remove('correct');
        }
    }
}

function updateCaret() {
    const wordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = wordElements[gameState.currentWordIndex];
    if (!currentWordElement || !caret || !wordsViewport) return;

    const charSpans = currentWordElement.querySelectorAll('.char');
    const inputValue = inputField.value;
    const wordsRect = wordsViewport.getBoundingClientRect();

    let caretLeft = currentWordElement.offsetLeft;
    let caretTop = currentWordElement.offsetTop;

    if (charSpans.length > 0) {
        if (inputValue.length === 0) {
            const firstRect = charSpans[0].getBoundingClientRect();
            caretLeft = firstRect.left - wordsRect.left;
            caretTop = firstRect.top - wordsRect.top;
        } else if (inputValue.length >= charSpans.length) {
            const lastRect = charSpans[charSpans.length - 1].getBoundingClientRect();
            caretLeft = lastRect.right - wordsRect.left;
            caretTop = lastRect.top - wordsRect.top;
        } else {
            const currentRect = charSpans[inputValue.length].getBoundingClientRect();
            caretLeft = currentRect.left - wordsRect.left;
            caretTop = currentRect.top - wordsRect.top;
        }
    }

    caret.style.transform = `translate(${caretLeft}px, ${caretTop}px)`;
}

function updateScroll() {
    if (!wordsViewport) return;

    const wordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = wordElements[gameState.currentWordIndex];
    if (!currentWordElement) return;

    const lineHeight = parseFloat(getComputedStyle(wordsDisplay).lineHeight);
    const viewportHeight = wordsViewport.clientHeight;
    const targetTop = currentWordElement.offsetTop;
    const desiredScroll = targetTop - lineHeight;
    const maxScroll = Math.max(0, wordsDisplay.scrollHeight - viewportHeight);
    const clampedScroll = Math.min(Math.max(desiredScroll, 0), maxScroll);

    wordsDisplay.style.transform = `translateY(-${clampedScroll}px)`;
}

function handleInput(e) {
    if (!gameState.started) {
        startTest();
    }

    const inputValue = e.target.value;
    const currentWord = gameState.words[gameState.currentWordIndex];

    // Check if word matches so far
    if (currentWord.startsWith(inputValue)) {
        inputField.classList.remove('error');
    } else {
        inputField.classList.add('error');
    }

    updateCurrentWordChars(inputValue);
    updateScroll();
    updateCaret();
    updateStats();
}

function handleKeydown(e) {
    if (e.key === ' ') {
        e.preventDefault();
        checkWord();
    }
}

function checkWord() {
    const inputValue = inputField.value.trim();
    const currentWord = gameState.words[gameState.currentWordIndex];

    if (inputValue === '') return;

    // Update word styling
    const wordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = wordElements[gameState.currentWordIndex];

    finalizeWordChars(gameState.currentWordIndex, inputValue);

    if (inputValue === currentWord) {
        currentWordElement.classList.add('correct');
        gameState.correctWords++;
        gameState.correctChars += currentWord.length + 1; // +1 for space
    } else {
        currentWordElement.classList.add('incorrect');
        gameState.incorrectWords++;
        gameState.incorrectChars += currentWord.length + 1;
    }

    currentWordElement.classList.remove('current');
    gameState.typedChars += inputValue.length + 1; // +1 for space

    // Move to next word
    gameState.currentWordIndex++;

    // Check if test is complete
    if (gameState.mode === 'words' && gameState.currentWordIndex >= gameState.words.length) {
        endTest();
        return;
    }

    // Add current class to next word
    if (gameState.currentWordIndex < gameState.words.length) {
        wordElements[gameState.currentWordIndex].classList.add('current');
    }

    // Clear input
    inputField.value = '';
    inputField.classList.remove('error');

    updateCurrentWordChars('');
    updateScroll();
    updateCaret();
    updateStats();
}

function startTest() {
    gameState.started = true;
    gameState.startTime = Date.now();
    
    if (gameState.mode === 'time') {
        gameState.timer = gameState.value;
        updateTimer();
        gameState.timerInterval = setInterval(() => {
            gameState.timer--;
            updateTimer();
            
            if (gameState.timer <= 0) {
                endTest();
            }
        }, 1000);
    }
    
    // Track WPM over time
    gameState.wpmTrackingInterval = setInterval(() => {
        if (gameState.started && !gameState.finished) {
            const wpm = calculateWPM();
            gameState.wpmHistory.push({
                time: (Date.now() - gameState.startTime) / 1000,
                wpm: wpm
            });
        }
    }, 1000);
}

function updateTimer() {
    if (gameState.mode === 'time') {
        timerElement.textContent = `${gameState.timer}s`;
    }
}

function calculateWPM() {
    if (!gameState.startTime) return 0;
    
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
    if (timeElapsed === 0) return 0;
    
    const wordsTyped = gameState.correctChars / 5; // Standard: 5 chars = 1 word
    return Math.round(wordsTyped / timeElapsed);
}

function calculateRawWPM() {
    if (!gameState.startTime) return 0;
    
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
    if (timeElapsed === 0) return 0;
    
    const allCharsTyped = (gameState.correctChars + gameState.incorrectChars) / 5;
    return Math.round(allCharsTyped / timeElapsed);
}

function calculateAccuracy() {
    const totalChars = gameState.correctChars + gameState.incorrectChars;
    if (totalChars === 0) return 100;
    
    return Math.round((gameState.correctChars / totalChars) * 100);
}

function updateStats() {
    wpmElement.textContent = calculateWPM();
    rawWpmElement.textContent = calculateRawWPM();
    accuracyElement.textContent = calculateAccuracy() + '%';
}

function endTest() {
    gameState.finished = true;
    gameState.endTime = Date.now();
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    if (gameState.wpmTrackingInterval) {
        clearInterval(gameState.wpmTrackingInterval);
    }
    
    inputField.disabled = true;
    
    // Show results modal
    showResults();
}

function showResults() {
    const finalWPM = calculateWPM();
    const finalRawWPM = calculateRawWPM();
    const finalAccuracy = calculateAccuracy();
    const timeElapsed = ((gameState.endTime - gameState.startTime) / 1000).toFixed(1);
    
    document.getElementById('final-wpm').textContent = finalWPM;
    document.getElementById('final-raw-wpm').textContent = finalRawWPM;
    document.getElementById('final-accuracy').textContent = finalAccuracy + '%';
    document.getElementById('final-correct').textContent = gameState.correctWords;
    document.getElementById('final-incorrect').textContent = gameState.incorrectWords;
    document.getElementById('final-time').textContent = timeElapsed + 's';
    
    // Create WPM chart
    createWPMChart();
    
    resultsModal.classList.add('show');
}

function createWPMChart() {
    const canvas = document.getElementById('wpm-chart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const width = canvas.width = canvas.offsetWidth * 2; // Higher resolution
    const height = canvas.height = 400;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (gameState.wpmHistory.length === 0) {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', width / 2, height / 2);
        return;
    }
    
    // Prepare data
    const wpmData = gameState.wpmHistory.map(entry => entry.wpm);
    const maxWpm = Math.max(...wpmData, 1);
    const padding = 60;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw title
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.fillText('WPM Over Time', width / 2, 40);
    
    // Draw axes
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const y = height - padding - (graphHeight / ySteps) * i;
        const value = Math.round((maxWpm / ySteps) * i);
        ctx.fillText(value.toString(), padding - 10, y + 7);
        
        // Draw horizontal grid lines
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw Y-axis label
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.fillText('Words Per Minute', 0, 0);
    ctx.restore();
    
    // Draw X-axis label
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.fillText('Time (seconds)', width / 2, height - 10);
    
    // Draw line graph
    if (wpmData.length > 0) {
        const xStep = graphWidth / (wpmData.length - 1 || 1);
        
        // Draw filled area
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        wpmData.forEach((wpm, index) => {
            const x = padding + xStep * index;
            const y = height - padding - (wpm / maxWpm) * graphHeight;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(padding + xStep * (wpmData.length - 1), height - padding);
        ctx.closePath();
        ctx.fill();
        
        // Draw line
        ctx.strokeStyle = 'rgb(99, 102, 241)';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        wpmData.forEach((wpm, index) => {
            const x = padding + xStep * index;
            const y = height - padding - (wpm / maxWpm) * graphHeight;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = 'rgb(99, 102, 241)';
        wpmData.forEach((wpm, index) => {
            const x = padding + xStep * index;
            const y = height - padding - (wpm / maxWpm) * graphHeight;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function closeModal() {
    resultsModal.classList.remove('show');
}

function restartTest() {
    closeModal();
    resetTest();
}

function resetTest() {
    // Clear any intervals
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    if (gameState.wpmTrackingInterval) {
        clearInterval(gameState.wpmTrackingInterval);
    }
    
    // Reset game state
    gameState = {
        mode: gameState.mode,
        value: gameState.value,
        words: [],
        currentWordIndex: 0,
        typedChars: 0,
        correctChars: 0,
        incorrectChars: 0,
        correctWords: 0,
        incorrectWords: 0,
        startTime: null,
        endTime: null,
        timer: null,
        timerInterval: null,
        wpmTrackingInterval: null,
        wpmHistory: [],
        started: false,
        finished: false
    };
    
    // Reset UI
    inputField.value = '';
    inputField.disabled = false;
    inputField.classList.remove('error');
    inputField.focus();
    
    wpmElement.textContent = '0';
    rawWpmElement.textContent = '0';
    accuracyElement.textContent = '100%';
    timerElement.textContent = '--';
    
    // Generate new words
    generateWords();
    renderWords();
}
