
import { Difficulty } from './types';

export const DIFFICULTY_LEVELS = [
    { id: Difficulty.ONES, label: 'Ones', description: 'Ones ÷ Ones' },
    { id: Difficulty.EASY, label: 'Easy', description: 'Tens ÷ Ones' },
    { id: Difficulty.HUNDREDS, label: 'Hundreds', description: 'Hundreds ÷ Ones' },
    { id: Difficulty.MEDIUM, label: 'Medium', description: 'Hundreds ÷ Tens' },
    { id: Difficulty.HARD, label: 'Hard', description: 'Thousands ÷ Tens' },
    { id: Difficulty.EXPERT, label: 'Expert', description: 'Thousands ÷ Hundreds' },
    { id: Difficulty.CUSTOM, label: 'Custom', description: 'Enter your own problem' },
];

export enum DivisionMode {
    Decimal = 'Decimal',
    Remainder = 'Remainder',
}

export enum InteractionMode {
    AUTOMATIC = 'AUTOMATIC',
    STUDENT_INPUT_QUOTIENT = 'STUDENT_INPUT_QUOTIENT',
    FULL_INPUT = 'FULL_INPUT',
}