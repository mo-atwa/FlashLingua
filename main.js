// ==================== Constants and Global State ====================
let sentences = [];
let categories = [];
let currentIndex = -1;
let currentWord = "";
let selectedWords = [];
let selectedCategories = [];
let practicePool = [];
let currentWordIndex = -1;
let allWords = [];

// ==================== Utility Functions ====================
function isSmallScreen() {
  return window.matchMedia("(max-width: 600px)").matches;
}

function resetShowAllCheckbox() {
  const showAllCheckbox = document.getElementById("showAllCheckbox");
  if (showAllCheckbox) showAllCheckbox.checked = false;
}

function hideInactiveTabs() {
  const tablinks = document.querySelectorAll(".tablinks");
  tablinks.forEach((tab) => {
    if (!tab.classList.contains("active")) {
      tab.style.display = "none";
    } else {
      tab.style.display = "block";
    }
  });
}

function toggleShowAll() {
  const showAllCheckbox = document.getElementById("showAllCheckbox");
  const tablinks = document.querySelectorAll(".tablinks");
  tablinks.forEach((tab) => {
    if (tab.classList.contains("active")) {
      tab.style.display = "block";
    } else {
      tab.style.display = showAllCheckbox.checked ? "block" : "none";
    }
  });
}

// ==================== Tab Management ====================
function openTab(evt, tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tabcontent").forEach((content) => {
    content.style.display = "none";
  });

  // Remove "active" class from all tab links
  document.querySelectorAll(".tablinks").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show the selected tab content and mark it as active
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");

  document.getElementById("showAllCheckbox").checked = false;

  // Handle small screen behavior
  if (isSmallScreen()) hideInactiveTabs();

  // Update specific tabs based on their name
  switch (tabName) {
    case "Practice":
      updatePracticeCategories();
      break;
    case "Add":
      selectedWords = [];
      updateSelectedWords();
      updateCategorySelect();
      selectLastCategory();
      break;
    case "Categories":
      updateCategoryList();
      break;
    case "WordFlashcards":
      updateAllWords();
      startWordFlashcards();
      break;
  }
}

// ==================== Input Handling ====================
// Setup automatic language input conversion
function setupAutoLanguageInputs() {
  const englishToArabicMap = {
    q: "ض",
    w: "ص",
    e: "ث",
    r: "ق",
    t: "ف",
    y: "غ",
    u: "ع",
    i: "ه",
    o: "خ",
    p: "ح",
    a: "ش",
    s: "س",
    d: "ي",
    f: "ب",
    g: "ل",
    h: "ا",
    j: "ت",
    k: "ن",
    l: "م",
    z: "ئ",
    x: "ء",
    c: "ؤ",
    v: "ر",
    b: "لا",
    n: "ى",
    m: "ة",
    "]": "د",
    "[": "ج",
    "'": "ط",
    ";": "ك",
    "/": "ظ",
    ".": "ز",
    ",": "و",
    "`": "ذ",
  };

  const arabicInput = document.getElementById("translationInput");
  if (arabicInput) {
    arabicInput.addEventListener("keypress", function (e) {
      // Check if the character is Arabic (lies within the Arabic character range)
      const isArabicChar = /[\u0600-\u06FF]/.test(e.key);

      // If the character is Arabic, allow default browser behavior
      if (isArabicChar) {
        return true;
      }

      // If it's an English character, prevent default behavior and convert to Arabic
      const char = e.key.toLowerCase();

      // Allow spaces and numbers directly
      if (char === " " || /^\d$/.test(char)) {
        return true;
      }

      // Convert English characters using the map
      if (englishToArabicMap[char]) {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value =
          this.value.substring(0, start) +
          englishToArabicMap[char] +
          this.value.substring(end);
        // Place cursor after the added character
        this.selectionStart = this.selectionEnd = start + 1;
      } else if (char.length === 1) {
        return true;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", setupAutoLanguageInputs);

function setupInputListeners() {
  const inputs = {
    newCategoryInput: {
      onEnter: () => {
        addNewCategory();
        focusElement("sentenceInput");
      },
    },
    sentenceInput: { onEnter: () => focusElement("wordInput") },
    wordInput: {
      onEnter: () => focusElement("translationInput"),
      onShiftEnter: () => addSentence(),
    },
    translationInput: {
      onEnter: () => {
        addWord();
        focusElement("wordInput");
      },
      onShiftEnter: () => addSentence(),
    },
  };

  function focusElement(id) {
    const element = document.getElementById(id);
    if (element) element.focus();
  }

  Object.entries(inputs).forEach(([id, actions]) => {
    const element = document.getElementById(id);
    if (!element) return;

    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        if (event.shiftKey && actions.onShiftEnter) actions.onShiftEnter();
        else if (actions.onEnter) actions.onEnter();
      }
    });
  });
}

// ==================== Word and Category Management ====================

function addWord() {
  const word = document.getElementById("wordInput").value.trim();
  const translation = document.getElementById("translationInput").value.trim();
  const sentence = document.getElementById("sentenceInput").value.trim();

  if (!word || !translation || !sentence) {
    showPopup("Please fill in all fields.");
    return;
  }

  if (!sentence.includes(word)) {
    showPopup("The sentence must contain the selected word.");
    return;
  }

  if (selectedWords.some((w) => w.word === word)) {
    showPopup("This word is already added.");
    return;
  }

  selectedWords.push({ word, translation });
  document.getElementById("wordInput").value = "";
  document.getElementById("translationInput").value = "";
  updateSelectedWords();
}

function updateSelectedWords() {
  const container = document.getElementById("selectedWords");
  if (!container) return;

  container.innerHTML = "";
  selectedWords.forEach((item, index) => {
    const chip = document.createElement("span");
    chip.className = "word-chip";
    chip.textContent = `${item.word} (${item.translation})`;
    chip.onclick = () => {
      selectedWords.splice(index, 1);
      updateSelectedWords();
    };
    container.appendChild(chip);
  });
}

function addNewCategory() {
  const categoryInput = document.getElementById("newCategoryInput");
  if (!categoryInput) return;

  const categoryName = categoryInput.value.trim();
  if (!categoryName) {
    showPopup("Please enter a category name.");
    return;
  }

  if (categories.some((cat) => cat.name === categoryName)) {
    showPopup("This category already exists.");
    return;
  }

  categories.push({ id: Date.now().toString(), name: categoryName });
  saveCategories();
  updateCategorySelect();
  selectLastCategory();
  categoryInput.value = "";
}

function createCategory() {
  const categoryNameInput = document.getElementById("categoryNameInput");
  if (!categoryNameInput) return;

  const categoryName = categoryNameInput.value.trim();
  if (!categoryName) {
    showPopup("Please enter a category name.");
    return;
  }

  if (categories.some((cat) => cat.name === categoryName)) {
    showPopup("This category already exists.");
    return;
  }

  categories.push({ id: Date.now().toString(), name: categoryName });
  saveCategories();
  updateCategoryList();
  updateCategorySelect();
  categoryNameInput.value = "";
}

function deleteCategory(id) {
  const categoryIndex = categories.findIndex((cat) => cat.id === id);
  if (categoryIndex === -1) return;

  const categoryName = categories[categoryIndex].name;
  const sentencesInCategory = sentences.filter(
    (s) => s.category === categoryName
  );

  if (sentencesInCategory.length > 0) {
    if (
      !confirm(
        `This category contains ${sentencesInCategory.length} sentences. Are you sure you want to delete it? All sentences in this category will also be deleted.`
      )
    ) {
      return;
    }
    sentences = sentences.filter(
      (sentence) => sentence.category !== categoryName
    );
    saveSentences();
  }

  categories.splice(categoryIndex, 1);
  saveCategories();
  updateCategoryList();
  updateCategorySelect();
  updatePracticeCategories();
}

function updateCategorySelect() {
  const select = document.getElementById("categorySelect");
  if (!select) return;

  select.innerHTML = '<option value="">-- Select Category --</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

function updateCategoryList() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  categoryList.innerHTML = "";
  if (categories.length === 0) {
    categoryList.innerHTML = "<p>No categories created yet</p>";
    return;
  }

  categories.forEach((category) => {
    const categoryItem = document.createElement("div");
    categoryItem.className = "category-item";

    const filteredSentences = sentences.filter(
      (s) => s.category === category.name
    );
    categoryItem.innerHTML = `
      <span onclick="toggleWordList('${category.id}')" style="cursor: pointer; width: 100%;">
        ${category.name} <span class="category-count">${filteredSentences.length}</span>
      </span>
      <button onclick="deleteCategory('${category.id}')">Delete</button>
    `;

    const wordList = document.createElement("div");
    wordList.id = `wordList-${category.id}`;
    wordList.className = "word-list";

    if (filteredSentences.length === 0) {
      wordList.innerHTML = "<p>No sentences in this category</p>";
    } else {
      filteredSentences.forEach((item) => {
        const wordItem = document.createElement("div");
        wordItem.className = "word-item";

        let sentenceHtml = item.sentence;
        item.words.forEach((wordObj) => {
          const wordText = wordObj.word;
          sentenceHtml = sentenceHtml.replace(
            new RegExp(wordText, "g"),
            `<strong>${wordText}</strong>`
          );
        });

        wordItem.innerHTML = `
          <span>
            ${sentenceHtml}<br>
            <small>(Words: ${item.words.map((w) => w.word).join(", ")})</small>
          </span>
          <button onclick="deleteSentence(${sentences.indexOf(
            item
          )})">Delete</button>
        `;
        wordList.appendChild(wordItem);
      });
    }

    categoryList.appendChild(categoryItem);
    categoryList.appendChild(wordList);
  });
}

function toggleWordList(categoryId) {
  const wordList = document.getElementById(`wordList-${categoryId}`);
  if (!wordList) return;

  wordList.style.display =
    wordList.style.display === "none" || wordList.style.display === ""
      ? "block"
      : "none";
}

// ==================== Practice Management ====================
function updatePracticeCategories() {
  const container = document.getElementById("practiceCategories");
  if (!container) return;

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
          if (!selectedCategories.includes(category.name))
            selectedCategories.push(category.name);
        } else {
          const index = selectedCategories.indexOf(category.name);
          if (index !== -1) selectedCategories.splice(index, 1);
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
        if (!selectedCategories.includes("")) selectedCategories.push("");
      } else {
        const index = selectedCategories.indexOf("");
        if (index !== -1) selectedCategories.splice(index, 1);
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

function updateFilterInfo() {
  const filterInfo = document.getElementById("filterInfo");
  if (!filterInfo) return;

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

function selectAllCategories() {
  selectedCategories = [];
  document.querySelectorAll(".category-checkbox").forEach((checkbox) => {
    checkbox.checked = true;
    selectedCategories.push(checkbox.value);
  });
  updateFilterInfo();
}

function deselectAllCategories() {
  selectedCategories = [];
  document.querySelectorAll(".category-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
  });
  updateFilterInfo();
}

// ==================== Sentence Management ====================
function addSentence() {
  const sentenceInput = document.getElementById("sentenceInput");
  const categorySelect = document.getElementById("categorySelect");

  if (!sentenceInput || !categorySelect) return;

  const sentence = sentenceInput.value.trim();
  const category = categorySelect.value;

  if (!sentence) {
    showPopup("Please enter a sentence.");
    return;
  }

  if (selectedWords.length === 0) {
    showPopup("Please add at least one word to memorize.");
    return;
  }

  if (!category) {
    showPopup("Please select a category.");
    return;
  }

  sentences.push({ sentence, words: [...selectedWords], category });
  saveSentences();

  sentenceInput.value = "";
  selectedWords = [];
  updateSelectedWords();
  updateCategoryList();
  sentenceInput.focus();
}

function deleteSentence(index) {
  sentences.splice(index, 1);
  saveSentences();
  updateCategoryList();
}

// ==================== Local Storage ====================
function saveSentences() {
  localStorage.setItem("flashcardSentences", JSON.stringify(sentences));
}

function loadSentences() {
  const savedSentences = localStorage.getItem("flashcardSentences");
  if (savedSentences) sentences = JSON.parse(savedSentences);
}

function saveCategories() {
  localStorage.setItem("flashcardCategories", JSON.stringify(categories));
}

function loadCategories() {
  const savedCategories = localStorage.getItem("flashcardCategories");
  if (savedCategories) categories = JSON.parse(savedCategories);
}

// ==================== Miscellaneous ====================
function getDateForId(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with ID "${id}" not found.`);
    return;
  }

  const today = new Date();
  const year = today.getFullYear();
  element.textContent = year;
}

// Example usage
getDateForId("date");

// Add event listener to open a portfolio link
document.getElementById("name").addEventListener("click", function () {
  window.open("https://atwa-portfolio.netlify.app/", "_blank");
});

function selectLastCategory() {
  if (categories.length > 0) {
    const lastCategory = categories[categories.length - 1].name;
    const categorySelect = document.getElementById("categorySelect");
    if (categorySelect) categorySelect.value = lastCategory;
  }
}

// ==================== Initialization ====================
window.onload = function () {
  loadCategories();
  loadSentences();
  updateCategorySelect();
  setupInputListeners();
  setupCategoryInputListener();
  setupAnswerInput();

  const defaultTab = document.querySelector(".tablinks");
  if (defaultTab) defaultTab.click();
};
