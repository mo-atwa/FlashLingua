// ==================== Practice Mode ====================
function startPractice() {
  const flashcardElement = document.querySelector(".flashcard");
  if (selectedCategories.length === 0) {
    showPopup("Please select at least one category for practice");
    return;
  }

  // Build the practice pool based on selected categories
  practicePool = [];
  sentences.forEach((sentence, index) => {
    if (
      selectedCategories.includes(sentence.category) ||
      ((!sentence.category || sentence.category === "") &&
        selectedCategories.includes(""))
    ) {
      practicePool.push(index);
      if (flashcardElement) flashcardElement.style.display = "flex";
    }
  });

  if (practicePool.length === 0) {
    showPopup("No sentences found in the selected categories");
    return;
  }

  nextCard();
}

function checkAnswer() {
  const userAnswer = document.getElementById("answerInput");
  const resultMessage = document.getElementById("resultMessage");
  const flashcardSentence = document.getElementById("flashcardSentence");

  if (!userAnswer || !resultMessage || !flashcardSentence) return;

  const answer = userAnswer.value.trim();
  if (answer === currentWord) {
    resultMessage.innerHTML = "Correct! Well done";
    resultMessage.className = "result correct";

    const sentence = sentences[currentIndex].sentence;
    const highlightedSentence = sentence.replace(
      new RegExp(currentWord, "g"),
      `<strong>${currentWord}</strong>`
    );
    flashcardSentence.innerHTML = highlightedSentence;
  } else {
    resultMessage.innerHTML = "Incorrect, try again";
    resultMessage.className = "result incorrect";
  }
}

function showAnswer() {
  const answerInput = document.getElementById("answerInput");
  const resultMessage = document.getElementById("resultMessage");
  const flashcardSentence = document.getElementById("flashcardSentence");

  if (!answerInput || !resultMessage || !flashcardSentence) return;

  answerInput.value = currentWord;
  resultMessage.innerHTML = `The correct answer is: ${currentWord}`;
  resultMessage.className = "result";

  const sentence = sentences[currentIndex].sentence;
  const highlightedSentence = sentence.replace(
    new RegExp(currentWord, "g"),
    `<strong>${currentWord}</strong>`
  );
  flashcardSentence.innerHTML = highlightedSentence;
}

function nextCard() {
  const flashcardSentence = document.getElementById("flashcardSentence");
  const answerInput = document.getElementById("answerInput");
  const resultMessage = document.getElementById("resultMessage");

  if (!flashcardSentence || !answerInput || !resultMessage) return;

  if (practicePool.length === 0) {
    flashcardSentence.innerHTML =
      "No sentences available for practice. Please select categories first.";
    answerInput.disabled = true;
    return;
  }

  answerInput.disabled = false;
  resultMessage.innerHTML = "";
  answerInput.value = "";
  resultMessage.className = "result";

  const randomPoolIndex = Math.floor(Math.random() * practicePool.length);
  currentIndex = practicePool[randomPoolIndex];
  const randomWordIndex = Math.floor(
    Math.random() * sentences[currentIndex].words.length
  );
  currentWord = sentences[currentIndex].words[randomWordIndex].word;
  const translation =
    sentences[currentIndex].words[randomWordIndex].translation;
  const sentence = sentences[currentIndex].sentence;
  const hiddenSentence = sentence.replace(
    new RegExp(currentWord, "g"),
    '<span class="blank"></span>'
  );

  flashcardSentence.innerHTML = `
    ${hiddenSentence}
    <div class="translation">(${translation})</div>
  `;

  if (sentences[currentIndex].imageData) {
    const flashcardImage = document.getElementById("flashcardImage");
    if (flashcardImage) {
      flashcardImage.src = sentences[currentIndex].imageData;
      flashcardImage.style.display = "block";
    }
  }
}

function flashcardClose() {
  practicePool = [];
  const flashcardElement = document.querySelector(".flashcard");
  if (flashcardElement) flashcardElement.style.display = "none";
}

// Setup answer input
function setupAnswerInput() {
  const answerInput = document.getElementById("answerInput");
  if (answerInput) {
    answerInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const resultMessage = document.getElementById("resultMessage");
        if (resultMessage && resultMessage.className === "result correct") {
          nextCard();
        } else {
          checkAnswer();
        }
      }
    });
  }
}

// ==================== Word management functions ====================
let displayedWords = [];

function getAllWords() {
  const allWords = [];
  sentences.forEach((sentence) => {
    sentence.words.forEach((wordObj) => {
      if (!allWords.some((w) => w.word === wordObj.word)) {
        allWords.push(wordObj);
      }
    });
  });
  return allWords;
}

function updateAllWords() {
  allWords = getAllWords();
  displayedWords = [];
}

// Flashcard elements
const flashcardContainer = document.getElementById("flashcard");
const frontContent = document.getElementById("flashcard--content_en");
const backContent = document.getElementById("flashcard--content_es");

// Flashcard control functions
function nextWordFlashcard() {
  if (displayedWords.length === allWords.length) {
    const result = allWords
      .map((item) => `${item.word}: ${item.translation}`)
      .join(",\n");
    console.log(result);
    showPopup(`You have practiced all the words! Refreshing the list...`);
    updateAllWords();
  }

  if (allWords.length === 0) {
    showPopup("No words available for practice");
    return;
  }

  let randomIndex;
  let currentWordObj;

  do {
    randomIndex = Math.floor(Math.random() * allWords.length);
    currentWordObj = allWords[randomIndex];
  } while (displayedWords.includes(currentWordObj));

  displayedWords.push(currentWordObj);

  frontContent.textContent = currentWordObj.word; // Update the front content
  backContent.textContent = currentWordObj.translation;
  flashcardContainer.classList.remove("flipped");

  const flashcardElement = document.querySelector(
    "#WordFlashcards .flip-container"
  );
  if (flashcardElement) {
    flashcardElement.style.display = "flex";
  }

  // Clear the input field when a new word is displayed
  userInputField.value = "";
}

function startWordFlashcards() {
  updateAllWords();
  nextWordFlashcard();
}

function flipCard() {
  flashcardContainer.classList.toggle("flipped");
}

// Event listeners
flashcardContainer.addEventListener("click", flipCard);

function setupCategoryInputListener() {
  const categoryNameInput = document.getElementById("categoryNameInput");
  if (categoryNameInput) {
    categoryNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        createCategory();
      }
    });
  }
}

// Reference to the input field
const userInputField = document.getElementById("userInput");

// Function to check if the input matches the front content
function checkUserInput() {
  const userInput = userInputField.value.trim(); // Get the user's input (trimmed of whitespace)
  const correctWord = frontContent.textContent.trim(); // Get the word on the front of the flashcard

  if (userInput === correctWord) {
    showPopup("Correct! The word matches.");
  } else {
    showPopup(
      `Incorrect. You typed: "${userInput}". The correct word is: "${correctWord}".`
    );
  }

  // Clear the input field after checking
  userInputField.value = "";
}

// Event listener for the Enter key in the input field
userInputField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission or other default behavior
    checkUserInput();
  }
});
