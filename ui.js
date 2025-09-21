// This file handles all DOM manipulation and UI updates for SparkLearn.

const profilesListSettings = document.getElementById('profiles-list-settings');
const profilesListKids = document.getElementById('profiles-list-kids');
const storyContent = document.getElementById('story-content');
const questionsContainer = document.getElementById('questions-container');
const scoreContainer = document.getElementById('score-container');
const scoreDisplay = document.getElementById('score');
const submitAnswersBtn = document.getElementById('submit-answers-btn');
const loader = document.querySelector('#module-view .loader');
const markdownConverter = new showdown.Converter();

export function renderProfilesForSettings(profiles, editProfileCallback, deleteProfileCallback) {
    profilesListSettings.innerHTML = '';
    profiles.forEach((profile, index) => {
        const profileElement = document.createElement('div');
        profileElement.className = 'profile';
        
        const profileName = document.createElement('span');
        profileName.textContent = `${profile.name} (Age: ${profile.age})`;
        profileElement.appendChild(profileName);

        const menu = document.createElement('div');
        menu.className = 'profile-menu';

        const editBtn = document.createElement('button');
        editBtn.className = 'profile-menu-btn edit-btn';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', () => editProfileCallback(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'profile-menu-btn delete-btn';
        deleteBtn.textContent = '✖️';
        deleteBtn.addEventListener('click', () => deleteProfileCallback(index));

        menu.appendChild(editBtn);
        menu.appendChild(deleteBtn);
        profileElement.appendChild(menu);
        profilesListSettings.appendChild(profileElement);
    });
}

export function renderProfilesForKids(profiles, selectProfileCallback) {
    profilesListKids.innerHTML = '';
    profiles.forEach(profile => {
        const profileElement = document.createElement('div');
        profileElement.className = 'profile';
        profileElement.textContent = profile.name;
        profileElement.addEventListener('click', () => selectProfileCallback(profile));
        profilesListKids.appendChild(profileElement);
    });
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
                questionCard.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                optionElement.classList.add('selected');
            });
            optionsContainer.appendChild(optionElement);
        });

        questionCard.appendChild(optionsContainer);
        questionsContainer.appendChild(questionCard);
    });
}

export function displayModuleContent(parsedResult) {
    storyContent.innerHTML = markdownConverter.makeHtml(parsedResult.story);
    renderQuestions(parsedResult.questions);
    submitAnswersBtn.classList.remove('hidden');
}

export function displayError(message) {
    storyContent.textContent = message;
}

export function showLoader() {
    loader.style.display = 'block';
}

export function hideLoader() {
    loader.style.display = 'none';
}

export function resetModuleView() {
    storyContent.innerHTML = '';
    questionsContainer.innerHTML = '';
    scoreContainer.classList.add('hidden');
    submitAnswersBtn.classList.add('hidden');
}

export function updateScore(score, total) {
    scoreDisplay.textContent = `${score} / ${total}`;
    scoreContainer.classList.remove('hidden');
    submitAnswersBtn.classList.add('hidden');
}
