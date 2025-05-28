// Tarot Cards Database
const tarotCards = [
  // Major Arcana
  {
    name: "The Fool",
    suit: "Major Arcana",
    meaning: "new beginnings, adventure, potential",
    keywords: ["start", "journey", "risk"],
  },
  {
    name: "The Magician",
    suit: "Major Arcana",
    meaning: "willpower, manifestation, skill",
    keywords: ["power", "control", "action"],
  },
  {
    name: "The High Priestess",
    suit: "Major Arcana",
    meaning: "intuition, mystery, inner wisdom",
    keywords: ["intuition", "wisdom", "secret"],
  },
  {
    name: "The Empress",
    suit: "Major Arcana",
    meaning: "fertility, creativity, abundance",
    keywords: ["creative", "nurture", "growth"],
  },
  {
    name: "The Emperor",
    suit: "Major Arcana",
    meaning: "authority, structure, control",
    keywords: ["leadership", "control", "discipline"],
  },
  {
    name: "The Lovers",
    suit: "Major Arcana",
    meaning: "love, harmony, relationships",
    keywords: ["love", "relationship", "choice"],
  },
  {
    name: "The Chariot",
    suit: "Major Arcana",
    meaning: "determination, success, willpower",
    keywords: ["success", "determination", "victory"],
  },
  {
    name: "Strength",
    suit: "Major Arcana",
    meaning: "inner strength, courage, patience",
    keywords: ["strength", "courage", "patience"],
  },
  {
    name: "The Hermit",
    suit: "Major Arcana",
    meaning: "introspection, seeking truth, guidance",
    keywords: ["search", "wisdom", "guidance"],
  },
  {
    name: "Wheel of Fortune",
    suit: "Major Arcana",
    meaning: "change, cycles, fate",
    keywords: ["change", "luck", "destiny"],
  },

  // Cups (Emotions)
  {
    name: "Ace of Cups",
    suit: "Cups",
    meaning: "new love, emotional beginning",
    keywords: ["love", "emotion", "start"],
  },
  {
    name: "Two of Cups",
    suit: "Cups",
    meaning: "partnership, mutual attraction",
    keywords: ["partnership", "love", "connection"],
  },
  {
    name: "Three of Cups",
    suit: "Cups",
    meaning: "friendship, celebration, community",
    keywords: ["friendship", "celebration", "joy"],
  },
  {
    name: "King of Cups",
    suit: "Cups",
    meaning: "emotional maturity, compassion",
    keywords: ["wisdom", "emotion", "balance"],
  },
  {
    name: "Queen of Cups",
    suit: "Cups",
    meaning: "intuitive, caring, emotionally secure",
    keywords: ["intuition", "care", "emotion"],
  },

  // Wands (Career/Passion)
  {
    name: "Ace of Wands",
    suit: "Wands",
    meaning: "new opportunities, growth",
    keywords: ["opportunity", "career", "growth"],
  },
  {
    name: "Two of Wands",
    suit: "Wands",
    meaning: "personal power, planning",
    keywords: ["planning", "power", "future"],
  },
  {
    name: "Three of Wands",
    suit: "Wands",
    meaning: "expansion, foresight, leadership",
    keywords: ["expansion", "leadership", "vision"],
  },
  {
    name: "King of Wands",
    suit: "Wands",
    meaning: "leadership, vision, entrepreneurship",
    keywords: ["leadership", "vision", "success"],
  },
  {
    name: "Queen of Wands",
    suit: "Wands",
    meaning: "confidence, determination, passion",
    keywords: ["confidence", "passion", "determination"],
  },

  // Swords (Challenges/Mind)
  {
    name: "Ace of Swords",
    suit: "Swords",
    meaning: "clarity, breakthrough, new ideas",
    keywords: ["clarity", "breakthrough", "truth"],
  },
  {
    name: "Two of Swords",
    suit: "Swords",
    meaning: "difficult decisions, weighing options",
    keywords: ["decision", "choice", "difficulty"],
  },
  {
    name: "Three of Swords",
    suit: "Swords",
    meaning: "heartbreak, sorrow, grief",
    keywords: ["sadness", "heartbreak", "loss"],
  },
  {
    name: "King of Swords",
    suit: "Swords",
    meaning: "intellectual power, truth, clarity",
    keywords: ["intellect", "truth", "authority"],
  },
  {
    name: "Queen of Swords",
    suit: "Swords",
    meaning: "independent, perceptive, clear thinking",
    keywords: ["independence", "clarity", "perception"],
  },
];

// AI Learning System
class TarotAI {
  constructor() {
    this.userProfile = {
      preferredSuits: { "Major Arcana": 0, Cups: 0, Wands: 0, Swords: 0 },
      preferredMeanings: {},
      totalReadings: 0,
      accuracyScore: 50,
      feedbackHistory: [],
    };
    this.currentReading = null;
    this.loadUserProfile();
  }

  // Save user profile to memory (simplified storage)
  saveUserProfile() {
    // In a real application, this would use localStorage or database
    console.log("Saving user profile:", this.userProfile);
  }

  // Load user profile from memory
  loadUserProfile() {
    // In a real application, this would load from localStorage or database
    this.updateStats();
  }

  // Learn from user feedback
  learnFromFeedback(feedback, question, cards, reading) {
    this.userProfile.totalReadings++;
    this.userProfile.feedbackHistory.push({
      feedback: feedback,
      question: question,
      cards: cards,
      timestamp: new Date(),
    });

    // Update accuracy based on feedback
    switch (feedback) {
      case "very-good":
        this.userProfile.accuracyScore = Math.min(
          95,
          this.userProfile.accuracyScore + 3
        );
        this.updatePreferences(cards, 2);
        break;
      case "good":
        this.userProfile.accuracyScore = Math.min(
          95,
          this.userProfile.accuracyScore + 1
        );
        this.updatePreferences(cards, 1);
        break;
      case "neutral":
        // No change in accuracy
        break;
      case "bad":
        this.userProfile.accuracyScore = Math.max(
          20,
          this.userProfile.accuracyScore - 2
        );
        this.updatePreferences(cards, -1);
        break;
    }

    this.saveUserProfile();
    this.updateStats();
  }

  // Update user preferences based on feedback
  updatePreferences(cards, weight) {
    cards.forEach((card) => {
      // Update suit preferences
      this.userProfile.preferredSuits[card.suit] += weight;

      // Update meaning preferences
      card.keywords.forEach((keyword) => {
        this.userProfile.preferredMeanings[keyword] =
          (this.userProfile.preferredMeanings[keyword] || 0) + weight;
      });
    });
  }

  // Select cards based on user question and learned preferences
  selectCards(question) {
    const questionWords = question.toLowerCase().split(" ");
    let suitedCards = [];

    // Analyze question to determine preferred suits
    const questionType = this.analyzeQuestion(questionWords);

    // Filter cards based on question type and user preferences
    let availableCards = tarotCards.filter((card) => {
      // Match question type with card suit
      if (questionType === "love" && card.suit === "Cups") return true;
      if (questionType === "career" && card.suit === "Wands") return true;
      if (questionType === "challenge" && card.suit === "Swords") return true;
      if (questionType === "general" && card.suit === "Major Arcana")
        return true;

      // Also consider user preferences
      const suitPreference = this.userProfile.preferredSuits[card.suit] || 0;
      return suitPreference > 0 || Math.random() > 0.7;
    });

    // If no specific cards found, use all cards
    if (availableCards.length < 3) {
      availableCards = tarotCards;
    }

    // Select 3 random cards from available cards
    const selectedCards = [];
    const cardsCopy = [...availableCards];

    for (let i = 0; i < 3 && cardsCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * cardsCopy.length);
      selectedCards.push(cardsCopy.splice(randomIndex, 1)[0]);
    }

    return selectedCards;
  }

  // Analyze question to determine type
  analyzeQuestion(words) {
    const loveKeywords = [
      "love",
      "relationship",
      "partner",
      "marriage",
      "dating",
      "romance",
    ];
    const careerKeywords = [
      "work",
      "job",
      "career",
      "business",
      "money",
      "success",
      "promotion",
    ];
    const challengeKeywords = [
      "problem",
      "difficulty",
      "challenge",
      "conflict",
      "trouble",
      "issue",
    ];

    if (words.some((word) => loveKeywords.includes(word))) return "love";
    if (words.some((word) => careerKeywords.includes(word))) return "career";
    if (words.some((word) => challengeKeywords.includes(word)))
      return "challenge";

    return "general";
  }

  // Generate personalized reading based on cards and user profile
  generateReading(question, cards) {
    const questionType = this.analyzeQuestion(
      question.toLowerCase().split(" ")
    );
    let reading = `Berdasarkan pertanyaan Anda tentang "${question}", kartu-kartu ini memberikan panduan:\n\n`;

    cards.forEach((card, index) => {
      const position = [
        "Past/Influence",
        "Present/Situation",
        "Future/Outcome",
      ][index];
      reading += `**${position} - ${card.name}**: ${card.meaning}. `;

      // Add personalized interpretation based on user profile
      if (this.userProfile.accuracyScore > 70) {
        reading += this.getPersonalizedInterpretation(card, questionType);
      }
      reading += "\n\n";
    });

    // Add overall guidance
    reading += this.getOverallGuidance(cards, questionType);

    this.currentReading = {
      question: question,
      cards: cards,
      reading: reading,
      timestamp: new Date(),
    };

    return reading;
  }

  // Get personalized interpretation based on user profile
  getPersonalizedInterpretation(card, questionType) {
    const interpretations = {
      love: {
        Cups: "Fokus pada emosi dan hubungan yang mendalam.",
        Wands: "Passion dan energi akan membawa perubahan positif.",
        Swords: "Komunikasi yang jelas akan menyelesaikan masalah.",
        "Major Arcana": "Perubahan besar dalam kehidupan cinta Anda.",
      },
      career: {
        Cups: "Ikuti intuisi Anda dalam keputusan karir.",
        Wands: "Saatnya mengambil inisiatif dan kepemimpinan.",
        Swords: "Analisis yang tajam akan membawa kesuksesan.",
        "Major Arcana": "Perubahan karir yang signifikan menanti.",
      },
      general: {
        Cups: "Dengarkan hati dan intuisi Anda.",
        Wands: "Ambil tindakan dengan penuh keyakinan.",
        Swords: "Pikirkan dengan jernih sebelum bertindak.",
        "Major Arcana": "Ini adalah momen penting dalam hidup Anda.",
      },
    };

    return (
      interpretations[questionType]?.[card.suit] ||
      "Percayai pada proses dan tetap terbuka terhadap kemungkinan."
    );
  }

  // Get overall guidance based on all cards
  getOverallGuidance(cards, questionType) {
    const suitCounts = {};
    cards.forEach((card) => {
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });

    let guidance = "**Panduan Keseluruhan**: ";

    if (suitCounts["Cups"] >= 2) {
      guidance += "Emosi dan intuisi akan memandu jalan Anda. ";
    }
    if (suitCounts["Wands"] >= 2) {
      guidance += "Saatnya untuk bertindak dan mengambil inisiatif. ";
    }
    if (suitCounts["Swords"] >= 2) {
      guidance += "Gunakan logika dan komunikasi yang jelas. ";
    }
    if (suitCounts["Major Arcana"] >= 2) {
      guidance +=
        "Perubahan besar dan penting sedang terjadi dalam hidup Anda. ";
    }

    guidance +=
      "Ingatlah bahwa Anda memiliki kekuatan untuk membentuk masa depan Anda sendiri.";

    return guidance;
  }

  // Update statistics display
  updateStats() {
    document.getElementById("totalReadings").textContent =
      this.userProfile.totalReadings;
    document.getElementById("accuracy").textContent =
      this.userProfile.accuracyScore + "%";

    // Determine user profile type
    let profileType = "Neutral";
    const maxSuit = Object.keys(this.userProfile.preferredSuits).reduce(
      (a, b) =>
        this.userProfile.preferredSuits[a] > this.userProfile.preferredSuits[b]
          ? a
          : b
    );

    if (this.userProfile.preferredSuits[maxSuit] > 2) {
      const profiles = {
        Cups: "Emotional",
        Wands: "Action-Oriented",
        Swords: "Analytical",
        "Major Arcana": "Spiritual",
      };
      profileType = profiles[maxSuit] || "Neutral";
    }

    document.getElementById("userProfile").textContent = profileType;

    // Update progress bar
    const progress = Math.min(100, (this.userProfile.totalReadings / 10) * 100);
    document.getElementById("progressFill").style.width = progress + "%";

    if (progress >= 100) {
      document.getElementById("progressText").textContent =
        "AI telah sepenuhnya mempelajari preferensi Anda!";
    } else {
      document.getElementById(
        "progressText"
      ).textContent = `AI sedang belajar... ${progress.toFixed(0)}% complete`;
    }
  }
}

// Initialize AI
const tarotAI = new TarotAI();

// Main functions
function drawCards() {
  const question = document.getElementById("questionInput").value.trim();

  if (!question) {
    alert("Silakan ajukan pertanyaan terlebih dahulu!");
    return;
  }

  // Select cards using AI
  const selectedCards = tarotAI.selectCards(question);

  // Display cards
  displayCards(selectedCards);

  // Generate and display reading
  const reading = tarotAI.generateReading(question, selectedCards);
  displayReading(reading);

  // Show sections
  document.getElementById("cardsSection").style.display = "block";
  document.getElementById("readingSection").style.display = "block";
  document.getElementById("progressSection").style.display = "block";

  // Scroll to cards
  document
    .getElementById("cardsSection")
    .scrollIntoView({ behavior: "smooth" });
}

function displayCards(cards) {
  const container = document.getElementById("cardsContainer");
  container.innerHTML = "";

  cards.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-suit">${card.suit}</div>
        `;
    container.appendChild(cardElement);
  });
}

function displayReading(reading) {
  const readingElement = document.getElementById("readingText");
  readingElement.innerHTML = reading
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function giveFeedback(feedback) {
  if (!tarotAI.currentReading) {
    alert("Tidak ada bacaan untuk dinilai!");
    return;
  }

  // Learn from feedback
  tarotAI.learnFromFeedback(
    feedback,
    tarotAI.currentReading.question,
    tarotAI.currentReading.cards,
    tarotAI.currentReading.reading
  );

  // Disable feedback buttons
  const buttons = document.querySelectorAll(".feedback-btn");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.onclick.toString().includes(feedback)) {
      btn.style.transform = "scale(1.1)";
      btn.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
    }
  });

  // Show thank you message
  setTimeout(() => {
    alert(
      "Terima kasih atas feedback Anda! AI akan belajar untuk memberikan bacaan yang lebih akurat."
    );
  }, 500);
}
