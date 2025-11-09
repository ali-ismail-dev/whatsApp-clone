import { isAudio, isImage, isPreviewable, isPDF, isVideo } from "@/Helpers";
import { ArrowDownTrayIcon, PlayCircleIcon, PaperClipIcon } from "@heroicons/react/24/outline";

export default function MessageAttachment({ attachments = [], attachmentClick }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap justify-end gap-3">
      {attachments.map((attachment, index) => {
        // decide base size & classes for rectangle preview
         const isRectangular =
              (!isImage(attachment) && !isVideo(attachment));


        // For truly small images you might want to allow smaller size — adjust if needed.
        return (
          <div
            key={attachment.id ?? attachment.url ?? index}
            onClick={() => attachmentClick && attachmentClick(attachment, index)}
            className={`group relative cursor-pointer overflow-hidden text-gray-400 transition-all rounded-md
                  ${isRectangular
                    ? "flex flex-row w-[300px] h-[70px] items-center justify-between bg-slate-800 hover:bg-slate-700 p-3"
                    : "flex flex-col w-40 aspect-square items-center justify-center bg-slate-800 hover:bg-slate-700"
                  }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && attachmentClick && attachmentClick(attachment, index)}
          >
            {/* download button (if previewable or not) */}
            {!isAudio(attachment) && (
              <a
                onClick={(ev) => ev.stopPropagation()}
                download
                href={attachment.url}
                className="z-20 opacity-100 group-hover:opacity-100 transition-all w-8 h-8 flex items-center justify-center text-gray-100 bg-gray-800 rounded absolute right-2 top-2 cursor-pointer hover:bg-gray-600"
                title={`Download ${attachment.name ?? "file"}`}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </a>
            )}

            {/* IMAGE: fill the rectangle */}
            {isImage(attachment) && (
              <img
                src={attachment.url}
                alt={attachment.name ?? "image"}
                className="w-full h-full object-cover"
                draggable={false}
              />
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
                  <PlayCircleIcon className="w-14 h-14 text-white/90 drop-shadow-lg" />
                </div>
              </>
            )}

            {/* AUDIO: show a simple rectangle with audio controls centered */}
            {isAudio(attachment) && (
              <div className="w-full h-full flex items-center justify-center px-3">
                <audio controls src={attachment.url} className="w-full" />
              </div>
            )}

            {/* PDF: embed or cover area with iframe (may be blocked in some browsers) */}
            {isPDF(attachment) && (
              <iframe
                src={attachment.url}
                title={attachment.name ?? "pdf"}
                className="w-full h-full object-cover"
              />
            )}

            {/* Non-previewable (other files): show icon + filename */}
            {!isPreviewable(attachment) && !isImage(attachment) && !isAudio(attachment) && !isVideo(attachment) && !isPDF(attachment) && (
              <div className="flex items-center justify-center gap-3 text-center">
                <PaperClipIcon className="w-12 h-12 text-gray-300 bg-slate-700 p-2 rounded" />
                <div className="text-xs text-gray-300 truncate max-w-[200px]">
                  {attachment.name ?? "file"}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
