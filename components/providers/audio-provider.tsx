"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";

const AudioContextGlobal = createContext<any>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const handleClick = async () => {
      if (!audioRef.current) return;

      if (!audioContextRef.current) {
        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(audioRef.current);
        const analyser = ctx.createAnalyser();

        analyser.fftSize = 128;

        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      }

      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      await audioRef.current.play().catch(() => {});
      setPlaying(true);

      window.removeEventListener("click", handleClick);
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const toggle = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      await audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <AudioContextGlobal.Provider
      value={{ audioRef, analyserRef, playing, toggle }}
    >
      {children}
      <audio ref={audioRef} loop src="/dj_kakapun_manis.mp3" />
    </AudioContextGlobal.Provider>
  );
}

export const useAudio = () => useContext(AudioContextGlobal);
