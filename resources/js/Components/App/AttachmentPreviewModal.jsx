import { isImage, isPreviewable, isPDF, isVideo } from "@/Helpers";
import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
console.log('=== Preview Debug ===');
console.log('All attachments:', attachments);
console.log('Previewable attachments:', previewableAttachments);
console.log('Current attachment:', attachment);
console.log('isImage:', attachment ? isImage(attachment) : 'no attachment');
console.log('====================');
  const close = () => {
    onClose?.();
  };

  const prev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    setCurrentIndex((i) => Math.min(previewableAttachments.length - 1, i + 1));
  };

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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="h-screen w-screen">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="flex flex-col w-full h-full transform overflow-hidden bg-slate-800 text-left align-middle shadow-xl transition-all">
                <button
                  onClick={close}
                  className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center z-40 text-gray-300 hover:text-gray-800"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="relative group h-full">
                  {/* Prev / Next controls (only if there are multiple previewables) */}
                  {currentIndex > 0 && (
                    <div
                      onClick={prev}
                      className="absolute opacity-100 text-gray-100 cursor-pointer flex items-center justify-center w-16 h-16 left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 z-30"
                    >
                      <ArrowLeftIcon className="w-8 h-8" />
                    </div>
                  )}

                  {currentIndex < previewableAttachments.length - 1 && (
                    <div
                      onClick={next}
                      className="absolute opacity-100 text-gray-100 cursor-pointer flex items-center justify-center w-16 h-16 right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 z-30"
                    >
                      <ArrowRightIcon className="w-8 h-8" />
                    </div>
                  )}

                  {attachment ? (
                    <div className="flex items-center justify-center w-full h-full p-3">
                      {isImage(attachment) && (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full h-full object-contain"
                        />
                      )}

                      {isVideo(attachment) && (
                        <div className="w-full h-full aspect-video flex items-center">
                          <video src={attachment.url} controls autoPlay className="w-full h-full object-contain" />
                        </div>
                      )}

                      {isPDF(attachment) && (
                        <iframe
                          className="w-full h-full"
                          src={attachment.url}
                          title={attachment.name}
                        />
                      )}

                      {/* fallback for previewable types we don't explicitly handle */}
                      {isPreviewable(attachment) && !isImage(attachment) && !isVideo(attachment) && !isPDF(attachment) && (
                        <div className="p-8 flex flex-col justify-center items-center text-gray-100">
                          <PaperClipIcon className="w-16 h-16 mb-3" />
                          <small>{attachment.name}</small>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full p-3">
                      <div className="text-gray-400">No previewable attachments</div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
