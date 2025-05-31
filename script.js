// NAIVE BAYES CLASSIFIER SEDERHANA
class SimpleNaiveBayes {
  constructor() {
    // Data training - contoh kalimat
    this.trainingData = {
      sopan: [
        "terima kasih",
        "mohon maaf",
        "selamat pagi",
        "tolong bantu",
        "permisi",
        "dengan hormat",
        "silakan",
        "bagus sekali",
        "mohon tunggu",
        "baik sekali",
        "selamat siang",
        "selamat malam",
        "maaf mengganggu",
        "boleh minta tolong",
        "terima kasih banyak",
      ],
      tidakSopan: [
        "bodoh",
        "goblok",
        "sialan",
        "tolol",
        "bangsat",
        "bego",
        "kampret",
        "payah",
        "jelek banget",
        "dasar",
        "anjing",
        "setan",
        "kurang ajar",
        "brengsek",
        "bajingan",
      ],
    };

    // Statistik
    this.stats = {
      totalPredictions: 0,
      correctPredictions: 0,
    };

    // Variabel untuk feedback
    this.lastText = "";
    this.lastPrediction = "";

    // Hitung kata-kata dari data training
    this.processTrainingData();
  }

  // Memproses data training untuk menghitung frekuensi kata
  processTrainingData() {
    this.wordCounts = {
      sopan: {},
      tidakSopan: {},
    };

    this.totalWords = {
      sopan: 0,
      tidakSopan: 0,
    };

    // Hitung kata di setiap kategori
    for (let category in this.trainingData) {
      for (let sentence of this.trainingData[category]) {
        let words = this.cleanText(sentence);

        for (let word of words) {
          // Inisialisasi jika belum ada
          if (!this.wordCounts[category][word]) {
            this.wordCounts[category][word] = 0;
          }

          // Tambah hitungan
          this.wordCounts[category][word]++;
          this.totalWords[category]++;
        }
      }
    }
  }

  // Membersihkan dan memecah teks
  cleanText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(" ")
      .filter((word) => word.length > 0);
  }

  // Menghitung probabilitas kata dalam kategori
  getWordProbability(word, category) {
    let wordCount = this.wordCounts[category][word] || 0;
    let totalWords = this.totalWords[category];
    let vocabularySize = Object.keys(this.wordCounts[category]).length;

    // Laplace smoothing: tambah 1 untuk menghindari probabilitas 0
    return (wordCount + 1) / (totalWords + vocabularySize + 1);
  }

  // Prediksi teks
  predict(text) {
    this.lastText = text;
    let words = this.cleanText(text);

    // Hitung probabilitas untuk setiap kategori
    let probSopan = 0.5; // probabilitas awal 50-50
    let probTidakSopan = 0.5;

    // Kalikan dengan probabilitas setiap kata
    for (let word of words) {
      probSopan *= this.getWordProbability(word, "sopan");
      probTidakSopan *= this.getWordProbability(word, "tidakSopan");
    }

    // Normalisasi
    let total = probSopan + probTidakSopan;
    probSopan = probSopan / total;
    probTidakSopan = probTidakSopan / total;

    // Tentukan prediksi
    let prediction = probSopan > probTidakSopan ? "sopan" : "tidak sopan";
    let confidence = Math.max(probSopan, probTidakSopan);

    this.lastPrediction = prediction;

    return {
      prediction: prediction,
      confidence: Math.round(confidence * 100),
      probabilities: {
        sopan: Math.round(probSopan * 100),
        tidakSopan: Math.round(probTidakSopan * 100),
      },
    };
  }

  // Memberikan feedback
  addFeedback(isCorrect) {
    this.stats.totalPredictions++;

    if (isCorrect) {
      this.stats.correctPredictions++;
      // Tambah ke data training yang benar
      let correctCategory =
        this.lastPrediction === "sopan" ? "sopan" : "tidakSopan";
      this.trainingData[correctCategory].push(this.lastText);
    } else {
      // Tambah ke kategori yang berlawanan
      let correctCategory =
        this.lastPrediction === "sopan" ? "tidakSopan" : "sopan";
      this.trainingData[correctCategory].push(this.lastText);
    }

    // Update model
    this.processTrainingData();
  }

  // Mendapatkan statistik
  getStats() {
    let accuracy =
      this.stats.totalPredictions > 0
        ? Math.round(
            (this.stats.correctPredictions / this.stats.totalPredictions) * 100
          )
        : 0;

    return {
      totalPredictions: this.stats.totalPredictions,
      correctPredictions: this.stats.correctPredictions,
      accuracy: accuracy,
    };
  }
}

// ========================================
// INISIALISASI DAN FUNGSI UI
// ========================================

// Buat instance classifier
const classifier = new SimpleNaiveBayes();

// Fungsi untuk menganalisis teks
function analyzeText() {
  const text = document.getElementById("textInput").value.trim();

  if (!text) {
    alert("Silakan masukkan teks terlebih dahulu!");
    return;
  }

  // Prediksi
  const result = classifier.predict(text);

  // Tampilkan hasil
  showResult(result);
  updateStats();
}

// Menampilkan hasil prediksi
function showResult(result) {
  const resultDiv = document.getElementById("result");
  const predictionDiv = document.getElementById("prediction");
  const confidenceDiv = document.getElementById("confidence");

  // Set prediction text dan class
  predictionDiv.textContent = result.prediction.toUpperCase();
  predictionDiv.className = `prediction ${result.prediction.replace(" ", "-")}`;

  // Set confidence
  confidenceDiv.textContent = `Keyakinan: ${result.confidence}%`;

  // Tampilkan hasil
  resultDiv.style.display = "block";
  resultDiv.scrollIntoView({ behavior: "smooth" });
}

// Memberikan feedback
function giveFeedback(isCorrect) {
  classifier.addFeedback(isCorrect);

  const message = isCorrect
    ? "✅ Terima kasih! Model semakin pintar."
    : "🔧 Model telah diperbaiki. Terima kasih!";

  showMessage(message);
  updateStats();
}

// Menampilkan pesan
function showMessage(text) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.style.display = "block";

  // Auto hide setelah 3 detik
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 3000);
}

// Update statistik
function updateStats() {
  const stats = classifier.getStats();

  document.getElementById("totalPredictions").textContent =
    stats.totalPredictions;
  document.getElementById("correctCount").textContent =
    stats.correctPredictions;
  document.getElementById("accuracy").textContent = stats.accuracy + "%";
}

// ========================================
// EVENT LISTENERS
// ========================================

// Event listener untuk Enter key
document.addEventListener("DOMContentLoaded", function () {
  // Keyboard shortcut (Ctrl+Enter untuk analisis)
  document
    .getElementById("textInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter" && e.ctrlKey) {
        analyzeText();
      }
    });

  // Inisialisasi statistik
  updateStats();

  console.log("🎉 Aplikasi AI Deteksi Kesopanan siap digunakan!");
  console.log("💡 Tips: Tekan Ctrl+Enter untuk analisis cepat");
});
