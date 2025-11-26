import React from 'react';

interface NumberPadProps {
    onDigitClick: (digit: number) => void;
}

const NumberButton: React.FC<{ digit: number; onClick: (digit: number) => void; className?: string }> = ({ digit, onClick, className }) => (
    <button
        onClick={() => onClick(digit)}
        className={`
            w-16 h-16 rounded-2xl text-2xl font-bold transition-all duration-200
            bg-white text-indigo-600 
            border-b-[6px] border-r-[2px] border-indigo-100
            hover:border-b-[8px] hover:-translate-y-0.5 hover:shadow-lg hover:text-indigo-700
            active:border-b-0 active:border-t-[2px] active:translate-y-1 active:shadow-inner
            focus:outline-none focus:ring-4 focus:ring-indigo-200
            ${className}
        `}
        aria-label={`Number ${digit}`}
    >
        {digit}
    </button>
);

export const NumberPad: React.FC<NumberPadProps> = ({ onDigitClick }) => {
    return (
        <div className="w-full max-w-sm mx-auto mt-6 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 backdrop-blur-sm shadow-sm">
            <h3 className="text-center font-bold text-indigo-900/70 mb-6 text-sm uppercase tracking-widest">Type Answer</h3>
            <div className="grid grid-cols-3 gap-4 justify-items-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                    <NumberButton key={digit} digit={digit} onClick={onDigitClick} />
                ))}
                <div /> {/* Empty cell for alignment */}
                <NumberButton digit={0} onClick={onDigitClick} />
                <div /> {/* Empty cell for alignment */}
            </div>
        </div>
    );
};