import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { fetchSurah, type SurahData } from "@/services/QuranAPI";
import Header from "@/components/header";
import NavigationButtons from "@/components/NavigationButtons";
import AyatCard from "@/components/AyatCard";
import AyatPagination from "@/components/AyatPagination";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Home, Mic } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function App() {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const navigate = useNavigate();
  const [tafsirData, setTafsirData] = useState<SurahData | null>(null);
  const [currentAyat, setCurrentAyat] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);
  const [voiceResult, setVoiceResult] = useState<string>("");
  const [showVoiceCorrection, setShowVoiceCorrection] = useState(false);
  const [isRecitationMode, setIsRecitationMode] = useState(false);

  // Check speech recognition availability
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setRecognitionAvailable(!!SpeechRecognition);
  }, []);

  // Load surah data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const num = surahNumber ? parseInt(surahNumber) : 67;
        const data = await fetchSurah(num);
        setTafsirData(data);
        setCurrentAyat(1);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data dari API");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [surahNumber]);

  // Search function
  const performSearch = (term: string) => {
    if (!tafsirData || !term.trim()) {
      alert("Masukkan kata kunci pencarian");
      return;
    }

    const cleanTerm = term
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .normalize("NFKC");

    const fuse = new Fuse(tafsirData.verses, {
      keys: ["arab", "latin", "terjemahan", "tafsir"],
      threshold: 0.4,
      includeScore: true,
    });

    const result = fuse.search(cleanTerm);

    if (result.length > 0) {
      const found = result[0].item;
      setCurrentAyat(found.id);
      setShowVoiceCorrection(false);
      alert(`✅ Ditemukan ayat ke-${found.id}`);
    } else {
      alert("❌ Ayat tidak ditemukan. Coba kata kunci lain.");
    }
  };

  // Start listening for text search
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser tidak mendukung Speech Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceResult(transcript);
      setSearchText(transcript);
      setShowVoiceCorrection(true);
      setIsListening(false);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
      alert("Terjadi kesalahan saat mendengarkan. Coba lagi.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  // Multi-language recitation search
  const startRecitationSearch = async () => {
    if (!tafsirData) return;

    setIsRecitationMode(true);
    setIsListening(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser tidak mendukung Speech Recognition");
      setIsListening(false);
      setIsRecitationMode(false);
      return;
    }

    const recognizeInLang = (lang: string): Promise<string | null> => {
      return new Promise((resolve) => {
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

        recognition.start();
      });
    };

    const langs = ["ar-SA", "id-ID", "en-US"];
    let transcript: string | null = null;

    for (const lang of langs) {
      transcript = await recognizeInLang(lang);
      if (transcript) break;
    }

    setIsListening(false);
    setIsRecitationMode(false);

    if (transcript) {
      const cleanTerm = transcript
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .normalize("NFKC");

      const fuse = new Fuse(tafsirData.verses, {
        keys: ["arab", "latin", "terjemahan", "tafsir"],
        threshold: 0.6,
        includeScore: true,
      });

      const result = fuse.search(cleanTerm);

      if (result.length > 0) {
        const found = result[0].item;
        setCurrentAyat(found.id);
        alert(`✅ Ditemukan ayat ke-${found.id} dari lantunan Anda!`);
      } else {
        alert("❌ Ayat tidak ditemukan dari lantunan. Coba baca lebih jelas.");
      }
    } else {
      alert("Tidak ada hasil suara yang dikenali.");
    }
  };

  const handleVoiceCorrection = () => {
    performSearch(searchText);
  };

  const currentTafsir = tafsirData?.verses.find((ayat) => ayat.id === currentAyat);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center text-destructive">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!tafsirData) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Tidak ada data.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Daftar Surah
          </Button>
        </div>

        {/* Header Surah */}
        <Header
          name={tafsirData.name.long}
          transliteration={tafsirData.name.transliteration.id}
        />

        {/* Search Bar */}
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          onSearch={performSearch}
          isListening={isListening && !isRecitationMode}
          startListening={startListening}
          stopListening={stopListening}
          recognitionAvailable={recognitionAvailable}
        />

        {/* Recitation Search Card */}
        {recognitionAvailable && (
          <Card className="mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-primary">Cari dengan Melantunkan Ayat</h3>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Bacakan ayat dalam bahasa Arab/Indonesia/Inggris untuk mencari ayat yang sesuai
                </p>
                <Button
                  onClick={startRecitationSearch}
                  disabled={isListening}
                  variant={isRecitationMode && isListening ? "destructive" : "default"}
                  className="w-full md:w-auto min-w-[200px]"
                >
                  {isRecitationMode && isListening ? (
                    <>
                      <Mic className="h-4 w-4 mr-2 animate-pulse" />
                      Mendengarkan Lantunan...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      🎤 Mulai Melantunkan Ayat
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voice Correction Card */}
        {showVoiceCorrection && voiceResult && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">
                Hasil pengenalan suara:
              </p>
              <div className="flex gap-2 items-start">
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                  placeholder="Koreksi jika perlu..."
                />
                <Button onClick={handleVoiceCorrection} className="shrink-0">
                  Cari
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Edit teks di atas jika hasil pengenalan kurang tepat, lalu klik Cari
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <NavigationButtons
          current={currentAyat}
          total={tafsirData.verses.length}
          onPrev={() => setCurrentAyat((c) => Math.max(1, c - 1))}
          onNext={() => setCurrentAyat((c) => Math.min(tafsirData.verses.length, c + 1))}
        />

        {/* Ayat Card */}
        {currentTafsir && (
          <AyatCard
            {...currentTafsir}
            name={tafsirData.name.short}
            transliteration={tafsirData.name.transliteration.id}
            translation={tafsirData.name.translation.id}
          />
        )}

        {/* Pagination */}
        <AyatPagination
          total={tafsirData.verses.length}
          current={currentAyat}
          onSelect={setCurrentAyat}
        />

        {/* Footer */}
        <Footer
          name={tafsirData.name.short}
          transliteration={tafsirData.name.transliteration.id}
        />
      </div>
    </div>
  );
}