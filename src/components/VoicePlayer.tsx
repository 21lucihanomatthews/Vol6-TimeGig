import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { motion } from 'motion/react';

interface VoicePlayerProps {
  url: string;
  isSender?: boolean;
}

export default function VoicePlayer({ url, isSender = false }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`flex items-center gap-3 p-2 rounded-2xl w-full min-w-[220px] shadow-sm border ${
      isSender 
        ? 'bg-indigo-600 text-white border-indigo-500 rounded-br-none' 
        : 'bg-white text-slate-900 border-slate-100 rounded-bl-none'
    }`}>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay} 
        className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full shadow-md transition-colors ${
          isSender ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
        }`}
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </motion.button>
      
      <div className="flex-1 space-y-1.5">
        <div className={`relative h-1.5 rounded-full overflow-hidden ${isSender ? 'bg-indigo-400' : 'bg-slate-200'}`}>
          <motion.div 
            className={`absolute left-0 top-0 h-full rounded-full ${isSender ? 'bg-white' : 'bg-indigo-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
          />
        </div>
        <div className={`flex justify-between text-[10px] font-medium font-mono ${isSender ? 'text-indigo-100' : 'text-slate-400'}`}>
          <span>{Math.floor((audioRef.current?.currentTime || 0) / 60)}:{(Math.floor(audioRef.current?.currentTime || 0) % 60).toString().padStart(2, '0')}</span>
          {duration > 0 && <span>{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>}
        </div>
      </div>
      
      <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full ${isSender ? 'bg-indigo-500/50 text-white' : 'bg-slate-100 text-slate-500'}`}>
        <Mic size={14} strokeWidth={2.5} />
      </div>
    </div>
  );
}
