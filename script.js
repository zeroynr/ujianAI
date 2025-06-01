// Data training untuk klasifikasi
const data = {
  sopan: [
    "terima kasih",
    "mohon maaf",
    "tolong",
    "permisi",
    "silakan",
    "selamat",
    "dengan hormat",
    "mohon bantuan",
  ],
  tidakSopan: [
    "bodoh",
    "goblok",
    "tolol",
    "bangsat",
    "anjing",
    "kampret",
    "bego",
    "sialan",
  ],
};

// Statistik aplikasi
let stats = {
  total: 0,
  correct: 0,
};

// Menyimpan hasil terakhir untuk feedback
let lastResult = {};

// Fungsi utama untuk menganalisis teks
function analyze() {
  const text = document.getElementById("textInput").value.toLowerCase().trim();

  if (!text) {
    alert("Masukkan teks terlebih dahulu!");
    return;
  }

  let sopanScore = 0;
  let tidakSopanScore = 0;

  // Hitung skor berdasarkan kata yang ditemukan
  data.sopan.forEach((word) => {
    if (text.includes(word)) sopanScore++;
  });

  data.tidakSopan.forEach((word) => {
    if (text.includes(word)) tidakSopanScore++;
  });

  // Tentukan hasil prediksi
  const isSopan = sopanScore >= tidakSopanScore;
  const prediction = isSopan ? "SOPAN" : "TIDAK SOPAN";
  const confidence = Math.max(sopanScore, tidakSopanScore) * 20 + 50;

  // Simpan hasil untuk feedback
  lastResult = {
    text: text,
    prediction: isSopan,
  };

  // Tampilkan hasil
  showResult(prediction, confidence, isSopan);
}

// Menampilkan hasil prediksi
function showResult(prediction, confidence, isSopan) {
  const resultDiv = document.getElementById("result");
  const predictionDiv = document.getElementById("prediction");

  predictionDiv.innerHTML = `<strong>${prediction}</strong><br>Keyakinan: ${confidence}%`;
  resultDiv.className = `result ${isSopan ? "sopan" : "tidak-sopan"}`;
  resultDiv.style.display = "block";
}

// Memberikan feedback untuk memperbaiki model
function feedback(isCorrect) {
  stats.total++;

  if (isCorrect) {
    stats.correct++;
    showMessage("✅ Terima kasih! Model semakin akurat.");
  } else {
    // Perbaiki data training
    improvModel();
    showMessage("🔧 Model telah diperbaiki berdasarkan feedback Anda!");
  }

  updateStats();
}

// Memperbaiki model berdasarkan feedback negatif
function improvModel() {
  if (!lastResult.text) return;

  const correctCategory = lastResult.prediction ? "tidakSopan" : "sopan";
  const words = lastResult.text.split(" ").filter((word) => word.length > 2);

  if (words.length > 0) {
    // Tambahkan kata pertama yang cukup panjang ke kategori yang benar
    data[correctCategory].push(words[0]);
  }
}

// Menampilkan pesan sementara
function showMessage(message) {
  alert(message);
}

// Update statistik di UI
function updateStats() {
  document.getElementById("total").textContent = stats.total;
  document.getElementById("correct").textContent = stats.correct;

  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  document.getElementById("accuracy").textContent = accuracy + "%";
}

// Inisialisasi aplikasi ketika halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi statistik
  updateStats();

  console.log("🎉 AI Deteksi Kesopanan siap digunakan!");
});
