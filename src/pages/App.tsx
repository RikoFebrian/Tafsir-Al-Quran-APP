import { useEffect, useState} from "react";
import { fetchAlMulk } from "@/services/QuranAPI";
// import { useEffect } from "react";
import Header from "@/components/header";
// import SearchBar from "@/components/SearchBar";
import NavigationButtons from "@/components/NavigationButtons";
import AyatCard from "@/components/AyatCard";
import AyatPagination from "@/components/AyatPagination";
import Footer from "@/components/Footer";

// ✅ Definisikan tipe data untuk Ayat
interface Ayat {
  id: number;
  arab: string;
  latin: string;
  terjemahan: string;
  tafsir: string;
}

// ✅ Definisikan tipe untuk SpeechRecognition agar TypeScript mengenalinya
// interface ExtendedWindow extends Window {
//   webkitSpeechRecognition?: typeof SpeechRecognition;
// }

export default function App() {
  const [tafsirData, setTafsirData] = useState<Ayat[]>([]);
  const [currentAyat, setCurrentAyat] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [isListening, setIsListening] = useState<boolean>(false);
  // const [searchText, setSearchText] = useState<string>("");
  // const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAlMulk();
        // Pastikan data sesuai dengan struktur Ayat[]
        setTafsirData(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data dari API");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const currentTafsir = tafsirData.find((ayat) => ayat.id === currentAyat);

  if (loading) return <div className="text-center mt-20">Memuat data...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  

  // const recognitionAvailable =
  //   "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  // useEffect(() => {
  //   if (recognitionAvailable) {
  //     const SpeechRecognition =
  //       (window as ExtendedWindow).webkitSpeechRecognition ||
  //       window.SpeechRecognition;

  //     if (SpeechRecognition) {
  //       const recog = new SpeechRecognition();
  //       recog.lang = "id-ID";

  //       recog.onresult = (event: SpeechRecognitionEvent) => {
  //         const text = event.results[0][0].transcript;
  //         setSearchText(text);
  //         searchAyat(text);
  //       };

  //       recog.onend = () => setIsListening(false);
  //       setRecognition(recog);
  //     }
  //   }
  // }, [recognitionAvailable]);

  // const startListening = () => {
  //   if (recognition) {
  //     setIsListening(true);
  //     recognition.start();
  //   }
  // };

  // const stopListening = () => {
  //   if (recognition) {
  //     setIsListening(false);
  //     recognition.stop();
  //   }
  // };

  // const searchAyat = (text: string) => {
  //   const term = text.toLowerCase();
  //   const found = tafsirData.find(
  //     (item) =>
  //       item.terjemahan.toLowerCase().includes(term) ||
  //       item.tafsir.toLowerCase().includes(term) ||
  //       item.latin.toLowerCase().includes(term)
  //   );
  //   if (found) setCurrentAyat(found.id);
  // };

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Header />
        {/* <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          onSearch={searchAyat}
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          recognitionAvailable={recognitionAvailable}
        /> */}
        <NavigationButtons
          current={currentAyat}
          total={tafsirData.length}
          onPrev={() => setCurrentAyat((c) => Math.max(1, c - 1))}
          onNext={() => setCurrentAyat((c) => Math.min(tafsirData.length, c + 1))}
        />
        {currentTafsir && <AyatCard {...currentTafsir} />}
        <AyatPagination
          total={tafsirData.length}
          current={currentAyat}
          onSelect={setCurrentAyat}
        />
        <Footer />
      </div>
    </div>
  );
}
