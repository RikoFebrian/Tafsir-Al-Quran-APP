import { useEffect, useState } from "react";
import Fuse from "fuse.js"; 
import { fetchAlMulk, type SurahData } from "@/services/QuranAPI";
import Header from "@/components/header";
import VoiceRecognitionButton from "@/components/VoiceRecognitionButton";
import NavigationButtons from "@/components/NavigationButtons";
import AyatCard from "@/components/AyatCard";
import AyatPagination from "@/components/AyatPagination";
import Footer from "@/components/Footer";

export default function App() {
  const [tafsirData, setTafsirData] = useState<SurahData | null>(null);
  const [currentAyat, setCurrentAyat] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAlMulk();
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

  // Handler voice recognition
  const handleVoiceResult = (recognizedText: string) => {
  if (!tafsirData) return;

  const term = recognizedText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "") // hilangkan simbol
    .normalize("NFKC");

  const fuse = new Fuse(tafsirData.verses, {
    keys: ["arab", "latin", "terjemahan", "tafsir"],
    threshold: 0.9, 
  });

  const result = fuse.search(term);

  if (result.length > 0) {
    const found = result[0].item;
    setCurrentAyat(found.id);
    alert(`✅ Ditemukan ayat ke-${found.id}`);
  } else {
    alert("❌ Ayat tidak ditemukan. Coba ulangi lebih jelas atau pendekkan bacaan.");
  }
};

  const currentTafsir = tafsirData?.verses.find(
    (ayat) => ayat.id === currentAyat
  );

  if (loading) return <div className="text-center mt-20">Memuat data...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!tafsirData) return <div>Tidak ada data.</div>;

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 🔹 Header Surah */}
        <Header
          name={tafsirData?.name.long}
          transliteration={tafsirData?.name.transliteration.id}
        />

        {/* Tombol Voice Recognition */}
        <div className="flex justify-center mb-6">
          <VoiceRecognitionButton onResult={handleVoiceResult} />
        </div>

        {/* Navigasi antar ayat */}
        <NavigationButtons
          current={currentAyat}
          total={tafsirData.verses.length}
          onPrev={() => setCurrentAyat((c) => Math.max(1, c - 1))}
          onNext={() => setCurrentAyat((c) => Math.min(tafsirData.verses.length, c + 1))}
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
