"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: number;
}

const DESKTOP_STAR_COUNT = 220;
const MOBILE_STAR_COUNT = 90;
const CONNECTION_DISTANCE = 140;
const MOUSE_INFLUENCE = 25;
const PARALLAX_FACTORS = [0.01, 0.025, 0.05];

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const STAR_COUNT = isMobile ? MOBILE_STAR_COUNT : DESKTOP_STAR_COUNT;

    // Lock the canvas to the largest viewport seen so the address-bar
    // show/hide on mobile doesn't trigger a resize + re-init loop.
    let currentW = 0;
    let currentH = 0;

    function getViewport(): { w: number; h: number } {
      return {
        w: window.innerWidth,
        h: Math.max(window.innerHeight, document.documentElement.clientHeight),
      };
    }

    function resize() {
      const { w, h } = getViewport();
      currentW = w;
      currentH = h;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initStars() {
      const w = currentW;
      const h = currentH;
      const stars: Star[] = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2;
        stars.push({
          x, y, baseX: x, baseY: y,
          size:
            layer === 0
              ? 0.5 + Math.random() * 0.8
              : layer === 1
                ? 0.8 + Math.random() * 1.2
                : 1.2 + Math.random() * 1.8,
          brightness: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          layer,
        });
      }
      starsRef.current = stars;
    }

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function draw(time: number) {
      const w = currentW;
      const h = currentH;
      ctx!.clearRect(0, 0, w, h);

      const stars = starsRef.current;
      const mouse = mouseRef.current;
      const centerX = w / 2;
      const centerY = h / 2;
      const mx = mouse.x - centerX;
      const my = mouse.y - centerY;

      // Parallax update
      for (const star of stars) {
        const factor = PARALLAX_FACTORS[star.layer];
        star.x = star.baseX - mx * factor * MOUSE_INFLUENCE * 0.04;
        star.y = star.baseY - my * factor * MOUSE_INFLUENCE * 0.04;
      }

      // Connections (desktop only for performance)
      if (!isMobile) {
        ctx!.lineWidth = 0.5;
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const a = stars[i];
            const b = stars[j];
            if (Math.abs(a.layer - b.layer) > 1) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECTION_DISTANCE) {
              const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
              ctx!.strokeStyle = `rgba(201, 165, 92, ${opacity})`;
              ctx!.beginPath();
              ctx!.moveTo(a.x, a.y);
              ctx!.lineTo(b.x, b.y);
              ctx!.stroke();
            }
          }
        }
      }

      // Stars with twinkle + glow
      const t = time * 0.001;
      for (const star of stars) {
        const twinkle =
          0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.brightness * (0.4 + 0.6 * twinkle);

        if (star.layer >= 1) {
          const gradient = ctx!.createRadialGradient(
            star.x, star.y, 0, star.x, star.y, star.size * 3
          );
          gradient.addColorStop(0, `rgba(201, 165, 92, ${alpha * 0.3})`);
          gradient.addColorStop(1, "rgba(201, 165, 92, 0)");
          ctx!.fillStyle = gradient;
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.fillStyle = `rgba(232, 228, 220, ${alpha})`;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx!.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    resize();
    initStars();

    // Only re-layout when width actually changes (orientation change,
    // desktop window resize). Ignore height-only changes — on mobile those
    // are just the address bar showing/hiding and cause flicker.
    const handleResize = () => {
      const { w, h } = getViewport();
      if (w === currentW && h <= currentH) return;
      if (w === currentW) {
        currentH = h;
        canvas!.style.height = h + "px";
        canvas!.height = Math.floor(h * dpr);
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        return;
      }
      resize();
      initStars();
    };
    window.addEventListener("orientationchange", handleResize);
    if (!isMobile) {
      window.addEventListener("resize", handleResize);
      window.addEventListener("mousemove", handleMouseMove);
    }
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
