import React, { useRef, useCallback, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  className?: string;
}

const SignaturePad = forwardRef<HTMLDivElement, SignaturePadProps>(
  ({ onSignatureChange, className }, ref) => {
    const sigPadRef = useRef<SignatureCanvas>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const resizeCanvas = useCallback(() => {
      if (sigPadRef.current && containerRef.current) {
        const canvas = sigPadRef.current.getCanvas();
        const container = containerRef.current;

        // Get the device pixel ratio, strictly 1 or higher
        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        // Save current content if needed (optional, clears on resize usually)
        // const data = sigPadRef.current.toData();

        // Set canvas width/height to physical pixels
        canvas.width = container.offsetWidth * ratio;
        canvas.height = container.offsetHeight * ratio;

        // Scale the context to match
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(ratio, ratio);

        // Reset or redraw logic could go here if content persistence is needed
        // sigPadRef.current.fromData(data);
        sigPadRef.current.clear(); // Clear to prevent distortion, simple approach
      }
    }, []);

    React.useEffect(() => {
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas(); // Initial sizing

      // Also use ResizeObserver for more robust handling
      const observer = new ResizeObserver(() => resizeCanvas());
      if (containerRef.current) observer.observe(containerRef.current);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        observer.disconnect();
      };
    }, [resizeCanvas]);

    const handleClear = useCallback(() => {
      if (sigPadRef.current) {
        sigPadRef.current.clear();
        onSignatureChange(null);
      }
    }, [onSignatureChange]);

    const handleEnd = useCallback(() => {
      if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
        const originalCanvas = sigPadRef.current.getCanvas();

        // Create a temporary canvas to transform the color
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalCanvas.width;
        tempCanvas.height = originalCanvas.height;
        const ctx = tempCanvas.getContext('2d');

        if (ctx) {
          // Draw the original signature (gold)
          ctx.drawImage(originalCanvas, 0, 0);

          // Use composite operation to change color to black
          // 'source-in' keeps the alpha of the existing drawing but takes the color of the new drawing
          ctx.globalCompositeOperation = 'source-in';
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

          // Get data URL from the black signature
          const dataUrl = tempCanvas.toDataURL('image/png');
          onSignatureChange(dataUrl);
        }
      }
    }, [onSignatureChange]);

    return (
      <div ref={ref} className={cn("space-y-3 md:space-y-4", className)}>
        <div ref={containerRef} className="relative rounded-xl w-full h-48 md:h-[280px] border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-primary/50 group focus-within:ring-2 focus-within:ring-primary/50 focus-within:shadow-gold">
          <SignatureCanvas
            ref={sigPadRef}
            penColor="#d4af37"
            minWidth={1.5}
            maxWidth={3.5}
            velocityFilterWeight={0.8}
            throttle={0}
            minDistance={2}
            canvasProps={{
              className: 'w-full h-48 md:h-[280px] touch-none',
              style: {
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent'
              }
            }}
            onEnd={handleEnd}
          />
          <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 border-t border-primary/30 pointer-events-none">
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
            onClick={handleClear}
            className="flex-1 min-h-[44px] md:min-h-[48px] text-sm md:text-base touch-manipulation"
          >
            <Eraser className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Limpar Assinatura
          </Button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
