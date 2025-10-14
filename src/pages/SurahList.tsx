import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSurahList, type SurahListItem } from "@/services/QuranAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";

export default function SurahList() {
  const [surahList, setSurahList] = useState<SurahListItem[]>([]);
  const [filteredList, setFilteredList] = useState<SurahListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadSurahList = async () => {
      try {
        const data = await fetchSurahList();
        setSurahList(data);
        setFilteredList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSurahList();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredList(surahList);
    } else {
      const filtered = surahList.filter((surah) => {
        const term = searchTerm.toLowerCase();
        return (
          surah.name.transliteration.id.toLowerCase().includes(term) ||
          surah.name.translation.id.toLowerCase().includes(term) ||
          surah.number.toString().includes(term)
        );
      });
      setFilteredList(filtered);
    }
  }, [searchTerm, surahList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat daftar surah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-primary">القرآن الكريم</h1>
          </div>
          <h2 className="text-2xl text-muted-foreground">Daftar Surah Al-Qur'an</h2>
          <p className="text-sm text-muted-foreground mt-2">
            114 Surah dengan Tafsir & Pencarian Ayat
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </header>

        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Cari surah berdasarkan nama atau nomor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((surah) => (
            <Card
              key={surah.number}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:border-primary group"
              onClick={() => navigate(`/surah/${surah.number}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      {surah.number}
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {surah.name.transliteration.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {surah.name.translation.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-Amiri">{surah.name.short}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {surah.numberOfVerses} Ayat
                  </span>
                  <span className="bg-accent px-2 py-0.5 rounded">
                    {surah.revelation.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">
              Tidak ada surah yang cocok dengan pencarian "{searchTerm}"
            </p>
          </div>
        )}

        <footer className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            💡 Klik pada surah untuk membaca ayat, tafsir, dan mencari dengan suara
          </p>
        </footer>
      </div>
    </div>
  );
}