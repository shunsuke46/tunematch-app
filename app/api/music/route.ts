import { NextResponse } from "next/server";

const GENRE_ARTISTS: Record<string, string[]> = {
  "J-POP": [
    "米津玄師", "Official髭男dism", "YOASOBI", "Ado", "藤井風",
    "King Gnu", "Mrs. GREEN APPLE", "back number", "あいみょん", "星野源",
    "BUMP OF CHICKEN", "スピッツ", "宇多田ヒカル", "椎名林檎", "くるり",
  ],
  "Hip Hop": [
    "Creepy Nuts", "JP THE WAVY", "KID FRESINO", "BIM", "tofubeats",
    "鎮座DOPENESS", "SALU", "PUNPEE", "般若", "晋平太",
  ],
  "K-POP": [
    "BTS", "BLACKPINK", "NewJeans", "aespa", "IVE",
    "TWICE", "EXO", "SEVENTEEN", "Stray Kids", "LE SSERAFIM",
  ],
  "女性アイドル": [
    "乃木坂46", "日向坂46", "AKB48", "櫻坂46", "STU48",
    "NGT48", "HKT48", "NMB48", "≠ME", "≒JOY",
  ],
  "男性アイドル": [
    "Snow Man", "SixTONES", "なにわ男子", "Travis Japan", "Aぇ! group",
    "King & Prince", "Hey! Say! JUMP", "Kis-My-Ft2", "関ジャニ∞", "V6",
  ],
  "ロック": [
    "ONE OK ROCK", "MY FIRST STORY", "BLUE ENCOUNT", "coldrain", "04 Limited Sazabys",
    "マキシマム ザ ホルモン", "BUCK-TICK", "the GazettE", "lynch.", "SiM",
    "RADWIMPS", "ASIAN KUNG-FU GENERATION", "ELLEGARDEN", "10-FEET", "ワンオク",
  ],
  "アニソン": [
    "LiSA", "Aimer", "藍井エイル", "angela", "fripSide",
    "水樹奈々", "田所あずさ", "TrySail", "ClariS", "ZAQ",
    "茅原実里", "花澤香菜", "nano.RIPE", "やなぎなぎ", "麻枝准",
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") || "J-POP";
  const page = parseInt(searchParams.get("page") || "0");
  const artists = GENRE_ARTISTS[genre] || GENRE_ARTISTS["J-POP"];

  try {
    // ページごとに違うアーティストを選ぶ
    const shuffled = [...artists].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 4);

    const results = await Promise.all(
      picked.map(async (artist) => {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&media=music&limit=10&country=JP`
        );
        const data = await res.json();
        return data.results || [];
      })
    );

    const allSongs = results.flat()
      .filter((item: any) => item.previewUrl)
      .sort(() => Math.random() - 0.5)
      .slice(0, 15)
      .map((item: any) => ({
        id: item.trackId,
        title: item.trackName,
        artist: item.artistName,
        genre: item.primaryGenreName,
        artwork: item.artworkUrl100.replace("100x100", "400x400"),
        preview: item.previewUrl,
      }));

    return NextResponse.json({ songs: allSongs, genre, page });
  } catch {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}
