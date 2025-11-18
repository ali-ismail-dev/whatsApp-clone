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
      <div className="flex items-center space-x-3 p-4 bg-gradient-to-t from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl shadow-blue-500/5 relative">
        {/* LEFT ICONS */}
        <div className="flex items-center space-x-1">
          <label
            className="relative p-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 rounded-xl cursor-pointer hover:bg-slate-700/50 backdrop-blur-sm group"
            title="Attach File"
          >
            <PaperClipIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <input
              type="file"
              multiple
              onChange={onFileChange}
              className="absolute inset-0 z-20 opacity-0 cursor-pointer"
            />
          </label>

          <label
            className="relative p-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 rounded-xl cursor-pointer hover:bg-slate-700/50 backdrop-blur-sm group"
            title="Upload Image"
          >
            <PhotoIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <input
              type="file"
              multiple
              onChange={onFileChange}
              accept="image/*"
              className="absolute inset-0 z-20 opacity-0 cursor-pointer"
            />
          </label>

          <Popover className="relative">
            <Popover.Button className="p-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 rounded-xl hover:bg-slate-700/50 backdrop-blur-sm group">
              <FaceSmileIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </Popover.Button>
            <Popover.Panel className="absolute left-0 z-50 bottom-full mb-3">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-slate-600/50">
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={(ev) => setNewMessage((m) => m + ev.emoji)}
                />
              </div>
            </Popover.Panel>
          </Popover>
          
          <AudioRecorder fileReady={recordedAudioReady} />
        </div>

        {/* INPUT AREA */}
        <div className="flex-grow flex relative">
          <div className="
            flex-grow relative rounded-2xl 
            bg-gradient-to-br from-slate-800/80 to-slate-900/80 
            border border-slate-600/50 backdrop-blur-sm
            transition-all duration-300 
            focus-within:border-cyan-500/50 focus-within:shadow-lg focus-within:shadow-cyan-500/10
            hover:border-slate-500/50
          ">
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
              className="w-full resize-none overflow-hidden p-4 max-h-40 min-h-[3.5rem] border-none bg-transparent text-slate-100 placeholder-slate-400 focus:ring-0 focus:outline-none rounded-2xl"
              placeholder="Type a message..."
              rows={1}
            />
            {/* Gradient accent line when focused */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 focus-within:w-full group-hover:w-full"></div>
          </div>
        </div>

        {/* SEND BUTTON */}
        <button
          onClick={sendMessage}
          disabled={messageSending || (newMessage.trim() === "" && chosenFiles.length === 0)}
          className="
            flex items-center justify-center w-14 h-14 
            bg-gradient-to-r from-blue-500 to-cyan-500 
            hover:from-blue-600 hover:to-cyan-600 
            text-white rounded-2xl 
            shadow-lg shadow-blue-500/30 
            transition-all duration-300 
            transform hover:scale-110 active:scale-95 
            disabled:from-slate-700 disabled:to-slate-800 
            disabled:text-slate-500 disabled:shadow-none
            disabled:scale-100 disabled:cursor-not-allowed
            backdrop-blur-sm border border-blue-400/20
            group
          "
          title="Send Message"
        >
          {messageSending ? (
            <div className="flex items-center justify-center w-6 h-6">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : (
            <PaperAirplaneIcon className="w-6 h-6 transform -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          )}
        </button>

        {/* ERROR MESSAGE */}
        {inputErrorMessage && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 p-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm shadow-2xl shadow-red-500/20 backdrop-blur-sm border border-red-500/30 z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              {inputErrorMessage}
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD PROGRESS */}
      {uploadProgress > 0 && (
        <div className="px-4 pt-2 bg-gradient-to-t from-slate-900/95 to-slate-800/95 backdrop-blur-xl">
          <div className="w-full bg-slate-700/50 rounded-full h-2 backdrop-blur-sm">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 shadow-lg shadow-blue-500/30"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* PREVIEW AREA */}
      {chosenFiles.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-700/50 bg-gradient-to-t from-slate-900/95 to-slate-800/95 backdrop-blur-xl">
          <div className="flex flex-wrap gap-3">
            {chosenFiles.map((file) => (
              <div
                key={file.file.name + file.file.size}
                className={`
                  relative rounded-2xl p-3 flex items-center justify-center overflow-hidden 
                  backdrop-blur-sm border border-slate-600/50
                  bg-gradient-to-br from-slate-800/80 to-slate-900/80
                  hover:border-cyan-500/50 hover:shadow-lg hover:shadow-blue-500/10
                  transition-all duration-300 transform hover:scale-[1.02]
                  ${!isImage(file.file) ? "w-[320px] h-[120px]" : "w-[120px] h-[120px]"}
                `}
              >
                {isImage(file.file) && (
                  <div className="relative w-full h-full">
                    <img
                      src={file.url}
                      alt={file.file.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent rounded-xl"></div>
                  </div>
                )}

                {isAudio(file.file) && (
                  <CustomAudioPlayer file={file} showVolume={false} />
                )}

                {!isAudio(file.file) && !isImage(file.file) && (
                  <AttachmentPreview file={file.file} />
                )}

                <button
                  onClick={() =>
                    setChosenFiles((prev) =>
                      prev.filter((f) => f.file.name !== file.file.name || f.file.size !== file.file.size)
                    )
                  }
                  className="
                    absolute top-2 right-2 
                    bg-gradient-to-r from-red-500 to-red-600 
                    text-white rounded-full w-7 h-7 
                    flex items-center justify-center
                    transition-all duration-300 
                    hover:scale-110 hover:shadow-lg hover:shadow-red-500/30
                    backdrop-blur-sm border border-red-400/30
                  "
                  aria-label={`Remove ${file.file.name}`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}