"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { FiX, FiZoomIn, FiZoomOut, FiCheck, FiRotateCw } from "react-icons/fi";

interface Props {
  src: string;
  type: "avatar" | "banner";
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

// Avatar: 1:1 circle crop | Banner: 3:1 wide crop
const ASPECT = { avatar: 1, banner: 3 };
const OUTPUT = { avatar: { w: 400, h: 400 }, banner: { w: 1200, h: 400 } };

export default function ImageCropper({ src, type, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  const CANVAS_W = 560;
  const CANVAS_H = type === "banner" ? 187 : 280;
  const cropW = CANVAS_W;
  const cropH = CANVAS_H;

  // Load image and center it
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      // Fit image to canvas initially (fill crop area)
      const scaleToFit = Math.max(cropW / img.naturalWidth, cropH / img.naturalHeight);
      setScale(scaleToFit);
      setOffset({ x: 0, y: 0 });
    };
    img.src = src;
  }, [src, cropW, cropH]);

  // Redraw canvas whenever state changes
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Checkerboard background
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (CANVAS_W - dw) / 2 + offset.x;
    const dy = (CANVAS_H - dh) / 2 + offset.y;

    ctx.drawImage(img, dx, dy, dw, dh);

    // Dim overlay outside crop circle (avatar) or nothing (banner is full canvas)
    if (type === "avatar") {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      const r = Math.min(cropW, cropH) / 2 - 4;
      ctx.arc(CANVAS_W / 2, CANVAS_H / 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Circle border
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2, CANVAS_H / 2, Math.min(cropW, cropH) / 2 - 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Banner: just a border
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2);

      // Rule-of-thirds grid
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      [1/3, 2/3].forEach(f => {
        ctx.beginPath(); ctx.moveTo(CANVAS_W * f, 0); ctx.lineTo(CANVAS_W * f, CANVAS_H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, CANVAS_H * f); ctx.lineTo(CANVAS_W, CANVAS_H * f); ctx.stroke();
      });
    }
  }, [scale, offset, type, CANVAS_W, CANVAS_H, cropW, cropH]);

  useEffect(() => { draw(); }, [draw]);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }, [dragging]);
  const onMouseUp = useCallback(() => setDragging(false), []);

  // Touch events
  const lastTouch = useRef<{ dist: number; x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setDragging(true);
      dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, ox: offset.x, oy: offset.y };
    } else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      lastTouch.current = { dist: d, x: offset.x, y: offset.y };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging) {
      setOffset({ x: dragStart.current.ox + e.touches[0].clientX - dragStart.current.mx, y: dragStart.current.oy + e.touches[0].clientY - dragStart.current.my });
    } else if (e.touches.length === 2 && lastTouch.current) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const factor = d / lastTouch.current.dist;
      setScale(s => Math.min(10, Math.max(0.1, s * factor)));
      lastTouch.current.dist = d;
    }
  };
  const onTouchEnd = () => { setDragging(false); lastTouch.current = null; };

  // Scroll to zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setScale(s => Math.min(10, Math.max(0.1, s * delta)));
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  const resetView = () => {
    const img = imgRef.current;
    if (!img) return;
    const scaleToFit = Math.max(cropW / img.naturalWidth, cropH / img.naturalHeight);
    setScale(scaleToFit);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const out = OUTPUT[type];
    const offscreen = document.createElement("canvas");
    offscreen.width = out.w;
    offscreen.height = out.h;
    const ctx = offscreen.getContext("2d")!;

    // Scale factor from display canvas to output canvas
    const sx = out.w / CANVAS_W;
    const sy = out.h / CANVAS_H;

    const dw = img.naturalWidth * scale * sx;
    const dh = img.naturalHeight * scale * sy;
    const dx = (out.w - dw) / 2 + offset.x * sx;
    const dy = (out.h - dh) / 2 + offset.y * sy;

    if (type === "avatar") {
      ctx.beginPath();
      ctx.arc(out.w / 2, out.h / 2, out.w / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(img, dx, dy, dw, dh);

    offscreen.toBlob(blob => {
      if (blob) onConfirm(blob);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[620px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Adjust {type === "avatar" ? "Avatar" : "Banner"}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Drag to position · Scroll or pinch to zoom</p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <FiX size={18} />
          </button>
        </div>

        {/* Canvas */}
        <div className="bg-gray-900 flex items-center justify-center" style={{ height: CANVAS_H + 32 }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseDown={onMouseDown}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="block"
            style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-3">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <FiZoomOut size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="range" min="10" max="1000" step="1"
              value={Math.round(scale * 100)}
              onChange={e => setScale(Number(e.target.value) / 100)}
              className="flex-1 accent-red-700"
            />
            <FiZoomIn size={15} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 w-12 text-right">{Math.round(scale * 100)}%</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={resetView}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              <FiRotateCw size={13} /> Reset
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5"
              style={{ backgroundColor: "rgb(151,0,3)" }}
            >
              <FiCheck size={14} /> Confirm & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
