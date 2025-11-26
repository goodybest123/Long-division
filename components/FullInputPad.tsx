import React, { useState, useEffect } from 'react';

interface FullInputPadProps {
    onSubmit: (value: string) => void;
}

export const FullInputPad: React.FC<FullInputPadProps> = ({ onSubmit }) => {
    const [inputValue, setInputValue] = useState('');

    const handleDigitClick = (digit: number) => {
        setInputValue(prev => prev + digit);
    };

    const handleBackspace = () => {
        setInputValue(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        onSubmit(inputValue);
        setInputValue('');
    };

    // Allow keyboard input
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key >= '0' && event.key <= '9') {
                handleDigitClick(parseInt(event.key));
            } else if (event.key === 'Backspace') {
                handleBackspace();
            } else if (event.key === 'Enter') {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);


    return (
        <div className="w-full max-w-sm mx-auto mt-6 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 backdrop-blur-sm shadow-sm flex flex-col items-center">
             <div className="w-full h-16 mb-6 bg-white border border-indigo-100 rounded-2xl shadow-inner text-4xl font-bold text-indigo-700 flex items-center justify-end px-6 tracking-widest overflow-hidden">
                {inputValue || <span className="text-indigo-200 animate-pulse">?</span>}
            </div>
            <div className="grid grid-cols-3 gap-3 justify-items-center w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                     <button 
                        key={digit} 
                        onClick={() => handleDigitClick(digit)} 
                        className="w-full h-14 bg-white border-b-4 border-indigo-100 rounded-xl text-xl font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        {digit}
                    </button>
                ))}
                 <button onClick={handleBackspace} className="w-full h-14 bg-rose-50 border-b-4 border-rose-100 rounded-xl text-xl font-bold text-rose-400 hover:bg-rose-100 hover:border-rose-200 active:border-b-0 active:translate-y-1 transition-all flex justify-center items-center group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
                    </svg>
                 </button>
                 <button onClick={() => handleDigitClick(0)} className="w-full h-14 bg-white border-b-4 border-indigo-100 rounded-xl text-xl font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:border-b-0 active:translate-y-1 transition-all">
                    0
                </button>
                 <button onClick={handleSubmit} className="w-full h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 border-b-4 border-emerald-600 text-white rounded-xl text-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-500 hover:to-emerald-600 active:border-b-0 active:translate-y-1 transition-all flex justify-center items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                 </button>
            </div>
        </div>
    );
};