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

const GENRES = ["J-POP", "Hip Hop", "K-POP", "女性アイドル", "男性アイドル", "ロック", "アニソン"];

const GENRE_COLORS: Record<string, string> = {
  "J-POP":    "linear-gradient(135deg, #f093fb, #f5576c)",
  "Hip Hop":  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "K-POP":    "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "女性アイドル": "linear-gradient(135deg, #ff9a9e, #fecfef)",
  "男性アイドル": "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
  "ロック":    "linear-gradient(135deg, #f7971e, #ffd200)",
  "アニソン":  "linear-gradient(135deg, #43e97b, #38f9d7)",
};

const GENRE_START: Record<string, string> = {
  "J-POP": "#f093fb", "Hip Hop": "#4facfe", "K-POP": "#a18cd1",
  "女性アイドル": "#ff9a9e", "男性アイドル": "#a1c4fd", "ロック": "#f7971e", "アニソン": "#43e97b",
};
const GENRE_END: Record<string, string> = {
  "J-POP": "#f5576c", "Hip Hop": "#00f2fe", "K-POP": "#fbc2eb",
  "女性アイドル": "#fecfef", "男性アイドル": "#c2e9fb", "ロック": "#ffd200", "アニソン": "#38f9d7",
};

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState<Song[]>([]);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [showLikes, setShowLikes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("J-POP");
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { fetchSongs("J-POP"); }, []);

  const fetchSongs = async (genre: string) => {
    setLoading(true); setIndex(0);
    audioRef.current?.pause(); setPlaying(false);
    try {
      const res = await fetch(`/api/music?genre=${encodeURIComponent(genre)}`);
      const data = await res.json();
      setSongs(data.songs);
    } catch { console.error("取得失敗"); }
    setLoading(false);
  };

  const handleGenreChange = (genre: string) => { setSelectedGenre(genre); fetchSongs(genre); };
  const current = songs[index];

  const togglePlay = () => {
    if (!current) return;
    if (playing) { audioRef.current?.pause(); setPlaying(false); }
    else if (audioRef.current) { audioRef.current.src = current.preview; audioRef.current.play(); setPlaying(true); }
  };

  const swipe = (dir: "left" | "right") => {
    audioRef.current?.pause(); setPlaying(false);
    setAnimDir(dir); setDragX(0);
    setTimeout(() => {
      if (dir === "right") setLikes(prev => [...prev, songs[index]]);
      setIndex(prev => prev + 1); setAnimDir(null);
    }, 450);
  };

  const onMouseDown = (e: React.MouseEvent) => { startXRef.current = e.clientX; setIsDragging(true); };
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging) setDragX(e.clientX - startXRef.current); };
  const onMouseUp = () => {
    setIsDragging(false);
    if (dragX > 80) swipe("right");
    else if (dragX < -80) swipe("left");
    else setDragX(0);
  };

  const rotate = animDir === "right" ? 18 : animDir === "left" ? -18 : dragX * 0.08;
  const tx = animDir === "right" ? 600 : animDir === "left" ? -600 : dragX;
  const opacity = animDir ? 0 : Math.max(0, 1 - Math.abs(dragX) / 300);
  const likeOpacity = dragX > 30 ? Math.min(1, (dragX - 30) / 60) : 0;
  const skipOpacity = dragX < -30 ? Math.min(1, (-dragX - 30) / 60) : 0;
  const c1 = GENRE_START[selectedGenre];
  const c2 = GENRE_END[selectedGenre];

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ece0", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem", userSelect: "none" }}>
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />

      {/* ヘッダー */}
      <div style={{ width: "100%", maxWidth: 440, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0 0.75rem" }}>
        {/* ロゴ: グラデーションをborderで表現してバグ回避 */}
        <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: -1, position: "relative" }}>
          <span style={{ color: c1 }}>tune</span><span style={{ color: c2 }}>match</span>
        </div>
        <button onClick={() => setShowLikes(!showLikes)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0ece0", padding: "0.45rem 1.1rem", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem" }}>
          ♡ {likes.length}曲
        </button>
      </div>

      {/* ジャンルボタン */}
      <div style={{ width: "100%", maxWidth: 440, display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {GENRES.map((genre) => {
          const active = selectedGenre === genre;
          return (
            <button key={genre} onClick={() => handleGenreChange(genre)} style={{
              padding: "0.45rem 1rem", borderRadius: 30,
              border: active ? "none" : "1px solid rgba(255,255,255,0.1)",
              background: active ? GENRE_COLORS[genre] : "rgba(255,255,255,0.05)",
              color: active ? "#fff" : "#888",
              fontSize: "0.8rem", fontWeight: active ? 700 : 400,
              cursor: "pointer", transition: "all 0.25s",
              boxShadow: active ? "0 4px 16px rgba(0,0,0,0.35)" : "none",
            }}>{genre}</button>
          );
        })}
      </div>

      {/* お気に入りリスト */}
      {showLikes && (
        <div style={{ width: "100%", maxWidth: 440, background: "#141414", borderRadius: 20, padding: "1.25rem", marginBottom: "1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.75rem", letterSpacing: "0.1em" }}>お気に入り</div>
          {likes.length === 0 ? (
            <div style={{ color: "#444", fontSize: "0.875rem" }}>右スワイプで追加！</div>
          ) : likes.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <img src={s.artwork} alt={s.title} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{s.title}</div>
                <div style={{ fontSize: "0.75rem", color: "#666" }}>{s.artist}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎵</div>
          <div style={{ color: "#555", fontSize: "0.9rem" }}>読み込み中...</div>
        </div>
      )}

      {!loading && current && (
        <>
          <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
            <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10, background: "linear-gradient(135deg,#43e97b,#38f9d7)", color: "#fff", fontWeight: 900, fontSize: "1.4rem", padding: "0.4rem 1rem", borderRadius: 12, transform: "rotate(-12deg)", opacity: likeOpacity, border: "3px solid #fff", pointerEvents: "none" }}>
              LIKE ♡
            </div>
            <div style={{ position: "absolute", top: 24, right: 24, zIndex: 10, background: "linear-gradient(135deg,#f5576c,#f093fb)", color: "#fff", fontWeight: 900, fontSize: "1.4rem", padding: "0.4rem 1rem", borderRadius: 12, transform: "rotate(12deg)", opacity: skipOpacity, border: "3px solid #fff", pointerEvents: "none" }}>
              SKIP ✕
            </div>

            <div
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              style={{
                borderRadius: 28, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                transform: `translateX(${tx}px) rotate(${rotate}deg)`,
                opacity, cursor: isDragging ? "grabbing" : "grab",
                transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.45s ease",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ position: "relative" }}>
                <img src={current.artwork} alt={current.title} style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />
                <button onClick={togglePlay} style={{
                  position: "absolute", bottom: "5rem", right: "1.25rem",
                  width: 52, height: 52, borderRadius: "50%",
                  background: playing ? `linear-gradient(135deg,${c1},${c2})` : "rgba(255,255,255,0.15)",
                  border: "none", color: "#fff", fontSize: "1.3rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: playing ? `0 0 20px ${c1}88` : "none", transition: "all 0.2s",
                }}>
                  {playing ? "⏸" : "▶"}
                </button>
                <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem", right: "5rem" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6, color: c1 }}>{current.genre}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, lineHeight: 1.1, textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>{current.title}</div>
                  <div style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{current.artist}</div>
                </div>
              </div>

              <div style={{ background: "#111", padding: "1.25rem 1.5rem 1.5rem", display: "flex", gap: "0.75rem" }}>
                <button onClick={() => swipe("left")} style={{ flex: 1, padding: "1rem", background: "rgba(245,87,108,0.1)", border: "1px solid rgba(245,87,108,0.3)", color: "#f5576c", borderRadius: 16, fontSize: "1rem", cursor: "pointer", fontWeight: 700 }}>✕ スキップ</button>
                <button onClick={() => swipe("right")} style={{ flex: 1, padding: "1rem", background: `linear-gradient(135deg,${c1},${c2})`, border: "none", color: "#fff", borderRadius: 16, fontSize: "1rem", cursor: "pointer", fontWeight: 700, boxShadow: `0 4px 20px ${c1}66` }}>♡ いいね</button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#444" }}>残り {songs.length - index} 曲</div>
        </>
      )}

      {!loading && songs.length > 0 && index >= songs.length && (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎶</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>今日の音楽は以上！</div>
          <div style={{ color: "#666", marginBottom: "2rem" }}>お気に入り {likes.length}曲</div>
          <button onClick={() => fetchSongs(selectedGenre)} style={{ background: `linear-gradient(135deg,${c1},${c2})`, color: "#fff", border: "none", padding: "0.9rem 2.5rem", borderRadius: 30, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
            新しい曲を探す
          </button>
        </div>
      )}
    </main>
  );
}
