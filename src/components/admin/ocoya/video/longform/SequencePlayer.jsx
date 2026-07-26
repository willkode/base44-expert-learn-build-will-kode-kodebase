import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

/** Plays every ready scene clip back to back with its voice-over — full-sequence preview. */
export default function SequencePlayer({ scenes, aspectRatio }) {
  const playable = scenes.filter((s) => s.video_url);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const current = playable[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing && current?.audio_url) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [index, playing, current?.audio_url]);

  if (playable.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
        Generate at least one scene clip to preview the sequence.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-sora font-semibold">Sequence preview</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { setIndex(0); setPlaying(true); }}>
            <Play className="w-3.5 h-3.5" /> Play all
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPlaying(false)}>
            <Square className="w-3.5 h-3.5" /> Stop
          </Button>
        </div>
      </div>

      <div className={`mx-auto ${aspectRatio === "16:9" ? "max-w-2xl" : "max-w-xs"}`}>
        <video
          key={current.id}
          src={current.video_url}
          autoPlay={playing}
          muted
          controls={!playing}
          className="w-full rounded-xl border border-border bg-black"
          onEnded={() => {
            if (!playing) return;
            if (index + 1 < playable.length) setIndex(index + 1);
            else { setPlaying(false); setIndex(0); }
          }}
        />
        <audio ref={audioRef} src={current.audio_url || undefined} />
        {current.caption_text && (
          <p className="mt-2 text-center text-sm text-foreground/90">{current.caption_text}</p>
        )}
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Scene {current.scene_number} of {playable.length}
        </p>
      </div>
    </div>
  );
}