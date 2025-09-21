import {
    renderProfiles,
    displayModuleContent,
    displayError,
    showLoader,
    hideLoader,
    resetModuleView,
    updateScore
} from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
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
    const moduleSelection = document.getElementById('module-selection');
    const moduleView = document.getElementById('module-view');
    const moduleTitle = document.getElementById('module-title');
    const submitAnswersBtn = document.getElementById('submit-answers-btn');
    const backBtn = document.getElementById('back-btn');
    const moduleBtns = document.querySelectorAll('.module-btn');
    const exitToProfileBtn = document.getElementById('exit-to-profile-btn');

    // Reusable Parental Gate elements
    const parentalGateModal = document.getElementById('parental-gate-modal');
    const closeParentalGateBtn = document.getElementById('close-parental-gate-btn');
    const parentalQuestion = document.getElementById('parental-question');
    const parentalAnswerInput = document.getElementById('parental-answer');
    const submitParentalAnswerBtn = document.getElementById('submit-parental-answer-btn');

    // --- Application State ---
    let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
    let currentProfile = null;
    let questionsData = [];
    let parentalCheckAnswer = 0;
    let onParentalCheckSuccess = null; // Callback for successful check

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

    // --- Parental Gate Logic ---
    function openParentalGate(onSuccessCallback) {
        const num1 = Math.floor(Math.random() * 10) + 5;
        const num2 = Math.floor(Math.random() * 10) + 5;
        parentalCheckAnswer = num1 + num2;
        parentalQuestion.textContent = `What is ${num1} + ${num2}?`;
        parentalAnswerInput.value = '';
        onParentalCheckSuccess = onSuccessCallback;
        parentalGateModal.classList.remove('hidden');
    }

    submitParentalAnswerBtn.addEventListener('click', () => {
        const userAnswer = parseInt(parentalAnswerInput.value, 10);
        if (userAnswer === parentalCheckAnswer) {
            parentalGateModal.classList.add('hidden');
            if (onParentalCheckSuccess) {
                onParentalCheckSuccess();
            }
        } else {
            alert('Incorrect answer. Please try again.');
        }
    });

    closeParentalGateBtn.addEventListener('click', () => {
        parentalGateModal.classList.add('hidden');
    });

    // --- Profile Management ---
    function deleteProfile(profileIndex) {
        openParentalGate(() => {
            profiles.splice(profileIndex, 1);
            localStorage.setItem('profiles', JSON.stringify(profiles));
            renderProfiles(profiles, selectProfile, deleteProfile);
        });
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
            renderProfiles(profiles, selectProfile, deleteProfile);
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

    exitToProfileBtn.addEventListener('click', () => {
        openParentalGate(() => {
            mainApp.classList.add('hidden');
            profileSelection.classList.remove('hidden');
        });
    });

    // --- Settings Listeners ---

    settingsFab.addEventListener('click', () => {
        openParentalGate(() => {
            settingsModal.classList.remove('hidden');
            apiKeyInput.focus();
        });
    });

    closeModalBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
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
    function initializeApp() {
        renderProfiles(profiles, selectProfile, deleteProfile);
        settingsModal.classList.add('hidden');
        parentalGateModal.classList.add('hidden');

        if (!getApiKey()) {
            settingsFab.classList.add('pulse');
            setTimeout(() => {
                openParentalGate(() => {
                    settingsModal.classList.remove('hidden');
                    apiKeyInput.focus();
                });
            }, 1000);
        }
    }

    initializeApp();
});