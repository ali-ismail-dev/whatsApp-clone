import { useState, useRef } from "react";
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "@inertiajs/react"; // Optional, in case you need it later
import axios from "axios";

export default function MessageInput({ conversation = null }) {
  const [newMessage, setNewMessage] = useState("");
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const textareaRef = useRef(null);

  const sendMessage = () => {
    if (newMessage.trim() === "") {
      setInputErrorMessage("Message cannot be empty.");
      // keep the textarea size reasonable when showing error
      resetHeight();
      setTimeout(() => {
        setInputErrorMessage("");
      }, 3000);
      return;
    }

    const formData = new FormData();
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
          console.log(percentCompleted);
        },
      })
      .then((response) => {
        // clear text
        setNewMessage("");
        // reset height so textarea returns to its initial (min) height
        resetHeight();
        setMessageSending(false);
      })
      .catch((error) => {
        console.error("There was an error!", error);
        setMessageSending(false);
      });
  };

  // Automatically adjust textarea height (grow)
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // remove any fixed height so scrollHeight is accurate, then set to scrollHeight
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Reset textarea height back to initial state (let CSS min-height take effect)
  const resetHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Remove inline height so Tailwind min-h applies.
      // You can also set a specific value like '2.8rem' if you prefer exact size.
      textarea.style.height = "";
    }
  };

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    adjustHeight();
  };

  return (
    <div className="flex items-center space-x-3 border-t border-slate-700 p-4 bg-gray-900 shadow-md relative">
      {/* LEFT ICONS */}
      <div className="flex items-center space-x-1">
        <button
          className="relative p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full"
          title="Attach File"
        >
          <PaperClipIcon className="w-6 h-6" />
          <input
            type="file"
            multiple
            className="absolute inset-0 z-20 opacity-0 cursor-pointer"
          />
        </button>

        <button
          className="relative p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full"
          title="Upload Image"
        >
          <PhotoIcon className="w-6 h-6" />
          <input
            type="file"
            multiple
            accept="image/*"
            className="absolute inset-0 z-20 opacity-0 cursor-pointer"
          />
        </button>

        <button
          className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full"
          title="Select Emoji"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>
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
        disabled={messageSending || newMessage.trim() === ""}
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
  );
}
