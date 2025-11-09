import { useState, useRef } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/outline";



export default function CustomAudioPlayer({ file, showVolume = true }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);

    const togglePlayPuse = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        
        } else {
            console.log(audio, audio.duration);
            setDuration(audio.duration);
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeUpdate = (e) => {
        const volume = e.target.value;
        audioRef.current.volume = volume;
        setVolume(volume);
    };

    const handleTimeUpdate = (e) => {
        const audio = audioRef.current;
        setDuration(audio.duration);
        setCurrentTime(e.target.currentTime);
    };

    const handleLoadMetadata = (e) => {
        const time = e.target.duration;
        audioRef.current.currentTime = time;
        setDuration(time);
    };

    const handleSeekChange = (e) => {
        const time = e.target.value;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }

    return (
        <div className="w-full flex items-center gap-2 py-2 px-3 rounded-md bg-slate-800">
            <audio
             src={file.url}
             ref={audioRef}
             controls
             onTimeUpdate={handleTimeUpdate}
             onEnded={togglePlayPuse}
             onVolumeChange={handleVolumeUpdate}
             onLoadMetadata={handleLoadMetadata}

             className="hidden"
             />
             <button onClick={togglePlayPuse}>
                 {isPlaying ? (
                     <PauseIcon className="w-6 h-6 text-white" />
                 ) : (
                     <PlayIcon className="w-6 h-6 text-white" />
                 )}
             </button>
             {showVolume && (
                 <input
                     type="range"
                     min="0"
                     max={duration > 0 ? duration : 1}
                     step="0.01"
                     value={currentTime}
                     onChange={handleSeekChange}
                     className="w-20"
                 />
             )}
        </div>
    )
}
