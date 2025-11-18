import { isAudio, isImage, isPreviewable, isPDF, isVideo } from "@/Helpers";
import { ArrowDownTrayIcon, PlayCircleIcon, PaperClipIcon } from "@heroicons/react/24/outline";

export default function MessageAttachment({ attachments = [], attachmentClick }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap justify-end gap-3">
      {attachments.map((attachment, index) => {
        const isRectangular = (!isImage(attachment) && !isVideo(attachment));

        return (
          <div
            key={attachment.id ?? attachment.url ?? index}
            onClick={() => attachmentClick && attachmentClick(attachments, index)}
            className={`
              group relative cursor-pointer overflow-hidden transition-all rounded-xl
              border border-slate-600/50 backdrop-blur-sm
              hover:border-cyan-500/50 hover:shadow-lg hover:shadow-blue-500/10
              transform hover:scale-[1.02] transition-all duration-300
              ${isRectangular
                ? "flex flex-row w-[300px] h-[70px] items-center justify-between bg-gradient-to-br from-slate-800/80 to-slate-900/80"
                : "flex flex-col w-40 aspect-square items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900/80"
              }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && attachmentClick && attachmentClick(attachments, index)}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 z-10"></div>

            {/* download button with glass morphism */}
            {!isAudio(attachment) && !isPDF(attachment) && (
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
                <img
                  src={attachment.url}
                  alt={attachment.name ?? "image"}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}

            {/* VIDEO: show an overlay play icon + thumbnail/video element */}
            {isVideo(attachment) && (
              <>
                <video
                  src={attachment.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute z-10 flex items-center justify-center pointer-events-none left-0 top-0 w-full h-full">
                  <div className="bg-slate-900/40 backdrop-blur-sm rounded-full p-2 group-hover:bg-cyan-500/20 transition-colors duration-300">
                    <PlayCircleIcon className="w-10 h-10 text-white/90 drop-shadow-lg" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  Video
                </div>
              </>
            )}

            {/* AUDIO: styled audio controls */}
            {isAudio(attachment) && (
              <div className="w-full h-full flex items-center justify-center px-3">
                <div className="w-full bg-slate-700/50 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <PlayCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-200 text-sm font-medium truncate flex-1">
                      {attachment.name || "Audio file"}
                    </span>
                  </div>
                  <audio controls src={attachment.url} className="w-full h-8 [&::-webkit-media-controls-panel]:bg-slate-600" />
                </div>
              </div>
            )}

            {/* PDF: enhanced styling */}
            {isPDF(attachment) && (
              <div className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80">
                <div className="flex-shrink-0 relative">
                  <img src="/img/pdf.png" alt="PDF" className="w-12 h-14 object-contain filter drop-shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>

                <div className="flex-1 text-slate-200 truncate min-w-0">
                  <h3 className="text-sm font-medium truncate text-slate-100">{attachment.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <a
                  href={attachment.url}
                  download
                  onClick={(ev) => ev.stopPropagation()}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-cyan-500 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-slate-600/50"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 text-slate-300 hover:text-white" />
                </a>
              </div>
            )}

            {/* Non-previewable files: glass morphism design */}
            {!isPreviewable(attachment) && !isImage(attachment) && !isAudio(attachment) && !isVideo(attachment) && !isPDF(attachment) && (
              <div className="flex items-center justify-center gap-4 text-center p-4 w-full">
                <div className="relative">
                  <PaperClipIcon className="w-12 h-12 text-cyan-400 bg-slate-700/50 p-2 rounded-xl backdrop-blur-sm border border-slate-600/50" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate max-w-[160px]">
                    {attachment.name ?? "file"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}