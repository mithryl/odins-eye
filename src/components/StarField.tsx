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

const STAR_COUNT = 250;
const CONNECTION_DISTANCE = 140;
const MOUSE_INFLUENCE = 25;
const PARALLAX_FACTORS = [0.01, 0.025, 0.05];
const BLUR_RADIUS = 1.65; // px of gaussian-like blur for the frost effect
const BLUR_PASSES = 3; // stackblur approximation passes

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const cardRectRef = useRef<CardRect | null>(null);

  // Find the .glass-card element's bounding rect each frame
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

    // Downscale factor for the blur canvas — cheaper to blur a small canvas
    const DS = 4;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      blurCanvas!.width = Math.ceil(window.innerWidth / DS);
      blurCanvas!.height = Math.ceil(window.innerHeight / DS);
    }

    function initStars() {
      const stars: Star[] = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        const x = Math.random() * canvas!.width;
        const y = Math.random() * canvas!.height;
        const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2;
        stars.push({
          x, y, baseX: x, baseY: y,
          size: layer === 0 ? 0.5 + Math.random() * 0.8 : layer === 1 ? 0.8 + Math.random() * 1.2 : 1.2 + Math.random() * 1.8,
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

    function drawStarsToContext(targetCtx: CanvasRenderingContext2D, w: number, h: number, scale: number, time: number) {
      const stars = starsRef.current;
      const mouse = mouseRef.current;
      const centerX = canvas!.width / 2;
      const centerY = canvas!.height / 2;
      const mx = mouse.x - centerX;
      const my = mouse.y - centerY;

      // Update positions
      for (const star of stars) {
        const factor = PARALLAX_FACTORS[star.layer];
        star.x = star.baseX - mx * factor * MOUSE_INFLUENCE * 0.04;
        star.y = star.baseY - my * factor * MOUSE_INFLUENCE * 0.04;
      }

      // Connections
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

      // Stars
      const t = time * 0.001;
      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.brightness * (0.4 + 0.6 * twinkle);
        const sx = star.x * scale;
        const sy = star.y * scale;
        const ss = star.size * scale;

        if (star.layer >= 1) {
          const gradient = targetCtx.createRadialGradient(sx, sy, 0, sx, sy, ss * 3);
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
      const w = canvas!.width;
      const h = canvas!.height;

      // Draw sharp stars to main canvas
      ctx!.clearRect(0, 0, w, h);
      drawStarsToContext(ctx!, w, h, 1, time);

      // Update card rect
      updateCardRect();
      const card = cardRectRef.current;

      if (card) {
        // Draw the same scene to small blur canvas
        const bw = blurCanvas!.width;
        const bh = blurCanvas!.height;
        blurCtx!.clearRect(0, 0, bw, bh);
        drawStarsToContext(blurCtx!, bw, bh, 1 / DS, time);

        // Apply CSS blur via filter to the blur canvas
        // We draw the blurred version OVER the card area on the main canvas
        const pad = 20; // extra padding to avoid hard edges
        const sx = Math.max(0, Math.floor((card.left - pad) / DS));
        const sy = Math.max(0, Math.floor((card.top - pad) / DS));
        const sw = Math.min(bw - sx, Math.ceil((card.right - card.left + pad * 2) / DS));
        const sh = Math.min(bh - sy, Math.ceil((card.bottom - card.top + pad * 2) / DS));

        const dx = sx * DS;
        const dy = sy * DS;
        const dw = sw * DS;
        const dh = sh * DS;

        // Save, clip to card rect, draw blurred region, restore
        ctx!.save();

        // Rounded rect clip to match the card
        const r = 12;
        const cx = card.left;
        const cy = card.top;
        const cw = card.right - card.left;
        const ch = card.bottom - card.top;
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

        // Clear the sharp stars in the card area
        ctx!.clearRect(cx, cy, cw, ch);

        // Draw blurred version using filter
        ctx!.filter = `blur(${BLUR_RADIUS}px)`;
        ctx!.drawImage(blurCanvas!, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx!.filter = "none";

        // Draw frost tint over the blurred area
        ctx!.fillStyle = "rgba(15, 17, 35, 0.55)";
        ctx!.fillRect(cx, cy, cw, ch);

        ctx!.restore();
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    resize();
    initStars();

    const handleResize = () => { resize(); initStars(); };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [updateCardRect]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <canvas
        ref={blurCanvasRef}
        style={{ display: "none" }}
      />
    </>
  );
}
