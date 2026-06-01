import React from "react";

const socials = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@kodebase",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@kodebaseofficial",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/iamwillkode",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M18.9 1.5h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.5h7.6l5.2 6.9zm-1.3 19.8h2L6.5 3.6H4.4z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com/invite/cwEv93EwBA",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3a13.7 13.7 0 0 0-.6 1.3 18.3 18.3 0 0 0-5.5 0A13.7 13.7 0 0 0 8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9 0 13.5.3 17.9a19.9 19.9 0 0 0 6 3.1c.5-.7.9-1.4 1.3-2.2-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1 .4.8.8 1.5 1.3 2.2a19.8 19.8 0 0 0 6-3.1c.4-5.1-.6-9.6-3.6-13.5zM8.3 15.3c-1.2 0-2.2-1.1-2.2-2.4S7 10.5 8.3 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z" />
      </svg>
    ),
  },
];

export default function SocialLinks({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors p-2"
        >
          {s.icon}
        </a>
      ))}
    </div>
  );
}