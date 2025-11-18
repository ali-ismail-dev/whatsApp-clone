import { StopCircleIcon, MicrophoneIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";

export default function AudioRecorder({ fileReady, onCancel }) {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [showCancel, setShowCancel] = useState(false);
    const timerRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);

    useEffect(() => {
        if (recording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            
            // Show cancel option after 3 seconds
            const cancelTimer = setTimeout(() => {
                setShowCancel(true);
            }, 3000);
            
            return () => {
                clearTimeout(cancelTimer);
                clearInterval(timerRef.current);
            };
        } else {
            clearInterval(timerRef.current);
            setRecordingTime(0);
            setShowCancel(false);
        }
    }, [recording]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const setupAudioAnalysis = async (stream) => {
        try {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            
            analyserRef.current.fftSize = 256;
            microphoneRef.current.connect(analyserRef.current);
            
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateAudioLevel = () => {
                if (!analyserRef.current) return;
                
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setAudioLevel(Math.min(average / 128, 1));
                
                if (recording) {
                    requestAnimationFrame(updateAudioLevel);
                }
            };
            
            updateAudioLevel();
        } catch (err) {
            console.warn("Audio analysis not supported:", err);
        }
    };

    const cleanupAudioAnalysis = () => {
        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setAudioLevel(0);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            await setupAudioAnalysis(stream);
            
            const newMediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            
            newMediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            
            newMediaRecorder.addEventListener("stop", () => {
                if (chunks.length > 0) {
                    let audioBlob = new Blob(chunks, { type: "audio/webm" });
                    let audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { 
                        type: "audio/webm; codecs=opus" 
                    });
                    const url = URL.createObjectURL(audioFile);
                    fileReady(audioFile, url);
                }
                stream.getTracks().forEach(track => track.stop());
                cleanupAudioAnalysis();
            });
            
            newMediaRecorder.start();
            setMediaRecorder(newMediaRecorder);
            setRecording(true);

        } catch (err) {
            console.error("Error accessing microphone: ", err);
            setRecording(false);
            cleanupAudioAnalysis();
        }   
    };

    const stopRecording = () => {
        setRecording(false);
        cleanupAudioAnalysis();
        if (mediaRecorder) {
            mediaRecorder.stop();
            setMediaRecorder(null);
        }
    };

    const cancelRecording = () => {
        setRecording(false);
        cleanupAudioAnalysis();
        if (mediaRecorder) {
            mediaRecorder.stop();
            setMediaRecorder(null);
        }
        onCancel?.();
    };

    return (
        <div className="flex items-center gap-1 p-4 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
            {/* Recording Status */}
            <div className="flex items-center gap-3 flex-1">
                {recording && (
                    <>
                        {/* Audio Visualization */}
                        <div className="flex items-end gap-1 h-8">
                            {[...Array(8)].map((_, index) => {
                                const threshold = (index + 1) / 8;
                                const height = Math.max(4, audioLevel > threshold ? 24 * threshold : 4);
                                return (
                                    <div
                                        key={index}
                                        className={`w-1.5 rounded-full transition-all duration-75 ${
                                            audioLevel > threshold 
                                                ? 'bg-red-400' 
                                                : 'bg-red-400/30'
                                        }`}
                                        style={{ height: `${height}px` }}
                                    />
                                );
                            })}
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-red-400 font-mono font-medium text-lg">
                                {formatTime(recordingTime)}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
                {showCancel && recording && (
                    <button
                        onClick={cancelRecording}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 transform hover:scale-105"
                        title="Cancel recording"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}

                <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={!navigator.mediaDevices?.getUserMedia}
                    className={`
                        relative flex items-center justify-center w-12 h-12 rounded-2xl 
                        transition-all duration-300 transform hover:scale-105 active:scale-95
                        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800
                        ${recording 
                            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg' 
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg'
                        }
                        ${!navigator.mediaDevices?.getUserMedia && 'opacity-50 cursor-not-allowed'}
                    `}
                    title={recording ? "Stop recording" : "Start recording"}
                >
                    {recording ? (
                        <StopCircleIcon className="w-6 h-6" />
                    ) : (
                        <MicrophoneIcon className="w-5 h-5" />
                    )}

                    {/* Recording Animation */}
                    {recording && (
                        <>
                            <div className="absolute inset-0 rounded-2xl border-2 border-red-400/50 animate-ping"></div>
                            <div className="absolute inset-0 rounded-2xl border-2 border-red-400/30 animate-pulse"></div>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}