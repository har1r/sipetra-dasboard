"use client";

import { useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/components/providers/audio-provider";

export default function PlaylistToday() {
  const { analyserRef, playing, toggle } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

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
    <div className="flex items-center gap-4 px-3 rounded-full bg-black/70 backdrop-blur border border-white/10 shadow-md ml-4">
      <button
        onClick={toggle}
        className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-black hover:scale-105 transition"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <div className="flex flex-col leading-tight">
        <span className="text-xs font-semibold text-white">
          DJ Kakapun Manis
        </span>
        <span className="text-xs text-gray-400">Remix Indonesia</span>
      </div>

      <canvas ref={canvasRef} width={160} height={30} />
    </div>
  );
}
