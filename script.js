class PolitenessDetector {
  constructor() {
    this.trainingData = this.loadTrainingData();
    this.model = this.initializeModel();
    this.currentPrediction = null;
    this.currentText = "";
    this.correctPredictions = 0;
    this.totalPredictions = 0;

    this.initializeUI();
    this.updateStats();
  }

  initializeModel() {
    return {
      sopanWords: [
        "terima kasih",
        "tolong",
        "maaf",
        "permisi",
        "selamat",
        "mohon",
        "silakan",
        "dengan hormat",
        "baik",
        "bagus",
        "hebat",
        "keren",
        "mantap",
        "makasih",
        "thanks",
      ],
      tidakSopanWords: [
        "bodoh",
        "goblok",
        "tolol",
        "bangsat",
        "anjing",
        "bego",
        "idiot",
        "sialan",
        "kampret",
        "mampus",
        "tai",
        "sial",
        "keparat",
        "asu",
      ],
    };
  }

  loadTrainingData() {
    const saved = JSON.parse(
      sessionStorage.getItem("politenessTrainingData") || "[]"
    );
    return saved.length > 0
      ? saved
      : [
          { text: "terima kasih banyak atas bantuannya", label: "sopan" },
          { text: "tolong bantu saya", label: "sopan" },
          { text: "maaf mengganggu waktu anda", label: "sopan" },
          {
            text: "selamat pagi, semoga hari anda menyenangkan",
            label: "sopan",
          },
          { text: "kamu bodoh sekali", label: "tidak sopan" },
          { text: "dasar goblok", label: "tidak sopan" },
          { text: "pergi sana tolol", label: "tidak sopan" },
          { text: "bangsat lu", label: "tidak sopan" },
        ];
  }

  saveTrainingData() {
    sessionStorage.setItem(
      "politenessTrainingData",
      JSON.stringify(this.trainingData)
    );
  }

  predict(text) {
    if (!text.trim()) return { prediction: "sopan", confidence: 0.5 };

    const lowerText = text.toLowerCase();
    let sopanScore = 0;
    let tidakSopanScore = 0;

    // Hitung kata sopan
    this.model.sopanWords.forEach((word) => {
      if (lowerText.includes(word)) {
        sopanScore += 2;
      }
    });

    // Hitung kata tidak sopan
    this.model.tidakSopanWords.forEach((word) => {
      if (lowerText.includes(word)) {
        tidakSopanScore += 3;
      }
    });

    // Cek pola sapaan
    if (/\b(halo|hai|selamat|pagi|siang|sore|malam)\b/i.test(text)) {
      sopanScore += 1;
    }

    // Cek tanda baca berlebihan
    if (/[!]{2,}|[?]{2,}/.test(text)) {
      tidakSopanScore += 1;
    }

    // Default ke sopan jika netral
    if (sopanScore === 0 && tidakSopanScore === 0) {
      sopanScore = 1;
    }

    const totalScore = sopanScore + tidakSopanScore;
    const confidence =
      totalScore > 0 ? Math.max(sopanScore, tidakSopanScore) / totalScore : 0.5;

    return {
      prediction: sopanScore >= tidakSopanScore ? "sopan" : "tidak sopan",
      confidence: Math.min(0.95, Math.max(0.55, confidence)),
    };
  }

  addTrainingData(text, label) {
    this.trainingData.push({
      text,
      label,
      timestamp: new Date().toISOString(),
    });
    this.saveTrainingData();
    this.updateStats();
  }

  calculateAccuracy() {
    if (this.totalPredictions === 0) return 0;
    return Math.round((this.correctPredictions / this.totalPredictions) * 100);
  }

  updateStats() {
    document.getElementById("totalData").textContent = this.trainingData.length;
    document.getElementById("accuracy").textContent =
      this.calculateAccuracy() + "%";
    document.getElementById("sopanCount").textContent =
      this.trainingData.filter((item) => item.label === "sopan").length;
    document.getElementById("tidakSopanCount").textContent =
      this.trainingData.filter((item) => item.label === "tidak sopan").length;
  }

  initializeUI() {
    // Event listeners
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

  handleFeedback(isCorrect) {
    if (isCorrect) {
      this.correctPredictions++;
      this.addTrainingData(this.currentText, this.currentPrediction.prediction);
      this.showFeedbackMessage(
        "✅ Terima kasih! Prediksi benar dan telah disimpan."
      );
    } else {
      document.getElementById("correctionSection").style.display = "block";
    }
    this.updateStats();
  }

  handleCorrection(correctLabel) {
    this.addTrainingData(this.currentText, correctLabel);
    this.showFeedbackMessage(
      "🔧 Terima kasih atas koreksinya! Model telah diperbarui."
    );
    document.getElementById("correctionSection").style.display = "none";
    this.updateStats();
  }

  showFeedbackMessage(message) {
    const existingMsg = document.querySelector(".feedback-message");
    if (existingMsg) existingMsg.remove();

    const msgDiv = document.createElement("div");
    msgDiv.className = "feedback-message";
    msgDiv.textContent = message;

    document.getElementById("resultSection").appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 3000);
  }

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
              <div class="data-label">Label: ${item.label}${
        item.timestamp ? ` | ${new Date(item.timestamp).toLocaleString()}` : ""
      }</div>
          `;
      dataList.appendChild(dataItem);
    });
  }

  clearModel() {
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus semua data training? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      sessionStorage.removeItem("politenessTrainingData");
      this.trainingData = this.loadTrainingData();
      this.correctPredictions = 0;
      this.totalPredictions = 0;
      this.updateStats();
      document.getElementById("trainingDataList").style.display = "none";
      document.getElementById("showDataBtn").textContent = "Tampilkan Data";
      alert("Model berhasil direset!");
    }
  }

  exportData() {
    const dataStr = JSON.stringify(this.trainingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `politeness_training_data_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize aplikasi ketika DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  new PolitenessDetector();
});
