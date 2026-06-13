'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Trash2, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  value?: string;
  readOnly?: boolean;
}

export default function SignaturePad({ onSave, value, readOnly = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);

  useEffect(() => {
    if (value && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = value;
        setHasSignature(true);
      }
    }
  }, [value]);

  // Adjust canvas resolution for high DPI displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#059669'; // Emerald primary line color
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (!readOnly && !value) {
        drawGuideline(canvas, ctx);
      }
    }
  }, [readOnly, value]);

  const drawGuideline = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 40);
    ctx.lineTo(canvas.width - 20, canvas.height - 40);
    ctx.stroke();
    ctx.restore();
  };

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (readOnly) return;
    setIsDrawing(false);
    save();
  };

  const clear = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    drawGuideline(canvas, ctx);

    setHasSignature(false);
    onSave('');
  };

  const save = () => {
    if (!hasSignature || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <PenTool className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          {readOnly ? 'President Signature' : 'President Signature Pad (Sign Below)'}
        </label>
        {!readOnly && hasSignature && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={clear}
            className="h-7 px-2 text-xs flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900/50 h-[180px] w-full cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full h-full"
          style={{ pointerEvents: readOnly ? 'none' : 'auto' }}
        />

        {readOnly && !hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
            No signature captured
          </div>
        )}

        {!readOnly && !hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm pointer-events-none">
            Draw signature using mouse, stylus, or finger
          </div>
        )}
      </div>
    </div>
  );
}
