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
    id: verse.number.inSurah,
    arab: verse.text.arab,
    latin: verse.text.transliteration.en,
    terjemahan: verse.translation.id,
    tafsir: verse.tafsir.id.short,
  }));

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

