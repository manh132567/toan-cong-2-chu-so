const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const correctCountEl = document.getElementById("correct-count");
const wrongCountEl = document.getElementById("wrong-count");
const modeButtons = document.querySelectorAll(".mode-btn");

let digitMode = 1;
let correctCount = 0;
let wrongCount = 0;
let currentAnswer = 0;
let answered = false;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const useTwoDigits = digitMode === 2;
  const a = useTwoDigits ? randomInt(10, 99) : randomInt(1, 9);
  const b = useTwoDigits ? randomInt(10, 99) : randomInt(1, 9);

  return { a, b, answer: a + b };
}

function resetScore() {
  correctCount = 0;
  wrongCount = 0;
  correctCountEl.textContent = "0";
  wrongCountEl.textContent = "0";
}

function setDigitMode(mode) {
  if (digitMode === mode) return;

  digitMode = mode;
  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.mode) === mode);
  });

  resetScore();
  renderQuestion();
}

function generateWrongAnswers(correct) {
  const wrong = new Set();

  while (wrong.size < 2) {
    const offset = randomInt(1, 10) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = correct + offset;

    if (candidate >= 0 && candidate !== correct && !wrong.has(candidate)) {
      wrong.add(candidate);
    }
  }

  return Array.from(wrong);
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function renderQuestion() {
  const { a, b, answer } = generateQuestion();
  currentAnswer = answer;
  answered = false;

  questionEl.textContent = `${a} + ${b} = ?`;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.classList.add("hidden");

  const choices = shuffle([answer, ...generateWrongAnswers(answer)]);
  optionsEl.innerHTML = "";

  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.textContent = choice;
    button.addEventListener("click", () => handleAnswer(choice, button));
    optionsEl.appendChild(button);
  });
}

function handleAnswer(selected, button) {
  if (answered) return;
  answered = true;

  const buttons = optionsEl.querySelectorAll(".option-btn");
  buttons.forEach((btn) => {
    btn.disabled = true;

    if (Number(btn.textContent) === currentAnswer) {
      btn.classList.add("reveal-correct");
    }
  });

  if (selected === currentAnswer) {
    correctCount += 1;
    correctCountEl.textContent = correctCount;
    button.classList.add("selected-correct");
    feedbackEl.textContent = "🎉 Giỏi quá! Đúng rồi!";
    feedbackEl.className = "feedback correct";
  } else {
    wrongCount += 1;
    wrongCountEl.textContent = wrongCount;
    button.classList.add("selected-wrong");
    feedbackEl.textContent = `😊 Chưa đúng! Đáp án là ${currentAnswer}`;
    feedbackEl.className = "feedback wrong";
  }

  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", renderQuestion);

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setDigitMode(Number(btn.dataset.mode)));
});

renderQuestion();
