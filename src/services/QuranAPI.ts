// src/services/QuranAPI.ts

export interface Verse {
  number: {
    inSurah: number;
  };
  text: {
    arab: string;
    transliteration: {
      en: string;
    };
  };
  translation: {
    id: string;
  };
  tafsir: {
    id: {
      short: string;
    };
  };
}

export interface Ayat {
  id: number;
  arab: string;
  latin: string;
  terjemahan: string;
  tafsir: string;
}

export async function fetchAlMulk(): Promise<Ayat[]> {
  const res = await fetch("https://quran-api-id.vercel.app/surah/67");

  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}`);
  }

  const data = await res.json();
  console.log("🔥 Data dari API:", data); // <== Tambahkan baris ini

  const verses = data.data?.verses;

  if (!verses || !Array.isArray(verses)) {
    console.error("⚠️ Struktur data API tidak sesuai:", data);
    throw new Error("Struktur data API tidak valid (tidak ada data.verses)");
  }

  return verses.map((verse: Verse) => ({
    id: verse.number.inSurah,
    arab: verse.text.arab,
    latin: verse.text.transliteration.en,
    terjemahan: verse.translation.id,
    tafsir: verse.tafsir.id.short,
  }));
}

