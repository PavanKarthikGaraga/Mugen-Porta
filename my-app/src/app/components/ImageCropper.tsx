"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { FiX, FiZoomIn, FiZoomOut, FiCheck, FiRotateCw } from "react-icons/fi";

interface Props {
  src: string;
  type: "avatar" | "banner";
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

// Canvas aspect ratios match output exactly so scale-x === scale-y always
const CANVAS = { avatar: { w: 480, h: 480 }, banner: { w: 480, h: 160 } };
const OUTPUT = { avatar: { w: 400, h: 400 }, banner: { w: 1200, h: 400 } };
// Corner radius on the 480-px canvas; scaled proportionally to output
const CROP_R = 28;

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export default function ImageCropper({ src, type, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const CW = CANVAS[type].w;
  const CH = CANVAS[type].h;

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const lastPinchDist = useRef<number | null>(null);

  // Load image — no crossOrigin needed for data URLs; setting it causes tainted canvas
  useEffect(() => {
    setReady(false);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const s = Math.max(CW / img.naturalWidth, CH / img.naturalHeight);
      setScale(s);
      setOffset({ x: 0, y: 0 });
      setReady(true);
    };
    img.src = src;
  }, [src, CW, CH]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CW, CH);

    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (CW - dw) / 2 + offset.x;
    const dy = (CH - dh) / 2 + offset.y;
    ctx.drawImage(img, dx, dy, dw, dh);

    if (type === "avatar") {
      // Dim corners outside the rounded-square crop region
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.52)";
      ctx.fillRect(0, 0, CW, CH);
      ctx.globalCompositeOperation = "destination-out";
      roundedRectPath(ctx, 0, 0, CW, CH, CROP_R);
      ctx.fill();
      ctx.restore();

      // Crop-region border
      ctx.save();
      roundedRectPath(ctx, 0.75, 0.75, CW - 1.5, CH - 1.5, CROP_R);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    } else {
      // Banner: rule-of-thirds grid + border
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      [1 / 3, 2 / 3].forEach((f) => {
        ctx.beginPath(); ctx.moveTo(CW * f, 0); ctx.lineTo(CW * f, CH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, CH * f); ctx.lineTo(CW, CH * f); ctx.stroke();
      });
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0.75, 0.75, CW - 1.5, CH - 1.5);
      ctx.restore();
    }
  }, [scale, offset, type, CW, CH]);

  useEffect(() => { draw(); }, [draw]);

  // Mouse
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: dragStart.current.ox + e.clientX - dragStart.current.mx, y: dragStart.current.oy + e.clientY - dragStart.current.my });
  }, [dragging]);
  const onMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setDragging(true);
      dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, ox: offset.x, oy: offset.y };
    } else if (e.touches.length === 2) {
      lastPinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging) {
      setOffset({ x: dragStart.current.ox + e.touches[0].clientX - dragStart.current.mx, y: dragStart.current.oy + e.touches[0].clientY - dragStart.current.my });
    } else if (e.touches.length === 2 && lastPinchDist.current != null) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setScale(s => Math.min(8, Math.max(0.1, s * (d / lastPinchDist.current!))));
      lastPinchDist.current = d;
    }
  };
  const onTouchEnd = () => { setDragging(false); lastPinchDist.current = null; };

  // Scroll zoom — gentle 3% per tick
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(8, Math.max(0.1, s * (e.deltaY > 0 ? 0.97 : 1.03))));
  };

  const resetView = () => {
    const img = imgRef.current;
    if (!img) return;
    setScale(Math.max(CW / img.naturalWidth, CH / img.naturalHeight));
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

    // Canvas and output share the same aspect ratio → single uniform scale
    const s = out.w / CW;
    const dw = img.naturalWidth * scale * s;
    const dh = img.naturalHeight * scale * s;
    const dx = (out.w - dw) / 2 + offset.x * s;
    const dy = (out.h - dh) / 2 + offset.y * s;

    if (type === "avatar") {
      // Clip to rounded square matching the displayed guide
      roundedRectPath(ctx, 0, 0, out.w, out.h, (CROP_R / CW) * out.w);
      ctx.clip();
    }

    ctx.drawImage(img, dx, dy, dw, dh);

    offscreen.toBlob(
      (blob) => {
        if (blob) {
          onConfirm(blob);
        } else {
          alert("Could not process image — please try a different photo.");
        }
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full" style={{ maxWidth: CW + 40 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-900 text-sm">
              {type === "avatar" ? "Crop Photo" : "Crop Banner"}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Drag to reposition · Scroll or pinch to zoom
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* Canvas */}
        <div
          className="bg-zinc-900 flex items-center justify-center"
          style={{ height: CH + 24 }}
        >
          {!ready ? (
            <div className="w-6 h-6 border-2 border-white/25 border-t-white/80 rounded-full animate-spin" />
          ) : (
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              onMouseDown={onMouseDown}
              onWheel={onWheel}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none", display: "block" }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-3">
          {/* Zoom slider */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setScale(s => Math.max(0.1, s * 0.9))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <FiZoomOut size={15} />
            </button>
            <input
              type="range"
              min="10"
              max="800"
              step="1"
              value={Math.round(scale * 100)}
              onChange={e => setScale(Number(e.target.value) / 100)}
              className="flex-1 accent-red-700 cursor-pointer"
            />
            <button
              onClick={() => setScale(s => Math.min(8, s * 1.1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <FiZoomIn size={15} />
            </button>
            <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={resetView}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FiRotateCw size={12} /> Reset
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!ready}
              className="flex-1 py-2 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-opacity"
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
