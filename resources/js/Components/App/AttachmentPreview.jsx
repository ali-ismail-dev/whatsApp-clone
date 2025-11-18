import { isPDF, isPreviewable } from "@/Helpers";
import { 
  PaperClipIcon, 
  DocumentIcon, 
  PhotoIcon,
  DocumentTextIcon,
  TableCellsIcon,
  FilmIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import { formatByets } from "@/Helpers";

export default function AttachmentPreview({ file }) {
  const realFile = file?.file ?? file;

  if (!realFile) {
    return (
      <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 shadow-lg">
        <div className="flex justify-center items-center w-12 h-12 bg-slate-600/50 rounded-lg">
          <PaperClipIcon className="w-6 h-6 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-300 text-sm font-medium truncate">Unknown file</h3>
          <p className="text-slate-400 text-xs mt-0.5">File not available</p>
        </div>
      </div>
    );
  }

  const name = realFile.name ?? "unknown";
  const size = typeof realFile.size === "number" ? formatByets(realFile.size) : "";
  const fileType = realFile.type?.split('/')[0];
  const fileExtension = name.split('.').pop()?.toLowerCase();

  const getFileIcon = () => {
    if (isPDF(realFile)) {
      return { icon: DocumentTextIcon, color: "from-red-500 to-red-600", badge: "PDF" };
    }
    
    switch (fileType) {
      case 'image':
        return { icon: PhotoIcon, color: "from-blue-500 to-cyan-500", badge: "IMG" };
      case 'video':
        return { icon: FilmIcon, color: "from-purple-500 to-pink-500", badge: "VID" };
      case 'audio':
        return { icon: MusicalNoteIcon, color: "from-green-500 to-emerald-500", badge: "AUD" };
      default:
        switch (fileExtension) {
          case 'doc':
          case 'docx':
            return { icon: DocumentTextIcon, color: "from-blue-500 to-blue-600", badge: "DOC" };
          case 'xls':
          case 'xlsx':
            return { icon: TableCellsIcon, color: "from-green-500 to-green-600", badge: "XLS" };
          case 'zip':
          case 'rar':
          case '7z':
            return { icon: ArchiveBoxIcon, color: "from-orange-500 to-orange-600", badge: "ZIP" };
          default:
            return { icon: DocumentIcon, color: "from-slate-600 to-slate-700", badge: "FILE" };
        }
    }
  };

  const { icon: Icon, color, badge } = getFileIcon();

  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 shadow-lg hover:bg-slate-700/70 transition-all duration-200 group">
      {/* File Icon with Badge */}
      <div className="relative">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600">
          <span className="text-white text-[6px] font-bold leading-none">{badge}</span>
        </div>
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-slate-200 text-sm font-medium truncate group-hover:text-white transition-colors duration-200">
          {name}
        </h3>
        {size && (
          <p className="text-slate-400 text-xs mt-0.5 flex items-center">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1.5"></span>
            {size}
          </p>
        )}
      </div>

      {/* Hover Indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-0.5">
        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
      </div>
    </div>
  );
}