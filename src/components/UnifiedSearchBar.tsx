import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Search } from "lucide-react";

interface UnifiedSearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onSearch: (text: string, isRecitation: boolean) => void;
  recognitionAvailable: boolean;
}

export default function UnifiedSearchBar({
  searchText,
  setSearchText,
  onSearch,
  recognitionAvailable,
}: UnifiedSearchBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [detectedMode, setDetectedMode] = useState<string>("");

  // Fungsi untuk mendeteksi apakah input adalah lantunan ayat atau kata kunci
  const detectInputType = (text: string): boolean => {
    // Indikator bahwa ini adalah lantunan ayat (lebih dari 5 kata atau mengandung tanda baca khas ayat)
    const wordCount = text.trim().split(/\s+/).length;
    const hasArabicDiacritics = /[\u064B-\u065F]/.test(text); // Tashkeel
    const hasLongPhrase = wordCount > 5;
    const hasArabicText = /[\u0600-\u06FF]/.test(text);
    
    // Jika panjang atau mengandung tashkeel atau banyak kata Arab, kemungkinan lantunan
    return (hasLongPhrase && hasArabicText) || hasArabicDiacritics;
  };

  const startSmartVoiceSearch = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser tidak mendukung Speech Recognition");
      return;
    }

    setIsListening(true);
    setDetectedMode("Mendengarkan...");

    // Fungsi untuk recognize dalam bahasa tertentu
    const recognizeInLang = (lang: string): Promise<string | null> => {
      return new Promise((resolve) => {
        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log(`🎧 [${lang}] hasil:`, transcript);
          resolve(transcript);
        };

        recognition.onerror = (e: any) => {
          console.error(`❌ Error [${lang}]:`, e);
          resolve(null);
        };

        recognition.start();
      });
    };

    // Coba mengenali dalam berbagai bahasa
    const langs = ["ar-SA", "id-ID", "en-US"];
    let transcript: string | null = null;
    let detectedLang = "";

    for (const lang of langs) {
      transcript = await recognizeInLang(lang);
      if (transcript) {
        detectedLang = lang;
        break;
      }
    }

    setIsListening(false);

    if (transcript) {
      // Deteksi otomatis: lantunan atau kata kunci
      const isRecitation = detectInputType(transcript);
      
      if (isRecitation) {
        setDetectedMode("🎵 Terdeteksi: Lantunan Ayat");
      } else {
        setDetectedMode("🔍 Terdeteksi: Kata Kunci");
      }

      // Set ke input field
      setSearchText(transcript);

      // Auto search setelah 1 detik
      setTimeout(() => {
        onSearch(transcript, isRecitation);
        setDetectedMode("");
      }, 1000);
    } else {
      setDetectedMode("");
      alert("Tidak ada hasil suara yang dikenali.");
    }
  };

  const handleVoiceClick = () => {
    if (isListening) {
      setIsListening(false);
      setDetectedMode("");
      return;
    }

    if (!recognitionAvailable) {
      alert("Browser tidak mendukung Speech Recognition");
      return;
    }

    startSmartVoiceSearch();
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Main Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const isRecitation = detectInputType(searchText);
          onSearch(searchText, isRecitation);
        }}
        className="flex gap-2"
      >
        <Input
          type="text"
          placeholder="Cari ayat dengan teks atau suara..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          onClick={handleVoiceClick}
          className="px-3"
          disabled={!recognitionAvailable}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Cari
        </Button>
      </form>

      {/* Status Messages */}
      {!recognitionAvailable && (
        <p className="text-sm text-muted-foreground text-center">
          Pencarian suara tidak didukung di browser Anda
        </p>
      )}
      
      {isListening && (
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm text-primary animate-pulse font-medium">
            🎤 {detectedMode}
          </p>
          <p className="text-xs text-muted-foreground">
            Ucapkan kata kunci atau bacakan ayat - sistem akan mendeteksi otomatis
          </p>
        </div>
      )}

      {detectedMode && !isListening && (
        <p className="text-sm text-primary text-center font-medium animate-in fade-in">
          {detectedMode}
        </p>
      )}
    </div>
  );
}