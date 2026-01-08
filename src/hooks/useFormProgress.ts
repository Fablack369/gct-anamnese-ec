import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseFormProgressOptions {
  sectionRefs: RefObject<HTMLElement | null>[];
  offset?: number;
}

export const useFormProgress = ({ sectionRefs, offset = 200 }: UseFormProgressOptions) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleScroll = useCallback(() => {
    // Safety check: Se estiver no topo da página, força a primeira etapa
    if (window.scrollY < 100) {
      setCurrentStep(0);
      return;
    }

    const scrollPosition = window.scrollY + offset;

    for (let i = sectionRefs.length - 1; i >= 0; i--) {
      const section = sectionRefs[i].current;
      if (section) {
        const sectionTop = section.offsetTop;
        if (scrollPosition >= sectionTop) {
          setCurrentStep(i);
          break;
        }
      }
    }
  }, [sectionRefs, offset]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const scrollToStep = useCallback((stepIndex: number) => {
    const section = sectionRefs[stepIndex]?.current;
    if (section) {
      const headerOffset = 120;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, [sectionRefs]);

  return {
    currentStep,
    scrollToStep,
    setCurrentStep,
  };
};
