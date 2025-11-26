import React, { useState, useEffect, useRef, useCallback } from 'react';

interface MascotProps {
    message: string;
    isAwaitingContinue?: boolean;
    onContinue?: () => void;
}

type VoicePreset = 'Friendly' | 'Calm' | 'Playful';

export const Mascot: React.FC<MascotProps> = ({ message, isAwaitingContinue, onContinue }) => {
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voicePreset, setVoicePreset] = useState<VoicePreset>('Friendly');
    const lastMessageRef = useRef<string>('');

    const speak = useCallback((text: string, preset: VoicePreset) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get all available voices
        const voices = window.speechSynthesis.getVoices();
        // Filter for English voices
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        
        let selectedVoice = null;

        switch (preset) {
            case 'Calm':
                // Prefer Male / Deeper voices
                selectedVoice = enVoices.find(v => v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male')) || enVoices[0];
                utterance.pitch = 0.9;
                utterance.rate = 0.9;
                break;
            case 'Playful':
                // Prefer Female / Higher voices, or just pitch shift up
                selectedVoice = enVoices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English')) || enVoices[0];
                utterance.pitch = 1.2;
                utterance.rate = 1.0;
                break;
            case 'Friendly':
            default:
                // Standard Neutral/Female leaning
                selectedVoice = enVoices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha')) || enVoices[0];
                utterance.pitch = 1.0;
                utterance.rate = 1.0;
                break;
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.volume = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    // Load voices when they are ready (Chrome requirement)
    useEffect(() => {
        const loadVoices = () => {
             window.speechSynthesis.getVoices();
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Trigger speech when message changes
    useEffect(() => {
        if (message !== lastMessageRef.current) {
            lastMessageRef.current = message;
            if (isVoiceEnabled) {
                speak(message, voicePreset);
            }
        }
    }, [message, isVoiceEnabled, voicePreset, speak]);

    const toggleVoice = () => {
        const newState = !isVoiceEnabled;
        setIsVoiceEnabled(newState);
        if (newState) {
            speak(message, voicePreset);
        } else {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const cycleVoice = () => {
        const presets: VoicePreset[] = ['Friendly', 'Calm', 'Playful'];
        const nextIdx = (presets.indexOf(voicePreset) + 1) % presets.length;
        const newPreset = presets[nextIdx];
        setVoicePreset(newPreset);
        
        // Immediate feedback
        if (isVoiceEnabled) {
            speak(message, newPreset);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Speech Bubble */}
            <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_25px_-5px_rgba(59,130,246,0.15)] border border-indigo-100 w-full mb-8 transition-all duration-500 ease-in-out group">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'}`}></span>
                        <p className="font-bold text-indigo-500 text-xs tracking-wider uppercase">Guide</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isVoiceEnabled && (
                            <button
                                onClick={cycleVoice}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                                title="Change Voice Style"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                                {voicePreset}
                            </button>
                        )}
                        <button 
                            onClick={toggleVoice}
                            className={`p-2 rounded-full transition-all duration-200 ${isVoiceEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                            title={isVoiceEnabled ? "Mute Voice" : "Enable Voice Assistant"}
                        >
                            {isVoiceEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.317zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                            ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.317zm3.293-1.707a1 1 0 011.414 0 10 10 0 010 14.142 1 1 0 01-1.414-1.414 8 8 0 000-11.314 1 1 0 010-1.414z" clipRule="evenodd" /><path fillRule="evenodd" d="M14.5 10a.5.5 0 01.5.5l3.5 3.5a.5.5 0 01-1 1l-3.5-3.5a.5.5 0 01.5-.5z" /></svg>
                            )}
                        </button>
                    </div>
                </div>
                
                <p className="text-slate-700 text-lg leading-relaxed font-medium font-sans min-h-[3rem] transition-colors duration-300">
                    {message}
                </p>
                
                {/* Bubble Tail */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-b border-r border-indigo-100 rotate-45"></div>

                {isAwaitingContinue && (
                    <div className="mt-5 flex justify-end">
                        <button
                            onClick={onContinue}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-full shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        >
                            Continue 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Mascot Avatar */}
            <div className={`transition-all duration-300 ${isSpeaking ? 'animate-bounce' : 'animate-float'}`}>
                <div className={`w-28 h-28 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-xl shadow-indigo-200/50 border-[6px] border-white relative z-10 transition-transform ${isSpeaking ? 'scale-110' : ''}`}>
                     <span className="text-6xl drop-shadow-md filter select-none cursor-pointer transform hover:scale-110 transition-transform">
                        🧙‍♂️
                     </span>
                     {/* Orbiting element */}
                     <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-300 rounded-full border-4 border-white shadow-md animate-bounce" style={{animationDuration: '2s'}}>
                        <span className="flex items-center justify-center w-full h-full text-[10px] font-bold text-yellow-800">÷</span>
                     </div>
                </div>
                {/* Shadow */}
                <div className="w-20 h-4 bg-indigo-900/10 rounded-[100%] mx-auto mt-4 blur-sm animate-pulse"></div>
            </div>
        </div>
    );
};