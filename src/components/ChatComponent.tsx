import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Trash2, Edit2, Check, X, ShieldAlert, Mic, StopCircle, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';
import VoicePlayer from './VoicePlayer';

export default function ChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pendingFiles, setPendingFiles] = useState<{type: 'image' | 'video' | 'voice' | 'document', url: string, name?: string}[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showSentToast, setShowSentToast] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    if (isBlocked) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const options = { audioBitsPerSecond: 128000 };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    
    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setPendingFiles(prev => [...prev, { type: 'voice', url }]);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const sendMessage = () => {
    if (isBlocked) return;
    
    let sent = false;
    if (pendingFiles.length > 0) {
      pendingFiles.forEach(file => {
        const msg: ChatMessage = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender_id: 'me',
          recipient_id: 'other',
          content: file.url,
          type: file.type,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, msg]);
      });
      setPendingFiles([]);
      sent = true;
    } else if (newMessage.trim()) {
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender_id: 'me',
        recipient_id: 'other',
        content: newMessage,
        type: 'text',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      sent = true;
    }

    if (sent) {
      setShowSentToast(true);
      setTimeout(() => setShowSentToast(false), 2000);
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const startEdit = (m: ChatMessage) => {
    if (m.type !== 'text') return;
    setEditingId(m.id);
    setEditingContent(m.content);
  };

  const saveEdit = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editingContent } : m));
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBlocked) return;
    const files = Array.from(e.target.files || []);
    
    const availableSlots = 20 - pendingFiles.length;
    const filesToProcess = files.slice(0, availableSlots);

    filesToProcess.forEach((file: File) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isDoc = file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('sheet') || file.type.includes('text/plain');
      
      if (isImage || isVideo || isDoc) {
        const reader = new FileReader();
        reader.onload = () => {
          let type: 'image' | 'video' | 'document' = 'document';
          if (isImage) type = 'image';
          if (isVideo) type = 'video';
          
          setPendingFiles(prev => [...prev, { 
            type, 
            url: reader.result as string,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white/70 backdrop-blur-xl">
      <div className="flex justify-between items-center px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            U
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Chat with Other</h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-medium">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsBlocked(!isBlocked)} 
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 ${
            isBlocked ? 'bg-red-500 text-white shadow-red-100 shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldAlert size={12} /> {isBlocked ? 'Blocked' : 'Block Access'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 p-4 pb-48">
        {messages.map(m => (
          <div key={m.id} className={`flex items-end gap-2 ${m.sender_id === 'me' ? 'justify-end' : ''}`}>
            {m.sender_id !== 'me' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500 shadow-sm">
                U
              </div>
            )}
            <div className={`rounded-2xl text-sm max-w-[70%] ${
              m.type === 'voice' 
                ? 'bg-transparent' 
                : m.sender_id === 'me' 
                  ? 'bg-indigo-600 text-white rounded-br-none p-3 shadow-sm' 
                  : 'bg-white text-slate-900 rounded-bl-none shadow-sm p-3 border border-slate-50'
            } relative group`}>
              {editingId === m.id ? (
                <div className="flex gap-2">
                  <input value={editingContent} onChange={e => setEditingContent(e.target.value)} className="text-slate-900 rounded-lg p-1 bg-slate-50 border border-slate-200" />
                  <button onClick={() => saveEdit(m.id)} className="text-green-600"><Check size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="text-red-500"><X size={16} /></button>
                </div>
              ) : (
                <>
                  {m.type === 'text' ? (
                    <p className="leading-relaxed">{m.content}</p>
                  ) : m.type === 'image' ? (
                    <img src={m.content} alt="Shared" className="rounded-xl max-w-full max-h-64 object-contain shadow-sm" />
                  ) : m.type === 'video' ? (
                    <video src={m.content} controls className="rounded-xl max-w-full max-h-64 shadow-sm" />
                  ) : m.type === 'document' ? (
                    <a 
                      href={m.content} 
                      download 
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        m.sender_id === 'me' ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${m.sender_id === 'me' ? 'bg-white/20' : 'bg-indigo-100'}`}>
                        <FileText size={20} className={m.sender_id === 'me' ? 'text-white' : 'text-indigo-600'} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold truncate max-w-[120px]">Proof of Payment</span>
                        <span className="text-[10px] opacity-70">Click to download</span>
                      </div>
                    </a>
                  ) : (
                    <VoicePlayer url={m.content} isSender={m.sender_id === 'me'} />
                  )}
                  {m.sender_id === 'me' && !isBlocked && (
                    <div className="absolute top-0 -left-12 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity duration-200">
                      {m.type === 'text' && <button onClick={() => startEdit(m)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full"><Edit2 size={14} /></button>}
                      <button onClick={() => deleteMessage(m.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-full"><Trash2 size={14} /></button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-[108px] left-0 right-0 z-50 p-2 pointer-events-none">
        <AnimatePresence>
          {pendingFiles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex gap-3 mb-3 overflow-x-auto p-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-indigo-100/50 mx-4 pointer-events-auto"
            >
              {pendingFiles.map((file, index) => (
                <motion.div 
                  key={index} 
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative min-w-[200px] flex-shrink-0"
                >
                  {file.type === 'image' ? (
                    <img src={file.url} alt="Preview" className="w-full h-24 object-cover rounded-2xl shadow-sm border border-slate-100" />
                  ) : file.type === 'video' ? (
                    <video src={file.url} className="w-full h-24 object-cover rounded-2xl shadow-sm border border-slate-100" />
                  ) : file.type === 'document' ? (
                    <div className="w-full h-24 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-2 text-center">
                      <FileText size={24} className="text-indigo-600 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600 truncate w-full px-2">{file.name || 'Document'}</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl p-1.5 border border-slate-100">
                      <VoicePlayer url={file.url} isSender={true} />
                    </div>
                  )}
                  <button 
                    onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== index))} 
                    className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-2 z-10 shadow-xl hover:bg-red-500 transition-colors"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="bg-white/98 backdrop-blur-2xl rounded-full shadow-[0_12px_48px_rgba(0,0,0,0.12)] border border-slate-200/50 mx-4 p-1 pointer-events-auto max-w-2xl md:mx-auto">
          <div className="flex items-center gap-1 h-11">
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div 
                  key="recording"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex-1 flex items-center justify-between px-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                      <motion.div 
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)]" 
                      />
                      <span className="text-sm font-bold text-slate-800 font-mono tabular-nums">
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="h-4 w-[1.5px] bg-slate-200" />
                    <span className="text-xs text-slate-500 font-bold tracking-tight uppercase">Recording...</span>
                  </div>
                  <button 
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black hover:bg-red-600 transition-all shadow-md active:scale-95 uppercase tracking-widest"
                  >
                    <StopCircle size={12} strokeWidth={3} /> Finish
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex items-center"
                >
                  {!isBlocked && (
                    <div className="flex items-center gap-0.5 px-1 text-slate-400">
                      <input 
                        type="file" 
                        accept="image/*,video/*,application/pdf,.doc,.docx,.txt" 
                        multiple 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-9 h-9 flex items-center justify-center hover:text-indigo-600 transition-all rounded-full hover:bg-slate-50"
                        title="Add media or document"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button 
                        onClick={startRecording}
                        className="w-9 h-9 flex items-center justify-center hover:text-red-500 transition-all rounded-full hover:bg-slate-50"
                        title="Voice note"
                      >
                        <Mic size={18} />
                      </button>
                    </div>
                  )}
                  
                  <input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 py-2 px-2 text-sm bg-transparent focus:outline-none placeholder-slate-400 text-slate-900 font-medium"
                    placeholder={isBlocked ? "Messaging disabled" : "Message..."}
                    disabled={isBlocked || pendingFiles.length > 0}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />

                  {!isBlocked && (
                    <div className="pr-1">
                      <motion.button 
                        whileTap={{ scale: 0.94 }}
                        onClick={() => sendMessage()} 
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                          newMessage.trim() || pendingFiles.length > 0 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'bg-slate-50 text-slate-300'
                        }`}
                        disabled={!newMessage.trim() && pendingFiles.length === 0}
                      >
                        <Send size={16} strokeWidth={3} className={newMessage.trim() || pendingFiles.length > 0 ? "translate-x-0.5" : ""} />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSentToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: -100, x: '-50%' }}
            exit={{ opacity: 0, y: -150, x: '-50%' }}
            className="fixed bottom-20 left-1/2 z-[60] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">Message sent</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
