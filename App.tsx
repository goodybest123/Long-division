import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LongDivisionCanvas } from './components/LongDivisionCanvas';
import { Controls } from './components/Controls';
import { Mascot } from './components/Mascot';
import { SettingsModal } from './components/SettingsModal';
import { useLongDivision } from './hooks/useLongDivision';
import type { Problem } from './types';
import { Difficulty } from './types';
import { InteractionMode, DivisionMode } from './constants';
import { NumberPad } from './components/NumberPad';
import { FullInputPad } from './components/FullInputPad';
import { generateProblem } from './utils/problemGenerator';
import { DifficultySelector } from './components/DifficultySelector';

const App: React.FC = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
    const [problem, setProblem] = useState<Problem>(() => generateProblem(difficulty));
    const [interactionMode, setInteractionMode] = useState<InteractionMode>(InteractionMode.AUTOMATIC);
    const [maxDecimalPlaces, setMaxDecimalPlaces] = useState(6);
    const [divisionMode, setDivisionMode] = useState<DivisionMode>(DivisionMode.Decimal);
    const [autoPlayDelay, setAutoPlayDelay] = useState(3); // in seconds

    const { 
        state, 
        nextStep, 
        prevStep, 
        reset, 
        submitQuotient, 
        submitFullAnswer,
        isAwaitingStudentInput,
        isAwaitingFullInput,
        acknowledgeStep
    } = useLongDivision(
        problem.dividend,
        problem.divisor,
        divisionMode,
        maxDecimalPlaces,
        interactionMode
    );

    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const autoPlayTimeoutRef = useRef<number | null>(null);

    const handleReset = useCallback(() => {
        setIsAutoPlaying(false);
        if (autoPlayTimeoutRef.current) {
            clearTimeout(autoPlayTimeoutRef.current);
        }
        
        if (difficulty === Difficulty.CUSTOM) {
            reset(problem.dividend, problem.divisor);
        } else {
            const newProblem = generateProblem(difficulty);
            setProblem(newProblem);
            reset(newProblem.dividend, newProblem.divisor);
        }
    }, [difficulty, problem.dividend, problem.divisor, reset]);

    const selectDifficulty = useCallback((newDifficulty: Difficulty) => {
        setIsAutoPlaying(false);
        if (autoPlayTimeoutRef.current) {
            clearTimeout(autoPlayTimeoutRef.current);
        }
        
        setDifficulty(newDifficulty);

        if (newDifficulty !== Difficulty.CUSTOM) {
            const newProblem = generateProblem(newDifficulty);
            setProblem(newProblem);
            reset(newProblem.dividend, newProblem.divisor);
        }
    }, [reset]);

    const handleStartCustomProblem = (dividend: number, divisor: number) => {
        setIsAutoPlaying(false);
        if (autoPlayTimeoutRef.current) {
            clearTimeout(autoPlayTimeoutRef.current);
        }
        const newProblem = { dividend, divisor };
        setProblem(newProblem);
        reset(newProblem.dividend, newProblem.divisor);
    };


    useEffect(() => {
        if (autoPlayTimeoutRef.current) {
            clearTimeout(autoPlayTimeoutRef.current);
        }

        if (isAutoPlaying && !state.isComplete && !isAwaitingStudentInput && !isAwaitingFullInput) {
            const delay = autoPlayDelay * 1000;

            autoPlayTimeoutRef.current = window.setTimeout(() => {
                nextStep();
            }, delay);
        } else if (isAutoPlaying) {
            setIsAutoPlaying(false);
        }

        return () => {
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }
        };
    }, [isAutoPlaying, state.currentStepIndex, state.isComplete, isAwaitingStudentInput, isAwaitingFullInput, nextStep, autoPlayDelay]);


    const toggleAutoPlay = () => {
        if (state.isComplete) {
            handleReset();
            setTimeout(() => setIsAutoPlaying(true), 100);
        } else {
            setIsAutoPlaying(prev => !prev);
        }
    };
    
    const canvasWrapperClasses = [
        "transition-all",
        "duration-300",
        "bg-white", 
        "rounded-2xl",
        "shadow-inner",
        "p-2",
        "border", 
        "border-slate-100",
        state.inputFeedback === 'incorrect' ? 'animate-shake border-rose-300 bg-rose-50' : '',
        state.inputFeedback === 'correct' ? 'animate-pulse-correct border-emerald-300 bg-emerald-50' : ''
    ].join(' ');
    
    const showMainControls = interactionMode !== InteractionMode.FULL_INPUT;
    const showNumberPad = isAwaitingStudentInput && !state.isAwaitingContinue;
    const showFullInputPad = isAwaitingFullInput && !state.isAwaitingContinue;
    const isWaitingForUserInput = isAwaitingStudentInput || isAwaitingFullInput;

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
            <header className="w-full max-w-7xl text-center mb-8 animate-fade-in-up">
                <div className="inline-block relative">
                     <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-500 mb-2 drop-shadow-sm tracking-tight">
                        Long Division Wiz
                    </h1>
                    <div className="absolute -top-4 -right-8 text-3xl animate-float opacity-80">✨</div>
                    <div className="absolute -bottom-2 -left-6 text-2xl animate-float opacity-80" style={{animationDelay: '1s'}}>🚀</div>
                </div>
                <p className="text-slate-500 text-lg font-medium mt-2">Master the magic of math, one step at a time!</p>
            </header>
            
            <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Canvas and Controls */}
                <div className="lg:col-span-8 flex flex-col gap-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    <div className="glass-panel p-8 rounded-[2rem] flex flex-col items-center min-h-[440px] justify-center relative overflow-hidden transition-all hover:shadow-xl">
                        {/* Decorative background blob */}
                        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>
                        
                        <div className={canvasWrapperClasses}>
                            <LongDivisionCanvas state={state} />
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-[2rem]">
                        {showNumberPad && (
                            <div className="animate-fade-in-up">
                                <NumberPad onDigitClick={submitQuotient} />
                            </div>
                        )}
                        {showFullInputPad && (
                            <div className="animate-fade-in-up">
                                <FullInputPad onSubmit={submitFullAnswer} />
                            </div>
                        )}
                        {showMainControls && (
                            <Controls
                                onNext={nextStep}
                                onReplay={prevStep}
                                onReset={handleReset}
                                onAutoPlay={toggleAutoPlay}
                                isAutoPlaying={isAutoPlaying}
                                canGoNext={!state.isComplete && !isWaitingForUserInput}
                                canGoPrev={state.currentStepIndex > 0 && !isWaitingForUserInput}
                                onSettings={() => setShowSettings(true)}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Mascot and Settings */}
                <aside className="lg:col-span-4 flex flex-col gap-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <div className="glass-panel rounded-[2rem] p-6 border-t-[6px] border-indigo-400 relative">
                        <Mascot
                            message={state.steps[state.currentStepIndex]?.mascotMessage || 'Let\'s get started!'}
                            isAwaitingContinue={state.isAwaitingContinue}
                            onContinue={acknowledgeStep}
                        />
                    </div>
                    
                    <div className="glass-panel rounded-[2rem] p-6">
                         <DifficultySelector 
                            currentDifficulty={difficulty}
                            onSelectDifficulty={selectDifficulty}
                            onStartCustomProblem={handleStartCustomProblem}
                         />
                    </div>
                </aside>
            </main>
            
            <footer className="w-full max-w-6xl text-center mt-12 mb-6 text-sm text-slate-400 font-medium">
                <p className="flex items-center justify-center gap-2">
                    <span>© G-LogicLens Tutoring</span> 
                    <span className="w-1 h-1 rounded-full bg-slate-400"></span> 
                    <span>Making Math Magical</span>
                </p>
            </footer>

            {showSettings && (
                <SettingsModal
                    interactionMode={interactionMode}
                    setInteractionMode={setInteractionMode}
                    divisionMode={divisionMode}
                    setDivisionMode={setDivisionMode}
                    maxDecimalPlaces={maxDecimalPlaces}
                    setMaxDecimalPlaces={setMaxDecimalPlaces}
                    autoPlayDelay={autoPlayDelay}
                    setAutoPlayDelay={setAutoPlayDelay}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
};

export default App;