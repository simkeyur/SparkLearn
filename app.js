import {
    renderProfiles,
    displayModuleContent,
    displayError,
    showLoader,
    hideLoader,
    resetModuleView,
    updateScore
} from './ui.js';

// --- DOM Element Selections ---
const profileSelection = document.getElementById('profile-selection');
const profileCreation = document.getElementById('profile-creation');
const mainApp = document.getElementById('main-app');
const newProfileBtn = document.getElementById('new-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const welcomeMessage = document.getElementById('welcome-message');
const apiKeyInput = document.getElementById('api-key');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const settingsFab = document.getElementById('settings-fab');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const parentalGate = document.getElementById('parental-gate');
const apiKeySection = document.getElementById('api-key-section');
const birthYearInput = document.getElementById('birth-year');
const validateBirthYearBtn = document.getElementById('validate-birth-year-btn');
const moduleSelection = document.getElementById('module-selection');
const moduleView = document.getElementById('module-view');
const moduleTitle = document.getElementById('module-title');
const submitAnswersBtn = document.getElementById('submit-answers-btn');
const backBtn = document.getElementById('back-btn');
const moduleBtns = document.querySelectorAll('.module-btn');

// Exit Parental Gate elements
const exitToProfileBtn = document.getElementById('exit-to-profile-btn');
const exitParentalGateModal = document.getElementById('exit-parental-gate-modal');
const closeExitModalBtn = document.getElementById('close-exit-modal-btn');
const parentalQuestion = document.getElementById('parental-question');
const parentalAnswerInput = document.getElementById('parental-answer');
const submitParentalAnswerBtn = document.getElementById('submit-parental-answer-btn');

// --- Application State ---
let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
let currentProfile = null;
let questionsData = [];
let parentalAnswer = 0;

// --- Core Logic ---

function selectProfile(profile) {
    currentProfile = profile;
    profileSelection.classList.add('hidden');
    mainApp.classList.remove('hidden');
    moduleSelection.classList.remove('hidden');
    moduleView.classList.add('hidden');
    welcomeMessage.textContent = `Welcome, ${currentProfile.name}!`;
}

async function selectModule(moduleType) {
    moduleSelection.classList.add('hidden');
    moduleView.classList.remove('hidden');
    moduleTitle.textContent = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);
    
    resetModuleView();
    showLoader();

    const prompt = getPrompt(currentProfile.age, moduleType);
    const result = await generateContent(prompt);
    
    hideLoader();

    try {
        const cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanedResult);
        questionsData = parsedResult.questions;
        displayModuleContent(parsedResult);
    } catch (error) {
        console.error("Failed to parse JSON from API:", error);
        displayError("Oops! Something went wrong. Could not load the module content. Please try again.");
    }
}

function checkAnswers() {
    let score = 0;
    const questionCards = document.querySelectorAll('.question-card');

    questionCards.forEach(card => {
        const questionIndex = parseInt(card.dataset.questionIndex, 10);
        const selectedOption = card.querySelector('.option.selected');
        
        if (selectedOption) {
            const selectedAnswerIndex = parseInt(selectedOption.dataset.optionIndex, 10);
            const correctAnswerIndex = questionsData[questionIndex].answer;

            if (selectedAnswerIndex === correctAnswerIndex) {
                score++;
                card.classList.add('correct');
            } else {
                card.classList.add('incorrect');
            }
        }
        card.querySelectorAll('.option').forEach(opt => opt.style.pointerEvents = 'none');
    });

    updateScore(score, questionsData.length);
}

// --- Event Listeners ---

newProfileBtn.addEventListener('click', () => {
    profileSelection.classList.add('hidden');
    profileCreation.classList.remove('hidden');
});

saveProfileBtn.addEventListener('click', () => {
    const name = nameInput.value;
    const age = ageInput.value;
    if (name && age) {
        const newProfile = { name, age };
        profiles.push(newProfile);
        localStorage.setItem('profiles', JSON.stringify(profiles));
        selectProfile(newProfile);
        profileCreation.classList.add('hidden');
        renderProfiles(profiles, selectProfile);
    }
});

moduleBtns.forEach(btn => {
    btn.addEventListener('click', () => selectModule(btn.dataset.module));
});

backBtn.addEventListener('click', () => {
    moduleView.classList.add('hidden');
    moduleSelection.classList.remove('hidden');
});

submitAnswersBtn.addEventListener('click', checkAnswers);

// --- Exit Parental Gate Listeners ---
exitToProfileBtn.addEventListener('click', () => {
    const num1 = Math.floor(Math.random() * 10) + 5;
    const num2 = Math.floor(Math.random() * 10) + 5;
    parentalAnswer = num1 + num2;
    parentalQuestion.textContent = `What is ${num1} + ${num2}?`;
    parentalAnswerInput.value = '';
    exitParentalGateModal.classList.remove('hidden');
});

closeExitModalBtn.addEventListener('click', () => {
    exitParentalGateModal.classList.add('hidden');
});

submitParentalAnswerBtn.addEventListener('click', () => {
    const userAnswer = parseInt(parentalAnswerInput.value, 10);
    if (userAnswer === parentalAnswer) {
        exitParentalGateModal.classList.add('hidden');
        mainApp.classList.add('hidden');
        profileSelection.classList.remove('hidden');
    } else {
        alert('Incorrect answer. Please try again.');
    }
});

// --- Settings & Parental Gate Listeners ---

settingsFab.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    parentalGate.classList.remove('hidden');
    apiKeySection.classList.add('hidden');
    birthYearInput.value = '';
});

closeModalBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

settingsModal.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

validateBirthYearBtn.addEventListener('click', () => {
    const birthYear = parseInt(birthYearInput.value, 10);
    const currentYear = new Date().getFullYear();
    if (birthYear && (currentYear - birthYear) >= 18) {
        parentalGate.classList.add('hidden');
        apiKeySection.classList.remove('hidden');
    } else {
        alert('You must be at least 18 years old to access settings.');
    }
});

saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    if (apiKey) {
        setApiKey(apiKey);
        saveApiKeyBtn.textContent = 'Saved!';
        setTimeout(() => {
            settingsModal.classList.add('hidden');
            saveApiKeyBtn.textContent = 'Save Key';
        }, 1000);
    }
});

// --- Initial Page Load ---
renderProfiles(profiles, selectProfile);
settingsModal.classList.add('hidden');
exitParentalGateModal.classList.add('hidden');