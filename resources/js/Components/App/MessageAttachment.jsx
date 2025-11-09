import { isAudio, isImage, isPreviewable, isPDF, isVideo } from "@/Helpers";
import { ArrowDownTrayIcon, PlayCircleIcon, PaperClipIcon } from "@heroicons/react/24/outline";


export default function MessageAttachment({ attachments=[], attachmentClick }) {
    
    return (
        <>
            {attachments.length > 0 && 
                <div className="mt-2 flex flex-wrap justify-end gap-1">
                    {attachments.map((attachment, index) => (
                        <div 
                            onClick={(ev) => attachmentClick(attachment, index)}
                            key={attachment.id} 
                            className={`group flex flex-col items-center justify-center text-gray-400 relative gap-1 cursor-pointer` +
                                (isAudio(attachment)
                                    ? "w-82"
                                    : "w-32 aspect-square bg-slate-800  hover:bg-slate-700 rounded-md")
                                
                            }
                        >
                            {!isAudio(attachment) && (
                                <a 
                                    onClick={(ev) => ev.stopPropagation()}
                                    download
                                    href={attachment.url}
                                    className="z-20 opacity-100 group-hover:opacity-100 transition-all w-8 h-8 flex items-center justify-center text-gray-100 bg-gray-800 rounded absolute right-0 top-0 m-1 cursor-pointer hover:bg-gray-500"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                </a>
                            )}
                            {isImage(attachment) && (
                                       <img src={attachment.url} alt={attachment.name} className="w-full h-full object-contain aspect-square" />
                            )}
                     
                            {isVideo(attachment) && (
                                <div className="relative flex justify-center items-center">
                                    <PlayCircleIcon className="z-20 absolute w-16 h-16 text-white opacity-70"/>
                                <div className="absolute left-0 top-0 w-full h-full bg-black/50 z-10">
                                </div>
                                <video src={attachment.url} className="w-full h-full object-contain aspect-square" />
                                </div>
                            )}

                            {isAudio(attachment) && (
                                <div className="relative flex items-center justify-center">
                                    <audio controls src={attachment.url} className="w-full h-full object-contain aspect-square" />
                                </div>
                            )}
                            {isPDF(attachment) && (
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute left-0 top-0 bottom-0 right-0"></div>
                                    <iframe src={attachment.url} className="w-full h-full object-contain aspect-square" />
                                </div>
                            )}
                            {!isPreviewable(attachment) && (
                                <a 
                                    onClick={(ev) => ev.stopPropagation()}
                                    download
                                    href={attachment.url}
                                    className="flex flex-col justify-center items-center"
                                    >
                                        <PaperClipIcon className="w-6 h-6 text-gray-400" />
                                        <small className="text-xs">{attachment.name}</small>
                                    </a>
                            )}
                        </div>
                    ))}    
                </div>
            }
        </>
    )
}