"use client";
import { useState, useEffect, useRef } from "react";

type Song = {
  id: number;
  title: string;
  artist: string;
  genre: string;
  artwork: string;
  preview: string;
};

const GENRES = ["J-POP", "ヒップホップ", "K-POP", "女性アイドル", "男性アイドル", "ロック", "アニソン"];

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState<Song[]>([]);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [showLikes, setShowLikes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("J-POP");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSongs(selectedGenre);
  }, []);

  const fetchSongs = async (genre: string) => {
    setLoading(true);
    setIndex(0);
    audioRef.current?.pause();
    setPlaying(false);
    try {
      const res = await fetch(`/api/music?genre=${encodeURIComponent(genre)}`);
      const data = await res.json();
      setSongs(data.songs);
    } catch {
      console.error("取得失敗");
    }
    setLoading(false);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    fetchSongs(genre);
  };

  const current = songs[index];

  const togglePlay = () => {
    if (!current) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = current.preview;
        audioRef.current.play();
        setPlaying(true);
      }
    }
  };

  const swipe = (dir: "left" | "right") => {
    audioRef.current?.pause();
    setPlaying(false);
    setAnimDir(dir);
    setTimeout(() => {
      if (dir === "right") setLikes((prev) => [...prev, songs[index]]);
      setIndex((prev) => prev + 1);
      setAnimDir(null);
    }, 350);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ece0", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem" }}>
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />

      {/* ヘッダー */}
      <div style={{ width: "100%", maxWidth: 420, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0" }}>
        <div style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: -1 }}>
          tune<span style={{ color: "#e8c84a" }}>match</span>
        </div>
        <button
          onClick={() => setShowLikes(!showLikes)}
          style={{ background: "transparent", border: "1px solid rgba(240,236,224,0.2)", color: "#f0ece0", padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem" }}
        >
          ♡ {likes.length}曲
        </button>
      </div>

      {/* ジャンル選択 */}
      <div style={{ width: "100%", maxWidth: 420, marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreChange(genre)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 20,
              border: selectedGenre === genre ? "1px solid #e8c84a" : "1px solid rgba(240,236,224,0.15)",
              background: selectedGenre === genre ? "rgba(232,200,74,0.15)" : "transparent",
              color: selectedGenre === genre ? "#e8c84a" : "#888",
              fontSize: "0.8rem",
              fontWeight: selectedGenre === genre ? 700 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* お気に入りリスト */}
      {showLikes && (
        <div style={{ width: "100%", maxWidth: 420, background: "#141414", borderRadius: 16, padding: "1rem", marginBottom: "1rem", border: "1px solid rgba(240,236,224,0.1)" }}>
          <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.75rem" }}>お気に入りの曲</div>
          {likes.length === 0 ? (
            <div style={{ color: "#555", fontSize: "0.85rem" }}>まだありません。♡いいねで追加！</div>
          ) : (
            likes.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(240,236,224,0.05)" }}>
                <img src={s.artwork} alt={s.title} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{s.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{s.artist} · {s.genre}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎵</div>
          <div style={{ color: "#888" }}>音楽を読み込み中...</div>
        </div>
      )}

      {/* カード */}
      {!loading && current && (
        <>
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid rgba(240,236,224,0.1)",
              transform: animDir === "right" ? "translateX(120px) rotate(10deg)" : animDir === "left" ? "translateX(-120px) rotate(-10deg)" : "translateX(0) rotate(0deg)",
              opacity: animDir ? 0 : 1,
              transition: "transform 0.35s ease, opacity 0.35s ease",
            }}
          >
            <div style={{ position: "relative" }}>
              <img src={current.artwork} alt={current.title} style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }} />
              <button
                onClick={togglePlay}
                style={{ position: "absolute", bottom: "1rem", right: "1rem", width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {playing ? "⏸" : "▶"}
              </button>
              <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#e8c84a", marginBottom: 4 }}>{current.genre}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{current.title}</div>
                <div style={{ fontSize: "0.9rem", color: "rgba(240,236,224,0.8)", marginTop: 2, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{current.artist}</div>
              </div>
            </div>

            <div style={{ background: "#141414", padding: "1rem 1.5rem 1.5rem" }}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => swipe("left")}
                  style={{ flex: 1, padding: "0.8rem", background: "transparent", border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b", borderRadius: 12, fontSize: "1rem", cursor: "pointer", fontWeight: 600 }}
                >
                  ✕ スキップ
                </button>
                <button
                  onClick={() => swipe("right")}
                  style={{ flex: 1, padding: "0.8rem", background: "rgba(232,200,74,0.1)", border: "1px solid rgba(232,200,74,0.4)", color: "#e8c84a", borderRadius: 12, fontSize: "1rem", cursor: "pointer", fontWeight: 600 }}
                >
                  ♡ いいね
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#555" }}>
            残り {songs.length - index} 曲
          </div>
        </>
      )}

      {/* 全部見た後 */}
      {!loading && songs.length > 0 && index >= songs.length && (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎶</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>今日の音楽は以上！</div>
          <div style={{ color: "#888", marginBottom: "2rem" }}>お気に入り {likes.length}曲 を保存しました</div>
          <button
            onClick={() => fetchSongs(selectedGenre)}
            style={{ background: "#e8c84a", color: "#0a0a0a", border: "none", padding: "0.8rem 2rem", borderRadius: 30, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
          >
            新しい曲を探す
          </button>
        </div>
      )}
    </main>
  );
}
