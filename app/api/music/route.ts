import { NextResponse } from "next/server";

const GENRE_MAP: Record<string, string> = {
  "J-POP": "jpop",
  "ヒップホップ": "japanese hip hop",
  "K-POP": "kpop",
  "女性アイドル": "japanese female idol",
  "男性アイドル": "japanese male idol",
  "ロック": "japanese rock",
  "アニソン": "anime",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") || "J-POP";
  const query = GENRE_MAP[genre] || "jpop";

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=20&country=JP`
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
