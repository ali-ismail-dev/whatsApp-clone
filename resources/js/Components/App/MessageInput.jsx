import { useState, useRef } from "react";
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import EmojiPicker from "emoji-picker-react";
import { isAudio, isImage } from "@/Helpers";
import { Popover } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import AttachmentPreview from "./AttachmentPreview";
import CustomAudioPlayer from "./CustomAudioPlayer";
import axios from "axios";
import AudioRecorder from "./AudioRecorder";

export default function MessageInput({ conversation = null }) {
  const [newMessage, setNewMessage] = useState("");
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [chosenFiles, setChosenFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const textareaRef = useRef(null);

  const onFileChange = (e) => {
    const files = e.target.files;
    const updatedFiles = [...files].map((file) => {
      return {
        file,
        url: URL.createObjectURL(file),
      };
    });
    setChosenFiles((prevFiles) => [...prevFiles, ...updatedFiles]);
  };

  const sendMessage = () => {
    if (newMessage.trim() === "" && chosenFiles.length === 0) {
      setInputErrorMessage("Message cannot be empty.");
      resetHeight();
      setTimeout(() => {
        setInputErrorMessage("");
      }, 3000);
      return;
    }

    const formData = new FormData();
    chosenFiles.forEach((file) => {
      formData.append("attachments[]", file.file);
    });
    formData.append("message", newMessage);

    if (conversation?.is_user) {
      formData.append("receiver_id", conversation.id);
    } else if (conversation?.is_group) {
      formData.append("group_id", conversation.id);
    }

    setMessageSending(true);

    axios
      .post(route("message.store"), formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(percentCompleted);
        },
      })
      .then((response) => {
        setNewMessage("");
        resetHeight();
        setMessageSending(false);
        setChosenFiles([]);
        setUploadProgress(0);
      })
      .catch((error) => {
        setMessageSending(false);
        setUploadProgress(0);
        setChosenFiles([]);
        const message = error?.response?.data?.message;
        setInputErrorMessage(message || "Failed to send message.");
        setTimeout(() => {
          setInputErrorMessage("");
        }, 3000);
      });
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const resetHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "";
    }
  };

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    adjustHeight();
  };

  const recordedAudioReady = (file, url) => {
    setChosenFiles((prevFiles) => [...prevFiles, { file, url }]);
  }

  return (
    <div className="w-full">
      {/* INPUT BAR */}
      <div className="flex items-center space-x-3 border-t border-slate-700 p-4 bg-gray-900 shadow-md relative">
        {/* LEFT ICONS */}
        <div className="flex items-center space-x-1">
          <label
            className="relative p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full cursor-pointer"
            title="Attach File"
          >
            <PaperClipIcon className="w-6 h-6" />
            <input
              type="file"
              multiple
              onChange={onFileChange}
              className="absolute inset-0 z-20 opacity-0 cursor-pointer"
            />
          </label>

          <label
            className="relative p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full cursor-pointer"
            title="Upload Image"
          >
            <PhotoIcon className="w-6 h-6" />
            <input
              type="file"
              multiple
              onChange={onFileChange}
              accept="image/*"
              className="absolute inset-0 z-20 opacity-0 cursor-pointer"
            />
          </label>

          <Popover className="relative">
            <Popover.Button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full">
              <FaceSmileIcon className="w-6 h-6" />
            </Popover.Button>
            <Popover.Panel className="absolute left-0 z-50 bottom-full">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(ev) => setNewMessage((m) => m + ev.emoji)}
              />
            </Popover.Panel>
          </Popover>
          <AudioRecorder fileReady={recordedAudioReady} />
        </div>

        {/* INPUT AREA */}
        <div className="flex-grow flex relative rounded-xl bg-slate-800 border border-slate-700 transition-all focus-within:border-cyan-500">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="w-full resize-none overflow-hidden p-3 max-h-40 min-h-[2.8rem] border-none bg-transparent text-slate-100 placeholder-slate-400 focus:ring-0 focus:outline-none rounded-xl"
            placeholder="Type a message..."
            rows={1}
          />
        </div>

        {/* SEND BUTTON */}
        <button
          onClick={sendMessage}
          disabled={messageSending || (newMessage.trim() === "" && chosenFiles.length === 0)}
          className="flex items-center justify-center w-12 h-12 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 disabled:opacity-75 shrink-0"
          title="Send Message"
        >
          {messageSending ? (
            <span className="loading loading-spinner text-white w-6 h-6"></span>
          ) : (
            <PaperAirplaneIcon className="w-6 h-6 transform -rotate-45" />
          )}
        </button>


        {/* ERROR MESSAGE */}
        {inputErrorMessage && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 p-2 px-4 rounded-lg bg-red-800 text-white text-sm shadow-xl z-10">
            {inputErrorMessage}
          </div>
        )}
      </div>

      {/* UPLOAD PROGRESS (full width under bar) */}
      {uploadProgress > 0 && (
        <div className="px-4 pt-2">
          <progress
            className="progress progress-info w-full"
            value={uploadProgress}
            max="100"
          />
        </div>
      )}

      {/* PREVIEW AREA: images/audio/attachments show UNDER the input bar */}
      {chosenFiles.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-800 bg-gray-900">
          <div className="flex flex-wrap gap-3">
            {chosenFiles.map((file) => (
              <div
                key={file.file.name + file.file.size}
                className={
                  "relative rounded-md bg-slate-800 p-1 flex items-center justify-center overflow-hidden " +
                  (!isImage(file.file) ? "w-[300px] h-[100px]" : "w-[100px] h-[100px]")
                }
              >
                {isImage(file.file) && (
                  <img
                    src={file.url}
                    alt={file.file.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                )}

                {isAudio(file.file) && (
                  // Assuming CustomAudioPlayer is available globally or imported
                  <CustomAudioPlayer file={file} showVolume={false} />
                )}

                {!isAudio(file.file) && !isImage(file.file) && (
                  // Assuming AttachmentPreview is available globally or imported
                  <AttachmentPreview file={file.file} />
                )}

                <button
                  onClick={() =>
                    setChosenFiles((prev) =>
                      prev.filter((f) => f.file.name !== file.file.name || f.file.size !== file.file.size)
                    )
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  aria-label={`Remove ${file.file.name}`}
                >
                  <XMarkIcon className="w-4 h-4 m-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
