import { useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

function formatSeconds(sec = 0) {
  if (!isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor(sec / 60);
  return `${m}:${s}`;
}

export default function CustomAudioPlayer({ file, showVolume = true }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // When file changes, reset state
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
    }
    setVolume(1);
    setIsMuted(false);
  }, [file?.url]);

  // Hook up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        // play() returns a promise in modern browsers
        await audio.play();
      }
      // state will update in play/pause event handlers
    } catch (err) {
      // autoplay or other errors can happen — fallback to toggling state
      console.warn("Audio play error", err);
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(value);
    setCurrentTime(Number(value));
  };

  const handleProgressClick = (e) => {
    const el = progressRef.current;
    if (!el || !duration) return;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    handleSeek(pct * duration);
  };

  const handleVolumeChange = (v) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Number(v);
    setVolume(Number(v));
    setIsMuted(Number(v) === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !isMuted;
    audio.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && audio.volume === 0) {
      audio.volume = 0.7;
      setVolume(0.7);
    }
  };

  const progressPct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="w-full max-w-lg bg-slate-800 rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm">
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={file?.url} preload="metadata" className="hidden" />

      {/* Play / Pause */}
      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={togglePlayPause}
        className="flex items-center justify-center w-12 h-12 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white shadow"
      >
        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </button>

      {/* Progress + times */}
      <div className="flex-1 min-w-0">
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative h-2 w-full bg-slate-700 rounded overflow-hidden cursor-pointer"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={duration || 0}
          aria-valuenow={currentTime}
        >
          <div
            className="absolute left-0 top-0 h-full bg-cyan-500"
            style={{ width: `${progressPct}%` }}
          />
          {/* scrub handle */}
          <div
            style={{ left: `${progressPct}%` }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-300 mt-2">
          <div className="truncate">{file?.name ?? "Audio"}</div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px]">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Volume & Download */}
      <div className="flex items-center gap-2">
        {showVolume && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="p-1 rounded hover:bg-slate-700"
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5 text-gray-200" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5 text-gray-200" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="w-24 accent-cyan-500"
            />
          </div>
        )}

        <a
          href={file?.url}
          download
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded hover:bg-slate-700"
          title="Download audio"
        >
          <ArrowDownTrayIcon className="w-5 h-5 text-gray-200" />
        </a>
      </div>
    </div>
  );
}
