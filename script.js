class NaiveBayesPolitenessDetector {
  constructor() {
    this.trainingData = this.loadTrainingData();
    this.vocabulary = new Set();
    this.classProbs = {};
    this.wordProbs = {};
    this.currentPrediction = null;
    this.currentText = "";
    this.correctPredictions = 0;
    this.totalPredictions = 0;

    this.initializeModel();
    this.initializeUI();
    this.updateStats();
  }

  loadTrainingData() {
    const defaultData = [
      { text: "terima kasih banyak atas bantuannya", label: "sopan" },
      { text: "tolong bantu saya mengerjakan ini", label: "sopan" },
      { text: "maaf mengganggu waktu anda sebentar", label: "sopan" },
      { text: "selamat pagi semoga hari anda menyenangkan", label: "sopan" },
      { text: "mohon bantuan untuk masalah ini", label: "sopan" },
      { text: "silakan duduk dan ambil menu", label: "sopan" },
      { text: "permisi saya mau lewat", label: "sopan" },
      { text: "bagus sekali pekerjaannya", label: "sopan" },
      { text: "kamu bodoh sekali sih", label: "tidak sopan" },
      { text: "dasar goblok ga bisa apa apa", label: "tidak sopan" },
      { text: "pergi sana tolol jangan ganggu", label: "tidak sopan" },
      { text: "bangsat lu berisik banget", label: "tidak sopan" },
      { text: "tai kucing lebih berguna dari lu", label: "tidak sopan" },
      { text: "sialan kenapa lama banget", label: "tidak sopan" },
      { text: "bego amat ga ngerti ngerti", label: "tidak sopan" },
      { text: "kampret bikin kesel aja", label: "tidak sopan" },
    ];

    const saved = localStorage.getItem("politenessTrainingData");
    return saved ? JSON.parse(saved) : defaultData;
  }

  saveTrainingData() {
    localStorage.setItem(
      "politenessTrainingData",
      JSON.stringify(this.trainingData)
    );
  }

  // Preprocessing text
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((word) => word.length > 0);
  }

  // Build vocabulary from training data
  buildVocabulary() {
    this.vocabulary.clear();
    this.trainingData.forEach((item) => {
      const words = this.preprocessText(item.text);
      words.forEach((word) => this.vocabulary.add(word));
    });
  }

  // Calculate class probabilities P(class)
  calculateClassProbabilities() {
    const totalDocs = this.trainingData.length;
    const classCounts = {};

    this.trainingData.forEach((item) => {
      classCounts[item.label] = (classCounts[item.label] || 0) + 1;
    });

    for (const className in classCounts) {
      this.classProbs[className] = classCounts[className] / totalDocs;
    }
  }

  // Calculate word probabilities P(word|class) with Laplace smoothing
  calculateWordProbabilities() {
    const classes = ["sopan", "tidak sopan"];
    const classWordCounts = {};
    const classTotalWords = {};

    // Initialize counters
    classes.forEach((className) => {
      classWordCounts[className] = {};
      classTotalWords[className] = 0;
    });

    // Count words per class
    this.trainingData.forEach((item) => {
      const words = this.preprocessText(item.text);
      const className = item.label;

      words.forEach((word) => {
        classWordCounts[className][word] =
          (classWordCounts[className][word] || 0) + 1;
        classTotalWords[className]++;
      });
    });

    // Calculate probabilities with Laplace smoothing
    const vocabularySize = this.vocabulary.size;

    classes.forEach((className) => {
      this.wordProbs[className] = {};

      this.vocabulary.forEach((word) => {
        const wordCount = classWordCounts[className][word] || 0;
        // Laplace smoothing: (count + 1) / (total + vocabulary_size)
        this.wordProbs[className][word] =
          (wordCount + 1) / (classTotalWords[className] + vocabularySize);
      });
    });
  }

  // Initialize/train the Naive Bayes model
  initializeModel() {
    if (this.trainingData.length === 0) return;

    this.buildVocabulary();
    this.calculateClassProbabilities();
    this.calculateWordProbabilities();
  }

  // Predict using Naive Bayes
  predict(text) {
    if (!text.trim() || this.trainingData.length === 0) {
      return { prediction: "sopan", confidence: 0.5 };
    }

    const words = this.preprocessText(text);
    const classes = ["sopan", "tidak sopan"];
    const scores = {};

    // Calculate log probabilities for each class
    classes.forEach((className) => {
      // Start with log of class probability
      scores[className] = Math.log(this.classProbs[className] || 0.5);

      // Add log probabilities of words
      words.forEach((word) => {
        if (this.vocabulary.has(word)) {
          scores[className] += Math.log(this.wordProbs[className][word]);
        } else {
          // Handle unknown words with very small probability
          scores[className] += Math.log(1 / (this.vocabulary.size + 1));
        }
      });
    });

    // Find the class with highest score
    const predictedClass =
      scores["sopan"] > scores["tidak sopan"] ? "sopan" : "tidak sopan";

    // Calculate confidence using softmax-like approach
    const maxScore = Math.max(...Object.values(scores));
    const expScores = {};
    let sumExp = 0;

    for (const className in scores) {
      expScores[className] = Math.exp(scores[className] - maxScore);
      sumExp += expScores[className];
    }

    const confidence = expScores[predictedClass] / sumExp;

    return {
      prediction: predictedClass,
      confidence: Math.max(0.55, Math.min(0.95, confidence)),
    };
  }

  // Add new training data and retrain model
  addTrainingData(text, label) {
    this.trainingData.push({
      text: text,
      label: label,
      timestamp: new Date().toISOString(),
    });

    this.saveTrainingData();
    this.initializeModel(); // Retrain model
    this.updateStats();
  }

  // Calculate model accuracy
  calculateAccuracy() {
    if (this.totalPredictions === 0) return 0;
    return Math.round((this.correctPredictions / this.totalPredictions) * 100);
  }

  // Update statistics display
  updateStats() {
    document.getElementById("totalData").textContent = this.trainingData.length;
    document.getElementById("accuracy").textContent =
      this.calculateAccuracy() + "%";
    document.getElementById("sopanCount").textContent =
      this.trainingData.filter((item) => item.label === "sopan").length;
    document.getElementById("tidakSopanCount").textContent =
      this.trainingData.filter((item) => item.label === "tidak sopan").length;
  }

  // Initialize UI event listeners
  initializeUI() {
    document
      .getElementById("analyzeBtn")
      .addEventListener("click", () => this.analyzePoliteness());
    document.getElementById("chatInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        this.analyzePoliteness();
      }
    });

    document
      .getElementById("correctBtn")
      .addEventListener("click", () => this.handleFeedback(true));
    document
      .getElementById("wrongBtn")
      .addEventListener("click", () => this.handleFeedback(false));
    document
      .getElementById("correctSopan")
      .addEventListener("click", () => this.handleCorrection("sopan"));
    document
      .getElementById("correctTidakSopan")
      .addEventListener("click", () => this.handleCorrection("tidak sopan"));

    document
      .getElementById("showDataBtn")
      .addEventListener("click", () => this.toggleDataDisplay());
    document
      .getElementById("clearDataBtn")
      .addEventListener("click", () => this.clearModel());
    document
      .getElementById("exportDataBtn")
      .addEventListener("click", () => this.exportData());
  }

  // Analyze politeness of input text
  analyzePoliteness() {
    const text = document.getElementById("chatInput").value.trim();
    if (!text) {
      alert("Silakan masukkan teks terlebih dahulu!");
      return;
    }

    this.currentText = text;
    const result = this.predict(text);
    this.currentPrediction = result;
    this.totalPredictions++;

    this.displayResult(result);
  }

  // Display prediction results
  displayResult(result) {
    const resultSection = document.getElementById("resultSection");
    const predictionResult = document.getElementById("predictionResult");
    const confidenceScore = document.getElementById("confidenceScore");

    predictionResult.textContent = result.prediction.toUpperCase();
    predictionResult.className = `prediction ${result.prediction.replace(
      " ",
      "-"
    )}`;

    confidenceScore.textContent = `Tingkat Keyakinan: ${Math.round(
      result.confidence * 100
    )}%`;

    resultSection.style.display = "block";
    document.getElementById("correctionSection").style.display = "none";

    resultSection.scrollIntoView({ behavior: "smooth" });
  }

  // Handle user feedback on prediction
  handleFeedback(isCorrect) {
    if (isCorrect) {
      this.correctPredictions++;
      this.addTrainingData(this.currentText, this.currentPrediction.prediction);
      this.showFeedbackMessage(
        "✅ Terima kasih! Prediksi benar dan model telah diperbarui."
      );
    } else {
      document.getElementById("correctionSection").style.display = "block";
    }
    this.updateStats();
  }

  // Handle user correction
  handleCorrection(correctLabel) {
    this.addTrainingData(this.currentText, correctLabel);
    this.showFeedbackMessage(
      "🔧 Terima kasih! Model telah dilatih ulang dengan data yang benar."
    );
    document.getElementById("correctionSection").style.display = "none";
    this.updateStats();
  }

  // Show feedback message
  showFeedbackMessage(message) {
    const existingMsg = document.querySelector(".feedback-message");
    if (existingMsg) existingMsg.remove();

    const msgDiv = document.createElement("div");
    msgDiv.className = "feedback-message";
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          padding: 15px;
          margin: 15px 0;
          border-radius: 10px;
          text-align: center;
      `;

    document.getElementById("resultSection").appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 3000);
  }

  // Toggle training data display
  toggleDataDisplay() {
    const dataList = document.getElementById("trainingDataList");
    const btn = document.getElementById("showDataBtn");

    if (dataList.style.display === "none") {
      this.displayTrainingData();
      dataList.style.display = "block";
      btn.textContent = "Sembunyikan Data";
    } else {
      dataList.style.display = "none";
      btn.textContent = "Tampilkan Data";
    }
  }

  // Display training data
  displayTrainingData() {
    const dataList = document.getElementById("trainingDataList");
    dataList.innerHTML = "";

    if (this.trainingData.length === 0) {
      dataList.innerHTML = "<p>Belum ada data training</p>";
      return;
    }

    this.trainingData.forEach((item, index) => {
      const dataItem = document.createElement("div");
      dataItem.className = `data-item ${item.label.replace(" ", "-")}`;
      dataItem.innerHTML = `
              <div class="data-text">"${item.text}"</div>
              <div class="data-label">Label: ${item.label} ${
        item.timestamp
          ? `| ${new Date(item.timestamp).toLocaleString("id-ID")}`
          : ""
      }</div>
          `;
      dataList.appendChild(dataItem);
    });
  }

  // Clear model and reset data
  clearModel() {
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus semua data training? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      localStorage.removeItem("politenessTrainingData");
      this.trainingData = this.loadTrainingData();
      this.correctPredictions = 0;
      this.totalPredictions = 0;
      this.initializeModel();
      this.updateStats();
      document.getElementById("trainingDataList").style.display = "none";
      document.getElementById("showDataBtn").textContent = "Tampilkan Data";
      alert("Model berhasil direset!");
    }
  }

  // Export training data
  exportData() {
    const dataStr = JSON.stringify(
      {
        trainingData: this.trainingData,
        statistics: {
          totalData: this.trainingData.length,
          accuracy: this.calculateAccuracy(),
          sopanCount: this.trainingData.filter((item) => item.label === "sopan")
            .length,
          tidakSopanCount: this.trainingData.filter(
            (item) => item.label === "tidak sopan"
          ).length,
          exportDate: new Date().toISOString(),
        },
      },
      null,
      2
    );

    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `politeness_model_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new NaiveBayesPolitenessDetector();
});
