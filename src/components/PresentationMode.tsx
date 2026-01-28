import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Maximize2, Minimize2, ChevronLeft, ChevronRight, 
  Play, Pause, X, Monitor, BookOpen, HelpCircle,
  Home, Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Course } from '@/types';
import { cn } from '@/lib/utils';

interface PresentationModeProps {
  course: Course;
  onClose: () => void;
}

interface Slide {
  id: string;
  type: 'title' | 'intro' | 'section' | 'examples' | 'warnings' | 'qcm' | 'conclusion';
  title: string;
  content: string;
  items?: string[];
  sectionIndex?: number;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ course, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');

  // Generate slides from course content
  const generateSlides = useCallback((): Slide[] => {
    const slides: Slide[] = [];

    // Title slide
    slides.push({
      id: 'title',
      type: 'title',
      title: course.title,
      content: `${course.modules.length} modules • ${course.content.sections.length} sections`
    });

    // Introduction slide
    if (course.content.introduction) {
      slides.push({
        id: 'intro',
        type: 'intro',
        title: 'Introduction',
        content: course.content.introduction
      });
    }

    // Section slides
    course.content.sections.forEach((section, index) => {
      // Main section content
      slides.push({
        id: `section-${index}`,
        type: 'section',
        title: section.title,
        content: section.explanation,
        sectionIndex: index
      });

      // Examples slide if exists
      if (section.examples.length > 0) {
        slides.push({
          id: `examples-${index}`,
          type: 'examples',
          title: `${section.title} - Exemples`,
          content: '',
          items: section.examples,
          sectionIndex: index
        });
      }

      // Warnings slide if exists
      if (section.warnings.length > 0) {
        slides.push({
          id: `warnings-${index}`,
          type: 'warnings',
          title: `${section.title} - Points d'attention`,
          content: '',
          items: section.warnings,
          sectionIndex: index
        });
      }
    });

    // QCM slides
    course.content.qcm.forEach((question, index) => {
      slides.push({
        id: `qcm-${index}`,
        type: 'qcm',
        title: `Question ${index + 1}`,
        content: question.question,
        items: question.options
      });
    });

    // Conclusion slide
    if (course.content.conclusion) {
      slides.push({
        id: 'conclusion',
        type: 'conclusion',
        title: 'Conclusion',
        content: course.content.conclusion,
        items: course.content.resources
      });
    }

    return slides;
  }, [course]);

  const slides = generateSlides();
  const totalSlides = slides.length;
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  const goToSlide = (index: number) => {
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(Math.max(0, Math.min(totalSlides - 1, index)));
    setShowOverview(false);
  };

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setSlideDirection('next');
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setSlideDirection('prev');
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          if (showOverview) {
            setShowOverview(false);
          } else if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'g':
        case 'G':
          setShowOverview(prev => !prev);
          break;
        case 'Home':
          goToSlide(0);
          break;
        case 'End':
          goToSlide(totalSlides - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose, isFullscreen, showOverview, totalSlides]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      if (currentSlide < totalSlides - 1) {
        nextSlide();
      } else {
        setIsAutoPlay(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, currentSlide, totalSlides, nextSlide]);

  // Fullscreen handling
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const currentSlideData = slides[currentSlide];

  const renderSlideContent = () => {
    const slide = currentSlideData;

    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-12">
            <Badge className="mb-6 text-lg px-4 py-2" variant="secondary">
              <Monitor className="w-5 h-5 mr-2" />
              Présentation
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl animate-fade-in">
              {slide.content}
            </p>
            <div className="mt-12 flex items-center gap-4 text-sm text-muted-foreground animate-fade-in">
              <span>{course.modules.length} modules</span>
              <span>•</span>
              <span>{course.content.sections.length} sections</span>
              <span>•</span>
              <span>{course.content.qcm.length} questions</span>
            </div>
          </div>
        );

      case 'intro':
      case 'section':
      case 'conclusion':
        return (
          <div className="flex flex-col h-full px-12 py-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-12 bg-primary rounded-full" />
              <h2 className="text-4xl md:text-5xl font-bold animate-fade-in">
                {slide.title}
              </h2>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none animate-fade-in">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {slide.content}
                </ReactMarkdown>
              </div>
              {slide.type === 'conclusion' && slide.items && slide.items.length > 0 && (
                <div className="mt-8 p-6 bg-muted/50 rounded-xl animate-fade-in">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Ressources complémentaires
                  </h3>
                  <ul className="space-y-2">
                    {slide.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 'examples':
        return (
          <div className="flex flex-col h-full px-12 py-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-10 h-10 text-primary" />
              <h2 className="text-4xl font-bold animate-fade-in">{slide.title}</h2>
            </div>
            <div className="flex-1 grid gap-4">
              {slide.items?.map((example, i) => (
                <div 
                  key={i}
                  className="p-6 bg-primary/5 border-l-4 border-primary rounded-r-xl animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <p className="text-lg md:text-xl">{example}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'warnings':
        return (
          <div className="flex flex-col h-full px-12 py-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-4xl font-bold animate-fade-in">{slide.title}</h2>
            </div>
            <div className="flex-1 grid gap-4">
              {slide.items?.map((warning, i) => (
                <div 
                  key={i}
                  className="p-6 bg-destructive/10 border-l-4 border-destructive rounded-r-xl animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <p className="text-lg md:text-xl">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'qcm':
        return (
          <div className="flex flex-col h-full px-12 py-8">
            <div className="flex items-center gap-3 mb-8">
              <HelpCircle className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold animate-fade-in">{slide.title}</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-2xl md:text-3xl font-medium mb-8 animate-fade-in">
                {slide.content}
              </p>
              <div className="grid gap-4">
                {slide.items?.map((option, i) => (
                  <div 
                    key={i}
                    className="p-5 bg-muted rounded-xl border-2 border-transparent hover:border-primary transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <span className="font-bold text-primary mr-3">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="text-lg">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Overview grid
  if (showOverview) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Grid3X3 className="w-5 h-5" />
            Vue d'ensemble - {totalSlides} diapositives
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setShowOverview(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  "aspect-video rounded-lg border-2 p-4 text-left transition-all hover:scale-105",
                  currentSlide === index 
                    ? "border-primary bg-primary/10" 
                    : "border-muted hover:border-primary/50"
                )}
              >
                <Badge variant="outline" className="mb-2 text-xs">
                  {index + 1}
                </Badge>
                <p className="text-sm font-medium line-clamp-2">{slide.title}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{slide.type}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-background via-background/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Quitter
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => goToSlide(0)}
            disabled={currentSlide === 0}
          >
            <Home className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowOverview(true)}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAutoPlay(!isAutoPlay)}
          >
            {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Main content */}
      <div 
        className={cn(
          "flex-1 flex items-stretch overflow-hidden",
          slideDirection === 'next' ? 'animate-fade-in' : 'animate-fade-in'
        )}
        key={currentSlide}
      >
        {/* Previous slide button */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={cn(
            "w-20 flex items-center justify-center hover:bg-muted/50 transition-colors",
            currentSlide === 0 && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Slide content */}
        <div className="flex-1 overflow-hidden">
          {renderSlideContent()}
        </div>

        {/* Next slide button */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className={cn(
            "w-20 flex items-center justify-center hover:bg-muted/50 transition-colors",
            currentSlide === totalSlides - 1 && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Bottom bar with slide indicators */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 flex items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex gap-2 max-w-xl overflow-x-auto py-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                currentSlide === index 
                  ? "bg-primary scale-125" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
        <span className="bg-muted px-2 py-1 rounded">←→</span> Navigation
        <span className="mx-2">|</span>
        <span className="bg-muted px-2 py-1 rounded">F</span> Plein écran
        <span className="mx-2">|</span>
        <span className="bg-muted px-2 py-1 rounded">G</span> Grille
        <span className="mx-2">|</span>
        <span className="bg-muted px-2 py-1 rounded">Esc</span> Quitter
      </div>
    </div>
  );
};
