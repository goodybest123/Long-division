import React, { useState, useEffect } from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_LEVELS } from '../constants';

interface DifficultySelectorProps {
    currentDifficulty: Difficulty;
    onSelectDifficulty: (difficulty: Difficulty) => void;
    onStartCustomProblem: (dividend: number, divisor: number) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ currentDifficulty, onSelectDifficulty, onStartCustomProblem }) => {
    const [customDividend, setCustomDividend] = useState('');
    const [customDivisor, setCustomDivisor] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleStart = () => {
        setError(null);
        const dividendNum = parseInt(customDividend, 10);
        const divisorNum = parseInt(customDivisor, 10);

        if (isNaN(dividendNum) || isNaN(divisorNum)) {
            setError('Please enter valid whole numbers.');
            return;
        }
        if (divisorNum <= 0) {
            setError('Divisor must be greater than zero.');
            return;
        }
        if (dividendNum < 0) {
            setError('Dividend cannot be negative.');
            return;
        }
        if (customDividend.includes('.') || customDivisor.includes('.')) {
            setError('Please enter whole numbers only.');
            return;
        }

        onStartCustomProblem(dividendNum, divisorNum);
    };

    useEffect(() => {
        if (currentDifficulty !== Difficulty.CUSTOM) {
            setCustomDividend('');
            setCustomDivisor('');
            setError(null);
        }
    }, [currentDifficulty]);

    return (
        <div>
            <h3 className="font-bold text-lg text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-wide opacity-70">
                <span className="p-1.5 bg-indigo-100 rounded-lg">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L8.586 10l3.414-3.414V7z" clipRule="evenodd" /></svg>
                </span>
                Level
            </h3>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200 pb-2">
                {DIFFICULTY_LEVELS.map((level) => (
                    <button
                        key={level.id}
                        onClick={() => onSelectDifficulty(level.id)}
                        className={`
                            w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden border
                            ${currentDifficulty === level.id 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
                                : 'bg-white border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {/* Interactive sheen effect for active state */}
                        {currentDifficulty === level.id && (
                             <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}
                        
                        <div className="flex justify-between items-center relative z-10">
                            <span className="font-bold text-base">{level.label}</span>
                            {currentDifficulty === level.id && (
                                <span className="bg-white/20 rounded-full p-1 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </span>
                            )}
                        </div>
                        <span className={`block text-xs mt-1 font-medium ${currentDifficulty === level.id ? 'text-indigo-100' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'}`}>
                            {level.description}
                        </span>
                    </button>
                ))}
            </div>
            {currentDifficulty === Difficulty.CUSTOM && (
                <div className="mt-6 pt-6 border-t border-indigo-100 space-y-4 animate-fade-in-up bg-white/50 p-4 rounded-2xl">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dividend" className="block text-xs font-bold text-indigo-400 uppercase mb-2">Dividend</label>
                            <input
                                type="number"
                                id="dividend"
                                min="0"
                                step="1"
                                value={customDividend}
                                onChange={(e) => setCustomDividend(e.target.value)}
                                placeholder="123"
                                className="w-full px-4 py-2.5 bg-white border border-indigo-100 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-slate-700 transition-all"
                            />
                        </div>
                         <div>
                            <label htmlFor="divisor" className="block text-xs font-bold text-indigo-400 uppercase mb-2">Divisor</label>
                            <input
                                type="number"
                                id="divisor"
                                min="1"
                                step="1"
                                value={customDivisor}
                                onChange={(e) => setCustomDivisor(e.target.value)}
                                placeholder="4"
                                className="w-full px-4 py-2.5 bg-white border border-indigo-100 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-slate-700 transition-all"
                            />
                        </div>
                    </div>
                    {error && <p className="text-xs text-rose-500 font-bold bg-rose-50 p-3 rounded-lg flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>}
                    <button
                        onClick={handleStart}
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        disabled={!customDividend || !customDivisor}
                    >
                        Start Custom Problem
                    </button>
                </div>
            )}
        </div>
    );
};