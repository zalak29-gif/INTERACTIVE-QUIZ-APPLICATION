"use strict";

const QUESTION_TIME = 15;
const BASE_POINTS = 10;
const SCORE_STORE_KEY = "quiz_universe_scores";

const config = window.GENRE_CONFIG;
if (!config) {
  throw new Error("GENRE_CONFIG missing.");
}

const genreTitle = document.getElementById("genreTitle");
const genreSubtitle = document.getElementById("genreSubtitle");
const subcategoryChips = document.getElementById("subcategoryChips");
const currentSubcategoryText = document.getElementById("currentSubcategoryText");
const questionText = document.getElementById("questionText");
const answersContainer = document.getElementById("answersContainer");
const feedbackText = document.getElementById("feedbackText");
const statusText = document.getElementById("statusText");
const nextBtn = document.getElementById("nextBtn");
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("scoreText");
const accuracyText = document.getElementById("accuracyText");
const timerText = document.getElementById("timerText");
const progressFill = document.getElementById("progressFill");
const resultCard = document.getElementById("resultCard");
const quizCard = document.getElementById("quizCard");
const finalScoreText = document.getElementById("finalScoreText");
const resultStats = document.getElementById("resultStats");
const finalMessageText = document.getElementById("finalMessageText");
const restartBtn = document.getElementById("restartBtn");
const pickSubcategoryBtn = document.getElementById("pickSubcategoryBtn");

let subcategoryBank = {};
let activeSubcategory = "";
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredCount = 0;
let correctCount = 0;
let incorrectCount = 0;
let timeoutCount = 0;
let answerLocked = true;
let countdown = QUESTION_TIME;
let timerId = null;

function setStatus(message, variant) {
  statusText.textContent = message || "";
  statusText.className = "status-text";
  if (variant) statusText.classList.add(variant);
}

function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildShuffledQuiz(questions) {
  const shuffledQuestions = shuffleArray(questions);
  return shuffledQuestions.map((q) => {
    const answersWithIndex = q.answers.map((answer, index) => ({ answer, index }));
    const shuffledAnswers = shuffleArray(answersWithIndex);
    const remappedCorrectIndex = shuffledAnswers.findIndex((item) => item.index === q.correctIndex);
    return {
      question: q.question,
      answers: shuffledAnswers.map((item) => item.answer),
      correctIndex: remappedCorrectIndex
    };
  });
}

function isValidQuestion(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.question !== "string" || item.question.trim().length === 0) return false;
  if (!Array.isArray(item.answers) || item.answers.length < 2) return false;
  if (!Number.isInteger(item.correctIndex)) return false;
  if (item.correctIndex < 0 || item.correctIndex >= item.answers.length) return false;
  return item.answers.every((answer) => typeof answer === "string" && answer.trim().length > 0);
}

function normalizeSubcategories(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const normalized = {};
  Object.keys(raw).forEach((key) => {
    const valid = Array.isArray(raw[key]) ? raw[key].filter(isValidQuestion) : [];
    if (valid.length > 0) normalized[key] = valid;
  });
  return normalized;
}

function updateTimerUI() {
  timerText.textContent = `Time: ${countdown}s`;
  timerText.classList.remove("warning", "danger");
  if (countdown <= 5) timerText.classList.add("danger");
  else if (countdown <= 9) timerText.classList.add("warning");
}

function updateLiveStats() {
  scoreText.textContent = `Score: ${score} pts`;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  accuracyText.textContent = `Accuracy: ${accuracy}%`;
}

function showSelectionState() {
  clearTimer();
  answerLocked = true;
  questionText.textContent = "Select a subcategory to start the quiz.";
  answersContainer.innerHTML = "";
  feedbackText.textContent = "";
  setStatus("");
  progressText.textContent = "Question 0 / 0";
  scoreText.textContent = "Score: 0 pts";
  accuracyText.textContent = "Accuracy: 0%";
  timerText.textContent = `Time: ${QUESTION_TIME}s`;
  progressFill.style.width = "0%";
  nextBtn.disabled = true;
  nextBtn.textContent = "Next Question";
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
}

function startTimer() {
  clearTimer();
  countdown = QUESTION_TIME;
  updateTimerUI();
  timerId = setInterval(() => {
    countdown -= 1;
    updateTimerUI();
    if (countdown <= 0) {
      clearTimer();
      handleTimeout();
    }
  }, 1000);
}

function loadQuestion() {
  answerLocked = false;
  const currentQuestion = quizData[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  progressText.textContent = `Question ${currentQuestionIndex + 1} / ${quizData.length}`;
  updateLiveStats();
  progressFill.style.width = `${(currentQuestionIndex / quizData.length) * 100}%`;
  feedbackText.textContent = "";
  feedbackText.className = "feedback-text";
  setStatus("");
  answersContainer.innerHTML = "";

  currentQuestion.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-btn";
    button.textContent = answer;
    button.addEventListener("click", () => handleAnswer(index, button));
    answersContainer.appendChild(button);
  });

  nextBtn.disabled = true;
  nextBtn.textContent = currentQuestionIndex === quizData.length - 1 ? "Finish Quiz" : "Next Question";
  startTimer();
}

function handleAnswer(selectedIndex, selectedButton) {
  if (answerLocked) return;
  answerLocked = true;
  clearTimer();
  answeredCount += 1;

  const currentQuestion = quizData[currentQuestionIndex];
  const buttons = answersContainer.querySelectorAll(".answer-btn");
  const isCorrect = selectedIndex === currentQuestion.correctIndex;

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === currentQuestion.correctIndex) button.classList.add("correct");
  });

  if (isCorrect) {
    correctCount += 1;
    const earnedPoints = BASE_POINTS + countdown;
    score += earnedPoints;
    selectedButton.classList.add("correct");
    feedbackText.textContent = `Correct! +${earnedPoints} pts`;
    feedbackText.classList.add("correct");
  } else {
    incorrectCount += 1;
    selectedButton.classList.add("wrong");
    feedbackText.textContent = "Incorrect. Correct answer highlighted.";
    feedbackText.classList.add("wrong");
  }

  updateLiveStats();
  nextBtn.disabled = false;
}

function handleTimeout() {
  if (answerLocked) return;
  answerLocked = true;
  answeredCount += 1;
  timeoutCount += 1;

  const currentQuestion = quizData[currentQuestionIndex];
  const buttons = answersContainer.querySelectorAll(".answer-btn");
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === currentQuestion.correctIndex) button.classList.add("correct");
  });

  feedbackText.textContent = "Time up. Tap Next.";
  feedbackText.classList.add("wrong");
  updateLiveStats();
  nextBtn.disabled = false;
}

function showResults() {
  clearTimer();
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  progressFill.style.width = "100%";

  const maxScore = quizData.length * (BASE_POINTS + QUESTION_TIME);
  const percent = Math.round((correctCount / quizData.length) * 100);
  finalScoreText.textContent = `You scored ${score} / ${maxScore} points (${percent}% correct).`;
  resultStats.innerHTML = `
    <p><strong>Genre:</strong> ${config.name}</p>
    <p><strong>Subcategory:</strong> ${activeSubcategory}</p>
    <p><strong>Correct:</strong> ${correctCount}</p>
    <p><strong>Incorrect:</strong> ${incorrectCount}</p>
    <p><strong>Timed out:</strong> ${timeoutCount}</p>
  `;

  if (percent === 100) finalMessageText.textContent = "Perfect run.";
  else if (percent >= 70) finalMessageText.textContent = "Great job.";
  else if (percent >= 40) finalMessageText.textContent = "Good effort.";
  else finalMessageText.textContent = "Try another round.";

  persistScore({
    genreKey: config.genreKey || "unknown",
    genreName: config.name,
    subcategory: activeSubcategory,
    score,
    percent
  });
}

function persistScore(entry) {
  try {
    const raw = localStorage.getItem(SCORE_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const safeStore = store && typeof store === "object" ? store : {};
    const key = `${entry.genreKey}::${entry.subcategory}`;
    const prev = safeStore[key] || {
      genreName: entry.genreName,
      subcategory: entry.subcategory,
      attempts: 0,
      bestScore: 0,
      bestPercent: 0,
      lastPlayed: null
    };

    safeStore[key] = {
      genreName: entry.genreName,
      subcategory: entry.subcategory,
      attempts: Number(prev.attempts || 0) + 1,
      bestScore: Math.max(Number(prev.bestScore || 0), Number(entry.score || 0)),
      bestPercent: Math.max(Number(prev.bestPercent || 0), Number(entry.percent || 0)),
      lastPlayed: new Date().toISOString()
    };

    localStorage.setItem(SCORE_STORE_KEY, JSON.stringify(safeStore));
  } catch (error) {
    // Ignore localStorage failures to avoid blocking gameplay.
  }
}

function goToNextQuestion() {
  if (!answerLocked) return;
  currentQuestionIndex += 1;
  if (currentQuestionIndex < quizData.length) loadQuestion();
  else showResults();
}

function renderSubcategoryChips() {
  subcategoryChips.innerHTML = "";
  Object.keys(subcategoryBank).forEach((subcategory) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "subcategory-chip";
    chip.textContent = subcategory;
    chip.dataset.subcategory = subcategory;
    chip.addEventListener("click", () => startSubcategory(subcategory));
    subcategoryChips.appendChild(chip);
  });
}

function startSubcategory(subcategory) {
  const sourceQuestions = subcategoryBank[subcategory];
  if (!sourceQuestions || sourceQuestions.length === 0) return;

  activeSubcategory = subcategory;
  currentSubcategoryText.textContent = `Subcategory: ${subcategory}`;
  subcategoryChips.querySelectorAll(".subcategory-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.subcategory === subcategory);
  });

  quizData = buildShuffledQuiz(sourceQuestions);
  currentQuestionIndex = 0;
  score = 0;
  answeredCount = 0;
  correctCount = 0;
  incorrectCount = 0;
  timeoutCount = 0;
  answerLocked = false;
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
  loadQuestion();
}

nextBtn.addEventListener("click", goToNextQuestion);
restartBtn.addEventListener("click", () => startSubcategory(activeSubcategory));
pickSubcategoryBtn.addEventListener("click", showSelectionState);

async function bootstrap() {
  genreTitle.textContent = config.name;
  genreSubtitle.textContent = config.subtitle;
  showSelectionState();
  setStatus("Loading subcategories...");

  try {
    subcategoryBank = normalizeSubcategories(config.questionBank);

    if (Object.keys(subcategoryBank).length === 0) {
      throw new Error("No valid subcategory questions.");
    }

    renderSubcategoryChips();
    setStatus("Choose a subcategory to start.");
  } catch (error) {
    setStatus("Failed to load this genre data.", "error");
  }
}

bootstrap();
