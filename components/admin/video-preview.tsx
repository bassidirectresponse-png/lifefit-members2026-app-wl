"use client";

import { Play } from "lucide-react";

interface VideoPreviewProps {
  url: string;
  className?: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  // Vimeo
  const vim = url.match(/vimeo\.com\/(\d+)/);
  if (vim) return `https://player.vimeo.com/video/${vim[1]}`;

  // Google Drive
  const drive = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;

  return null;
}

export function VideoPreview({ url, className }: VideoPreviewProps) {
  if (!url) {
    return (
      <div className={`bg-bg-tertiary rounded-card flex items-center justify-center h-[200px] ${className || ""}`}>
        <div className="text-center text-text-tertiary">
          <Play className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <span className="text-[13px]">Aucun lien vidéo</span>
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className={`bg-bg-tertiary rounded-card p-4 ${className || ""}`}>
        <p className="text-[13px] text-text-secondary mb-2">Lien externe :</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-pink-primary underline break-all"
        >
          {url}
        </a>
      </div>
    );
  }

  return (
    <div className={`rounded-card overflow-hidden border border-border ${className || ""}`}>
      <div className="relative pt-[56.25%]">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
