import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onSearch: (text: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  recognitionAvailable: boolean;
}

export default function SearchBar({
  searchText,
  setSearchText,
  onSearch,
  isListening,
  startListening,
  stopListening,
  recognitionAvailable,
}: SearchBarProps) {
  return (
    <div className="mb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(searchText);
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
          onClick={isListening ? stopListening : startListening}
          className="px-3"
          disabled={!recognitionAvailable}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </form>

      {!recognitionAvailable && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Pencarian suara tidak didukung di browser Anda
        </p>
      )}
      {isListening && (
        <p className="text-sm text-primary mt-2 text-center animate-pulse">
          Mendengarkan... Silakan ucapkan kata kunci pencarian
        </p>
      )}
    </div>
  );
}
