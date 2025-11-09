import { isPDF, isPreviewable } from "@/Helpers";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { formatByets } from "@/Helpers";

export default function AttachmentPreview({ file }) {
  // `file` might be:
  // 1) a wrapper: { file: File, url: '...' }
  // 2) the raw File object
  // 3) undefined/null (defensive)
  const realFile = file?.file ?? file;

  // If no file at all, render a safe fallback
  if (!realFile) {
    return (
      <div className="w-full items-center gap-2 py-2 px-3 rounded-md bg-slate-800">
        <div className="flex justify-center items-center w-10 h-10 bg-gray-700 rounded">
          <PaperClipIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-gray-400">
          <h3>Unknown file</h3>
        </div>
      </div>
    );
  }

  const name = realFile.name ?? "unknown";
  const size = typeof realFile.size === "number" ? formatByets(realFile.size) : "";

  return (
    <div className="w-full flex items-center gap-2 py-2 px-3 rounded-md bg-slate-800">
      <div>
        {isPDF(realFile) && (
          <img src="/img/pdf.png" alt="PDF" className="w-10 h-12" />
        )}

        {!isPreviewable(realFile) && (
          <div className="flex justify-center items-center w-10 h-10 bg-gray-700 rounded">
            <PaperClipIcon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 text-gray-400 truncate">
        <h3 className="text-sm">{name}</h3>
        <p className="text-xs">{size}</p>
      </div>
    </div>
  );
}
