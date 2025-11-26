
import { Difficulty, type Problem } from '../types';

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    if (min > max) {
      [min, max] = [max, min];
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateProblem = (difficulty: Difficulty): Problem => {
    let dividendMin: number, dividendMax: number;
    let divisorMin: number, divisorMax: number;

    switch (difficulty) {
        case Difficulty.ONES: // Ones ÷ Ones
            dividendMin = 2; dividendMax = 9;
            divisorMin = 2; divisorMax = 9;
            break;
        case Difficulty.EASY: // Tens ÷ Ones
            dividendMin = 10; dividendMax = 99;
            divisorMin = 2; divisorMax = 9;
            break;
        case Difficulty.HUNDREDS: // Hundreds ÷ Ones
            dividendMin = 100; dividendMax = 999;
            divisorMin = 2; divisorMax = 9;
            break;
        case Difficulty.MEDIUM: // Hundreds ÷ Tens
            dividendMin = 100; dividendMax = 999;
            divisorMin = 10; divisorMax = 99;
            break;
        case Difficulty.HARD: // Thousands ÷ Tens
            dividendMin = 1000; dividendMax = 9999;
            divisorMin = 10; divisorMax = 99;
            break;
        case Difficulty.EXPERT: // Thousands ÷ Hundreds
            dividendMin = 1000; dividendMax = 9999;
            divisorMin = 100; divisorMax = 999;
            break;
        default:
            dividendMin = 10; dividendMax = 99;
            divisorMin = 2; divisorMax = 9;
            break;
    }

    const divisor = getRandomInt(divisorMin, divisorMax);
    let dividend: number;

    if (difficulty === Difficulty.ONES) {
        // For ONES, ensure dividend >= divisor and both are single digits.
        dividend = getRandomInt(divisor, dividendMax);
    } else {
        // For other levels, ensure dividend is always greater than the divisor.
        dividend = getRandomInt(Math.max(dividendMin, divisor + 1), dividendMax);
    }

    return { dividend, divisor };
};