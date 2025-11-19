import { useState, useRef, useEffect } from "react";
import { isAudio, isImage, isPreviewable, isPDF, isVideo } from "@/Helpers";
import {
  ArrowDownTrayIcon,
  PlayCircleIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

/**
 * InlineAudioPlayer
 * Props:
 *  - src: string (audio url)
 *
 * Usage:
 *  <InlineAudioPlayer src={attachment.url} />
 */
function InlineAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onTime = () => {
      setCurrentTime(audio.currentTime || 0);
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      setProgressPct(Math.min(100, Math.max(0, pct)));
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlayPause = (ev) => {
    ev?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((e) => {
        console.error("Audio play blocked:", e);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (ev) => {
    ev.stopPropagation();
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = ev.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, clickX / rect.width));
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
    setCurrentTime(audio.currentTime);
    setProgressPct(pct * 100);
  };

  const formatSeconds = (s) => {
    if (s === null || s === undefined || isNaN(s)) return "0:00";
    const sec = Math.floor(s || 0);
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-4 border border-slate-600/50 shadow-lg"
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Audio message"
    >
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      {/* Play/Pause Button */}
      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={togglePlayPause}
        disabled={isLoading}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-xl
          bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg transition-all duration-300
          hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
          ${isPlaying ? "ring-2 ring-cyan-400/50 shadow-cyan-500/30" : ""}
        `}
        type="button"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5 ml-0.5" />
        )}
      </button>

      {/* Progress Bar */}
      <div className="flex-1">
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="w-full relative h-3 bg-slate-700/50 rounded-full overflow-hidden cursor-pointer group"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 0}
          aria-valuenow={Math.round(currentTime) || 0}
        >
          {/* Background track */}
          <div className="absolute inset-0 bg-slate-600/30 rounded-full" />

          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPct}%` }}
          />

          {/* Scrubber handle (visible on hover) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ left: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Time Display */}
      <div className="text-slate-300 text-sm font-mono min-w-[60px] text-right tracking-tight">
        {formatSeconds(currentTime)} / {formatSeconds(duration)}
      </div>
    </div>
  );
}


export default function MessageAttachment({ attachments = [], attachmentClick }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap justify-end gap-3">
      {attachments.map((attachment, index) => {
        const isRectangular = !isImage(attachment) && !isVideo(attachment);
        const isClickable = isPreviewable(attachment) && !isAudio(attachment);
        const key = attachment.id ?? `${attachment.url}-${index}`;

        return (
          <div
            key={key}
            onClick={() => isClickable && attachmentClick && attachmentClick(attachments, index)}
            className={`
              group relative overflow-hidden transition-all rounded-xl
              border border-slate-600/50 backdrop-blur-sm
              ${isClickable ? "cursor-pointer hover:border-cyan-500/50 hover:shadow-lg hover:shadow-blue-500/10 transform hover:scale-[1.02] duration-300" : "cursor-default"}
              ${isRectangular && !isAudio(attachment) 
                ? "flex flex-row w-[300px] h-[70px] items-center justify-between bg-gradient-to-br from-slate-800/80 to-slate-900/80"
                : isAudio(attachment)
                  ? "flex flex-row w-full max-w-xs items-center justify-between bg-gradient-to-br from-slate-800/80 to-slate-900/80"
                  : "flex flex-col w-40 aspect-square items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900/80"
              }`}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => e.key === "Enter" && isClickable && attachmentClick && attachmentClick(attachments, index)}
          >
            {/* Gradient overlay on hover (only for previewable items) */}
            {isClickable && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 z-10"></div>
            )}

            {/* download button with glass morphism */}
            {!isPreviewable(attachment) && !isAudio(attachment) && (
              <a
                onClick={(ev) => ev.stopPropagation()}
                download
                href={attachment.url}
                className="z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 w-8 h-8 flex items-center justify-center text-slate-100 bg-slate-700/80 backdrop-blur-sm rounded-lg absolute right-2 top-2 cursor-pointer hover:bg-cyan-500 hover:scale-110 border border-slate-600/50"
                title={`Download ${attachment.name ?? "file"}`}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </a>
            )}

            {/* IMAGE: fill the rectangle with enhanced styling */}
            {isImage(attachment) && (
              <div className="relative w-full h-full">
                <img src={attachment.url} alt={attachment.name ?? "image"} className="w-full h-full object-cover" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}

            {/* VIDEO: show an overlay play icon + thumbnail/video element */}
            {isVideo(attachment) && (
              <>
                <video src={attachment.url} className="w-full h-full object-cover" muted preload="metadata" />
                <div className="absolute z-10 flex items-center justify-center pointer-events-none left-0 top-0 w-full h-full">
                  <div className="bg-slate-900/40 backdrop-blur-sm rounded-full p-2 group-hover:bg-cyan-500/20 transition-colors duration-300">
                    <PlayCircleIcon className="w-10 h-10 text-white/90 drop-shadow-lg" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">Video</div>
              </>
            )}

            {/* AUDIO: Inline player (self-contained) */}
            {isAudio(attachment) && <InlineAudioPlayer src={attachment.url} />}

            {/* PDF: enhanced styling */}
            {isPDF(attachment) && (
              <div className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80">
                <div className="flex-shrink-0 relative">
                  <svg className="w-12 h-14 object-contain text-red-500 filter drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>

                <div className="flex-1 text-slate-200 truncate min-w-0">
                  <h3 className="text-sm font-medium truncate text-slate-100">{attachment.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{(attachment.size / 1024).toFixed(1)} KB</p>
                </div>

                <div className="p-2 rounded-lg bg-slate-700/50 text-slate-300 backdrop-blur-sm border border-slate-600/50">
                  <ArrowDownTrayIcon className="w-5 h-5 opacity-50" />
                </div>
              </div>
            )}

            {/* Non-previewable files */}
            {!isPreviewable(attachment) && !isImage(attachment) && !isAudio(attachment) && !isVideo(attachment) && !isPDF(attachment) && (
              <div className="flex items-center justify-center gap-4 text-center p-4 w-full">
                <div className="relative">
                  <PaperClipIcon className="w-12 h-12 text-cyan-400 bg-slate-700/50 p-2 rounded-xl backdrop-blur-sm border border-slate-600/50" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate max-w-[160px]">{attachment.name ?? "file"}</p>
                  <p className="text-xs text-slate-400 mt-1">{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : "Unknown size"}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}