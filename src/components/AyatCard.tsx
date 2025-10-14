import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AyatCardProps {
  arab?: string;
  latin?: string;
  terjemahan?: string;
  tafsir?: string;
  name?: string;
  transliteration?: string;
  translation?: string;
}

export default function AyatCard({ arab, latin, terjemahan, tafsir,name,transliteration,translation }: AyatCardProps) {
  return (
    <Card className="mb-6 shadow-lg border">
      <CardHeader className=" text-secondary-foreground">
        <CardTitle className="text-2xl text-center">
          {name} - {transliteration} ({translation})
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Ayat */}
        <div>
          <p className="text-3xl text-right font-Amiri leading-loose mb-2">
            {arab}
          </p>
          <p className="text-sm text-muted-foreground text-right italic">
            ({latin})
          </p>
        </div>

        {/* Terjemahan */}
        <div className="p-4 bg-accent/10 rounded-lg border-l-4 border-primary">
          <h3 className="font-semibold text-primary mb-2">Terjemahan:</h3>
          <p>{terjemahan}</p>
        </div>

        {/* Tafsir */}
        <div>
          <h3 className="font-semibold text-primary mb-2">Tafsir:</h3>
          <p className="leading-relaxed">{tafsir}</p>
        </div>
      </CardContent>
    </Card>
  );
}
