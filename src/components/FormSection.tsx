import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FormSection = forwardRef<HTMLElement, FormSectionProps>(
  ({ title, subtitle, icon, children, className }, ref) => {
    return (
      <section ref={ref} className={cn("space-y-6 md:space-y-8 animate-slide-up", className)}>
        <div className="p-4 md:p-6 rounded-xl md:rounded-2xl premium-glass transition-all duration-300 hover:border-primary/20">
          <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              {icon && (
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 text-primary shadow-gold">
                  <div className="scale-100 md:scale-110">
                    {icon}
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-foreground">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm md:text-base text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
          </div>
          <div className="space-y-4 md:space-y-6">{children}</div>
        </div>
      </section>
    );
  }
);

FormSection.displayName = 'FormSection';

export default FormSection;
