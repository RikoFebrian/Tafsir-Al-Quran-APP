<<<<<<< HEAD
export interface SuratName {
  long: string;
  short: string;
  transliteration: {
    id: string;
  };
  translation: {
    id: string;
  };
}

=======
// src/services/QuranAPI.ts
export interface SuratName{
  long: string;
  short: string;
  transliteration:{
    id: string;
  },
  translation:{
    id: string;
  }
}


>>>>>>> 487306ce68bf7a869c1dfb704081bd5d6e74012b
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

<<<<<<< HEAD
export interface SurahData {
  number: number;
  name: SuratName;
  verses: Ayat[];
  numberOfVerses: number;
  revelation: {
    arab: string;
    en: string;
    id: string;
  };
}

export interface SurahListItem {
  number: number;
  name: {
    short: string;
    long: string;
    transliteration: {
      id: string;
    };
    translation: {
      id: string;
    };
  };
  numberOfVerses: number;
  revelation: {
    arab: string;
    id: string;
  };
}

// Fetch daftar semua surah
export async function fetchSurahList(): Promise<SurahListItem[]> {
  const res = await fetch("https://quran-api-id.vercel.app/surah");
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

// Fetch surah berdasarkan nomor
export async function fetchSurah(surahNumber: number): Promise<SurahData> {
  const res = await fetch(`https://quran-api-id.vercel.app/surah/${surahNumber}`);
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

  const data = await res.json();

  const NameData: SuratName = {
    long: data.data.name.long,
    short: data.data.name.short,
    transliteration: { id: data.data.name.transliteration.id },
    translation: { id: data.data.name.translation.id },
  };

  const verses = data.data?.verses;
  if (!verses || !Array.isArray(verses)) {
    throw new Error("Struktur data API tidak valid");
  }

  const ayatList: Ayat[] = verses.map((verse: Verse) => ({
=======
export interface SurahData{
  name: SuratName;
  verses: Ayat[];
}

export async function fetchAlMulk(): Promise<SurahData> {
  const res = await fetch("https://quran-api-id.vercel.app/surah/67");

  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}`);
  }


  const data = await res.json();
  
  const NameData: SuratName = {
    long:data.data.name.long,
    short:data.data.name.short,
    transliteration:{
      id:data.data.name.transliteration.id,
    },
    translation:{
      id:data.data.name.translation.id,
    }
  }

  const verses = data.data?.verses;

  if (!verses || !Array.isArray(verses)) {
    console.error("⚠️ Struktur data API tidak sesuai:", data);
    throw new Error("Struktur data API tidak valid (tidak ada data.verses)");
  }

  const ayatList: Ayat[] = verses.map((verse:Verse)=>({
>>>>>>> 487306ce68bf7a869c1dfb704081bd5d6e74012b
    id: verse.number.inSurah,
    arab: verse.text.arab,
    latin: verse.text.transliteration.en,
    terjemahan: verse.translation.id,
    tafsir: verse.tafsir.id.short,
  }));

<<<<<<< HEAD
  return {
    number: data.data.number,
    name: NameData,
    verses: ayatList,
    numberOfVerses: data.data.numberOfVerses,
    revelation: data.data.revelation,
  };
}

// Backward compatibility
export async function fetchAlMulk(): Promise<SurahData> {
  return fetchSurah(67);
}
=======
  // return verses.map((verse: Verse) => ({
  //   id: verse.number.inSurah,
  //   arab: verse.text.arab,
  //   latin: verse.text.transliteration.en,
  //   terjemahan: verse.translation.id,
  //   tafsir: verse.tafsir.id.short,
  // }));

  return{
    name: NameData,
    verses: ayatList,
  }
}

>>>>>>> 487306ce68bf7a869c1dfb704081bd5d6e74012b
