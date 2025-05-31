// =====================================================
// NAIVE BAYES CLASSIFIER SEDERHANA UNTUK DETEKSI KESOPANAN
// =====================================================

class NaiveBayesClassifier {
  constructor() {
    // Data training awal - contoh kalimat sopan dan tidak sopan
    this.trainingData = {
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
        "payah lu",
        "jelek banget",
      ],
    };

    // Struktur data untuk menyimpan informasi model
    this.vocabulary = new Set(); // Semua kata yang pernah dilihat
    this.wordCounts = {
      // Jumlah kemunculan kata per kategori
      sopan: {},
      tidakSopan: {},
    };
    this.totalWords = {
      // Total kata per kategori
      sopan: 0,
      tidakSopan: 0,
    };
    this.documentCounts = {
      // Jumlah dokumen per kategori
      sopan: this.trainingData.sopan.length,
      tidakSopan: this.trainingData.tidakSopan.length,
    };

    // Statistik untuk feedback
    this.statistics = {
      totalPredictions: 0,
      correctPredictions: 0,
    };

    // Variabel untuk menyimpan prediksi terakhir
    this.lastText = "";
    this.lastPrediction = "";

    // Mulai training model
    this.trainModel();
  }

  // =====================================================
  // STEP 1: PREPROCESSING TEXT
  // Membersihkan dan memecah teks menjadi kata-kata
  // =====================================================
  preprocessText(text) {
    console.log("🔄 Preprocessing text:", text);

    // 1. Ubah ke huruf kecil
    let cleanText = text.toLowerCase();

    // 2. Hapus tanda baca dan karakter khusus
    cleanText = cleanText.replace(/[^\w\s]/g, " ");

    // 3. Hapus spasi berlebih
    cleanText = cleanText.replace(/\s+/g, " ").trim();

    // 4. Pecah menjadi array kata
    let words = cleanText.split(" ").filter((word) => word.length > 0);

    console.log("✅ Hasil preprocessing:", words);
    return words;
  }

  // =====================================================
  // STEP 2: TRAINING MODEL
  // Belajar dari data training untuk menghitung probabilitas
  // =====================================================
  trainModel() {
    console.log("🎯 Mulai training model...");

    // Reset semua data
    this.vocabulary.clear();
    this.wordCounts = { sopan: {}, tidakSopan: {} };
    this.totalWords = { sopan: 0, tidakSopan: 0 };

    // Proses setiap kategori (sopan dan tidak sopan)
    for (let category of ["sopan", "tidakSopan"]) {
      console.log(`\n📚 Training kategori: ${category}`);

      // Proses setiap kalimat dalam kategori
      for (let sentence of this.trainingData[category]) {
        let words = this.preprocessText(sentence);

        // Hitung setiap kata
        for (let word of words) {
          // Tambah ke vocabulary
          this.vocabulary.add(word);

          // Hitung kemunculan kata di kategori ini
          if (!this.wordCounts[category][word]) {
            this.wordCounts[category][word] = 0;
          }
          this.wordCounts[category][word]++;

          // Update total kata di kategori ini
          this.totalWords[category]++;
        }
      }

      console.log(`✅ Kategori ${category}: ${this.totalWords[category]} kata`);
    }

    console.log(
      `\n🎉 Training selesai! Total vocabulary: ${this.vocabulary.size} kata`
    );
    this.showTrainingResults();
  }

  // =====================================================
  // STEP 3: MENGHITUNG PROBABILITAS KATA
  // P(kata|kategori) dengan Laplace Smoothing
  // =====================================================
  getWordProbability(word, category) {
    // Jumlah kemunculan kata di kategori
    let wordCount = this.wordCounts[category][word] || 0;

    // Total kata di kategori
    let totalWords = this.totalWords[category];

    // Ukuran vocabulary (untuk Laplace smoothing)
    let vocabularySize = this.vocabulary.size;

    // Laplace Smoothing: (count + 1) / (total + vocabulary_size)
    let probability = (wordCount + 1) / (totalWords + vocabularySize);

    return probability;
  }

  // =====================================================
  // STEP 4: MENGHITUNG PROBABILITAS KATEGORI
  // P(kategori) = jumlah dokumen kategori / total dokumen
  // =====================================================
  getCategoryProbability(category) {
    let totalDocuments =
      this.documentCounts.sopan + this.documentCounts.tidakSopan;
    return this.documentCounts[category] / totalDocuments;
  }

  // =====================================================
  // STEP 5: PREDIKSI MENGGUNAKAN NAIVE BAYES
  // Menghitung probabilitas untuk setiap kategori
  // =====================================================
  predict(text) {
    console.log("\n🔮 Mulai prediksi untuk:", text);

    // Simpan untuk feedback nanti
    this.lastText = text;

    // Preprocessing text input
    let words = this.preprocessText(text);

    // Hitung log probabilitas untuk setiap kategori
    // Menggunakan log untuk menghindari underflow
    let logProbSopan = Math.log(this.getCategoryProbability("sopan"));
    let logProbTidakSopan = Math.log(this.getCategoryProbability("tidakSopan"));

    console.log("\n📊 Perhitungan detail:");
    console.log(
      `P(sopan) = ${this.getCategoryProbability("sopan").toFixed(4)}`
    );
    console.log(
      `P(tidak sopan) = ${this.getCategoryProbability("tidakSopan").toFixed(4)}`
    );

    let calculationSteps = [];
    calculationSteps.push(`Kata yang dianalisis: [${words.join(", ")}]`);
    calculationSteps.push(`\nProbabilitas awal:`);
    calculationSteps.push(
      `P(sopan) = ${this.getCategoryProbability("sopan").toFixed(4)}`
    );
    calculationSteps.push(
      `P(tidak sopan) = ${this.getCategoryProbability("tidakSopan").toFixed(4)}`
    );
    calculationSteps.push(`\nPerhitungan per kata:`);

    // Kalikan dengan probabilitas setiap kata
    for (let word of words) {
      let probSopan = this.getWordProbability(word, "sopan");
      let probTidakSopan = this.getWordProbability(word, "tidakSopan");

      logProbSopan += Math.log(probSopan);
      logProbTidakSopan += Math.log(probTidakSopan);

      console.log(
        `"${word}": P(sopan)=${probSopan.toFixed(
          6
        )}, P(tidak sopan)=${probTidakSopan.toFixed(6)}`
      );
      calculationSteps.push(
        `"${word}": P(sopan)=${probSopan.toFixed(
          6
        )}, P(tidak sopan)=${probTidakSopan.toFixed(6)}`
      );
    }

    // Konversi kembali dari log probability
    let probSopan = Math.exp(logProbSopan);
    let probTidakSopan = Math.exp(logProbTidakSopan);

    // Normalisasi probabilitas agar total = 1
    let totalProb = probSopan + probTidakSopan;
    let normalizedProbSopan = probSopan / totalProb;
    let normalizedProbTidakSopan = probTidakSopan / totalProb;

    // Tentukan prediksi
    let prediction =
      normalizedProbSopan > normalizedProbTidakSopan ? "sopan" : "tidak sopan";
    let confidence = Math.max(normalizedProbSopan, normalizedProbTidakSopan);

    this.lastPrediction = prediction;

    calculationSteps.push(`\nHasil akhir:`);
    calculationSteps.push(
      `P(sopan|text) = ${(normalizedProbSopan * 100).toFixed(2)}%`
    );
    calculationSteps.push(
      `P(tidak sopan|text) = ${(normalizedProbTidakSopan * 100).toFixed(2)}%`
    );
    calculationSteps.push(`\nPrediksi: ${prediction.toUpperCase()}`);

    console.log(
      `\n🎯 Hasil prediksi: ${prediction} (${(confidence * 100).toFixed(2)}%)`
    );

    return {
      prediction: prediction,
      confidence: Math.round(confidence * 100),
      probabilities: {
        sopan: Math.round(normalizedProbSopan * 100),
        tidakSopan: Math.round(normalizedProbTidakSopan * 100),
      },
      calculationSteps: calculationSteps,
      words: words,
    };
  }

  // =====================================================
  // LEARNING: Menambah data training baru
  // =====================================================
  addTrainingData(text, label) {
    console.log(`📝 Menambah data baru: "${text}" -> ${label}`);

    // Tambah ke data training
    this.trainingData[label].push(text);
    this.documentCounts[label]++;

    // Re-train model dengan data baru
    this.trainModel();

    console.log("✅ Model berhasil diupdate!");
  }

  // =====================================================
  // FEEDBACK SYSTEM
  // =====================================================
  giveFeedback(isCorrect) {
    this.statistics.totalPredictions++;

    if (isCorrect) {
      this.statistics.correctPredictions++;
      // Tambah ke data training untuk memperkuat model
      this.addTrainingData(this.lastText, this.lastPrediction);
    } else {
      // Jika salah, tambah ke kategori yang benar
      let correctLabel =
        this.lastPrediction === "sopan" ? "tidakSopan" : "sopan";
      this.addTrainingData(this.lastText, correctLabel);
    }
  }

  // =====================================================
  // STATISTIK MODEL
  // =====================================================
  getStatistics() {
    let accuracy =
      this.statistics.totalPredictions > 0
        ? Math.round(
            (this.statistics.correctPredictions /
              this.statistics.totalPredictions) *
              100
          )
        : 0;

    return {
      totalWords: this.vocabulary.size,
      accuracy: accuracy,
      sopanDocs: this.documentCounts.sopan,
      tidakSopanDocs: this.documentCounts.tidakSopan,
      totalPredictions: this.statistics.totalPredictions,
    };
  }

  // =====================================================
  // HELPER: Menampilkan hasil training
  // =====================================================
  showTrainingResults() {
    console.log("\n📈 Ringkasan Training:");
    console.log("=".repeat(50));

    for (let category of ["sopan", "tidakSopan"]) {
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`- Jumlah dokumen: ${this.documentCounts[category]}`);
      console.log(`- Total kata: ${this.totalWords[category]}`);

      // Tampilkan 5 kata paling sering
      let sortedWords = Object.entries(this.wordCounts[category])
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      console.log(
        "- Kata tersering:",
        sortedWords.map(([word, count]) => `${word}(${count})`).join(", ")
      );
    }
  }
}

// =====================================================
// UI FUNCTIONS - Mengatur tampilan dan interaksi
// =====================================================

// Inisialisasi classifier
const classifier = new NaiveBayesClassifier();

// Fungsi untuk menampilkan hasil prediksi
function showResult(result) {
  // Update elemen prediksi
  const predictionEl = document.getElementById("prediction");
  predictionEl.textContent = result.prediction.toUpperCase();
  predictionEl.className = `prediction ${result.prediction.replace(" ", "-")}`;

  // Update confidence
  document.getElementById(
    "confidence"
  ).textContent = `Keyakinan: ${result.confidence}%`;

  // Update detail perhitungan
  document.getElementById("calculationDetails").innerHTML =
    `<strong>🧮 Detail Perhitungan Naive Bayes:</strong><br><br>` +
    result.calculationSteps.join("<br>");

  // Tampilkan section hasil
  document.getElementById("result").style.display = "block";

  // Update statistik
  updateStatistics();

  // Scroll ke hasil
  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
}

// Fungsi untuk mengupdate statistik
function updateStatistics() {
  const stats = classifier.getStatistics();
  document.getElementById("totalWords").textContent = stats.totalWords;
  document.getElementById("accuracy").textContent = stats.accuracy + "%";
  document.getElementById("sopanDocs").textContent = stats.sopanDocs;
  document.getElementById("tidakSopanDocs").textContent = stats.tidakSopanDocs;
}

// Fungsi untuk menampilkan pesan
function showMessage(text, type = "success") {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.style.display = "block";

  // Auto hide setelah 3 detik
  setTimeout(() => {
    messageEl.style.display = "none";
  }, 3000);
}

// =====================================================
// EVENT HANDLERS - Menangani interaksi user
// =====================================================

// Handler untuk tombol analisis
function handleAnalyze() {
  const text = document.getElementById("textInput").value.trim();

  if (!text) {
    alert("Silakan masukkan teks terlebih dahulu!");
    return;
  }

  console.log("\n" + "=".repeat(60));
  console.log("🚀 MEMULAI ANALISIS BARU");
  console.log("=".repeat(60));

  const result = classifier.predict(text);
  showResult(result);
}

// Handler untuk feedback "Benar"
function handleCorrectFeedback() {
  classifier.giveFeedback(true);
  showMessage("✅ Terima kasih! Model semakin pintar.");
  updateStatistics();
}

// Handler untuk feedback "Salah"
function handleWrongFeedback() {
  classifier.giveFeedback(false);
  showMessage("🔧 Model telah diperbaiki. Terima kasih atas koreksinya!");
  updateStatistics();
}

// =====================================================
// INISIALISASI APLIKASI
// =====================================================
function initializeApp() {
  // Pasang event listeners
  document
    .getElementById("analyzeBtn")
    .addEventListener("click", handleAnalyze);
  document
    .getElementById("correctBtn")
    .addEventListener("click", handleCorrectFeedback);
  document
    .getElementById("wrongBtn")
    .addEventListener("click", handleWrongFeedback);

  // Keyboard shortcut (Ctrl+Enter untuk analisis)
  document.getElementById("textInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAnalyze();
    }
  });

  // Update statistik awal
  updateStatistics();

  console.log("🎉 Aplikasi siap digunakan!");
  console.log(
    "💡 Tips: Buka Developer Console untuk melihat detail perhitungan"
  );
}

// Mulai aplikasi ketika DOM sudah loaded
document.addEventListener("DOMContentLoaded", initializeApp);
