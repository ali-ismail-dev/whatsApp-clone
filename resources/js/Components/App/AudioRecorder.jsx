import { StopCircleIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function AudioRecorder({fileReady}) {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);

    const onMicClick = async () => {
        if (recording) {
            setRecording(false);
            if (mediaRecorder) {
                mediaRecorder.stop();
                setMediaRecorder(null);
            }
            return;
        }
        setRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const newMediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            newMediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            }
            newMediaRecorder.addEventListener("stop", () => {
                let audioBlob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
                let audioFile = new File([audioBlob], "recorded_audio.ogg", { type: "audio/ogg; codecs=opus" });
                const url = URL.createObjectURL(audioFile);
                fileReady(audioFile, url);
            });
            newMediaRecorder.start();
            setMediaRecorder(newMediaRecorder);

        } catch (err) {
            setRecording(false);
            console.log("Error: ", err);
        }   
    }
    return (
        <button onClick={onMicClick}>
            {recording ? 
            <StopCircleIcon className="w-6 h-6 text-red-400 hover:text-red-600 transition-colors" /> : <MicrophoneIcon className=" text-slate-400 hover:text-cyan-400 transition-colors w-6 h-6 rounded-full" />}
            </button>
    )
}