// This file handles all DOM manipulation and UI updates for SparkLearn.

const profilesContainer = document.getElementById('profiles');
const storyContent = document.getElementById('story-content');
const questionsContainer = document.getElementById('questions-container');
const scoreContainer = document.getElementById('score-container');
const scoreDisplay = document.getElementById('score');
const submitAnswersBtn = document.getElementById('submit-answers-btn');
const loader = document.querySelector('#module-view .loader');
const markdownConverter = new showdown.Converter();

export function renderProfiles(profiles, selectProfileCallback) {
    profilesContainer.innerHTML = '';
    profiles.forEach(profile => {
        const profileElement = document.createElement('div');
        profileElement.classList.add('profile');
        profileElement.textContent = profile.name;
        profileElement.addEventListener('click', () => selectProfileCallback(profile));
        profilesContainer.appendChild(profileElement);
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
