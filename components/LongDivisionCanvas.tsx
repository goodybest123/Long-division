import React, { useRef, useEffect, useState } from 'react';
import type { DivisionState, DivisionStep } from '../types';
import { StepType } from '../types';

interface LongDivisionCanvasProps {
    state: DivisionState;
}

const FONT_SIZE = 28;
const LINE_HEIGHT = FONT_SIZE * 1.6;
const PADDING = 30;
const CHAR_WIDTH = FONT_SIZE * 0.6;
const HOUSE_TICK_HEIGHT = 12;
const CONFETTI_COUNT = 150;

interface ConfettiParticle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    wobble: number;
    wobbleSpeed: number;
}

export const LongDivisionCanvas: React.FC<LongDivisionCanvasProps> = ({ state }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

    useEffect(() => {
        if (state.isComplete && (state.steps[state.currentStepIndex].type === StepType.TERMINATED || state.steps[state.currentStepIndex].type === StepType.REPEATING)) {
            const canvas = canvasRef.current;
            if (canvas) {
                const newConfetti: ConfettiParticle[] = [];
                for (let i = 0; i < CONFETTI_COUNT; i++) {
                    newConfetti.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * -canvas.height * 0.5,
                        size: Math.random() * 8 + 4,
                        speedX: Math.random() * 4 - 2,
                        speedY: Math.random() * 3 + 2,
                        color: ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa'][Math.floor(Math.random() * 5)],
                        rotation: Math.random() * 360,
                        rotationSpeed: Math.random() * 10 - 5,
                        wobble: Math.random() * 10,
                        wobbleSpeed: Math.random() * 0.1 + 0.05
                    });
                }
                setConfetti(newConfetti);
            }
        } else {
            setConfetti([]);
        }
    }, [state.isComplete, state.currentStepIndex, state.steps]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dividendStr = String(state.dividend);
        const quotient = state.steps[state.currentStepIndex]?.quotient || '';
        // Add extra width for padding
        const requiredWidth = PADDING * 2 + (Math.max(dividendStr.length, quotient.length) + String(state.divisor).length + 3) * CHAR_WIDTH + 40;
        const requiredHeight = PADDING * 2 + (3 + (state.steps[state.currentStepIndex]?.work?.length || 0) * 2) * LINE_HEIGHT;
        
        canvas.width = requiredWidth;
        canvas.height = requiredHeight;
        
        // Use a clean monospace font
        ctx.font = `600 ${FONT_SIZE}px 'Courier New', monospace`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Drawing positions
        const divisorX = PADDING;
        const houseStartX = divisorX + (String(state.divisor).length + 1) * CHAR_WIDTH;
        const houseTopY = PADDING + LINE_HEIGHT;
        const dividendWidth = dividendStr.length * CHAR_WIDTH;
        const houseEndX = houseStartX + dividendWidth + PADDING/2;

        // Draw divisor (Indigo-600)
        ctx.fillStyle = '#4f46e5'; 
        ctx.fillText(String(state.divisor), divisorX, houseTopY + FONT_SIZE);

        // Draw division house (Slate-400)
        ctx.strokeStyle = '#94a3b8'; 
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(houseStartX, houseTopY + FONT_SIZE + 5);
        ctx.lineTo(houseStartX - HOUSE_TICK_HEIGHT, houseTopY + FONT_SIZE + 5);
        ctx.lineTo(houseStartX, houseTopY - FONT_SIZE / 2);
        ctx.lineTo(houseEndX, houseTopY - FONT_SIZE / 2);
        ctx.stroke();

        // Draw dividend (Slate-800)
        const currentStep = state.steps[state.currentStepIndex];
        ctx.fillStyle = '#1e293b';
        ctx.fillText(dividendStr, houseStartX, houseTopY + FONT_SIZE);
        
        // Highlight current working part of dividend (Yellow-100 rounded rect)
        if(currentStep.workingDividend){
            ctx.fillStyle = 'rgba(254, 240, 138, 0.5)';
            // Draw a rounded rect for highlight manually or just rect
            ctx.fillRect(houseStartX - 2, houseTopY + 2, currentStep.workingDividend.length * CHAR_WIDTH + 4, LINE_HEIGHT);
        }

        // Draw quotient (Teal-600)
        ctx.fillStyle = '#0d9488'; 
        ctx.fillText(currentStep.quotient, houseStartX, houseTopY - FONT_SIZE/2 - 8);

        // Draw repeating bar
        if (state.isRepeating && state.repeatingStartIndex !== null) {
            const nonRepeating = currentStep.quotient.substring(0, state.repeatingStartIndex);
            const barStartX = houseStartX + nonRepeating.length * CHAR_WIDTH;
            const barEndX = houseStartX + currentStep.quotient.length * CHAR_WIDTH;
            ctx.beginPath();
            ctx.moveTo(barStartX, houseTopY - FONT_SIZE - 6);
            ctx.lineTo(barEndX, houseTopY - FONT_SIZE - 6);
            ctx.strokeStyle = '#0d9488';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Reset stroke
            ctx.strokeStyle = '#94a3b8'; 
            ctx.lineWidth = 3;
        }

        // Draw work steps
        currentStep.work.forEach((ws, i) => {
            const yOffset = houseTopY + (i * 2 + 2) * LINE_HEIGHT;
            const previousWorkStep = state.steps.slice().reverse().find(s => s.work.length === i);
            const partialDividendForThisStep = i === 0 
                ? currentStep.workingDividend
                : (previousWorkStep ? `${previousWorkStep.remainder}${dividendStr[previousWorkStep.dividendIndex-1]}` : '');
            const partialLen = partialDividendForThisStep?.length || 0;

            // product (Rose-500)
            ctx.fillStyle = '#f43f5e'; 
            ctx.fillText(`-${ws.product}`, houseStartX + (partialLen - ws.product.length) * CHAR_WIDTH, yOffset);

            // subtraction line
            ctx.beginPath();
            ctx.moveTo(houseStartX, yOffset + 8);
            ctx.lineTo(houseStartX + partialLen * CHAR_WIDTH, yOffset + 8);
            ctx.lineWidth = 2;
            ctx.stroke();

            // remainder (Slate-600)
            ctx.fillStyle = '#475569';
            ctx.fillText(ws.remainder, houseStartX + (partialLen - ws.remainder.length) * CHAR_WIDTH, yOffset + LINE_HEIGHT);
        });

    }, [state]);

    // Confetti Animation Loop
    useEffect(() => {
        if (confetti.length === 0) return;
        let animationFrameId: number;

        const animateConfetti = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Redraw static content first
            // Note: In a production app, we might layer canvases to avoid redrawing static text
            // But for this simple app, redrawing is fast enough.
            const dividendStr = String(state.dividend);
            const currentStep = state.steps[state.currentStepIndex];
            if (!currentStep) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // --- REDRAW STATIC CONTENT ---
            const houseStartX = PADDING + (String(state.divisor).length + 1) * CHAR_WIDTH;
            const houseTopY = PADDING + LINE_HEIGHT;
            const dividendWidth = dividendStr.length * CHAR_WIDTH;
            const houseEndX = houseStartX + dividendWidth + PADDING/2;
            
            ctx.font = `600 ${FONT_SIZE}px 'Courier New', monospace`;

            // Divisor
            ctx.fillStyle = '#4f46e5'; 
            ctx.fillText(String(state.divisor), PADDING, houseTopY + FONT_SIZE);

            // House
            ctx.strokeStyle = '#94a3b8'; 
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(houseStartX, houseTopY + FONT_SIZE + 5); ctx.lineTo(houseStartX - HOUSE_TICK_HEIGHT, houseTopY + FONT_SIZE + 5); ctx.lineTo(houseStartX, houseTopY - FONT_SIZE / 2); ctx.lineTo(houseEndX, houseTopY - FONT_SIZE / 2); ctx.stroke();

            // Dividend
            ctx.fillStyle = '#1e293b';
            ctx.fillText(dividendStr, houseStartX, houseTopY + FONT_SIZE);

            // Quotient
            ctx.fillStyle = '#0d9488'; 
            ctx.fillText(currentStep.quotient, houseStartX, houseTopY - FONT_SIZE/2 - 8);
             if (state.isRepeating && state.repeatingStartIndex !== null) {
                const nonRepeating = currentStep.quotient.substring(0, state.repeatingStartIndex);
                const barStartX = houseStartX + nonRepeating.length * CHAR_WIDTH;
                const barEndX = houseStartX + currentStep.quotient.length * CHAR_WIDTH;
                ctx.beginPath(); ctx.moveTo(barStartX, houseTopY - FONT_SIZE - 6); ctx.lineTo(barEndX, houseTopY - FONT_SIZE - 6); ctx.strokeStyle = '#0d9488'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
            }

            // Work
             currentStep.work.forEach((ws, i) => {
                const yOffset = houseTopY + (i * 2 + 2) * LINE_HEIGHT;
                const previousWorkStep = state.steps.slice().reverse().find(s => s.work.length === i);
                const partialDividendForThisStep = i === 0 ? currentStep.workingDividend : (previousWorkStep ? `${previousWorkStep.remainder}${dividendStr[previousWorkStep.dividendIndex-1]}` : '');
                const partialLen = partialDividendForThisStep?.length || 0;
                ctx.fillStyle = '#f43f5e'; ctx.fillText(`-${ws.product}`, houseStartX + (partialLen - ws.product.length) * CHAR_WIDTH, yOffset);
                ctx.beginPath(); ctx.moveTo(houseStartX, yOffset + 8); ctx.lineTo(houseStartX + partialLen * CHAR_WIDTH, yOffset + 8); ctx.lineWidth = 2; ctx.stroke();
                ctx.fillStyle = '#475569'; ctx.fillText(ws.remainder, houseStartX + (partialLen - ws.remainder.length) * CHAR_WIDTH, yOffset + LINE_HEIGHT);
            });
            // -----------------------------

            // Update and draw confetti
            const newConfetti = confetti.map(p => {
                p.y += p.speedY;
                p.x += p.speedX + Math.sin(p.wobble) * 2;
                p.wobble += p.wobbleSpeed;
                p.rotation += p.rotationSpeed;
                return p;
            }).filter(p => p.y < canvas.height + 20); // Keep them a bit longer
            
            newConfetti.forEach(p => {
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                // Draw rounded rect/circle confetti
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            });

            setConfetti(newConfetti);

            if (newConfetti.length > 0) {
                animationFrameId = requestAnimationFrame(animateConfetti);
            }
        };

        animateConfetti();
        return () => cancelAnimationFrame(animationFrameId);
    }, [confetti, state]);


    return (
        <div className="flex justify-center items-center w-full h-full min-h-[300px] overflow-auto">
           <canvas ref={canvasRef}></canvas>
        </div>
    );
};