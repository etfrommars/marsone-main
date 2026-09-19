import { useEffect, useRef } from 'react';

export default function AlienBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars & celestial particles
    const stars: Array<{ x: number; y: number; size: number; alpha: number; speed: number; pulseSpeed: number }> = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.15 + 0.05,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render stars
      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
        star.alpha += Math.sin(angle * star.pulseSpeed) * 0.01;
        const currentAlpha = Math.max(0.1, Math.min(0.85, star.alpha));

        ctx.fillStyle = `rgba(13, 242, 201, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle orbital telemetry circle in top right
      const radarCenterX = width * 0.85;
      const radarCenterY = 120;
      const radarRadius = Math.min(width * 0.12, 100);

      ctx.save();
      ctx.strokeStyle = 'rgba(13, 242, 201, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Radar scan line
      angle += 0.015;
      const scanX = radarCenterX + Math.cos(angle) * radarRadius;
      const scanY = radarCenterY + Math.sin(angle) * radarRadius;

      ctx.strokeStyle = 'rgba(13, 242, 201, 0.25)';
      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.lineTo(scanX, scanY);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-radial-nebula opacity-70" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 scanline-overlay opacity-25" />
    </div>
  );
}
