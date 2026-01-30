"use client";

import { useEffect, useRef } from "react";

interface Point {
    x: number;
    y: number;
    z: number;
    pulsating: boolean;
    pulsePhase: number;
}

export function GrapheneModel({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Configuration
        const checkColor = getComputedStyle(document.documentElement).getPropertyValue('--color-md-primary') || '#6750A4';
        const nodeColor = checkColor.trim();
        const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-md-secondary') || '#E8DEF8';

        let width = canvas.width = canvas.parentElement?.clientWidth || 600;
        let height = canvas.height = canvas.parentElement?.clientHeight || 600;

        // Generate Points (Fibonacci Sphere)
        const numPoints = 40;
        const points: Point[] = [];
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < numPoints; i++) {
            const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;

            // Randomly assign pulsators (approx 5)
            const isPulsating = Math.random() > 0.85;

            points.push({
                x: x * 200, // Scale radius
                y: y * 200,
                z: z * 200,
                pulsating: isPulsating,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }

        // Animation Loop
        let angleX = 0;
        let angleY = 0;
        let animationFrameId: number;

        const render = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Center of canvas
            const cx = width / 2;
            const cy = height / 2;

            // Rotation
            angleX += 0.003;
            angleY += 0.005;

            // Project points
            const projectedPoints = points.map(p => {
                // Rotate around Y
                let x1 = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
                let z1 = p.z * Math.cos(angleY) + p.x * Math.sin(angleY);
                let y1 = p.y;

                // Rotate around X
                let y2 = y1 * Math.cos(angleX) - z1 * Math.sin(angleX);
                let z2 = z1 * Math.cos(angleX) + y1 * Math.sin(angleX);
                let x2 = x1;

                // Simple perspective projection
                const scale = 800 / (800 + z2);
                const x2d = x2 * scale + cx;
                const y2d = y2 * scale + cy;

                return { ...p, x2d, y2d, scale, z: z2 };
            });

            // Draw Connections
            ctx.strokeStyle = nodeColor;
            ctx.lineWidth = 1; // thinner lines
            ctx.globalAlpha = 0.3; // subtle connections

            for (let i = 0; i < projectedPoints.length; i++) {
                for (let j = i + 1; j < projectedPoints.length; j++) {
                    const p1 = projectedPoints[i];
                    const p2 = projectedPoints[j];

                    // Check distance in 3D space to properly connect neighbors
                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const dz = points[i].z - points[j].z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 120) { // Connection threshold
                        ctx.beginPath();
                        ctx.moveTo(p1.x2d, p1.y2d);
                        ctx.lineTo(p2.x2d, p2.y2d);
                        ctx.stroke();
                    }
                }
            }

            // Draw Nodes
            projectedPoints.forEach(p => {
                ctx.globalAlpha = 0.8;

                // Pulsate logic
                let radius = 3 * p.scale;
                if (p.pulsating) {
                    // Update phase (hacky, mutating original points via closure index lookups or just local phase increment not persisted? 
                    // Wait, p is a copy. We need to mutate the source points for phase? 
                    // Actually, let's just use time-based pulse for simplicity or assume phase is constant offset and use Date.now()
                    const time = Date.now() / 500;
                    const pulse = (Math.sin(time + p.pulsePhase) + 1) / 2; // 0 to 1

                    // Draw pulsating glow
                    const glowRadius = radius + (pulse * 8 * p.scale);
                    ctx.fillStyle = nodeColor;
                    ctx.globalAlpha = 0.4 * (1 - pulse); // Fade out as it expands
                    ctx.beginPath();
                    ctx.arc(p.x2d, p.y2d, glowRadius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.globalAlpha = 1;
                    radius = 4 * p.scale; // Slightly larger core
                    ctx.fillStyle = secondaryColor.trim(); // Specific active color
                } else {
                    ctx.fillStyle = nodeColor;
                }

                ctx.beginPath();
                ctx.arc(p.x2d, p.y2d, radius, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        // Resize handler
        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.clientWidth || 600;
            height = canvas.height = canvas.parentElement?.clientHeight || 600;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className}
        />
    );
}
