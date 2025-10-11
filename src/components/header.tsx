interface HeaderProps {
  name?: string;
  transliteration?: string;
}


export default function Header({name,transliteration}: HeaderProps) {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl font-bold text-primary mb-2">تفسير {name}</h1>
      <h2 className="text-2xl text-muted-foreground">Tafsir Surat {transliteration}</h2>
      <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
    </header>
  );
}
