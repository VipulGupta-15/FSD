
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const createParticles = (canvas: HTMLCanvasElement, numberOfParticles: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newParticles: Particle[] = [];
    const colors = ['#1E3A8A', '#2DD4BF', '#FFFFFF', '#FF00FF'];

    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 5 + 1;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const speedX = Math.random() * 1 - 0.5;
      const speedY = Math.random() * 1 - 0.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = Math.random() * 0.5 + 0.1;

      newParticles.push({
        x,
        y,
        size,
        speedX,
        speedY,
        color,
        opacity,
      });
    }

    particles.current = newParticles;
  };

  const updateParticles = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.current.forEach((particle) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX *= -1;
      }

      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY *= -1;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fill();
    });

    animationFrameId.current = requestAnimationFrame(() => updateParticles(canvas));
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Recreate particles on resize
    createParticles(canvas, 100);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create initial particles
    createParticles(canvas, 100);

    // Start animation
    updateParticles(canvas);

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-60"
    />
  );
};

export default ParticleBackground;
