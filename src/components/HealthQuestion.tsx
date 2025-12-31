import React from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface HealthQuestionProps {
  question: string;
  fieldName: string;
  value: boolean | null;
  details?: string;
  isRisk?: boolean;
  onChange: (value: boolean) => void;
  onDetailsChange?: (details: string) => void;
}

const HealthQuestion: React.FC<HealthQuestionProps> = ({
  question,
  fieldName,
  value,
  details = '',
  isRisk = false,
  onChange,
  onDetailsChange,
}) => {
  return (
    <div className="space-y-3 md:space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
        <p className="flex-1 text-foreground text-sm sm:text-base md:text-lg leading-relaxed">
          {question}
          {isRisk && (
            <AlertTriangle className="inline-block ml-2 h-4 w-4 md:h-5 md:w-5 text-warning" />
          )}
        </p>
        <div className="flex gap-2 md:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={cn(
              "min-w-[60px] md:min-w-[80px] min-h-[48px] px-6 md:px-8 py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-200 touch-manipulation",
              value === true
                ? isRisk
                  ? "bg-warning text-warning-foreground shadow-lg scale-105"
                  : "bg-primary text-primary-foreground shadow-gold scale-105"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95"
            )}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={cn(
              "min-w-[60px] md:min-w-[80px] min-h-[48px] px-6 md:px-8 py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-200 touch-manipulation",
              value === false
                ? "bg-success text-success-foreground shadow-lg scale-105"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95"
            )}
          >
            Não
          </button>
        </div>
      </div>

      {value === true && onDetailsChange && (
        <div className="animate-slide-up pl-0 sm:pl-4 md:pl-6">
          <Textarea
            placeholder="Descreva os detalhes..."
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            className="min-h-[80px] md:min-h-[100px] bg-charcoal-dark border-border/50 focus-glow text-base"
          />
        </div>
      )}

      {value === true && isRisk && (
        <div className="animate-slide-up flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-lg bg-warning/10 border border-warning/30">
          <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-warning shrink-0 mt-0.5" />
          <p className="text-sm md:text-base text-warning">
            Atenção: Esta condição requer avaliação do tatuador antes de prosseguir.
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthQuestion;
