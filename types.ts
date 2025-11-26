
import { DivisionMode, InteractionMode } from './constants';

export enum StepType {
    START = 'START',
    BRING_DOWN = 'BRING_DOWN',
    CALCULATE_Q = 'CALCULATE_Q',
    AWAIT_Q_INPUT = 'AWAIT_Q_INPUT',
    MULTIPLY = 'MULTIPLY',
    AWAIT_PRODUCT_INPUT = 'AWAIT_PRODUCT_INPUT',
    SUBTRACT = 'SUBTRACT',
    AWAIT_REMAINDER_INPUT = 'AWAIT_REMAINDER_INPUT',
    ADD_DECIMAL_POINT = 'ADD_DECIMAL_POINT',
    APPEND_ZERO = 'APPEND_ZERO',
    TERMINATED = 'TERMINATED',
    REPEATING = 'REPEATING',
    MAX_DECIMALS_REACHED = 'MAX_DECIMALS_REACHED',
}

export enum Difficulty {
    ONES = 'ONES',
    EASY = 'EASY',
    HUNDREDS = 'HUNDREDS',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
    EXPERT = 'EXPERT',
    CUSTOM = 'CUSTOM',
}

export interface DivisionStep {
    type: StepType;
    mascotMessage: string;
    // State of calculation for this step
    partialDividend: string;
    quotient: string;
    product: string;
    remainder: string;
    dividendIndex: number;
    // Data for rendering/animation
    workingDividend: string;
    work: WorkStep[];
    isDecimalStep: boolean;
}

export interface WorkStep {
    product: string;
    remainder: string;
}

export type RequiredInputType = 'quotient' | 'product' | 'remainder' | null;

export interface DivisionState {
    dividend: number;
    divisor: number;
    steps: DivisionStep[];
    currentStepIndex: number;
    isComplete: boolean;
    isRepeating: boolean;
    repeatingStartIndex: number | null;
    calculationMode: DivisionMode;
    interactionMode: InteractionMode;
    maxDecimalPlaces: number;
    inputFeedback: 'correct' | 'incorrect' | null;
    remainderHistory: Map<number, number>;
    currentUserInput: string;
    requiredInputType: RequiredInputType;
    isAwaitingContinue: boolean;
}

export interface RemainderInfo {
    remainder: number;
    quotientIndex: number;
}

export interface Problem {
    dividend: number;
    divisor: number;
}