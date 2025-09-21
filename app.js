const profileSelection = document.getElementById('profile-selection');
const profileCreation = document.getElementById('profile-creation');
const mainApp = document.getElementById('main-app');
const profilesContainer = document.getElementById('profiles');
const newProfileBtn = document.getElementById('new-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const welcomeMessage = document.getElementById('welcome-message');
const apiKeyInput = document.getElementById('api-key');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');

// Modal and FAB elements
const settingsFab = document.getElementById('settings-fab');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const parentalGate = document.getElementById('parental-gate');
const apiKeySection = document.getElementById('api-key-section');
const birthYearInput = document.getElementById('birth-year');
const validateBirthYearBtn = document.getElementById('validate-birth-year-btn');

// New module elements
const moduleSelection = document.getElementById('module-selection');
const moduleView = document.getElementById('module-view');
const moduleTitle = document.getElementById('module-title');
const storyContent = document.getElementById('story-content');
const questionsContainer = document.getElementById('questions-container');
const scoreContainer = document.getElementById('score-container');
const scoreDisplay = document.getElementById('score');
const submitAnswersBtn = document.getElementById('submit-answers-btn');
const backBtn = document.getElementById('back-btn');
const moduleBtns = document.querySelectorAll('.module-btn');
const loader = document.querySelector('#module-view .loader');

let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
let currentProfile = null;
let questionsData = [];
const markdownConverter = new showdown.Converter();

function renderProfiles() {
    profilesContainer.innerHTML = '';
    profiles.forEach(profile => {
        const profileElement = document.createElement('div');
        profileElement.classList.add('profile');
        profileElement.textContent = profile.name;
        profileElement.addEventListener('click', () => selectProfile(profile));
        profilesContainer.appendChild(profileElement);
    });
}

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
    
    // Reset view
    storyContent.innerHTML = '';
    questionsContainer.innerHTML = '';
    scoreContainer.classList.add('hidden');
    submitAnswersBtn.classList.add('hidden');
    loader.style.display = 'block';

    const prompt = getPrompt(currentProfile.age, moduleType);

    const result = await generateContent(prompt);
    loader.style.display = 'none';

    try {
        // Clean the response string before parsing
        const cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanedResult);
        questionsData = parsedResult.questions;
        
        storyContent.innerHTML = markdownConverter.makeHtml(parsedResult.story);
        renderQuestions(questionsData);
        submitAnswersBtn.classList.remove('hidden');

    } catch (error) {
        console.error("Failed to parse JSON from API:", error);
        storyContent.textContent = "Oops! Something went wrong. Could not load the module content. Please try again.";
    }
}

function renderQuestions(questions) {
    questionsContainer.innerHTML = '';
    questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.dataset.questionIndex = index;

        const questionHeader = document.createElement('div');
        questionHeader.className = 'question-header';

        const questionNumber = document.createElement('span');
        questionNumber.className = 'question-number';
        questionNumber.textContent = `${index + 1}.`;

        const questionText = document.createElement('p');
        questionText.className = 'question-text';
        questionText.textContent = q.question;

        questionHeader.appendChild(questionNumber);
        questionHeader.appendChild(questionText);
        questionCard.appendChild(questionHeader);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options';

        q.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.dataset.optionIndex = optionIndex;
            optionElement.addEventListener('click', () => {
                // Deselect other options in the same card
                questionCard.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                optionElement.classList.add('selected');
            });
            optionsContainer.appendChild(optionElement);
        });

        questionCard.appendChild(optionsContainer);
        questionsContainer.appendChild(questionCard);
    });
}

submitAnswersBtn.addEventListener('click', () => {
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
        // Disable further clicks
        card.querySelectorAll('.option').forEach(opt => opt.style.pointerEvents = 'none');
    });

    scoreDisplay.textContent = `${score} / ${questionsData.length}`;
    scoreContainer.classList.remove('hidden');
    submitAnswersBtn.classList.add('hidden');
});


moduleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectModule(btn.dataset.module);
    });
});

backBtn.addEventListener('click', () => {
    moduleView.classList.add('hidden');
    moduleSelection.classList.remove('hidden');
});


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
    }
});

saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    if (apiKey) {
        setApiKey(apiKey);
        // Visual confirmation instead of alert
        saveApiKeyBtn.textContent = 'Saved!';
        setTimeout(() => {
            settingsModal.classList.add('hidden');
            saveApiKeyBtn.textContent = 'Save Key'; // Reset button text
        }, 1000);
    }
});

// --- Modal and Parental Gate Logic ---

// Show the modal when the settings button is clicked
settingsFab.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    // Always reset to the parental gate when opening
    parentalGate.classList.remove('hidden');
    apiKeySection.classList.add('hidden');
    birthYearInput.value = '';
});

// Hide the modal when the close button is clicked
closeModalBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// Hide the modal if the user clicks on the background overlay
settingsModal.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Validate the birth year to show the API key section
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

// --- Initial Page Load ---
renderProfiles();

// Explicitly ensure the modal is hidden when the script first runs.
settingsModal.classList.add('hidden');