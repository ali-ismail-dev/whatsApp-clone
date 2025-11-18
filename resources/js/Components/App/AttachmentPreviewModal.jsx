import { isImage, isPreviewable, isPDF, isVideo } from "@/Helpers";
import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  PaperClipIcon, 
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon
} from "@heroicons/react/24/outline";

export default function AttachmentPreviewModal({
  attachments,
  index = 0,
  show = false,
  onClose = () => {},
}) {
  // Normalize attachments to an array so .filter/.map are safe
  const attachmentsArr = Array.isArray(attachments) ? attachments : (attachments ? [attachments] : []);
  // Only previewable attachments
  const previewableAttachments = useMemo(
    () => attachmentsArr.filter((att) => isPreviewable(att)),
    [attachmentsArr]
  );

  // We keep currentIndex relative to previewableAttachments
  const [currentIndex, setCurrentIndex] = useState(() => {
    const start = Number.isFinite(index) ? index : 0;
    return Math.max(0, Math.min(start, previewableAttachments.length - 1));
  });

  // Update currentIndex when `index` or previewableAttachments change
  useEffect(() => {
    const start = Number.isFinite(index) ? index : 0;
    const clamped = Math.max(0, Math.min(start, previewableAttachments.length - 1));
    setCurrentIndex(clamped);
  }, [index, previewableAttachments.length]);

  const attachment = previewableAttachments[currentIndex];

  const close = () => {
    onClose?.();
  };

  const prev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    setCurrentIndex((i) => Math.min(previewableAttachments.length - 1, i + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, currentIndex, previewableAttachments.length]);

  const getFileTypeIcon = () => {
    if (isImage(attachment)) return PhotoIcon;
    if (isVideo(attachment)) return FilmIcon;
    if (isPDF(attachment)) return DocumentIcon;
    return PaperClipIcon;
  };

  const FileTypeIcon = attachment ? getFileTypeIcon() : PaperClipIcon;

  return (
    <Transition show={show} as={Fragment} leave="duration-200">
      <Dialog
        as="div"
        id="modal"
        className="fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
        onClose={close}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="h-screen w-screen flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flex flex-col w-full max-w-6xl h-full max-h-[90vh] transform overflow-hidden bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <FileTypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Dialog.Title className="text-slate-200 font-medium text-sm truncate">
                        {attachment?.name || 'Attachment Preview'}
                      </Dialog.Title>
                      <p className="text-slate-400 text-xs">
                        {currentIndex + 1} of {previewableAttachments.length} • {attachment?.type}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={close}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content Area */}
                <div className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6">
                  {/* Navigation Arrows */}
                  {previewableAttachments.length > 1 && (
                    <>
                      <button
                        onClick={prev}
                        disabled={currentIndex === 0}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 z-30 ${
                          currentIndex === 0
                            ? 'opacity-50 cursor-not-allowed text-slate-500 bg-slate-700/30'
                            : 'text-slate-200 bg-slate-700/80 hover:bg-slate-600/80 hover:text-white transform hover:scale-105 shadow-lg'
                        }`}
                      >
                        <ArrowLeftIcon className="w-6 h-6" />
                      </button>

                      <button
                        onClick={next}
                        disabled={currentIndex === previewableAttachments.length - 1}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 z-30 ${
                          currentIndex === previewableAttachments.length - 1
                            ? 'opacity-50 cursor-not-allowed text-slate-500 bg-slate-700/30'
                            : 'text-slate-200 bg-slate-700/80 hover:bg-slate-600/80 hover:text-white transform hover:scale-105 shadow-lg'
                        }`}
                      >
                        <ArrowRightIcon className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Attachment Preview */}
                  {attachment ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      {isImage(attachment) && (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg pointer-events-none"></div>
                        </div>
                      )}

                      {isVideo(attachment) && (
                        <div className="w-full max-w-4xl aspect-video flex items-center justify-center">
                          <video 
                            src={attachment.url} 
                            controls 
                            autoPlay 
                            className="w-full h-full object-contain rounded-lg shadow-2xl bg-black"
                          />
                        </div>
                      )}

                      {isPDF(attachment) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <iframe
                            className="w-full h-full rounded-lg shadow-2xl bg-white"
                            src={attachment.url}
                            title={attachment.name}
                          />
                        </div>
                      )}

                      {/* Fallback for other previewable types */}
                      {isPreviewable(attachment) && !isImage(attachment) && !isVideo(attachment) && !isPDF(attachment) && (
                        <div className="flex flex-col items-center justify-center text-slate-300 p-8">
                          <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <PaperClipIcon className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Preview Not Available</h3>
                          <p className="text-slate-400 text-center max-w-md">
                            This file type cannot be previewed in the browser.
                          </p>
                          <a
                            href={attachment.url}
                            download={attachment.name}
                            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                          >
                            Download File
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-8">
                      <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
                        <PaperClipIcon className="w-10 h-10" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
                      <p>There are no previewable attachments.</p>
                    </div>
                  )}
                </div>

                {/* Footer - Navigation Dots */}
                {previewableAttachments.length > 1 && (
                  <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
                    <div className="flex items-center justify-center space-x-2">
                      {previewableAttachments.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            idx === currentIndex
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 scale-125'
                              : 'bg-slate-600 hover:bg-slate-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}