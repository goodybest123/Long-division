import React from 'react';

interface ControlsProps {
    onNext: () => void;
    onReplay: () => void;
    onReset: () => void;
    onAutoPlay: () => void;
    onSettings: () => void;
    isAutoPlaying: boolean;
    canGoNext: boolean;
    canGoPrev: boolean;
}

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'neutral' }> = ({ children, variant = 'primary', className, ...props }) => {
    let baseStyles = "px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";
    
    let variantStyles = "";
    switch (variant) {
        case 'primary':
            variantStyles = "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-teal-200/50 hover:shadow-xl hover:shadow-teal-300/60 hover:-translate-y-1";
            break;
        case 'secondary':
            variantStyles = "bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1 shadow-sm";
            break;
        case 'danger':
            variantStyles = "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:shadow-md hover:border-rose-200";
            break;
        case 'neutral':
            variantStyles = "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700";
            break;
    }

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Controls: React.FC<ControlsProps> = ({
    onNext,
    onReplay,
    onReset,
    onAutoPlay,
    onSettings,
    isAutoPlaying,
    canGoNext,
    canGoPrev,
}) => {
    return (
        <div className="w-full flex flex-col md:flex-row flex-wrap justify-center gap-4">
            <div className="flex gap-3 w-full md:w-auto justify-center">
                 <Button onClick={onReplay} disabled={!canGoPrev || isAutoPlaying} variant="secondary" title="Go Back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </Button>
                
                <Button onClick={onNext} disabled={!canGoNext || isAutoPlaying} variant="primary" className="flex-grow md:flex-grow-0 min-w-[160px] text-lg">
                    Next Step
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </Button>
            </div>

            <div className="flex gap-3 w-full md:w-auto justify-center">
                <Button onClick={onAutoPlay} disabled={!canGoNext && !isAutoPlaying} variant="secondary" className="min-w-[120px]">
                    {isAutoPlaying ? (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                        Pause</>
                    ) : (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        Auto</>
                    )}
                </Button>
                
                <Button onClick={onReset} variant="danger" title="Reset Problem">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 003.5 13.5" /></svg>
                </Button>

                <Button onClick={onSettings} variant="neutral" title="Settings" className="rounded-2xl">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                </Button>
            </div>
        </div>
    );
};