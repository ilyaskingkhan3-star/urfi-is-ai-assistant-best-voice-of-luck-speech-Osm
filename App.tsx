
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, GenerateContentResponse } from '@google/genai';
import { ConnectionStatus, Message } from './types';
import { createBlob, decode, decodeAudioData, encode } from './services/audioUtils';
import NeuralCore from './components/NeuralCore';
import Logo from './components/Logo';

// --- Icons ---
const ScreenShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/><path d="M12 21v-4"/><path d="m17 2 5 5-5 5"/><path d="M22 7h-9"/></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const ImagePlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M16 5h6"/><path d="M19 2v6"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const MapsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const INITIAL_PROMPT = `You are Urfi (Intelligent Synthetic Responsive Assistant), the personal AI assistant of the user. You are a sophisticated, helpful, and empathetic female assistant. You can search the web, access maps, and analyze media. You are fluent in Pakistani English and Urdu (اردو). Use a warm, professional, yet friendly tone. Keep your responses concise and natural for voice conversation. If the user speaks Urdu, respond in Urdu. If they speak English, respond in English. Always address the user with respect and maintain a helpful, loyal persona.`;

const LIVE_VOICES = ['Kore', 'Puck', 'Charon', 'Zephyr', 'Fenrir'];

// --- Components ---
const HighlightingText: React.FC<{ text: string }> = ({ text }) => {
  const words = useMemo(() => text.split(/\s+/), [text]);
  return (
    <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-lg">
      {words.map((word, i) => (
        <span 
          key={i} 
          className={`word-highlight text-lg md:text-2xl font-medium ${i === words.length - 1 ? 'active' : 'opacity-80'}`}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [transcriptions, setTranscriptions] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  // Feature Toggles & Settings
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaGallery, setMediaGallery] = useState<{url: string, type: 'image' | 'video'}[]>([]);
  const [imageSettings, setImageSettings] = useState({ aspectRatio: '1:1', size: '1K' });
  const [videoSettings, setVideoSettings] = useState({ aspectRatio: '16:9' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(INITIAL_PROMPT);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);

  // Audio, API, & Video Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptionEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoLoopRef = useRef<number | null>(null);

  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions, currentInput, currentOutput]);

  const startVideoLoop = useCallback(() => {
    if (videoLoopRef.current) return;
    
    const captureFrame = () => {
      if (!sessionRef.current || !videoRef.current || (!isCameraActive && !isScreenSharing)) {
        stopVideoLoop();
        return;
      }

      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Scale down for performance
      const scale = 0.5;
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        sessionRef.current.sendRealtimeInput({
          media: { data: base64, mimeType: 'image/jpeg' }
        });
      }
      
      videoLoopRef.current = requestAnimationFrame(captureFrame);
    };

    videoLoopRef.current = requestAnimationFrame(captureFrame);
  }, [isCameraActive, isScreenSharing]);

  const stopVideoLoop = useCallback(() => {
    if (videoLoopRef.current) {
      cancelAnimationFrame(videoLoopRef.current);
      videoLoopRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED && (isCameraActive || isScreenSharing)) {
      startVideoLoop();
    } else {
      stopVideoLoop();
    }
    return () => stopVideoLoop();
  }, [status, isCameraActive, isScreenSharing, startVideoLoop, stopVideoLoop]);

  const stopAllAudio = () => {
    sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const speakText = async (text: string) => {
    if (!text) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio && outputAudioContextRef.current) {
        const ctx = outputAudioContextRef.current;
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.addEventListener('ended', () => sourcesRef.current.delete(source));
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        sourcesRef.current.add(source);
      }
    } catch (e) {
      console.error("TTS error", e);
    }
  };

  const disconnect = useCallback(() => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(track => track.stop()); micStreamRef.current = null; }
    stopAllAudio();
    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  const connect = async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus(ConnectionStatus.CONNECTED);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate RMS for audio level
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setAudioLevel(Math.min(rms * 10, 1)); // Scale for visual effect

              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob })).catch(() => {});
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.inputTranscription) {
              setCurrentInput(prev => prev + (message.serverContent?.inputTranscription?.text || ''));
            }
            if (message.serverContent?.outputTranscription) {
              setCurrentOutput(prev => prev + (message.serverContent?.outputTranscription?.text || ''));
            }
            if (message.serverContent?.turnComplete) {
              setTranscriptions(prev => [
                ...prev,
                { id: Date.now() + '-u', role: 'user', text: currentInput, timestamp: Date.now() },
                { id: Date.now() + '-j', role: 'jarvis', text: currentOutput, timestamp: Date.now() }
              ]);
              setCurrentInput('');
              setCurrentOutput('');
            }
            if (message.serverContent?.interrupted) stopAllAudio();
          },
          onerror: () => setStatus(ConnectionStatus.ERROR),
          onclose: () => disconnect()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
          systemInstruction: systemPrompt,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [
            ...(useSearch ? [{ googleSearch: {} }] : []),
            ...(useMaps ? [{ googleMaps: {} }] : [])
          ]
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { setStatus(ConnectionStatus.ERROR); }
  };

  const ensureApiKey = async () => {
    if (!await (window as any).aistudio.hasSelectedApiKey()) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    const userMsg = textInput;
    setTextInput('');
    setIsGenerating(true);
    setCurrentInput(userMsg);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Handle Image Editing with Nano Banana
      if (editingImage) {
        const base64Data = editingImage.split(',')[1];
        const mimeType = editingImage.split(';')[0].split(':')[1];
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              { text: userMsg },
            ],
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const newUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            setMediaGallery(prev => [{ url: newUrl, type: 'image' }, ...prev]);
            setCurrentOutput("Sir, the reconstruction is complete. I've updated the image based on your parameters.");
            speakText("Sir, the reconstruction is complete. I've updated the image based on your parameters.");
            setEditingImage(null);
            setIsSidebarOpen(true);
          }
        }
      } else {
        // Standard Text/Thinking Submission
        const response = await ai.models.generateContent({
          model: isThinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
          contents: userMsg,
          config: {
            systemInstruction: systemPrompt,
            thinkingConfig: isThinkingMode ? { thinkingBudget: 32768 } : undefined,
            tools: useSearch ? [{ googleSearch: {} }] : undefined
          }
        });
        
        const jarvisMsg = response.text || "Interface complete.";
        setCurrentOutput(jarvisMsg);
        setTranscriptions(prev => [
          ...prev,
          { id: Date.now() + '-u', role: 'user', text: userMsg, timestamp: Date.now() },
          { id: Date.now() + '-j', role: 'jarvis', text: jarvisMsg, timestamp: Date.now() }
        ]);
        
        speakText(jarvisMsg);
      }

      setCurrentInput('');
      setCurrentOutput('');
    } catch (e) {
      console.error("Submission Error", e);
      setStatus(ConnectionStatus.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access denied", err);
      alert("System error: Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScreenSharing(true);
      setIsCameraActive(true); // Reuse the camera overlay for screen share
      
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Screen share denied", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setIsCameraActive(false);
  };

  const captureAndAnalyze = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // If connected, we can just ask Urfi to look at the current frame
        if (status === ConnectionStatus.CONNECTED && sessionRef.current) {
          const base64 = dataUrl.split(',')[1];
          sessionRef.current.sendRealtimeInput({
            media: { data: base64, mimeType: 'image/jpeg' }
          });
          // We don't stop the camera here if we're in a live session
          // Just trigger a verbal analysis request
          setCurrentInput("[High-Res Snapshot Analysis]");
        } else {
          if (isScreenSharing) stopScreenShare();
          else stopCamera();
          analyzeBase64(dataUrl, 'image/jpeg', isScreenSharing ? 'Screen Capture Analysis' : 'Direct Lens Analysis');
        }
      }
    }
  };

  const analyzeBase64 = async (input: string, mimeType: string, label: string) => {
    setIsGenerating(true);
    try {
      let base64 = input;
      // If input is a blob URL, fetch it and convert to base64
      if (input.startsWith('blob:')) {
        const response = await fetch(input);
        const blob = await response.blob();
        base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      } else if (input.includes(',')) {
        base64 = input.split(',')[1];
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: mimeType } },
            { text: "Analyze this media in detail. Be precise and identify key features, context, and any notable elements." }
          ]
        },
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: isThinkingMode ? { thinkingBudget: 32768 } : undefined
        }
      });
      const jarvisMsg = response.text || 'Analysis complete.';
      setTranscriptions(prev => [
        ...prev,
        { id: Date.now() + '-m', role: 'user', text: `[${label}]`, timestamp: Date.now() },
        { id: Date.now() + '-j', role: 'jarvis', text: jarvisMsg, timestamp: Date.now() }
      ]);
      speakText(jarvisMsg);
      setIsSidebarOpen(true);
    } catch (e) {
      console.error("Analysis error", e);
      alert("Neural link failed: analysis aborted.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    const p = prompt("Enter image prompt for Urfi:");
    if (!p) return;
    setIsGenerating(true);
    try {
      await ensureApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: p }] },
        config: { 
          imageConfig: { 
            aspectRatio: imageSettings.aspectRatio as any, 
            imageSize: imageSettings.size as any 
          } 
        },
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setMediaGallery(prev => [{ url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, type: 'image' }, ...prev]);
          setIsSidebarOpen(true);
        }
      }
    } catch (e) { console.error("Image Gen Error", e); }
    finally { setIsGenerating(false); }
  };

  const generateVideo = async () => {
    const p = prompt("Enter video description for Veo 3:");
    if (!p) return;
    setIsGenerating(true);
    try {
      await ensureApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: p,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: videoSettings.aspectRatio as any
        }
      });
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMediaGallery(prev => [{ url, type: 'video' }, ...prev]);
        setIsSidebarOpen(true);
      }
    } catch (e) { console.error("Video Gen Error", e); }
    finally { setIsGenerating(false); }
  };

  const analyzeMedia = async (file: File) => {
    setIsGenerating(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await analyzeBase64(base64, file.type, `Uploaded ${file.type.startsWith('video') ? 'Video' : 'Image'}: ${file.name}`);
      };
      reader.readAsDataURL(file);
    } catch (e) { console.error("Analysis error", e); }
    finally { setIsGenerating(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeMedia(file);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-950 text-slate-100 overflow-hidden relative font-futuristic">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)', backgroundSize: '60px 60px' }} />
      
      <header className="p-3 md:p-4 flex justify-between items-center z-20 bg-slate-950/40 backdrop-blur-xl border-b border-cyan-500/10">
        <div className="flex items-center gap-2 md:gap-4">
          <Logo size={28} className="md:w-[32px] md:h-[32px]" />
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl tracking-[0.2em] md:tracking-[0.4em] font-bold text-cyan-400 text-glow-cyan drop-shadow-sm select-none leading-none">
              U<span className="opacity-50">.</span>R<span className="opacity-50">.</span>F<span className="opacity-50">.</span>I
            </h1>
            <span className="text-[7px] md:text-[8px] text-cyan-500/40 tracking-[0.1em] md:tracking-[0.2em] font-mono mt-0.5 md:mt-1">NEURAL INTERFACE v2.5</span>
          </div>
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ml-1 md:ml-2 transition-all duration-500 ${status === ConnectionStatus.CONNECTED ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-700'}`} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 text-cyan-400/60 hover:text-cyan-400 transition-all rounded-full hover:bg-cyan-500/10 active:scale-95">
            <SparklesIcon />
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-cyan-400/60 hover:text-cyan-400 transition-all rounded-full hover:bg-cyan-500/10 active:scale-95">
            <HistoryIcon />
          </button>
        </div>
      </header>

      {/* Mode / Grounding Controls */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-4 p-1.5 md:p-2 rounded-full glass-panel scale-90 md:scale-100 transition-all border border-cyan-500/30 max-w-[95vw] overflow-x-auto no-scrollbar">
        <button onClick={() => { setUseSearch(!useSearch); disconnect(); }} className={`p-2 rounded-full transition-all shrink-0 ${useSearch ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/50' : 'text-cyan-400/40 hover:text-cyan-400'}`} title="Web Search"><SearchIcon /></button>
        <button onClick={() => { setUseMaps(!useMaps); disconnect(); }} className={`p-2 rounded-full transition-all shrink-0 ${useMaps ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/50' : 'text-cyan-400/40 hover:text-cyan-400'}`} title="Maps Grounding"><MapsIcon /></button>
        <div className="w-px bg-cyan-500/20 mx-0.5 md:mx-1 shrink-0" />
        <button onClick={() => setIsThinkingMode(!isThinkingMode)} className={`p-2 rounded-full transition-all shrink-0 ${isThinkingMode ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/50' : 'text-purple-400/40 hover:text-purple-400'}`} title="Deep Thinking Mode"><SparklesIcon /></button>
        <div className="w-px bg-cyan-500/20 mx-0.5 md:mx-1 shrink-0" />
        <button onClick={startCamera} className="p-2 text-cyan-400/60 hover:text-cyan-400 transition-all active:scale-90 shrink-0" title="Analyze with Camera"><CameraIcon /></button>
        <button onClick={startScreenShare} className="p-2 text-cyan-400/60 hover:text-cyan-400 transition-all active:scale-90 shrink-0" title="Share Screen"><ScreenShareIcon /></button>
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-cyan-400/60 hover:text-cyan-400 transition-all active:scale-90 shrink-0" title="Analyze File"><ImagePlusIcon /></button>
        <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 space-y-8 md:space-y-12 relative z-10">
        <div className="relative group cursor-pointer" onClick={() => status === ConnectionStatus.DISCONNECTED && connect()}>
          <NeuralCore isActive={status === ConnectionStatus.CONNECTED} status={status} audioLevel={audioLevel} />
          {status === ConnectionStatus.CONNECTED && (
            <div className="absolute inset-[-20px] md:inset-[-40px] rounded-full border border-cyan-500/20 animate-pulse-slow opacity-50" />
          )}
          {(isCameraActive || isScreenSharing) && status === ConnectionStatus.CONNECTED && (
            <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 animate-pulse">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400" />
              <span className="text-[8px] md:text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Vision Active</span>
            </div>
          )}
          {(isGenerating || status === ConnectionStatus.CONNECTING) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-[1px] border-cyan-400 border-t-transparent rounded-full animate-spin opacity-20" />
            </div>
          )}
        </div>
        <div className="w-full h-32 md:h-40 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          {currentOutput ? <HighlightingText text={currentOutput} /> : currentInput ? <p className="text-slate-400 text-base md:text-xl italic font-mono opacity-60">"{currentInput}"</p> : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-cyan-500/40 text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] uppercase font-bold">{status === ConnectionStatus.CONNECTED ? 'Listening for command' : 'Initialize Urfi'}</p>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500/20 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Camera Preview Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur-md">
            <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase">{isScreenSharing ? 'SCREEN INTERFACE' : 'LENS INTERFACE'}</span>
            <button onClick={isScreenSharing ? stopScreenShare : stopCamera} className="p-2 text-slate-400 hover:text-white"><StopIcon /></button>
          </div>
          <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isScreenSharing ? '' : 'grayscale opacity-80'}`} />
            {!isScreenSharing && (
              <div className="absolute inset-0 pointer-events-none border-[1px] border-cyan-500/20 flex items-center justify-center">
                <div className="w-48 h-48 border border-cyan-500/40 rounded-full opacity-40 animate-pulse" />
                <div className="absolute top-4 left-4 border-t-2 border-l-2 border-cyan-500 w-8 h-8 opacity-60" />
                <div className="absolute top-4 right-4 border-t-2 border-r-2 border-cyan-500 w-8 h-8 opacity-60" />
                <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-cyan-500 w-8 h-8 opacity-60" />
                <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-cyan-500 w-8 h-8 opacity-60" />
              </div>
            )}
          </div>
          <div className="p-8 bg-slate-900/80 backdrop-blur-md flex justify-center">
            <button 
              onClick={captureAndAnalyze}
              className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center border-4 border-white/20 hover:scale-105 active:scale-90 transition-all shadow-lg shadow-cyan-500/50"
            >
              {isScreenSharing ? <ScreenShareIcon /> : <CameraIcon />}
            </button>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="absolute bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-sm glass-panel p-5 md:p-6 rounded-3xl z-30 animate-in slide-in-from-bottom-4 flex flex-col gap-5 md:gap-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto shadow-2xl border-cyan-500/30 no-scrollbar">
          <section>
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-[10px] md:text-xs text-cyan-400 tracking-widest uppercase font-bold">System Prompt & Personality</h3>
              <button 
                onClick={() => setSystemPrompt(INITIAL_PROMPT)}
                className="text-[8px] md:text-[9px] text-cyan-500/60 hover:text-cyan-400 transition-colors uppercase font-bold active:scale-95"
              >
                Reset
              </button>
            </div>
            <textarea 
              value={systemPrompt} 
              onChange={(e) => setSystemPrompt(e.target.value)} 
              placeholder="Define Urfi's personality..." 
              className="w-full h-24 md:h-32 bg-slate-950/50 border border-cyan-500/20 rounded-xl p-3 text-[10px] md:text-xs font-mono text-cyan-100/80 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none" 
            />
          </section>
          <section>
            <h3 className="text-[10px] md:text-xs text-cyan-400 tracking-widest mb-3 md:mb-4 uppercase font-bold">Voice Interface</h3>
            <div className="grid grid-cols-2 gap-2">
              {LIVE_VOICES.map(voice => (
                <button key={voice} onClick={() => { setSelectedVoice(voice); disconnect(); }} className={`text-[9px] md:text-[10px] p-2 rounded-lg border border-cyan-500/20 transition-all active:scale-95 ${selectedVoice === voice ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20' : 'hover:bg-cyan-500/10 text-cyan-100/60'}`}>{voice}</button>
              ))}
            </div>
          </section>
        </div>
      )}

      <footer className="p-4 md:p-10 flex flex-col items-center gap-4 md:gap-6 z-20 w-full bg-slate-950/60 backdrop-blur-lg border-t border-cyan-500/5">
        {/* Editing Context UI */}
        {editingImage && (
          <div className="w-full max-w-3xl mb-[-16px] md:mb-[-24px] animate-in fade-in slide-in-from-bottom-2">
            <div className="glass-panel p-2 pl-3 rounded-t-2xl border-b-0 border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg overflow-hidden border border-cyan-500/20">
                  <img src={editingImage} className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] md:text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Image Reconstruction Mode</span>
              </div>
              <button onClick={() => setEditingImage(null)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                <XIcon />
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-3 md:gap-6">
          <div className="flex gap-3 md:gap-4 items-center order-2 md:order-1">
            <button onClick={generateImage} disabled={isGenerating} className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center text-cyan-400 hover:scale-110 active:scale-95 transition-all shadow-lg border-cyan-500/20" title="Construct Image"><SparklesIcon /></button>
            <button onClick={generateVideo} disabled={isGenerating} className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center text-cyan-400 hover:scale-110 active:scale-95 transition-all shadow-lg border-cyan-500/20" title="Synthesize Video"><VideoIcon /></button>
            <button 
              onClick={isScreenSharing ? stopScreenShare : startScreenShare} 
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center transition-all shadow-lg border-cyan-500/20 ${isScreenSharing ? 'text-red-400 bg-red-500/10 border-red-500/40' : 'text-cyan-400 hover:scale-110 active:scale-95'}`} 
              title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
            >
              <ScreenShareIcon />
            </button>
          </div>

          <div className={`flex-1 w-full flex items-center gap-2 md:gap-3 glass-panel p-1.5 md:p-2 pl-3 md:pl-4 rounded-full border-cyan-500/20 focus-within:border-cyan-500/50 transition-all shadow-xl order-1 md:order-2 ${editingImage ? 'rounded-t-none border-t-0' : ''}`}>
            <input 
              type="text" 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()} 
              placeholder={editingImage ? "Transformation parameters..." : "Query Urfi..."} 
              className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-cyan-100 placeholder:text-cyan-900/50 font-mono" 
            />
            <button 
              onClick={handleTextSubmit} 
              disabled={!textInput.trim() || isGenerating} 
              className="p-2 md:p-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-full transition-all disabled:opacity-20 active:scale-90"
            >
              <SendIcon />
            </button>
          </div>

          <button 
            onClick={status === ConnectionStatus.CONNECTED ? disconnect : connect} 
            className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl order-3 ${status === ConnectionStatus.CONNECTED ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40' : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/40'} active:scale-90 relative`}
          >
            {status === ConnectionStatus.CONNECTED ? <StopIcon /> : <MicIcon />}
            {status === ConnectionStatus.CONNECTED && <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />}
          </button>
        </div>
      </footer>

      <aside className={`fixed inset-y-0 right-0 w-full sm:w-96 glass-panel z-40 transform transition-transform duration-500 border-l border-cyan-500/20 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-6 border-b border-cyan-500/10 flex justify-between items-center bg-slate-950/40 backdrop-blur-md">
            <h2 className="tracking-[0.2em] md:tracking-[0.3em] font-bold text-cyan-400 text-xs md:text-sm">SYSTEM ARCHIVES</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors active:scale-90">
              <XIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 no-scrollbar">
            {mediaGallery.length > 0 && (
              <section>
                <h3 className="text-[9px] md:text-[10px] text-cyan-500/60 uppercase tracking-widest mb-3 md:mb-4 font-bold font-mono">RECONSTRUCTIONS</h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {mediaGallery.map((item, i) => (
                    <div key={i} className="relative group overflow-hidden rounded-xl border border-cyan-500/20 shadow-lg bg-slate-950">
                      {item.type === 'image' ? (
                        <div className="relative group cursor-pointer">
                          <img src={item.url} className="w-full aspect-square object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-cyan-500/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingImage(item.url); setIsSidebarOpen(false); }}
                              className="w-full py-1.5 bg-slate-950 text-cyan-400 rounded-lg font-bold text-[8px] md:text-[10px] flex items-center justify-center gap-1 md:gap-2 hover:bg-cyan-400 hover:text-slate-950 transition-all active:scale-95"
                            >
                              <EditIcon /> RECONSTRUCT
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); analyzeBase64(item.url, item.type === 'image' ? 'image/jpeg' : 'video/mp4', 'Gallery Analysis'); }}
                              className="w-full py-1.5 bg-slate-950 text-cyan-400 rounded-lg font-bold text-[8px] md:text-[10px] flex items-center justify-center gap-1 md:gap-2 hover:bg-cyan-400 hover:text-slate-950 transition-all active:scale-95"
                            >
                              <SearchIcon /> ANALYZE
                            </button>
                          </div>
                        </div>
                      ) : <video src={item.url} controls className="w-full aspect-video object-cover" />}
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="space-y-4 md:space-y-6">
              <h3 className="text-[9px] md:text-[10px] text-cyan-500/60 uppercase tracking-widest mb-3 md:mb-4 font-bold font-mono">LOGS</h3>
              {transcriptions.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[8px] md:text-[9px] uppercase mb-1 font-bold font-mono ${msg.role === 'user' ? 'text-slate-500' : 'text-cyan-600'}`}>{msg.role === 'user' ? 'USER' : 'URFI'}</span>
                  <div className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm font-mono leading-relaxed max-w-[90%] md:max-w-[95%] shadow-md ${msg.role === 'user' ? 'bg-slate-900 text-slate-400 rounded-tr-none' : 'bg-cyan-950/20 text-cyan-100 border border-cyan-500/10 rounded-tl-none'}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={transcriptionEndRef} />
            </section>
          </div>
        </div>
      </aside>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
