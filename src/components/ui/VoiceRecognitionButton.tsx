import { useState } from "react";

interface Props {
  onResult: (text: string) => void;
}

const VoiceRecognitionButton: React.FC<Props> = ({ onResult }) => {
  const [listening, setListening] = useState(false);

  const recognizeInLang = (lang: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Browser tidak mendukung Speech Recognition");
        resolve(null);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log(`🎧 [${lang}] hasil:`, transcript);
        resolve(transcript);
      };

      recognition.onerror = (e: any) => {
        console.error(`❌ Error [${lang}]:`, e);
        resolve(null);
      };

      recognition.onend = () => {
        console.log(`[${lang}] selesai`);
      };

      recognition.start();
    });
  };

  const handleStartListening = async () => {
    setListening(true);

    const langs = ["ar-SA", "id-ID", "en-US"];
    let transcript: string | null = null;

    for (const lang of langs) {
      transcript = await recognizeInLang(lang);
      if (transcript) break; 
    }

    setListening(false);
    if (transcript) onResult(transcript);
    else alert("Tidak ada hasil suara yang dikenali.");
  };

  return (
    <button
      onClick={handleStartListening}
      className={`p-3 mt-4 rounded-xl text-black font-semibold w-full border ${
      listening ? "bg-red-300" : "bg-green-300 hover:bg-green-400"
    }`}
    >
      🎤 {listening ? "Mendengarkan..." : "Mulai Baca Ayat"}
    </button>
  );
};

export default VoiceRecognitionButton;