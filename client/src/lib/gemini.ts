import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Default model
const defaultModelName = "gemini-2.5-flash-preview-05-20"; 

// Chat history interface
export interface ChatMessage {
  role: "user" | "model" | "function" | "system";
  content: string;
}

// Create a chat session
export const createChatSession = async (history: ChatMessage[] = []) => {
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const model = genAI.getGenerativeModel({ model: defaultModelName });
  
  try {
    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Token diperbesar untuk jawaban lebih panjang
      },
    });
    return chat;
  } catch (error) {
    console.error("Error creating chat session:", error);
    const errorMessage = (typeof error === "object" && error !== null && "message" in error)
      ? (error as { message?: string }).message
      : String(error);
    throw new Error("Failed to initialize chat session: " + errorMessage);
  }
};

// --- FUNGSI UNTUK CHAT BIASA (Telah Diubah) ---
export const sendMessage = async (
  chat: any,
  message: string,
  analysisHistory: any[] = [],
  retries = 3,
  delay = 1000,
): Promise<string> => {

  // DIUBAH: System prompt dibuat lebih sederhana untuk percakapan umum.
  const simpleSystemPrompt = `Anda adalah Arina, asisten AI yang ramah, canggih, dan ahli dalam agribisnis. 
  Jawablah pertanyaan dengan jelas dan terstruktur. 
  Selalu gunakan format Markdown (seperti heading, bold, dan list) untuk membuat jawaban mudah dibaca. 
  Jika diminta data tabel, gunakan format tabel Markdown.`;

  if (!chat) {
    throw new Error('Chat session is not initialized');
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Invalid message');
  }

  try {
    let finalMessage = message;
    
    // Konteks riwayat analisis tetap bisa disertakan jika ada
    if (analysisHistory && analysisHistory.length > 0) {
      const historyCount = Math.min(analysisHistory.length, 2);
      const contextPrefix = `Konteks dari analisis sebelumnya:\n`;
      const analysisContext = analysisHistory
        .slice(0, historyCount)
        .map((analysis, i) => `- Analisis Tipe: ${analysis.type} pada ${new Date(analysis.created_at).toLocaleDateString('id-ID')}`)
        .join('\n');
      finalMessage = `${contextPrefix}${analysisContext}\n\nPesan Pengguna: ${message}`;
    }
    
    // Menggabungkan prompt sederhana dengan pesan pengguna
    const messageToSend = `${simpleSystemPrompt}\n\n---\n\n${finalMessage}`;
    
    const result = await chat.sendMessage(messageToSend);
    const response = await result.response.text();
    
    return response.trim() || "Maaf, saya tidak bisa memberikan respons saat ini.";

  } catch (error: any) {
    console.error("Error sending message:", error);
    // Penanganan error tetap sama
    if (error.status === 429) {
      // ... (logika retry dan rate limit)
      return `Maaf, server sedang sibuk. Mohon coba lagi dalam beberapa saat.`;
    }
    return "Maaf, terjadi kesalahan saat memproses permintaan Anda.";
  }
};


// --- FUNGSI BARU (Untuk Analisis Detail) ---
// Fungsi ini menggunakan prompt detail Anda yang lama, khusus untuk menghasilkan laporan.
export const generateAnalysisResponse = async (
  analysisType: string,
  data: any,
  analysisHistory: any[] = []
): Promise<string> => {
  
  // DIUBAH: Prompt detail sekarang ada di dalam fungsi ini, tidak di `sendMessage` lagi.
  const detailedSystemPrompt = `Anda adalah **Arina** (Agriculture Intelligence Assistant), asisten AI yang ahli dalam analisis bisnis pertanian di Indonesia maupun diluar Indonesia. Anda akan membuat laporan analisis yang detail dan profesional.

## TUGAS ANDA
Membuat laporan terstruktur berdasarkan data yang diberikan, dengan format berikut:

\`\`\`markdown
## [Emoji] Judul Utama Analisis ${analysisType}

### 📋 Ringkasan
[Ringkasan singkat dan jelas dari temuan utama.]

### 💡 Analisis Mendalam
1.  **Poin Pertama:** Penjelasan detail.
2.  **Poin Kedua:** Penjelasan detail.

### 🎯 Rekomendasi Praktis
| Prioritas | Tindakan | Estimasi Dampak |
|-----------|----------|-----------------|
| Tinggi    | [Aksi]   | [Dampak]        |
| Sedang    | [Aksi]   | [Dampak]        |

### ⚠️ Potensi Risiko
> **Catatan Penting:** [Jelaskan risiko utama dan cara mitigasinya.]

### 🔄 Langkah Selanjutnya
- [ ] Tugas 1
- [ ] Tugas 2
\`\`\`

Selalu gunakan format di atas. Berikan analisis yang tajam, relevan dengan agribisnis Indonesia, dan sertakan perhitungan jika ada angka.
`;

  let fullPrompt = `${detailedSystemPrompt}\n\n## 📊 Data untuk Dianalisis\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

  if (analysisHistory && analysisHistory.length > 0) {
    const historyContext = analysisHistory
      .map((item, index) => `### Riwayat Analisis ${index + 1}: ${item.type}\n\`\`\`json\n${JSON.stringify(item.data, null, 2)}\n\`\`\``)
      .join("\n\n");
    fullPrompt += `\n\n## Konteks dari Riwayat Analisis Sebelumnya\n${historyContext}`;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: defaultModelName });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response.text();
    return response.trim();
  } catch (error) {
    console.error("Error generating analysis response:", error);
    return "Gagal menghasilkan laporan analisis.";
  }
};