"use client";

import { useEffect, useRef, useCallback } from "react";

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

interface CardRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const DESKTOP_STAR_COUNT = 250;
const MOBILE_STAR_COUNT = 100;
const CONNECTION_DISTANCE = 140;
const MOUSE_INFLUENCE = 25;
const PARALLAX_FACTORS = [0.01, 0.025, 0.05];
const BLUR_RADIUS = 1.65;

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const cardRectRef = useRef<CardRect | null>(null);

  const updateCardRect = useCallback(() => {
    const card = document.querySelector(".glass-card");
    if (card) {
      const r = card.getBoundingClientRect();
      cardRectRef.current = {
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
      };
    } else {
      cardRectRef.current = null;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const blurCanvas = blurCanvasRef.current;
    if (!canvas || !blurCanvas) return;
    const ctx = canvas.getContext("2d");
    const blurCtx = blurCanvas.getContext("2d");
    if (!ctx || !blurCtx) return;

    const DS = 4;
    // Cap DPR to keep mobile GPU from choking
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const STAR_COUNT = isMobile ? MOBILE_STAR_COUNT : DESKTOP_STAR_COUNT;

    // Use the visual viewport if available (handles mobile Safari's dynamic address bar)
    function getViewportSize(): { w: number; h: number } {
      const vv = window.visualViewport;
      if (vv) {
        return { w: vv.width, h: vv.height };
      }
      return { w: window.innerWidth, h: window.innerHeight };
    }

    function resize() {
      const { w, h } = getViewportSize();
      // Logical size (CSS pixels)
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      // Physical size (device pixels) for sharp rendering
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      blurCanvas!.width = Math.ceil((w * dpr) / DS);
      blurCanvas!.height = Math.ceil((h * dpr) / DS);
      // Scale all drawing by DPR so we can think in CSS pixels
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function getLogicalSize(): { w: number; h: number } {
      return { w: canvas!.width / dpr, h: canvas!.height / dpr };
    }

    function initStars() {
      const { w, h } = getLogicalSize();
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

    function drawStarsToContext(
      targetCtx: CanvasRenderingContext2D,
      scale: number,
      time: number,
    ) {
      const { w, h } = getLogicalSize();
      const stars = starsRef.current;
      const mouse = mouseRef.current;
      const centerX = w / 2;
      const centerY = h / 2;
      const mx = mouse.x - centerX;
      const my = mouse.y - centerY;

      for (const star of stars) {
        const factor = PARALLAX_FACTORS[star.layer];
        star.x = star.baseX - mx * factor * MOUSE_INFLUENCE * 0.04;
        star.y = star.baseY - my * factor * MOUSE_INFLUENCE * 0.04;
      }

      // Connections — skip on mobile for performance
      if (!isMobile) {
        targetCtx.lineWidth = 0.5 * scale;
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
              targetCtx.strokeStyle = `rgba(201, 165, 92, ${opacity})`;
              targetCtx.beginPath();
              targetCtx.moveTo(a.x * scale, a.y * scale);
              targetCtx.lineTo(b.x * scale, b.y * scale);
              targetCtx.stroke();
            }
          }
        }
      }

      const t = time * 0.001;
      for (const star of stars) {
        const twinkle =
          0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.brightness * (0.4 + 0.6 * twinkle);
        const sx = star.x * scale;
        const sy = star.y * scale;
        const ss = star.size * scale;

        if (star.layer >= 1) {
          const gradient = targetCtx.createRadialGradient(
            sx, sy, 0, sx, sy, ss * 3
          );
          gradient.addColorStop(0, `rgba(201, 165, 92, ${alpha * 0.3})`);
          gradient.addColorStop(1, "rgba(201, 165, 92, 0)");
          targetCtx.fillStyle = gradient;
          targetCtx.beginPath();
          targetCtx.arc(sx, sy, ss * 3, 0, Math.PI * 2);
          targetCtx.fill();
        }

        targetCtx.fillStyle = `rgba(232, 228, 220, ${alpha})`;
        targetCtx.beginPath();
        targetCtx.arc(sx, sy, ss, 0, Math.PI * 2);
        targetCtx.fill();
      }
    }

    function draw(time: number) {
      const { w, h } = getLogicalSize();

      ctx!.clearRect(0, 0, w, h);
      drawStarsToContext(ctx!, 1, time);

      updateCardRect();
      const card = cardRectRef.current;

      if (card) {
        // Reset transform for blur canvas draw, then restore
        const prevTransform = ctx!.getTransform();

        // Draw to blur canvas (no DPR transform, just scale by DS)
        blurCtx!.setTransform(1, 0, 0, 1, 0, 0);
        blurCtx!.clearRect(0, 0, blurCanvas!.width, blurCanvas!.height);
        drawStarsToContext(blurCtx!, dpr / DS, time);

        // On the main ctx, we want to draw the blur in CSS pixels, so use our scaled transform
        ctx!.setTransform(prevTransform);

        const pad = 20;
        const r = 12;
        const cx = card.left;
        const cy = card.top;
        const cw = card.right - card.left;
        const ch = card.bottom - card.top;

        ctx!.save();
        ctx!.beginPath();
        ctx!.moveTo(cx + r, cy);
        ctx!.lineTo(cx + cw - r, cy);
        ctx!.quadraticCurveTo(cx + cw, cy, cx + cw, cy + r);
        ctx!.lineTo(cx + cw, cy + ch - r);
        ctx!.quadraticCurveTo(cx + cw, cy + ch, cx + cw - r, cy + ch);
        ctx!.lineTo(cx + r, cy + ch);
        ctx!.quadraticCurveTo(cx, cy + ch, cx, cy + ch - r);
        ctx!.lineTo(cx, cy + r);
        ctx!.quadraticCurveTo(cx, cy, cx + r, cy);
        ctx!.closePath();
        ctx!.clip();

        ctx!.clearRect(cx, cy, cw, ch);

        // Draw blurred source region (in device pixels) mapped to CSS pixels
        const sx = Math.max(0, Math.floor(((card.left - pad) * dpr) / DS));
        const sy = Math.max(0, Math.floor(((card.top - pad) * dpr) / DS));
        const sw = Math.min(
          blurCanvas!.width - sx,
          Math.ceil(((cw + pad * 2) * dpr) / DS),
        );
        const sh = Math.min(
          blurCanvas!.height - sy,
          Math.ceil(((ch + pad * 2) * dpr) / DS),
        );

        ctx!.filter = `blur(${BLUR_RADIUS}px)`;
        ctx!.drawImage(
          blurCanvas!,
          sx, sy, sw, sh,
          card.left - pad, card.top - pad, cw + pad * 2, ch + pad * 2,
        );
        ctx!.filter = "none";

        ctx!.fillStyle = "rgba(15, 17, 35, 0.55)";
        ctx!.fillRect(cx, cy, cw, ch);

        ctx!.restore();
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    resize();
    initStars();

    const handleResize = () => {
      resize();
      initStars();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }
    // Only track mouse on desktop — touch devices don't need parallax tracking
    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [updateCardRect]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
        }}
      />
      <canvas ref={blurCanvasRef} style={{ display: "none" }} />
    </>
  );
}
