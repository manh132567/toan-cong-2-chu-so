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
let difficultyLevel = 1;

const arrCorrect = [
  "Giỏi quá!",
  "ối dồi ôi! Quá là giỏi luôn",
  "Ghê đấy",
  "Kinh rứa chài",
  "Đúng đúng đúng",
  "Rất là tốt!",
  "Phờ Rồ lun!",
  "Quá đẳng cấp",
  "Cứ thế tiếp tục nhé!",
  "10 điểm",
  "Con ai mà giỏi thế!",
];

//
let correctPool = [];
let correctIndex = 0;
let lastCorrectMessage = null;

// function speak(text) {
//   if (!("speechSynthesis" in window)) return;

//   speechSynthesis.cancel();

//   const voices = speechSynthesis.getVoices();

//   const utterance = new SpeechSynthesisUtterance(text);

//   utterance.lang = "vi-VN";
//   utterance.rate = 1;
//   utterance.pitch = 1.8;
//   utterance.volume = 1;

//   const vietnameseVoice = voices.find(
//     voice => voice.lang.includes("vi")
//   );

//   if (vietnameseVoice) {
//     utterance.voice = vietnameseVoice;
//   }

//   speechSynthesis.speak(utterance);
// }

function speak(text, isWrong = false) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();

  utterance.lang = "vi-VN";
  utterance.volume = 1;

  // if (isWrong) {
  //   // Giọng nhẹ nhàng động viên
  //   utterance.rate = 0.9;
  //   utterance.pitch = 1.2;
  // } else {
  //   // Giọng vui vẻ, đáng yêu
  //   utterance.rate = 1.15;
  //   utterance.pitch = 2;
  // }
  if (isWrong) {
    // Hugry voice
    utterance.rate = 0.95;
    utterance.pitch = 1.3;
  } else {
    // Happy voice
    utterance.rate = 1.15;
    utterance.pitch = 2;
  }

  // Ưu tiên giọng nữ tiếng Việt
  const femaleVoice =
    voices.find(
      (v) =>
        v.lang.includes("vi") &&
        (v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("female voice")),
    ) || voices.find((v) => v.lang.includes("vi"));

  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  speechSynthesis.speak(utterance);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  // Chế độ 1 chữ số
  if (digitMode === 1) {
    const a = randomInt(1, 9);
    const b = randomInt(1, 9);

    return {
      a,
      b,
      answer: a + b,
    };
  }

  // Chế độ 2 chữ số - tăng độ khó từ từ
  let a;
  let b;

  // Mức 1: rất dễ (1 số + 2 số nhỏ)
  if (difficultyLevel <= 3) {
    a = randomInt(1, 9);
    b = randomInt(10, 20);
  }
  // Mức 2
  else if (difficultyLevel <= 6) {
    a = randomInt(10, 20);
    b = randomInt(1, 9);
  }
  // Mức 3
  else if (difficultyLevel <= 10) {
    a = randomInt(10, 20);
    b = randomInt(10, 20);
  }
  // Mức 4
  else if (difficultyLevel <= 15) {
    a = randomInt(15, 30);
    b = randomInt(1, 15);
  }
  // Mức 5
  else if (difficultyLevel <= 20) {
    a = randomInt(15, 35);
    b = randomInt(10, 25);
  }
  // Mức 6
  else if (difficultyLevel <= 30) {
    a = randomInt(20, 50);
    b = randomInt(15, 35);
  }
  // Mức 7
  else if (difficultyLevel <= 40) {
    a = randomInt(30, 70);
    b = randomInt(20, 50);
  }
  // Mức tối đa
  else {
    a = randomInt(10, 99);
    b = randomInt(10, 99);
  }

  return {
    a,
    b,
    answer: a + b,
  };
}

function resetScore() {
  correctCount = 0;
  wrongCount = 0;
  difficultyLevel = 1;

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

    if (candidate >= 0 && candidate !== correct) {
      wrong.add(candidate);
    }
  }

  return Array.from(wrong);
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
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

    button.addEventListener("click", () => {
      handleAnswer(choice, button);
    });

    optionsEl.appendChild(button);
  });
}

function getNextCorrectMessage() {
  if (correctPool.length === 0 || correctIndex >= correctPool.length) {
    do {
      correctPool = shuffle(arrCorrect);
    } while (
      arrCorrect.length > 1 &&
      correctPool[0] === lastCorrectMessage
    );

    correctIndex = 0;
  }

  const message = correctPool[correctIndex++];

  lastCorrectMessage = message;

  return message;
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
    correctCount++;

    // Cứ 3 câu đúng tăng 1 cấp
    difficultyLevel = Math.floor(correctCount / 3) + 1;

    correctCountEl.textContent = correctCount;

    button.classList.add("selected-correct");

    // Lấy message tiếp theo
    const randomCorrect = getNextCorrectMessage();

    feedbackEl.textContent = "🎉 " + randomCorrect;
    feedbackEl.className = "feedback correct";
    speak(randomCorrect);
  } else {
    wrongCount++;

    wrongCountEl.textContent = wrongCount;

    button.classList.add("selected-wrong");

    feedbackEl.textContent = `😊 Chưa đúng! Đáp án là ${currentAnswer}`;
    feedbackEl.className = "feedback wrong";
    const isWrong = true;
    speak("Chưa đúng! Đáp án là " + currentAnswer, isWrong);
  }

  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", renderQuestion);

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setDigitMode(Number(btn.dataset.mode));
  });
});

renderQuestion();
