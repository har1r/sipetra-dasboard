"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/components/providers/audio-provider";

export default function PlaylistToday() {
  const { analyserRef, playing, toggle } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const [mode, setMode] = useState<"full" | "compact" | "icon">("full");

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;

      if (width < 140) setMode("icon");
      else if (width < 240) setMode("compact");
      else setMode("full");
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let started = false;

    const start = () => {
      if (started) return;
      if (!canvasRef.current || !analyserRef.current) return;

      started = true;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const data = new Uint8Array(bufferLength);

      const render = () => {
        animationRef.current = requestAnimationFrame(render);

        analyser.getByteFrequencyData(data);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const step = canvas.width / bufferLength;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let i = 0; i < bufferLength; i++) {
          const y = canvas.height - (data[i] / 255) * canvas.height;
          ctx.lineTo(i * step, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "#22c55e");
        gradient.addColorStop(1, "#3b82f6");

        ctx.fillStyle = gradient;
        ctx.fill();
      };

      render();
    };

    const interval = setInterval(start, 100);

    return () => {
      clearInterval(interval);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyserRef]);

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2 px-2 py-1.5 max-w-[280px] w-full min-w-0 rounded-full bg-black/70 backdrop-blur border border-white/10 shadow-md transition-all"
    >
      <button
        onClick={toggle}
        className="flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-green-500 text-black"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>

      {mode !== "icon" && (
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="text-[11px] font-semibold text-white truncate">
            DJ Kakapun Manis
          </span>
          {mode === "full" && (
            <span className="text-[10px] text-gray-400 truncate">
              Remix Indonesia
            </span>
          )}
        </div>
      )}

      {mode === "full" && (
        <canvas
          ref={canvasRef}
          width={80}
          height={24}
          className="shrink-0"
        />
      )}
    </div>
  );
}