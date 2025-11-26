import React from 'react';
import { InteractionMode, DivisionMode } from '../constants';

interface SettingsModalProps {
    interactionMode: InteractionMode;
    setInteractionMode: (mode: InteractionMode) => void;
    divisionMode: DivisionMode;
    setDivisionMode: (mode: DivisionMode) => void;
    maxDecimalPlaces: number;
    setMaxDecimalPlaces: (places: number) => void;
    autoPlayDelay: number;
    setAutoPlayDelay: (delay: number) => void;
    onClose: () => void;
}

const interactionModeOptions = [
    { id: InteractionMode.AUTOMATIC, label: 'Automatic' },
    { id: InteractionMode.STUDENT_INPUT_QUOTIENT, label: 'Quotient Input' },
    { id: InteractionMode.FULL_INPUT, label: 'Full Input' },
];

const divisionModeOptions = [
    { id: DivisionMode.Decimal, label: 'Decimal' },
    { id: DivisionMode.Remainder, label: 'Remainder' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
    interactionMode,
    setInteractionMode,
    divisionMode,
    setDivisionMode,
    maxDecimalPlaces,
    setMaxDecimalPlaces,
    autoPlayDelay,
    setAutoPlayDelay,
    onClose
}) => {
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-8">
                     <div>
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Calculation Mode</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl">
                           {divisionModeOptions.map((option) => (
                               <button
                                    key={option.id}
                                    onClick={() => setDivisionMode(option.id)}
                                    className={`
                                        flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200
                                        ${divisionMode === option.id 
                                            ? 'bg-white text-indigo-600 shadow-sm transform scale-100' 
                                            : 'text-slate-500 hover:text-slate-700'
                                        }
                                    `}
                               >
                                   {option.label}
                               </button>
                           ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Interaction Mode</label>
                        <div className="flex flex-col gap-2">
                           {interactionModeOptions.map((option) => (
                               <button
                                    key={option.id}
                                    onClick={() => setInteractionMode(option.id)}
                                    className={`
                                        w-full px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 border-2 text-left flex items-center justify-between
                                        ${interactionMode === option.id 
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                                            : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200'
                                        }
                                    `}
                               >
                                   {option.label}
                                   {interactionMode === option.id && <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
                               </button>
                           ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="autoplay-delay" className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                                Speed (s)
                            </label>
                            <input
                                id="autoplay-delay"
                                type="number"
                                min="1"
                                max="60"
                                value={autoPlayDelay}
                                onChange={(e) => setAutoPlayDelay(Math.min(60, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl shadow-sm focus:ring-0 focus:border-indigo-500 outline-none text-black font-bold bg-white"
                            />
                        </div>

                        <div className={divisionMode === DivisionMode.Remainder ? 'opacity-40 pointer-events-none' : ''}>
                            <label htmlFor="max-decimals" className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                                Max Decimals
                            </label>
                            <input
                                id="max-decimals"
                                type="number"
                                min="1"
                                max="10"
                                value={maxDecimalPlaces}
                                onChange={(e) => setMaxDecimalPlaces(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl shadow-sm focus:ring-0 focus:border-indigo-500 outline-none text-black font-bold bg-white"
                                disabled={divisionMode === DivisionMode.Remainder}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};