"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipoAula } from "@/types/database";

interface MediaPlayerProps {
  tipo: TipoAula;
  url: string | null;
  titulo: string;
}

export function MediaPlayer({ tipo, url, titulo }: MediaPlayerProps) {
  if (!url) return null;

  switch (tipo) {
    case "video":
      return <VideoPlayer url={url} titulo={titulo} />;
    case "audio":
      return <AudioPlayer url={url} titulo={titulo} />;
    case "pdf":
      return <PDFViewer url={url} titulo={titulo} />;
    default:
      return null;
  }
}

function VideoPlayer({ url, titulo }: { url: string; titulo: string }) {
  // Extrair ID do YouTube/Vimeo
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="relative w-full rounded-card overflow-hidden bg-bg-secondary border border-border">
      <div className="relative pt-[56.25%]">
        <iframe
          src={embedUrl}
          title={titulo}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function AudioPlayer({ url, titulo }: { url: string; titulo: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-card p-6">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Waveform decorativa */}
      <div className="flex items-center justify-center gap-[3px] h-16 mb-6 px-8">
        {Array.from({ length: 40 }).map((_, i) => {
          const height = 20 + Math.sin(i * 0.4) * 20 + Math.random() * 16;
          const isFilled = (i / 40) * 100 <= progress;
          return (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-colors duration-300",
                isFilled
                  ? "bg-gradient-to-t from-pink-primary to-pink-vibrant"
                  : "bg-bg-tertiary"
              )}
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-pink-primary flex items-center justify-center hover:bg-pink-vibrant transition-colors duration-200 btn-glow"
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-bg-primary" fill="currentColor" />
          ) : (
            <Play
              className="w-5 h-5 text-bg-primary ml-0.5"
              fill="currentColor"
            />
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1 space-y-1">
          <div
            className="h-2 bg-bg-tertiary rounded-full cursor-pointer overflow-hidden"
            onClick={seekTo}
            role="slider"
            aria-label="Progresso do áudio"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-primary to-pink-vibrant transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] text-text-tertiary">
            <span>
              {formatTime(audioRef.current?.currentTime || 0)}
            </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <Volume2 className="w-5 h-5 text-text-tertiary" />
      </div>

      <p className="text-body-sm text-text-secondary mt-4 text-center">
        {titulo}
      </p>
    </div>
  );
}

function PDFViewer({ url, titulo }: { url: string; titulo: string }) {
  return (
    <div className="space-y-4">
      <div className="bg-bg-secondary border border-border rounded-card overflow-hidden">
        <iframe
          src={url}
          title={titulo}
          className="w-full h-[70vh] min-h-[500px]"
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="inline-flex items-center gap-2 px-6 py-3 rounded-button bg-pink-primary text-bg-primary font-semibold hover:bg-pink-vibrant transition-colors duration-200 btn-glow"
      >
        Baixar PDF
      </a>
    </div>
  );
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
}
