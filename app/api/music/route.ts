import { NextResponse } from "next/server";

const GENRE_MAP: Record<string, string> = {
  "J-POP":    "jpop 日本",
  "Hip Hop":  "日本語ラップ hiphop",
  "K-POP":    "kpop korea",
  "女性アイドル": "AKB48 乃木坂46 日向坂",
  "男性アイドル": "Hey!SayJUMP SixTONES Snow Man",
  "ロック":    "日本 rock バンド",
  "アニソン":  "アニメ ソング anime",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") || "J-POP";
  const query = GENRE_MAP[genre] || "jpop";

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=25&country=JP`
    );
    const data = await res.json();

    const songs = data.results
      .filter((item: any) => item.previewUrl)
      .slice(0, 10)
      .map((item: any) => ({
        id: item.trackId,
        title: item.trackName,
        artist: item.artistName,
        genre: item.primaryGenreName,
        artwork: item.artworkUrl100.replace("100x100", "400x400"),
        preview: item.previewUrl,
      }));

    return NextResponse.json({ songs, genre });
  } catch {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}
