import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { fetchSurah, type SurahData } from "@/services/QuranAPI";
import Header from "@/components/header";
import NavigationButtons from "@/components/NavigationButtons";
import AyatCard from "@/components/AyatCard";
import AyatPagination from "@/components/AyatPagination";
import Footer from "@/components/Footer";
import UnifiedSearchBar from "@/components/UnifiedSearchBar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function App() {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const navigate = useNavigate();
  const [tafsirData, setTafsirData] = useState<SurahData | null>(null);
  const [currentAyat, setCurrentAyat] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);

  useEffect(() => {
    // Check if speech recognition is available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setRecognitionAvailable(!!SpeechRecognition);
  }, []);

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

  const performSearch = (term: string, isRecitation: boolean = false) => {
    if (!tafsirData || !term.trim()) {
      alert("Masukkan kata kunci pencarian");
      return;
    }

    // Deteksi apakah input mengandung huruf Arab
    const hasArabic = /[\u0600-\u06FF]/.test(term);
    
    // Normalisasi berbeda untuk Arab dan non-Arab
    let cleanTerm: string;
    if (hasArabic) {
      // Untuk Arab: hanya trim, jangan lowercase atau hapus tashkeel
      cleanTerm = term.trim().normalize("NFKC");
    } else {
      // Untuk non-Arab: lowercase dan hapus simbol
      cleanTerm = term
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .normalize("NFKC");
    }

    // Konfigurasi Fuse.js berbeda untuk mode lantunan vs kata kunci
    let fuseOptions;
    
    if (isRecitation) {
      // Mode lantunan: lebih toleran, prioritas ke teks asli
      fuseOptions = hasArabic
        ? {
            keys: [{ name: "arab", weight: 3 }, { name: "latin", weight: 1 }],
            threshold: 0.5, // Lebih toleran untuk voice
            includeScore: true,
            ignoreLocation: true,
            minMatchCharLength: 3,
          }
        : {
            keys: [{ name: "latin", weight: 2 }, { name: "terjemahan", weight: 1.5 }, { name: "arab", weight: 1 }],
            threshold: 0.5,
            includeScore: true,
            ignoreLocation: true,
            minMatchCharLength: 3,
          };
    } else {
      // Mode kata kunci: lebih ketat, cari di semua field
      fuseOptions = hasArabic
        ? {
            keys: [{ name: "arab", weight: 2 }, "latin", "terjemahan"],
            threshold: 0.2, // Lebih ketat untuk kata kunci
            includeScore: true,
            ignoreLocation: true,
            minMatchCharLength: 2,
          }
        : {
            keys: ["latin", "terjemahan", "tafsir", "arab"],
            threshold: 0.4,
            includeScore: true,
            ignoreLocation: true,
          };
    }

    const fuse = new Fuse(tafsirData.verses, fuseOptions);
    const result = fuse.search(cleanTerm);

    if (result.length > 0) {
      const found = result[0].item;
      setCurrentAyat(found.id);
      const searchType = isRecitation ? "Lantunan" : "Kata Kunci";
      const langType = hasArabic ? "Arab" : "Indonesia/Latin";
      alert(`✅ Ditemukan ayat ke-${found.id}\n(Mode: ${searchType}, Bahasa: ${langType})`);
    } else {
      const suggestion = isRecitation
        ? "Coba baca ayat lebih jelas atau gunakan mode kata kunci."
        : hasArabic 
          ? "Coba copy-paste teks Arab langsung dari Al-Qur'an." 
          : "Coba kata kunci lain atau gunakan bahasa Arab.";
      alert(`❌ Ayat tidak ditemukan. ${suggestion}`);
    }
  };



  const currentTafsir = tafsirData?.verses.find((ayat) => ayat.id === currentAyat);

  if (loading)
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center text-destructive">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
        </div>
      </div>
    );

  if (!tafsirData) return <div>Tidak ada data.</div>;

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
          name={tafsirData?.name.long}
          transliteration={tafsirData?.name.transliteration.id}
        />

        {/* Unified Search Bar with Smart Voice Detection */}
        <UnifiedSearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          onSearch={performSearch}
          recognitionAvailable={recognitionAvailable}
        />

        {/* Navigasi antar ayat */}
        <NavigationButtons
          current={currentAyat}
          total={tafsirData.verses.length}
          onPrev={() => setCurrentAyat((c) => Math.max(1, c - 1))}
          onNext={() =>
            setCurrentAyat((c) => Math.min(tafsirData.verses.length, c + 1))
          }
        />

        {/* Kartu Ayat */}
        {currentTafsir && tafsirData && (
          <AyatCard
            {...currentTafsir}
            name={tafsirData?.name.short}
            transliteration={tafsirData?.name.transliteration.id}
            translation={tafsirData?.name.translation.id}
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
          name={tafsirData?.name.short}
          transliteration={tafsirData?.name.transliteration.id}
        />
      </div>
    </div>
  );
}