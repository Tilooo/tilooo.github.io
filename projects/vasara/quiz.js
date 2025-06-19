document.addEventListener('DOMContentLoaded', () => {
    // --- QUIZ ELEMENTS ---
    const quizContainer = document.querySelector('.quiz-container');
    const quizQuestionEl = document.querySelector('.quiz-question p');
    const quizOptionsEl = document.querySelector('.quiz-options');
    const quizSubmitBtn = document.querySelector('.quiz-submit');
    const quizProgressEl = document.querySelector('.quiz-progress');

    // The results container
    const quizResultsEl = document.createElement('div');
    quizResultsEl.classList.add('quiz-results');
    quizResultsEl.style.display = 'none'; // Initially hidden
    quizContainer.appendChild(quizResultsEl);

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let answerSelected = false;

    // --- FUNCTIONS ---

    // Fetches questions from the JSON file
    async function fetchQuestions() {
        try {
            const response = await fetch('quiz-questions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            questions = await response.json();
            loadQuestion();
        } catch (error) {
            quizQuestionEl.textContent = 'Failed to load quiz questions.';
            console.error('Error fetching quiz questions:', error);
        }
    }

    // Loads the current question and its options
    function loadQuestion() {
        resetState();
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        quizQuestionEl.textContent = currentQuestion.question;

        // Shuffles options for variety
        const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach(optionText => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('quiz-option');
            optionDiv.textContent = optionText;
            optionDiv.addEventListener('click', selectOption);
            quizOptionsEl.appendChild(optionDiv);
        });

        quizProgressEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        quizSubmitBtn.textContent = 'Submit Answer';
        quizSubmitBtn.disabled = true; // Disables until an option is selected
    }

    // Resets the state for the next question
    function resetState() {
        quizOptionsEl.innerHTML = '';
        answerSelected = false;
        quizSubmitBtn.disabled = false;
        quizOptionsEl.classList.remove('answered');
    }

    // Handles the selection of an option
    function selectOption(e) {
        if (answerSelected) return; // Prevents changing selection after submit

        const selectedOption = e.target;
        // Removes 'selected' from any other option
        Array.from(quizOptionsEl.children).forEach(child => child.classList.remove('selected'));
        // Adds 'selected' to the clicked option
        selectedOption.classList.add('selected');
        quizSubmitBtn.disabled = false; // Enables submit button
    }

    // Handles the submit button click
    function handleSubmit() {
        if (quizSubmitBtn.textContent.includes('Next') || quizSubmitBtn.textContent.includes('Results')) {
            currentQuestionIndex++;
            loadQuestion();
            return;
        }

        const selectedOption = quizOptionsEl.querySelector('.quiz-option.selected');
        if (!selectedOption) return;

        answerSelected = true;
        quizOptionsEl.classList.add('answered'); // Disables pointer events via CSS
        const correctAnswer = questions[currentQuestionIndex].answer;

        if (selectedOption.textContent === correctAnswer) {
            selectedOption.classList.add('correct');
            score++;
        } else {
            selectedOption.classList.add('incorrect');
            // Highlights the correct answer for learning
            Array.from(quizOptionsEl.children).forEach(option => {
                if (option.textContent === correctAnswer) {
                    option.classList.add('correct');
                }
            });
        }

        // Changes button text for the next action
        if (currentQuestionIndex < questions.length - 1) {
            quizSubmitBtn.textContent = 'Next Question';
        } else {
            quizSubmitBtn.textContent = 'Show Results';
        }
    }

    // Displays the final results
    function showResults() {
        // Hides the main quiz elements
        quizQuestionEl.style.display = 'none';
        quizOptionsEl.style.display = 'none';
        quizSubmitBtn.style.display = 'none';
        quizProgressEl.style.display = 'none';

        const percentage = Math.round((score / questions.length) * 100);
        quizResultsEl.innerHTML = `
            <i class="fas fa-trophy"></i>
            <h2>Quiz Complete!</h2>
            <p>You scored ${score} out of ${questions.length} (${percentage}%)</p>
            <button class="quiz-restart">Restart Quiz</button>
        `;
        quizResultsEl.style.display = 'flex';

        document.querySelector('.quiz-restart').addEventListener('click', restartQuiz);
    }

    // Restarts the quiz
    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizResultsEl.style.display = 'none';

        // Shows the main quiz elements again
        quizQuestionEl.style.display = 'block';
        quizOptionsEl.style.display = 'flex';
        quizSubmitBtn.style.display = 'block';
        quizProgressEl.style.display = 'block';

        loadQuestion();
    }

    // --- EVENT LISTENERS ---
    quizSubmitBtn.addEventListener('click', handleSubmit);

    // --- INITIALIZE QUIZ ---
    fetchQuestions();
});