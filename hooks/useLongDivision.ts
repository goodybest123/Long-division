
import { useState, useCallback, useEffect } from 'react';
import type { DivisionState, DivisionStep, RequiredInputType } from '../types';
import { StepType } from '../types';
import { DivisionMode, InteractionMode } from '../constants';

const getMascotMessage = (type: StepType | 'INCORRECT_ANSWER' | 'CORRECT_ANSWER', data: any = {}): string => {
    switch (type) {
        case StepType.START:
            return `Let's divide ${data.dividend} by ${data.divisor}.`;
        case StepType.CALCULATE_Q:
            return `${data.divisor} goes into ${data.partialDividend}… ${data.q} times! Let's write ${data.q} in the quotient.`;
        case StepType.MULTIPLY:
            return `Now, let's multiply our new quotient digit, ${data.q}, by the divisor, ${data.divisor}. That's ${data.product}.`;
        case StepType.SUBTRACT:
            return `Next, we subtract ${data.product} from ${data.partialDividend} to get a remainder of ${data.remainder}.`;
        case StepType.BRING_DOWN:
            return `Great! Now let's bring down the next digit, ${data.digit}, to make ${data.newPartialDividend}.`;
        case StepType.ADD_DECIMAL_POINT:
            return `We have a remainder, but no digits left. The decimal point lets us get a more precise answer by dividing this leftover piece into smaller parts!`;
        case StepType.APPEND_ZERO:
            return `To keep going, we add a '0' to our remainder. This turns '${data.remainder}' wholes into '${data.newPartialDividend}' tenths, a number we can now divide!`;
        case StepType.TERMINATED:
            let message = `The remainder is 0, so we're all done! The final answer is ${data.quotient}. Great job!`;
            if (data.isRemainderMode && data.finalRemainder && data.finalRemainder !== '0') {
                 message = `We've used all the digits. The final answer is ${data.quotient} with a remainder of ${data.finalRemainder}.`;
            }
            return message;
        case StepType.REPEATING:
            return `Hey, look! We have a remainder of ${data.remainder} again. This means the decimal will repeat forever. The answer is ${data.quotientWithBar}.`;
        case StepType.MAX_DECIMALS_REACHED:
            return `We've reached ${data.maxDecimalPlaces} decimal places, so let's stop here. The answer is approximately ${data.quotient}.`;
        
        // Input-specific messages
        case StepType.AWAIT_Q_INPUT:
            return `How many times does ${data.divisor} go into ${data.partialDividend}? Type your answer.`;
        case StepType.AWAIT_PRODUCT_INPUT:
            const lastQ = data.quotient.slice(-1);
            return `Correct! Now, what is ${lastQ} \u00D7 ${data.divisor}? Type your answer.`;
        case StepType.AWAIT_REMAINDER_INPUT:
             return `Excellent! What is ${data.partialDividend} - ${data.product}? Type the result.`;
        case 'INCORRECT_ANSWER':
             return "Not quite. Check your calculation and try again!";
        case 'CORRECT_ANSWER':
            return `That's right, ${data.answer} is correct! Let's continue.`;
    }
    return '';
};


const createInitialState = (dividend: number, divisor: number, calculationMode: DivisionMode, maxDecimalPlaces: number, interactionMode: InteractionMode): DivisionState => {
    const dividendStr = String(dividend);
    let partialDividendStr = "";
    let dividendIndex = 0;
    
    // Handle cases where the first part of the dividend is smaller than the divisor
    while (dividendIndex < dividendStr.length && parseInt((partialDividendStr || '0') + dividendStr[dividendIndex]) < divisor) {
        partialDividendStr += dividendStr[dividendIndex];
        dividendIndex++;
    }
    
    // If the loop finished, it means we have enough digits or we ran out.
    // If we are still smaller and have digits left, take one more.
    if (parseInt(partialDividendStr || '0') < divisor && dividendIndex < dividendStr.length) {
       partialDividendStr += dividendStr[dividendIndex];
       dividendIndex++;
    }
    
    if (partialDividendStr === "") partialDividendStr = "0";

    const startStep: DivisionStep = {
        type: StepType.START,
        mascotMessage: getMascotMessage(StepType.START, { dividend, divisor }),
        partialDividend: partialDividendStr,
        quotient: '',
        product: '',
        remainder: '',
        dividendIndex: dividendIndex,
        workingDividend: dividendStr.substring(0, dividendIndex),
        work: [],
        isDecimalStep: false,
    };

    return {
        dividend,
        divisor,
        steps: [startStep],
        currentStepIndex: 0,
        isComplete: false,
        isRepeating: false,
        repeatingStartIndex: null,
        calculationMode,
        interactionMode,
        maxDecimalPlaces,
        inputFeedback: null,
        remainderHistory: new Map(),
        currentUserInput: '',
        requiredInputType: null,
        isAwaitingContinue: false,
    };
};

const getCorrectAnswer = (step: DivisionStep, requiredInput: RequiredInputType, divisor: number): number => {
    switch (requiredInput) {
        case 'quotient':
            return Math.floor(parseInt(step.partialDividend) / divisor);
        case 'product':
            const q = parseInt(step.quotient.slice(-1));
            return q * divisor;
        case 'remainder':
            return parseInt(step.partialDividend) - parseInt(step.product);
        default:
            return NaN;
    }
}

export const useLongDivision = (initialDividend: number, initialDivisor: number, initialCalculationMode: DivisionMode, initialMaxDecimalPlaces: number, initialInteractionMode: InteractionMode) => {
    const [state, setState] = useState<DivisionState>(() => createInitialState(initialDividend, initialDivisor, initialCalculationMode, initialMaxDecimalPlaces, initialInteractionMode));

    // CORE FIX: This effect syncs the hook's internal state with any prop changes from the parent component.
    // This solves the stale state issue when the user changes modes or problems.
    useEffect(() => {
        setState(createInitialState(initialDividend, initialDivisor, initialCalculationMode, initialMaxDecimalPlaces, initialInteractionMode));
    }, [initialDividend, initialDivisor, initialCalculationMode, initialMaxDecimalPlaces, initialInteractionMode]);


    const reset = useCallback((dividend: number, divisor: number) => {
        // This reset is now just for the UI buttons, and it respects the current mode settings from props.
        setState(createInitialState(dividend, divisor, initialCalculationMode, initialMaxDecimalPlaces, initialInteractionMode));
    }, [initialCalculationMode, initialMaxDecimalPlaces, initialInteractionMode]);

    const isAwaitingStudentInput = state.interactionMode === InteractionMode.STUDENT_INPUT_QUOTIENT && !state.isComplete && state.steps[state.currentStepIndex].type === StepType.AWAIT_Q_INPUT;
    
    const isAwaitingFullInput = state.interactionMode === InteractionMode.FULL_INPUT && state.requiredInputType !== null;

    const nextStep = useCallback(() => {
        if (state.isComplete) return;

        let currentState = { ...state };
        let lastStep = currentState.steps[currentState.currentStepIndex];
        let nextStepType: StepType;
        
        const determineNextAction = (currentStep: DivisionStep): StepType => {
            const remainderVal = parseInt(currentStep.remainder);
            const hasMoreDigits = currentStep.dividendIndex < String(currentState.dividend).length;

            if (currentState.calculationMode === DivisionMode.Decimal && currentStep.isDecimalStep) {
                if (currentState.remainderHistory.has(remainderVal)) {
                     const firstIndex = currentState.remainderHistory.get(remainderVal)!;
                     // Prevent false positives for repeating 0s (e.g. in 1/8)
                    if (currentStep.quotient.substring(firstIndex) !== '0') {
                        return StepType.REPEATING;
                    }
                }
                const decimalPart = currentStep.quotient.split('.')[1] || '';
                if (decimalPart.length >= currentState.maxDecimalPlaces) return StepType.MAX_DECIMALS_REACHED;
            }

            if (remainderVal === 0 && !hasMoreDigits) return StepType.TERMINATED;
            if (hasMoreDigits) return StepType.BRING_DOWN;
            if (currentState.calculationMode === DivisionMode.Remainder) return StepType.TERMINATED;
            
            return StepType.ADD_DECIMAL_POINT;
        }

        switch (lastStep.type) {
            case StepType.START:
            case StepType.BRING_DOWN:
            case StepType.APPEND_ZERO:
                 if(currentState.interactionMode === InteractionMode.FULL_INPUT || currentState.interactionMode === InteractionMode.STUDENT_INPUT_QUOTIENT) {
                    nextStepType = StepType.AWAIT_Q_INPUT;
                } else {
                    nextStepType = StepType.CALCULATE_Q;
                }
                break;
            case StepType.CALCULATE_Q:
                if(currentState.interactionMode === InteractionMode.FULL_INPUT){
                    nextStepType = StepType.AWAIT_PRODUCT_INPUT;
                } else {
                    nextStepType = StepType.MULTIPLY;
                }
                break;
            case StepType.MULTIPLY:
                 if(currentState.interactionMode === InteractionMode.FULL_INPUT){
                    nextStepType = StepType.AWAIT_REMAINDER_INPUT;
                } else {
                    nextStepType = StepType.SUBTRACT;
                }
                break;
            case StepType.SUBTRACT:
                 nextStepType = determineNextAction(lastStep);
                break;
            case StepType.ADD_DECIMAL_POINT:
                nextStepType = StepType.APPEND_ZERO;
                break;
            default:
                return;
        }

        let newStep: DivisionStep | null = null;
        const dividendStr = String(currentState.dividend);

        switch (nextStepType) {
            case StepType.AWAIT_Q_INPUT:
                newStep = { ...lastStep, type: nextStepType, mascotMessage: getMascotMessage(nextStepType, { divisor: currentState.divisor, partialDividend: lastStep.partialDividend })};
                currentState.requiredInputType = 'quotient';
                break;
            case StepType.AWAIT_PRODUCT_INPUT:
                newStep = { ...lastStep, type: nextStepType, mascotMessage: getMascotMessage(nextStepType, { divisor: currentState.divisor, quotient: lastStep.quotient })};
                currentState.requiredInputType = 'product';
                break;
            case StepType.AWAIT_REMAINDER_INPUT:
                newStep = { ...lastStep, type: nextStepType, mascotMessage: getMascotMessage(nextStepType, { partialDividend: lastStep.partialDividend, product: lastStep.product })};
                currentState.requiredInputType = 'remainder';
                break;
            case StepType.CALCULATE_Q: {
                const q = getCorrectAnswer(lastStep, 'quotient', currentState.divisor);
                newStep = { ...lastStep, type: nextStepType, quotient: lastStep.quotient + q,
                    mascotMessage: getMascotMessage(nextStepType, { divisor: currentState.divisor, partialDividend: lastStep.partialDividend, q })
                };
                break;
            }
            case StepType.MULTIPLY: {
                const q = parseInt(lastStep.quotient.slice(-1));
                const product = getCorrectAnswer(lastStep, 'product', currentState.divisor);
                newStep = { ...lastStep, type: nextStepType, product: String(product),
                    mascotMessage: getMascotMessage(nextStepType, { q, divisor: currentState.divisor, product })
                };
                break;
            }
            case StepType.SUBTRACT: {
                const newRemainderNum = getCorrectAnswer(lastStep, 'remainder', currentState.divisor);
                const newWork = [...lastStep.work, { product: lastStep.product, remainder: String(newRemainderNum) }];
                newStep = { ...lastStep, type: nextStepType, remainder: String(newRemainderNum), work: newWork,
                    mascotMessage: getMascotMessage(nextStepType, { product: lastStep.product, partialDividend: lastStep.partialDividend, remainder: newRemainderNum })
                };
                if (newStep.isDecimalStep) {
                    const newHistory = new Map(currentState.remainderHistory);
                    if (!newHistory.has(newRemainderNum)) {
                       newHistory.set(newRemainderNum, newStep.quotient.length);
                    }
                    currentState.remainderHistory = newHistory;
                }
                break;
            }
            case StepType.BRING_DOWN: {
                const digit = dividendStr[lastStep.dividendIndex];
                const newPartialDividendStr = lastStep.remainder === '0' ? digit : lastStep.remainder + digit;
                newStep = { ...lastStep, type: nextStepType, partialDividend: newPartialDividendStr, dividendIndex: lastStep.dividendIndex + 1,
                    workingDividend: dividendStr.substring(0, lastStep.dividendIndex + 1),
                    mascotMessage: getMascotMessage(nextStepType, { digit, newPartialDividend: newPartialDividendStr })
                };
                break;
            }
            case StepType.ADD_DECIMAL_POINT: {
                const currentQuotient = lastStep.quotient || '0';
                const newQuotient = currentQuotient.includes('.') ? currentQuotient : currentQuotient + '.';
                newStep = { 
                    ...lastStep, 
                    type: nextStepType, 
                    quotient: newQuotient, 
                    isDecimalStep: true,
                    mascotMessage: getMascotMessage(nextStepType, {}) 
                };
                const newHistory = new Map(currentState.remainderHistory);
                const remainderVal = parseInt(lastStep.remainder);
                if (!newHistory.has(remainderVal)) {
                    newHistory.set(remainderVal, newQuotient.length);
                }
                currentState.remainderHistory = newHistory;
                break;
            }
            case StepType.APPEND_ZERO: {
                const newPartialDividendStr = lastStep.remainder + '0';
                newStep = { 
                    ...lastStep, 
                    type: nextStepType, 
                    partialDividend: newPartialDividendStr, 
                    mascotMessage: getMascotMessage(nextStepType, { remainder: lastStep.remainder, newPartialDividend: newPartialDividendStr })
                };
                break;
            }
            case StepType.TERMINATED: {
                let finalQuotient = lastStep.quotient;
                if (lastStep.quotient === '') finalQuotient = '0'; // Handle cases like 1/8 where quotient is empty before decimal
                newStep = { ...lastStep, type: nextStepType, 
                    mascotMessage: getMascotMessage(nextStepType, { 
                        quotient: finalQuotient,
                        isRemainderMode: currentState.calculationMode === DivisionMode.Remainder,
                        finalRemainder: lastStep.remainder,
                    }) 
                };
                currentState.isComplete = true;
                break;
            }
            case StepType.REPEATING: {
                const repeatIndex = currentState.remainderHistory.get(parseInt(lastStep.remainder))!;
                const nonRepeatingPart = lastStep.quotient.substring(0, repeatIndex);
                const repeatingPart = lastStep.quotient.substring(repeatIndex);
                const quotientWithBar = `${nonRepeatingPart}\overline{${repeatingPart}}`;
                newStep = { ...lastStep, type: nextStepType, mascotMessage: getMascotMessage(nextStepType, { remainder: lastStep.remainder, quotientWithBar }) };
                currentState.isComplete = true;
                currentState.isRepeating = true;
                currentState.repeatingStartIndex = repeatIndex;
                break;
            }
             case StepType.MAX_DECIMALS_REACHED: {
                newStep = { ...lastStep, type: nextStepType,
                    mascotMessage: getMascotMessage(nextStepType, { maxDecimalPlaces: currentState.maxDecimalPlaces, quotient: lastStep.quotient })
                };
                currentState.isComplete = true;
                break;
            }
        }
        
        if (newStep) {
            if (currentState.interactionMode !== InteractionMode.AUTOMATIC) {
                const isTerminalStep = [StepType.TERMINATED, StepType.REPEATING, StepType.MAX_DECIMALS_REACHED].includes(newStep.type);
                if (!isTerminalStep) {
                    currentState.isAwaitingContinue = true;
                }
            }
            currentState.steps = [...currentState.steps, newStep];
            currentState.currentStepIndex++;
        }
        setState(currentState);
    }, [state]);

    // This effect drives the simulation forward in FULL_INPUT mode after the user acknowledges a step.
    useEffect(() => {
        if (
            state.interactionMode === InteractionMode.FULL_INPUT &&
            !state.isAwaitingContinue &&
            state.requiredInputType === null &&
            !state.isComplete
        ) {
            // After acknowledging a message, if we aren't waiting for input, move to the next step.
            const timeoutId = setTimeout(() => {
                nextStep();
            }, 200); 
            return () => clearTimeout(timeoutId);
        }
    }, [state.isAwaitingContinue, state.interactionMode, state.requiredInputType, state.currentStepIndex, state.isComplete, nextStep]);

    // This effect kick-starts the simulation in student input modes
    useEffect(() => {
        const currentStep = state.steps[state.currentStepIndex];
        const isWaitingToStart = currentStep.type === StepType.START && state.currentStepIndex === 0;

        if ((state.interactionMode === InteractionMode.FULL_INPUT || state.interactionMode === InteractionMode.STUDENT_INPUT_QUOTIENT) && isWaitingToStart && !state.isComplete) {
            const timeoutId = setTimeout(() => nextStep(), 100);
            return () => clearTimeout(timeoutId);
        }
    }, [state.interactionMode, state.steps, state.currentStepIndex, state.isComplete, nextStep]);

    const submitQuotient = useCallback((digit: number) => {
        if (!isAwaitingStudentInput) return;

        const lastStep = state.steps[state.currentStepIndex];
        const correctAnswer = getCorrectAnswer(lastStep, 'quotient', state.divisor);

        if (digit === correctAnswer) {
            const currentQuotient = lastStep.quotient || (lastStep.isDecimalStep ? '0' : '');
            const newStep: DivisionStep = { ...lastStep, type: StepType.CALCULATE_Q, quotient: currentQuotient + digit,
                mascotMessage: getMascotMessage('CORRECT_ANSWER', { answer: digit })
            };
            setState(prevState => ({
                ...prevState,
                steps: [...prevState.steps, newStep],
                currentStepIndex: prevState.currentStepIndex + 1,
                inputFeedback: 'correct',
                isAwaitingContinue: true,
            }));
            setTimeout(() => setState(prevState => ({ ...prevState, inputFeedback: null })), 500);

        } else {
             setState(prevState => ({ 
                ...prevState, 
                inputFeedback: 'incorrect',
                steps: prevState.steps.map((step, index) => 
                    index === prevState.currentStepIndex 
                    ? { ...step, mascotMessage: getMascotMessage('INCORRECT_ANSWER', {}) } 
                    : step
                )
            }));
            setTimeout(() => setState(prevState => ({ ...prevState, inputFeedback: null })), 500);
        }
    }, [state, isAwaitingStudentInput]);
    
    const submitFullAnswer = useCallback((answerStr: string) => {
        if (!isAwaitingFullInput || answerStr === '') return;

        const answer = parseInt(answerStr);
        const lastStep = state.steps[state.currentStepIndex];
        const correctAnswer = getCorrectAnswer(lastStep, state.requiredInputType, state.divisor);

        if(answer === correctAnswer) {
            let stepUpdate: Partial<DivisionStep> = {};
            if(state.requiredInputType === 'quotient') {
                 const currentQuotient = lastStep.quotient || (lastStep.isDecimalStep ? '0' : '');
                 stepUpdate = { quotient: currentQuotient + answer, type: StepType.CALCULATE_Q };
            }
            if(state.requiredInputType === 'product') stepUpdate = { product: String(answer), type: StepType.MULTIPLY };
            if(state.requiredInputType === 'remainder') {
                const newWork = [...lastStep.work, { product: lastStep.product, remainder: String(answer) }];
                stepUpdate = { remainder: String(answer), work: newWork, type: StepType.SUBTRACT };
                 if (lastStep.isDecimalStep) {
                    const newHistory = new Map(state.remainderHistory);
                    if (!newHistory.has(answer)) {
                       newHistory.set(answer, lastStep.quotient.length);
                    }
                    state.remainderHistory = newHistory;
                }
            }
            
            const newStep: DivisionStep = { ...lastStep, ...stepUpdate, mascotMessage: getMascotMessage('CORRECT_ANSWER', { answer }) };
            
            setState(prevState => ({
                ...prevState,
                steps: [...prevState.steps, newStep],
                currentStepIndex: prevState.currentStepIndex + 1,
                inputFeedback: 'correct',
                requiredInputType: null,
                isAwaitingContinue: true,
            }));

            setTimeout(() => {
                setState(prevState => ({ ...prevState, inputFeedback: null }));
            }, 500);

        } else {
             setState(prevState => ({ 
                ...prevState, 
                inputFeedback: 'incorrect',
                steps: prevState.steps.map((step, index) => 
                    index === prevState.currentStepIndex 
                    ? { ...step, mascotMessage: getMascotMessage('INCORRECT_ANSWER', {}) } 
                    : step
                )
            }));
            setTimeout(() => setState(prevState => ({ ...prevState, inputFeedback: null })), 500);
        }

    }, [state, isAwaitingFullInput]);

    const acknowledgeStep = useCallback(() => {
        setState(prevState => {
            if (!prevState.isAwaitingContinue) return prevState;
            return {
                ...prevState,
                isAwaitingContinue: false,
            };
        });
    }, []);
    
    const prevStep = useCallback(() => {
        setState(prevState => {
            if (prevState.currentStepIndex === 0) {
                return prevState;
            }

            const newIndex = prevState.currentStepIndex - 1;
            const newSteps = prevState.steps.slice(0, newIndex + 1);
            
            const newCurrentStep = newSteps[newIndex];
            
            return {
                ...prevState,
                currentStepIndex: newIndex,
                steps: newSteps,
                isComplete: false,
                isRepeating: false,
                repeatingStartIndex: null,
                inputFeedback: null,
                requiredInputType: null,
                // Restore remainder history from the step we are going back to
                remainderHistory: newCurrentStep.isDecimalStep ? prevState.remainderHistory : new Map(),
                isAwaitingContinue: false, // Always allow interaction after going back
            };
        });
    }, []);

    return { state, nextStep, prevStep, reset, submitQuotient, submitFullAnswer, isAwaitingStudentInput, isAwaitingFullInput, acknowledgeStep };
};
