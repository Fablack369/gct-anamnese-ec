import React, { useRef, useCallback, useState, useEffect, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStroke } from 'perfect-freehand';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  className?: string;
}

interface Point {
  x: number;
  y: number;
  pressure: number;
}

const SignaturePad = forwardRef<HTMLDivElement, SignaturePadProps>(
  ({ onSignatureChange, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [strokes, setStrokes] = useState<Point[][]>([]);

    // Convert stroke points to SVG path using perfect-freehand
    const getSvgPathFromStroke = useCallback((points: Point[]): string => {
      const stroke = getStroke(points, {
        size: 4,
        thinning: 0.6,
        smoothing: 0.5,
        streamline: 0.3,
        simulatePressure: false, // Use real Apple Pencil pressure
        start: {
          taper: 20, // Taper 20px at start
          cap: true,
        },
        end: {
          taper: 20, // Taper 20px at end
          cap: true,
        },
      });

      if (!stroke.length) return '';

      const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
          const [x1, y1] = arr[(i + 1) % arr.length];
          acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
          return acc;
        },
        ['M', ...stroke[0], 'Q']
      );

      d.push('Z');
      return d.join(' ');
    }, []);

    // Redraw all strokes on canvas
    const redrawCanvas = useCallback(() => {
      if (!canvasRef.current || !containerRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw all completed strokes
      ctx.fillStyle = '#d4af37'; // Gold color
      strokes.forEach((stroke) => {
        const pathData = getSvgPathFromStroke(stroke);
        if (pathData) {
          const path = new Path2D(pathData);
          ctx.fill(path);
        }
      });

      // Draw current stroke if drawing
      if (currentStroke.length > 0) {
        const pathData = getSvgPathFromStroke(currentStroke);
        if (pathData) {
          const path = new Path2D(pathData);
          ctx.fill(path);
        }
      }
    }, [strokes, currentStroke, getSvgPathFromStroke]);

    // Resize canvas to match container with device pixel ratio
    const resizeCanvas = useCallback(() => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        canvas.width = container.offsetWidth * ratio;
        canvas.height = container.offsetHeight * ratio;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(ratio, ratio);
          // Redraw all strokes after resize
          redrawCanvas();
        }
      }
    }, [redrawCanvas]);

    useEffect(() => {
      redrawCanvas();
    }, [redrawCanvas]);

    useEffect(() => {
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      const observer = new ResizeObserver(() => resizeCanvas());
      if (containerRef.current) observer.observe(containerRef.current);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        observer.disconnect();
      };
    }, [resizeCanvas]);

    // Get pointer position relative to canvas
    const getPointerPos = useCallback((e: PointerEvent): Point => {
      if (!canvasRef.current) return { x: 0, y: 0, pressure: 0.5 };

      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        pressure: e.pressure || 0.5, // Apple Pencil pressure
      };
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const point = getPointerPos(e.nativeEvent);
      setCurrentStroke([point]);
    }, [getPointerPos]);

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isDrawing) return;
        e.preventDefault();

        const point = getPointerPos(e.nativeEvent);
        setCurrentStroke((prev) => [...prev, point]);
      },
      [isDrawing, getPointerPos]
    );

    const handlePointerUp = useCallback(() => {
      if (!isDrawing) return;

      setIsDrawing(false);
      if (currentStroke.length > 0) {
        setStrokes((prev) => [...prev, currentStroke]);
        setCurrentStroke([]);

        // Generate data URL after stroke ends
        setTimeout(() => {
          if (canvasRef.current) {
            // Convert gold to black for saving
            const originalCanvas = canvasRef.current;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = originalCanvas.width;
            tempCanvas.height = originalCanvas.height;
            const ctx = tempCanvas.getContext('2d');

            if (ctx) {
              ctx.drawImage(originalCanvas, 0, 0);
              ctx.globalCompositeOperation = 'source-in';
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

              const dataUrl = tempCanvas.toDataURL('image/png');
              onSignatureChange(dataUrl);
            }
          }
        }, 50);
      }
    }, [isDrawing, currentStroke, onSignatureChange]);

    const handleClear = useCallback(() => {
      setStrokes([]);
      setCurrentStroke([]);
      onSignatureChange(null);
    }, [onSignatureChange]);

    const handleUndo = useCallback(() => {
      setStrokes((prev) => {
        if (prev.length === 0) return prev;
        const newStrokes = prev.slice(0, -1);

        // Update signature data after state update and redraw
        setTimeout(() => {
          if (canvasRef.current) {
            if (newStrokes.length === 0) {
              onSignatureChange(null);
              return;
            }
            // Convert gold to black for saving
            const originalCanvas = canvasRef.current;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = originalCanvas.width;
            tempCanvas.height = originalCanvas.height;
            const ctx = tempCanvas.getContext('2d');

            if (ctx) {
              ctx.drawImage(originalCanvas, 0, 0);
              ctx.globalCompositeOperation = 'source-in';
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

              const dataUrl = tempCanvas.toDataURL('image/png');
              onSignatureChange(dataUrl);
            }
          }
        }, 50);

        return newStrokes;
      });
    }, [onSignatureChange]);

    return (
      <div ref={ref} className={cn("space-y-3 md:space-y-4", className)}>
        <div
          ref={containerRef}
          className="relative rounded-xl w-full h-48 md:h-[280px] border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-primary/50 group focus-within:ring-2 focus-within:ring-primary/50 focus-within:shadow-gold"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-full touch-none cursor-crosshair"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute bottom-12 md:bottom-16 left-3 md:left-4 right-3 md:right-4 border-t border-primary/30 pointer-events-none">
            <span className="absolute -top-3 left-4 text-xs md:text-sm text-muted-foreground bg-charcoal-dark px-2 md:px-3">
              Assine aqui
            </span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex-1 min-h-[44px] md:min-h-[48px] text-sm md:text-base touch-manipulation"
          >
            <Undo2 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Desfazer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleClear}
            className="flex-1 min-h-[44px] md:min-h-[48px] text-sm md:text-base touch-manipulation"
          >
            <Eraser className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Limpar
          </Button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
