// Enhanced Naive Bayes Classifier dengan Advanced AI Learning Techniques
class AdvancedNaiveBayesPolitenessClassifier {
  constructor() {
    // Training data awal dengan lebih banyak variasi
    this.trainingDocs = {
      sopan: [
        "terima kasih atas bantuannya",
        "mohon maaf mengganggu",
        "selamat pagi semua",
        "tolong bantu saya",
        "permisi boleh bertanya",
        "dengan hormat",
        "silakan masuk",
        "bagus sekali pekerjaannya",
        "mohon tunggu sebentar",
        "terima kasih banyak",
        "saya sangat menghargai",
        "maaf telah merepotkan",
        "boleh minta tolong",
        "selamat sore pak",
        "terima kasih atas waktunya",
      ],
      tidakSopan: [
        "kamu bodoh sekali",
        "dasar goblok",
        "jangan berisik",
        "sialan banget",
        "tolol ga ngerti",
        "bangsat lo",
        "bego amat",
        "kampret deh",
        "tai kucing",
        "anjing lu",
        "idiot banget sih",
        "payah lu",
        "jelek banget",
        "menyebalkan sekali",
        "dasar sampah",
      ],
    };

    // Advanced features
    this.ngramSize = 2; // Bigram support
    this.minWordFreq = 1; // Minimum word frequency
    this.learningRate = 0.1; // For adaptive learning

    // Vocabulary dan feature counts
    this.vocabulary = new Set();
    this.ngramVocabulary = new Set();
    this.wordCounts = { sopan: {}, tidakSopan: {} };
    this.ngramCounts = { sopan: {}, tidakSopan: {} };
    this.docCounts = {
      sopan: this.trainingDocs.sopan.length,
      tidakSopan: this.trainingDocs.tidakSopan.length,
    };
    this.totalWords = { sopan: 0, tidakSopan: 0 };
    this.totalNgrams = { sopan: 0, tidakSopan: 0 };

    // Advanced AI Learning features
    this.confidenceThreshold = 0.7; // Auto-learning threshold
    this.wordWeights = {}; // TF-IDF like weights
    this.documentFrequency = {}; // For IDF calculation

    // Learning statistics
    this.stats = {
      totalPredictions: 0,
      correctPredictions: 0,
      autoLearningCount: 0,
      uncertainPredictions: 0,
    };

    // Current prediction context
    this.currentText = "";
    this.currentPrediction = "";
    this.currentConfidence = 0;

    // Train initial model
    this.trainModel();
  }

  // Advanced text preprocessing dengan multiple techniques
  preprocessText(text) {
    // Basic cleaning
    let cleaned = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Tokenization
    let words = cleaned.split(" ").filter((word) => word.length > 2);

    // Simple stemming (hapus akhiran umum)
    words = words.map((word) => {
      // Indonesian stemming rules (simplified)
      if (word.endsWith("nya")) return word.slice(0, -3);
      if (word.endsWith("kan")) return word.slice(0, -3);
      if (word.endsWith("an")) return word.slice(0, -2);
      return word;
    });

    return words;
  }

  // Generate n-grams for better context understanding
  generateNgrams(words, n = 2) {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join("_"));
    }
    return ngrams;
  }

  // Calculate TF-IDF weights
  calculateTFIDF(word, category) {
    const tf =
      (this.wordCounts[category][word] || 0) / this.totalWords[category];
    const totalDocs = this.docCounts.sopan + this.docCounts.tidakSopan;
    const df = this.documentFrequency[word] || 0;
    const idf = Math.log(totalDocs / (1 + df));
    return tf * idf;
  }

  // Enhanced training dengan multiple feature types
  trainModel() {
    // Reset all counts
    this.vocabulary.clear();
    this.ngramVocabulary.clear();
    this.wordCounts = { sopan: {}, tidakSopan: {} };
    this.ngramCounts = { sopan: {}, tidakSopan: {} };
    this.totalWords = { sopan: 0, tidakSopan: 0 };
    this.totalNgrams = { sopan: 0, tidakSopan: 0 };
    this.documentFrequency = {};

    // Process each category
    for (let category of ["sopan", "tidakSopan"]) {
      for (let doc of this.trainingDocs[category]) {
        const words = this.preprocessText(doc);
        const ngrams = this.generateNgrams(words, this.ngramSize);

        // Track document frequency for IDF
        const uniqueWords = new Set(words);
        for (let word of uniqueWords) {
          this.documentFrequency[word] =
            (this.documentFrequency[word] || 0) + 1;
        }

        // Count unigrams
        for (let word of words) {
          this.vocabulary.add(word);
          this.wordCounts[category][word] =
            (this.wordCounts[category][word] || 0) + 1;
          this.totalWords[category]++;
        }

        // Count n-grams
        for (let ngram of ngrams) {
          this.ngramVocabulary.add(ngram);
          this.ngramCounts[category][ngram] =
            (this.ngramCounts[category][ngram] || 0) + 1;
          this.totalNgrams[category]++;
        }
      }
    }

    // Calculate word weights using TF-IDF
    this.calculateWordWeights();
  }

  // Calculate importance weights for words
  calculateWordWeights() {
    this.wordWeights = {};
    for (let word of this.vocabulary) {
      const tfidfSopan = this.calculateTFIDF(word, "sopan");
      const tfidfTidakSopan = this.calculateTFIDF(word, "tidakSopan");

      // Higher weight for words that are distinctive
      this.wordWeights[word] = Math.abs(tfidfSopan - tfidfTidakSopan) + 1;
    }
  }

  // Hitung P(word|class) dengan Laplace smoothing
  getWordProbability(word, category) {
    const wordCount = this.wordCounts[category][word] || 0;
    const totalWords = this.totalWords[category];
    const vocabularySize = this.vocabulary.size;

    // Laplace smoothing: (word_count + 1) / (total_words + vocabulary_size)
    return (wordCount + 1) / (totalWords + vocabularySize);
  }

  // Hitung P(class)
  getClassProbability(category) {
    const totalDocs = this.docCounts.sopan + this.docCounts.tidakSopan;
    return this.docCounts[category] / totalDocs;
  }

  // Enhanced prediction dengan multiple features dan confidence
  predict(text) {
    const words = this.preprocessText(text);
    const ngrams = this.generateNgrams(words, this.ngramSize);

    // Calculate log probabilities dengan weighted features
    let logProbSopan = Math.log(this.getClassProbability("sopan"));
    let logProbTidakSopan = Math.log(this.getClassProbability("tidakSopan"));

    // Weighted unigram probabilities
    for (let word of words) {
      const probSopan = this.getWordProbability(word, "sopan");
      const probTidakSopan = this.getWordProbability(word, "tidakSopan");
      const weight = this.wordWeights[word] || 1;

      logProbSopan += Math.log(probSopan) * weight;
      logProbTidakSopan += Math.log(probTidakSopan) * weight;
    }

    // N-gram probabilities (for context)
    for (let ngram of ngrams) {
      const probSopan = this.getNgramProbability(ngram, "sopan");
      const probTidakSopan = this.getNgramProbability(ngram, "tidakSopan");

      // Weight n-grams less than unigrams
      logProbSopan += Math.log(probSopan) * 0.3;
      logProbTidakSopan += Math.log(probTidakSopan) * 0.3;
    }

    // Convert to normal probabilities and normalize
    const probSopan = Math.exp(logProbSopan);
    const probTidakSopan = Math.exp(logProbTidakSopan);
    const totalProb = probSopan + probTidakSopan;

    const normalizedProbSopan = probSopan / totalProb;
    const normalizedProbTidakSopan = probTidakSopan / totalProb;

    // Determine prediction and confidence
    const prediction =
      normalizedProbSopan > normalizedProbTidakSopan ? "sopan" : "tidak sopan";
    const confidence = Math.max(normalizedProbSopan, normalizedProbTidakSopan);

    // Store current prediction context
    this.currentText = text;
    this.currentPrediction = prediction;
    this.currentConfidence = confidence;

    // Auto-learning untuk high confidence predictions
    if (confidence > this.confidenceThreshold) {
      this.autoLearn(text, prediction);
    }

    // Track uncertain predictions
    if (confidence < 0.6) {
      this.stats.uncertainPredictions++;
    }

    return {
      prediction: prediction,
      confidence: Math.round(confidence * 100),
      probabilities: {
        sopan: Math.round(normalizedProbSopan * 100),
        tidakSopan: Math.round(normalizedProbTidakSopan * 100),
      },
      features: {
        words: words,
        ngrams: ngrams,
        isUncertain: confidence < 0.6,
        isHighConfidence: confidence > this.confidenceThreshold,
      },
    };
  }

  // N-gram probability calculation
  getNgramProbability(ngram, category) {
    const ngramCount = this.ngramCounts[category][ngram] || 0;
    const totalNgrams = this.totalNgrams[category];
    const ngramVocabSize = this.ngramVocabulary.size;

    return (ngramCount + 1) / (totalNgrams + ngramVocabSize);
  }

  // Auto-learning from high confidence predictions
  autoLearn(text, prediction) {
    // Only auto-learn if we're very confident
    if (this.currentConfidence > 0.85) {
      this.trainingDocs[prediction === "sopan" ? "sopan" : "tidakSopan"].push(
        text
      );
      this.docCounts[prediction === "sopan" ? "sopan" : "tidakSopan"]++;
      this.stats.autoLearningCount++;

      // Re-train model periodically
      if (this.stats.autoLearningCount % 5 === 0) {
        this.trainModel();
      }
    }
  }

  // Tambah training data baru
  addTrainingData(text, label) {
    this.trainingDocs[label].push(text);
    this.docCounts[label]++;
    this.trainModel(); // Re-train model
  }

  // Update feedback
  updateFeedback(isCorrect) {
    this.stats.totalPredictions++;
    if (isCorrect) {
      this.stats.correctPredictions++;
    }
  }

  // Enhanced statistics dengan lebih banyak metrics
  getStats() {
    const accuracy =
      this.stats.totalPredictions > 0
        ? Math.round(
            (this.stats.correctPredictions / this.stats.totalPredictions) * 100
          )
        : 0;

    return {
      totalVocabulary: this.vocabulary.size,
      totalNgrams: this.ngramVocabulary.size,
      accuracy: accuracy,
      sopanDocs: this.docCounts.sopan,
      tidakSopanDocs: this.docCounts.tidakSopan,
      autoLearningCount: this.stats.autoLearningCount,
      uncertainPredictions: this.stats.uncertainPredictions,
      confidenceThreshold: Math.round(this.confidenceThreshold * 100),
    };
  }
}

// Initialize enhanced classifier
const classifier = new AdvancedNaiveBayesPolitenessClassifier();

// UI Functions
function showResult(result) {
  const predictionEl = document.getElementById("prediction");
  const confidenceEl = document.getElementById("confidence");
  const probabilityDetailsEl = document.getElementById("probabilityDetails");
  const resultEl = document.getElementById("result");

  // Update tampilan prediksi
  predictionEl.textContent = result.prediction.toUpperCase();
  predictionEl.className = `prediction ${result.prediction.replace(" ", "-")}`;

  // Update confidence
  confidenceEl.textContent = `Keyakinan: ${result.confidence}%`;

  // Update probability details dengan info lebih lengkap
  probabilityDetailsEl.innerHTML = `
      <strong>🧠 Advanced Naive Bayes Analysis:</strong><br>
      • P(Sopan) = ${result.probabilities.sopan}%<br>
      • P(Tidak Sopan) = ${result.probabilities.tidakSopan}%<br>
      • <strong>Features:</strong> ${result.features.words.join(", ")}<br>
      • <strong>N-grams:</strong> ${result.features.ngrams
        .slice(0, 3)
        .join(", ")}${result.features.ngrams.length > 3 ? "..." : ""}<br>
      • <strong>Status:</strong> ${
        result.features.isHighConfidence
          ? "🟢 High Confidence"
          : result.features.isUncertain
          ? "🟡 Uncertain"
          : "🔵 Normal"
      }<br>
      ${
        result.features.isHighConfidence
          ? "<em>⚡ Auto-learning enabled</em>"
          : ""
      }
  `;

  // Tampilkan section hasil
  resultEl.style.display = "block";

  // Update statistik
  updateStats();

  // Scroll ke hasil
  resultEl.scrollIntoView({ behavior: "smooth" });
}

function updateStats() {
  const stats = classifier.getStats();
  document.getElementById("totalVocab").textContent = stats.totalVocabulary;
  document.getElementById("accuracy").textContent = stats.accuracy + "%";
  document.getElementById("sopanDocs").textContent = stats.sopanDocs;
  document.getElementById("tidakSopanDocs").textContent = stats.tidakSopanDocs;
}

function showMessage(text) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.style.display = "block";

  setTimeout(() => {
    messageEl.style.display = "none";
  }, 3000);
}

// Event handlers
function handleAnalyze() {
  const text = document.getElementById("textInput").value.trim();

  if (!text) {
    alert("Silakan masukkan teks terlebih dahulu!");
    return;
  }

  classifier.currentText = text;
  const result = classifier.predict(text);
  classifier.currentPrediction = result.prediction;

  showResult(result);
}

function handleCorrectFeedback() {
  classifier.updateFeedback(true);
  classifier.addTrainingData(
    classifier.currentText,
    classifier.currentPrediction
  );
  const stats = classifier.getStats();
  showMessage(
    `✅ Model updated! Auto-learning: ${stats.autoLearningCount} cases`
  );
  updateStats();
}

function handleWrongFeedback() {
  classifier.updateFeedback(false);
  const correctLabel =
    classifier.currentPrediction === "sopan" ? "tidakSopan" : "sopan";
  classifier.addTrainingData(classifier.currentText, correctLabel);
  const stats = classifier.getStats();
  showMessage(
    `🔧 Model corrected! Uncertain cases: ${stats.uncertainPredictions}`
  );
  updateStats();
}

// Initialize app
function initializeApp() {
  document
    .getElementById("analyzeBtn")
    .addEventListener("click", handleAnalyze);
  document
    .getElementById("correctBtn")
    .addEventListener("click", handleCorrectFeedback);
  document
    .getElementById("wrongBtn")
    .addEventListener("click", handleWrongFeedback);

  document.getElementById("textInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAnalyze();
    }
  });

  updateStats();
}

// Start app when DOM loaded
document.addEventListener("DOMContentLoaded", initializeApp);
