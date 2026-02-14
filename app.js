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
    wpmHistory: [],
    started: false,
    finished: false
};

// DOM elements
const wordsDisplay = document.getElementById('words-display');
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
        wordSpan.textContent = word;
        if (index === 0) {
            wordSpan.classList.add('current');
        }
        wordsDisplay.appendChild(wordSpan);
    });
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
    
    updateStats();
}

function handleKeydown(e) {
    if (e.key === ' ') {
        e.preventDefault();
        checkWord();
    } else if (e.key === 'Tab' && e.shiftKey) {
        // Tab + Shift doesn't work well, so we use Tab + Enter for restart
    } else if (e.key === 'Enter' && e.getModifierState && e.getModifierState('Tab')) {
        resetTest();
    }
}

function checkWord() {
    const inputValue = inputField.value.trim();
    const currentWord = gameState.words[gameState.currentWordIndex];
    
    if (inputValue === '') return;
    
    // Update word styling
    const wordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = wordElements[gameState.currentWordIndex];
    
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
    setInterval(() => {
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
    const ctx = document.getElementById('wpm-chart').getContext('2d');
    
    // Clear existing chart if any
    if (window.wpmChart) {
        window.wpmChart.destroy();
    }
    
    // Prepare data
    const labels = gameState.wpmHistory.map(entry => entry.time.toFixed(0) + 's');
    const wpmData = gameState.wpmHistory.map(entry => entry.wpm);
    
    window.wpmChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'WPM',
                data: wpmData,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'WPM Over Time',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Words Per Minute'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

function closeModal() {
    resultsModal.classList.remove('show');
}

function restartTest() {
    closeModal();
    resetTest();
}

function resetTest() {
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
    
    // Clear any intervals
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
}
