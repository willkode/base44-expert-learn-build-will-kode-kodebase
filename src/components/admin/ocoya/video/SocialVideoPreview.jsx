import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { FOOTER_CTA } from "./videoOptions";

export default function SocialVideoPreview({ video }) {
  const videoRef = useRef(null);
  const voiceRef = useRef(null);
  const musicRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = 0.25;
  }, [video.musicUrl]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    const tracks = [voiceRef.current, musicRef.current].filter(Boolean);
    if (playing) {
      v.pause();
      tracks.forEach((t) => t.pause());
    } else {
      [v, ...tracks].forEach((t) => {
        t.currentTime = 0;
      });
      v.play();
      tracks.forEach((t) => t.play());
    }
    setPlaying(!playing);
  };

  const active = (video.onScreenText || []).find((s) => time >= (s.startSec || 0) && time < (s.endSec || 0));
  const vertical = video.aspectRatio !== "16:9";

  return (
    <div className={`relative mx-auto overflow-hidden rounded-2xl border border-border bg-black ${vertical ? "max-w-[260px] aspect-[9/16]" : "w-full aspect-video"}`}>
      <video
        ref={videoRef}
        src={video.videoUrl}
        muted
        playsInline
        loop={false}
        className="w-full h-full object-cover"
        onTimeUpdate={(e) => setTime(e.target.currentTime)}
        onEnded={() => {
          setPlaying(false);
          [voiceRef.current, musicRef.current].filter(Boolean).forEach((t) => t.pause());
        }}
      />
      {video.voiceoverUrl && <audio ref={voiceRef} src={video.voiceoverUrl} />}
      {video.musicUrl && <audio ref={musicRef} src={video.musicUrl} />}

      {active && (
        <div className="absolute inset-x-3 top-1/3 text-center">
          <span className="inline-block rounded-lg bg-black/55 px-3 py-1.5 font-sora text-base font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {active.text}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white">{FOOTER_CTA}</span>
      </div>

      <button
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center text-white transition-colors hover:bg-black/20"
        aria-label={playing ? "Pause preview" : "Play preview"}
      >
        {!playing && (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60">
            <Play className="h-5 w-5" />
          </span>
        )}
        {playing && (
          <span className="sr-only">
            <Pause className="h-4 w-4" />
          </span>
        )}
      </button>
    </div>
  );
}