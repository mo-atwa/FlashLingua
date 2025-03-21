// Global variables
let sentences = [];
let categories = [];
let currentIndex = -1;
let currentWord = "";
let selectedWords = [];
let selectedCategories = [];
let practicePool = [];

// Open tab functionality
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  // Hide all tab contents
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  // Remove "active" class from all tab links
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  // Show the selected tab content and mark it as active
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  // Update specific tabs based on their name
  if (tabName === "Practice") {
    updatePracticeCategories();
  } else if (tabName === "Add") {
    selectedWords = [];
    updateSelectedWords();
    updateCategorySelect();
    selectLastCategory();
  } else if (tabName === "Categories") {
    updateCategoryList();
  }
}

// Add a word to the selected words list
function addWord() {
  const word = document.getElementById("wordInput").value.trim();
  if (word === "") {
    alert("Please enter a word");
    return;
  }
  const sentence = document.getElementById("sentenceInput").value.trim();
  if (sentence === "") {
    alert("Please enter the sentence first");
    return;
  }
  if (!sentence.includes(word)) {
    alert("The sentence must contain the selected word");
    return;
  }
  if (selectedWords.includes(word)) {
    alert("This word is already added");
    return;
  }
  selectedWords.push(word);
  document.getElementById("wordInput").value = "";
  updateSelectedWords();
}

// Update the display of selected words
function updateSelectedWords() {
  const container = document.getElementById("selectedWords");
  container.innerHTML = "";
  selectedWords.forEach((word, index) => {
    const chip = document.createElement("span");
    chip.className = "word-chip";
    chip.textContent = word;
    chip.onclick = function () {
      selectedWords.splice(index, 1);
      updateSelectedWords();
    };
    container.appendChild(chip);
  });
}

// Add new category
let categoryInput = document.getElementById("newCategoryInput");
function addNewCategory() {
  const categoryName = categoryInput.value.trim();
  if (categoryName === "") {
    alert("Please enter a category name");
    return;
  }
  if (categories.some((cat) => cat.name === categoryName)) {
    alert("This category already exists");
    return;
  }
  categories.push({
    id: Date.now().toString(),
    name: categoryName,
  });
  saveCategories();
  updateCategorySelect();
  selectLastCategory();
  categoryInput.value = "";
}

// Focus to the input sentence field
function focusSentenceInput() {
  const sentence = document.getElementById("sentenceInput");
  const newCategoryInput = document.getElementById("newCategoryInput");
  newCategoryInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      sentence.focus();
      sentence.value = "";
    }
  });
}
focusSentenceInput();

function addInputOnEnter(inputElement, addCategoryFunction) {
  inputElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      addCategoryFunction();
    }
  });
}
addInputOnEnter(categoryInput, addNewCategory);
addInputOnEnter(document.getElementById("wordInput"), addWord);

// Add input functionality on pressing Enter key
function addInputOnEnter(inputElement, addFunction) {
  inputElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      addFunction();
    }
  });
}

// Create a new category
function createCategory() {
  const categoryName = document
    .getElementById("categoryNameInput")
    .value.trim();
  if (categoryName === "") {
    alert("Please enter a category name");
    return;
  }
  if (categories.some((cat) => cat.name === categoryName)) {
    alert("This category already exists");
    return;
  }
  categories.push({
    id: Date.now().toString(),
    name: categoryName,
  });
  document.getElementById("categoryNameInput").value = "";
  saveCategories();
  updateCategoryList();
  updateCategorySelect();
}

// Add event listener for Enter key
document
  .getElementById("categoryNameInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      createCategory();
    }
  });

// Add a new category option to the dropdown
function addCategoryOption() {
  const categoryInput = document.getElementById("categoryInput").value.trim();
  if (categoryInput === "") {
    alert("Please enter a category name");
    return;
  }
  const categorySelect = document.getElementById("categorySelect");
  const existingCategories = Array.from(categorySelect.options).map(
    (opt) => opt.value
  );
  if (!existingCategories.includes(categoryInput)) {
    const newOption = document.createElement("option");
    newOption.value = categoryInput;
    newOption.textContent = categoryInput;
    categorySelect.appendChild(newOption);
  }
  // Save the last added category in localStorage
  localStorage.setItem("lastSelectedCategory", categoryInput);
  // Set the newly added category as the selected value
  categorySelect.value = categoryInput; // Fixed the issue here
  document.getElementById("categoryInput").value = ""; // Clear the input field
}

// Load the last selected category from localStorage
function loadLastSelectedCategory() {
  const categorySelect = document.getElementById("categorySelect");
  const lastCategory = localStorage.getItem("lastSelectedCategory");
  if (lastCategory) {
    categorySelect.value = lastCategory;
  }
}
// Call the function when the page loads
window.addEventListener("DOMContentLoaded", loadLastSelectedCategory);

// Delete a category
function deleteCategory(id) {
  const categoryIndex = categories.findIndex((cat) => cat.id === id);
  if (categoryIndex === -1) return;
  const categoryName = categories[categoryIndex].name;

  // Check if any sentences use this category
  const sentencesInCategory = sentences.filter(
    (s) => s.category === categoryName
  );
  if (sentencesInCategory.length > 0) {
    if (
      confirm(
        `This category contains ${sentencesInCategory.length} sentences. Are you sure you want to delete it? All sentences in this category will also be deleted.`
      )
    ) {
      // Remove sentences in this category
      sentences = sentences.filter(
        (sentence) => sentence.category !== categoryName
      );
      saveSentences();
    } else {
      return;
    }
  }
  categories.splice(categoryIndex, 1);
  saveCategories();
  updateCategoryList();
  updateCategorySelect();
  updatePracticeCategories();
}

// Update the category dropdown
function updateCategorySelect() {
  const select = document.getElementById("categorySelect");
  select.innerHTML = '<option value="">-- Select Category --</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

// Update the category list display
function updateCategoryList() {
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = "";
  categories.forEach((category) => {
    const categoryItem = document.createElement("div");
    categoryItem.className = "category-item";

    // Create an element containing the category name with a toggle button for sentences
    categoryItem.innerHTML = `
      <span onclick="toggleWordList('${category.id}')" style="cursor: pointer; width: 100%;">
        ${category.name} <span class="category-count">${
      sentences.filter((s) => s.category === category.name).length
    }</span>
      </span>
      <button onclick="deleteCategory('${category.id}')">Delete</button>
    `;
    categoryList.appendChild(categoryItem);

    // Create a list of sentences for this category
    const wordList = document.createElement("div");
    wordList.id = `wordList-${category.id}`;
    wordList.className = "word-list";
    const filteredSentences = sentences.filter(
      (s) => s.category === category.name
    );
    if (filteredSentences.length === 0) {
      wordList.innerHTML = "<p>No sentences in this category</p>";
    } else {
      filteredSentences.forEach((item, index) => {
        const wordItem = document.createElement("div");
        wordItem.className = "word-item";
        let sentenceHtml = item.sentence;
        item.words.forEach((word) => {
          sentenceHtml = sentenceHtml.replace(
            new RegExp(word, "g"),
            "<strong>" + word + "</strong>"
          );
        });
        wordItem.innerHTML = `
          <span>
            ${sentenceHtml}<br>
            <small>(Words: ${item.words.join(", ")})</small>
          </span>
          <button onclick="deleteSentence(${index})">Delete</button>
        `;
        wordList.appendChild(wordItem);
      });
    }
    categoryList.appendChild(wordList);
  });
  if (categories.length === 0) {
    categoryList.innerHTML = "<p>No categories created yet</p>";
  }
}

// Toggle the visibility of the word list for a category
function toggleWordList(categoryId) {
  const wordList = document.getElementById(`wordList-${categoryId}`);
  if (wordList.style.display === "none" || wordList.style.display === "") {
    wordList.style.display = "block";
  } else {
    wordList.style.display = "none";
  }
}

// Update the practice categories checkboxes
function updatePracticeCategories() {
  const container = document.getElementById("practiceCategories");
  container.innerHTML = "";

  categories.forEach((category) => {
    const sentenceCount = sentences.filter(
      (s) => s.category === category.name
    ).length;
    if (sentenceCount > 0) {
      const label = document.createElement("label");
      label.className = "category-label";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "category-checkbox";
      checkbox.value = category.name;
      checkbox.checked = selectedCategories.includes(category.name);
      checkbox.onchange = function () {
        if (this.checked) {
          if (!selectedCategories.includes(category.name)) {
            selectedCategories.push(category.name);
          }
        } else {
          const index = selectedCategories.indexOf(category.name);
          if (index !== -1) {
            selectedCategories.splice(index, 1);
          }
        }
        updateFilterInfo();
      };
      label.appendChild(checkbox);
      label.appendChild(
        document.createTextNode(`${category.name} (${sentenceCount})`)
      );
      container.appendChild(label);
    }
  });

  // Add an option for uncategorized sentences
  const uncategorizedCount = sentences.filter(
    (s) => !s.category || s.category === ""
  ).length;
  if (uncategorizedCount > 0) {
    const label = document.createElement("label");
    label.className = "category-label";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "category-checkbox";
    checkbox.value = "";
    checkbox.checked = selectedCategories.includes("");
    checkbox.onchange = function () {
      if (this.checked) {
        if (!selectedCategories.includes("")) {
          selectedCategories.push("");
        }
      } else {
        const index = selectedCategories.indexOf("");
        if (index !== -1) {
          selectedCategories.splice(index, 1);
        }
      }
      updateFilterInfo();
    };
    label.appendChild(checkbox);
    label.appendChild(
      document.createTextNode(`Uncategorized (${uncategorizedCount})`)
    );
    container.appendChild(label);
  }
  updateFilterInfo();
}

/*
    
*/

// Update the filter information display
function updateFilterInfo() {
  const filterInfo = document.getElementById("filterInfo");
  if (selectedCategories.length === 0) {
    filterInfo.textContent = "No categories selected for practice";
    return;
  }
  let totalSentences = 0;
  selectedCategories.forEach((category) => {
    if (category === "") {
      totalSentences += sentences.filter(
        (s) => !s.category || s.category === ""
      ).length;
    } else {
      totalSentences += sentences.filter((s) => s.category === category).length;
    }
  });
  filterInfo.textContent = `${selectedCategories.length} categories selected with ${totalSentences} sentences total`;
}

// Select all categories
function selectAllCategories() {
  selectedCategories = [];
  const checkboxes = document.querySelectorAll(".category-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
    selectedCategories.push(checkbox.value);
  });
  updateFilterInfo();
}

// Deselect all categories
function deselectAllCategories() {
  selectedCategories = [];
  const checkboxes = document.querySelectorAll(".category-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  updateFilterInfo();
}

// Start practice mode
function startPractice() {
  if (selectedCategories.length === 0) {
    alert("Please select at least one category for practice");
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
      document.getElementsByClassName("flashcard")[0].style.display = "flex";
    }
  });
  if (practicePool.length === 0) {
    alert("No sentences found in the selected categories");
    return;
  }
  nextCard();
}

// Close the flashcard and reset the practice pool
function flashcardClose() {
  practicePool = [];
  document.getElementsByClassName("flashcard")[0].style.display = "none";
}

// Add a new sentence
function addSentence() {
  const sentenceInput = document.getElementById("sentenceInput");
  const sentence = sentenceInput.value.trim();
  const categorySelect = document.getElementById("categorySelect");
  const category = categorySelect.value;
  if (sentence === "") {
    alert("Please enter a sentence");
    return;
  }
  if (selectedWords.length === 0) {
    alert("Please add at least one word");
    return;
  }
  if (category === "") {
    alert("Please select a category");
    return;
  }
  sentences.push({
    sentence: sentence,
    words: [...selectedWords],
    category: category,
  });
  sentenceInput.value = "";
  selectedWords = [];
  updateSelectedWords();
  saveSentences();
  sentenceInput.focus();
}

// Focus to the input field
function focusToInput() {
  const sentence = document.getElementById("sentenceInput");
  sentence.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      document.getElementById("wordInput").focus();
      document.getElementById("wordInput").value = "";
    }
  });
}
focusToInput();

// Save sentences to local storage
function saveSentences() {
  localStorage.setItem("flashcardSentences", JSON.stringify(sentences));
}

// Save categories to local storage
function saveCategories() {
  localStorage.setItem("flashcardCategories", JSON.stringify(categories));
}

// Load sentences from local storage
function loadSentences() {
  const savedSentences = localStorage.getItem("flashcardSentences");
  if (savedSentences) {
    sentences = JSON.parse(savedSentences);
  }
}

// Load categories from local storage
function loadCategories() {
  const savedCategories = localStorage.getItem("flashcardCategories");
  if (savedCategories) {
    categories = JSON.parse(savedCategories);
  }
}

// Delete a sentence
function deleteSentence(index) {
  sentences.splice(index, 1);
  saveSentences();
  updateCategoryList();
}

// Go to the next card in practice mode
function nextCard() {
  const flashcardSentence = document.getElementById("flashcardSentence");
  const answerInput = document.getElementById("answerInput");
  const resultMessage = document.getElementById("resultMessage");
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

  // Select a random sentence from the practice pool
  const randomPoolIndex = Math.floor(Math.random() * practicePool.length);
  currentIndex = practicePool[randomPoolIndex];

  // Select a random word from the selected sentence
  const randomWordIndex = Math.floor(
    Math.random() * sentences[currentIndex].words.length
  );
  currentWord = sentences[currentIndex].words[randomWordIndex];
  const sentence = sentences[currentIndex].sentence;
  const hiddenSentence = sentence.replace(
    new RegExp(currentWord, "g"),
    '<span class="blank"></span>'
  );
  flashcardSentence.innerHTML = hiddenSentence;
}

// Check the user's answer
function checkAnswer() {
  const userAnswer = document.getElementById("answerInput").value.trim();
  const resultMessage = document.getElementById("resultMessage");
  if (userAnswer === currentWord) {
    resultMessage.innerHTML = "Correct! Well done";
    resultMessage.className = "result correct";
    const sentence = sentences[currentIndex].sentence;
    const highlightedSentence = sentence.replace(
      new RegExp(currentWord, "g"),
      "<strong>" + currentWord + "</strong>"
    );
    document.getElementById("flashcardSentence").innerHTML =
      highlightedSentence;
  } else {
    resultMessage.innerHTML = "Incorrect, try again";
    resultMessage.className = "result incorrect";
  }
}

// Show the correct answer
function showAnswer() {
  document.getElementById("answerInput").value = currentWord;
  document.getElementById("resultMessage").innerHTML =
    "The correct answer is: " + currentWord;
  document.getElementById("resultMessage").className = "result";
  const sentence = sentences[currentIndex].sentence;
  const highlightedSentence = sentence.replace(
    new RegExp(currentWord, "g"),
    "<strong>" + currentWord + "</strong>"
  );
  document.getElementById("flashcardSentence").innerHTML = highlightedSentence;
}

// Handle Enter key press event
function enterKey() {
  document
    .getElementById("answerInput")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const resultMessage =
          document.getElementById("resultMessage").className;
        if (resultMessage === "result correct") {
          nextCard();
        } else {
          checkAnswer();
        }
      }
    });
}
enterKey();

// Automatically select the last added category
function selectLastCategory() {
  if (categories.length > 0) {
    const lastCategory = categories[categories.length - 1].name;
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.value = lastCategory;
  }
}

// Load saved data when the page loads
window.onload = function () {
  loadCategories();
  loadSentences();
  updateCategorySelect();

  // Automatically select the last added category
  if (categories.length > 0) {
    selectLastCategory();
  }
};

