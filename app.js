import {
    renderProfilesForSettings,
    renderProfilesForKids,
    displayModuleContent,
    displayError,
    showLoader,
    hideLoader,
    resetModuleView,
    updateScore
} from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selections ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainApp = document.getElementById('main-app');
    const selectProfileBtn = document.getElementById('select-profile-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const settingsFab = document.getElementById('settings-fab');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    const profileCreation = document.getElementById('profile-creation');
    const addProfileBtn = document.getElementById('add-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const profileSelectionModal = document.getElementById('profile-selection-modal');
    const closeProfileSelectionBtn = document.getElementById('close-profile-selection-btn');
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

    // Edit Profile Modal elements
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const editNameInput = document.getElementById('edit-name');
    const editAgeInput = document.getElementById('edit-age');
    const saveEditProfileBtn = document.getElementById('save-edit-profile-btn');

    // --- Safe Local Storage Wrappers ---
    function safeLocalStorageSet(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn("localStorage is not available. Profile changes will not be saved.", e);
            return false;
        }
    }

    function safeLocalStorageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("localStorage is not available.", e);
            return null;
        }
    }

    // --- Application State ---
    let profiles = JSON.parse(safeLocalStorageGet('profiles')) || [];
    let currentProfile = null;
    let questionsData = [];
    let parentalCheckAnswer = 0;
    let onParentalCheckSuccess = null;
    let profileToEditIndex = -1;

    // --- Core Logic ---

    function selectProfile(profile) {
        currentProfile = profile;
        welcomeScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        moduleSelection.classList.remove('hidden');
        moduleView.classList.add('hidden');
        welcomeMessage.textContent = `Welcome, ${profile.name}!`;
        profileSelectionModal.classList.add('hidden');
        exitToProfileBtn.classList.remove('hidden'); // Show the exit button
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
            safeLocalStorageSet('profiles', JSON.stringify(profiles));
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
        });
    }

    function editProfile(profileIndex) {
        profileToEditIndex = profileIndex;
        const profile = profiles[profileIndex];
        editNameInput.value = profile.name;
        editAgeInput.value = profile.age;
        editProfileModal.classList.remove('hidden');
    }

    // --- Event Listeners ---

    selectProfileBtn.addEventListener('click', () => {
        renderProfilesForKids(profiles, selectProfile);
        profileSelectionModal.classList.remove('hidden');
    });

    closeProfileSelectionBtn.addEventListener('click', () => {
        profileSelectionModal.classList.add('hidden');
    });

    addProfileBtn.addEventListener('click', () => {
        profileCreation.classList.toggle('hidden');
    });

    saveProfileBtn.addEventListener('click', () => {
        const name = nameInput.value;
        const age = ageInput.value;
        if (name && age) {
            profiles.push({ name, age });
            safeLocalStorageSet('profiles', JSON.stringify(profiles));
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            nameInput.value = '';
            ageInput.value = '';
            profileCreation.classList.add('hidden');
        }
    });

    saveEditProfileBtn.addEventListener('click', () => {
        if (profileToEditIndex > -1) {
            profiles[profileToEditIndex].name = editNameInput.value;
            profiles[profileToEditIndex].age = editAgeInput.value;
            safeLocalStorageSet('profiles', JSON.stringify(profiles));
            editProfileModal.classList.add('hidden');
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            profileToEditIndex = -1;
        }
    });

    closeEditModalBtn.addEventListener('click', () => {
        editProfileModal.classList.add('hidden');
    });

    // --- Settings Listeners ---

    settingsFab.addEventListener('click', () => {
        openParentalGate(() => {
            apiKeyInput.value = getApiKey() || ''; // Load existing key into input
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            settingsModal.classList.remove('hidden');
        });
    });

    closeSettingsModalBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    exitToProfileBtn.addEventListener('click', () => {
        openParentalGate(() => {
            mainApp.classList.add('hidden');
            welcomeScreen.classList.remove('hidden');
            currentProfile = null;
            exitToProfileBtn.classList.add('hidden'); // Hide the exit button
        });
    });

    moduleBtns.forEach(btn => {
        btn.addEventListener('click', () => selectModule(btn.dataset.module));
    });

    backBtn.addEventListener('click', () => {
        moduleView.classList.add('hidden');
        moduleSelection.classList.remove('hidden');
    });

    submitAnswersBtn.addEventListener('click', checkAnswers);

    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value;
        if (apiKey) {
            setApiKey(apiKey);
            saveApiKeyBtn.textContent = 'Saved!';
            setTimeout(() => {
                saveApiKeyBtn.textContent = 'Save Key';
            }, 1500);
        }
    });

    // --- Initial Page Load ---
    function initializeApp() {
        if (!getApiKey()) {
            settingsFab.classList.add('pulse');
            setTimeout(() => {
                openParentalGate(() => {
                    settingsModal.classList.remove('hidden');
                });
            }, 1000);
        }
    }

    initializeApp();
});