import { useEffect, useRef, useState } from "react";
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon, 
  ArrowDownTrayIcon,
  MusicalNoteIcon
} from "@heroicons/react/24/outline";

function formatSeconds(sec = 0) {
  if (!isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor(sec / 60);
  return `${m}:${s}`;
}

export default function CustomAudioPlayer({ file, showVolume = true }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // When file changes, reset state
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;
    }
  }, [file?.url]);

  // Hook up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
      setIsLoading(false);
    };
    const onLoadStart = () => setIsLoading(true);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("loadstart", onLoadStart);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("loadstart", onLoadStart);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (err) {
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
    const newVolume = Number(v);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
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
  const volumePct = isMuted ? 0 : volume * 100;

  return (
    <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-4 shadow-2xl border border-slate-700/50">
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={file?.url} preload="metadata" className="hidden" />

      {/* Play/Pause Button */}
      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={togglePlayPause}
        disabled={isLoading}
        className={`
          relative flex items-center justify-center w-14 h-14 rounded-2xl
          bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700
          text-white shadow-lg transition-all duration-200 transform hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${isPlaying ? 'ring-2 ring-cyan-400/50' : ''}
        `}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <PauseIcon className="w-7 h-7" />
        ) : (
          <PlayIcon className="w-7 h-7 ml-1" />
        )}
        
        {/* Pulse effect when playing */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 animate-ping"></div>
        )}
      </button>

      {/* Progress + File Info */}
      <div className="flex-1 min-w-0">
        {/* File Name */}
        <div className="flex items-center gap-2 mb-2">
          <MusicalNoteIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="text-slate-200 text-sm font-medium truncate">
            {file?.name ?? "Audio Message"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs font-mono min-w-[35px]">
            {formatSeconds(currentTime)}
          </span>
          
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 relative h-3 bg-slate-700/80 rounded-full overflow-hidden cursor-pointer group"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={currentTime}
          >
            {/* Background Track */}
            <div className="absolute inset-0 bg-slate-600/50 rounded-full" />
            
            {/* Progress Fill */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${progressPct}%` }}
            />
            
            {/* Scrub Handle */}
            <div
              style={{ left: `${progressPct}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
          </div>

          <span className="text-slate-400 text-xs font-mono min-w-[35px]">
            {formatSeconds(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Download Controls */}
      <div className="flex items-center gap-2">
        {/* Volume Control */}
        {showVolume && (
          <div className="relative group">
            <button
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 transform hover:scale-105"
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : volume < 0.5 ? (
                <SpeakerWaveIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>

            {/* Volume Slider Popover */}
            <div 
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl transition-all duration-200 ${
                showVolumeSlider ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <div className="flex items-center justify-center h-24">
                <input
                  ref={volumeRef}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  className="volume-slider w-32 accent-cyan-500 transform -rotate-90"
                  orient="vertical"
                />
              </div>
              <div className="text-center text-slate-400 text-xs mt-1">
                {Math.round(volume * 100)}%
              </div>
            </div>
          </div>
        )}

        {/* Download Button */}
        <a
          href={file?.url}
          download={file?.name || "audio_message"}
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 transform hover:scale-105 group relative"
          title="Download audio"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </a>
      </div>

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading audio...</span>
          </div>
        </div>
      )}
    </div>
  );
}