import { isImage, isPreviewable } from "@/Helpers";
import { Transition } from "@headlessui/react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatBytes } from "@/Helpers";


export default function AttachmentPreviewModal({
    attachments,
    index,
    show = false,
    onClose = () => {},
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const attachment = useMemo(() => {
        return attachments[currentIndex];
    }, [attachments, currentIndex]);

    const previewableAttechments = useMemo(() => {
        return attachments.filter((attachment) => isPreviewable(attachment));
    }, [attachments]);

    const close = () => {
        if (closeable) {
            onClose();
        }
    };
    const prev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    const next = () => {
        if (currentIndex === previewableAttechments.length - 1) {
            return;
        }
        setCurrentIndex(currentIndex + 1);
    };
    useEffect(() => {
        setCurrentIndex(index);
    }, [index]);
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
                                    {currentIndex > 0 && (
                                        <div
                                            onClick={prev}
                                            className="absolute opacity-100 text-gray-100 cursor-pointer flex items-center justify-center w-16 h-16 left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 z-30"
                                        >
                                            <ChevronLeftIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    {currentIndex <
                                        previewableAttechments.length - 1 && (
                                        <div
                                            onClick={next}
                                            className="absolute opacity-100 text-gray-100 cursor-pointer flex items-center justify-center w-16 h-16 right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 z-30"
                                        >
                                            <ChevronRightIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    {attachment && (
                                        <div className="flex items-center justify-center w-full h-full p-3">
                                            {isImage(attachment) && (
                                                <img
                                                    src={attachment.url}
                                                    alt={attachment.name}
                                                    className="w-full h-full object-contain aspect-square"
                                                />
                                            )}
                                            {isVideo(attachment) && (
                                                <div className="w-full h-full aspect-video flex items-center">
                                                    <video
                                                        src={attachment.url}
                                                        controls
                                                        autoPlay
                                                    />
                                                </div>
                                            )}
                                            {isPDF(attachment) && (
                                                <iframe
                                                    className="w-full h-full"
                                                    src={attachment.url}
                                                    title={attachment.name}
                                                ></iframe>
                                            )}
                                            {isPreviewable(attachment) && (
                                                <div className="p-32 flex flex-col justify-center items-center text-gray-100">
                                                    <PaperClipIcon className="w-16 h-16 mb-3" />
                                                    <small>{attachment.name}</small>
                                                    </div>

                                            )}
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
