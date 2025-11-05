import React, { useState, useEffect } from 'react';

interface ProgressiveEnhancementProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  feature?: string;
}

// Hook to detect JavaScript availability and feature support
export const useProgressiveEnhancement = (feature?: string) => {
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [hasFeature, setHasFeature] = useState(false);

  useEffect(() => {
    // JavaScript is available if this runs
    setIsEnhanced(true);

    // Check for specific feature support
    if (feature) {
      switch (feature) {
        case 'intersection-observer':
          setHasFeature('IntersectionObserver' in window);
          break;
        case 'css-grid':
          setHasFeature(CSS.supports('display', 'grid'));
          break;
        case 'css-custom-properties':
          setHasFeature(CSS.supports('--custom', 'property'));
          break;
        case 'fetch':
          setHasFeature('fetch' in window);
          break;
        case 'local-storage':
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            setHasFeature(true);
          } catch {
            setHasFeature(false);
          }
          break;
        case 'touch':
          setHasFeature('ontouchstart' in window);
          break;
        default:
          setHasFeature(true);
      }
    } else {
      setHasFeature(true);
    }
  }, [feature]);

  return { isEnhanced, hasFeature };
};

// Progressive Enhancement Wrapper Component
const ProgressiveEnhancement: React.FC<ProgressiveEnhancementProps> = ({
  children,
  fallback,
  feature
}) => {
  const { isEnhanced, hasFeature } = useProgressiveEnhancement(feature);

  // Show fallback if JavaScript is disabled or feature is not supported
  if (!isEnhanced || !hasFeature) {
    return <>{fallback || children}</>;
  }

  return <>{children}</>;
};

// Enhanced Form Component with Progressive Enhancement
export const EnhancedForm: React.FC<{
  onSubmit: (data: FormData) => void;
  children: React.ReactNode;
  action?: string;
  method?: string;
}> = ({ onSubmit, children, action = '#', method = 'POST' }) => {
  const { isEnhanced } = useProgressiveEnhancement();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isEnhanced) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(formData);
    }
    // If JavaScript is disabled, form will submit normally to action URL
  };

  return (
    <form onSubmit={handleSubmit} action={action} method={method}>
      {children}
      <noscript>
        <p className="text-sm text-gray-500 mt-2">
          JavaScript is disabled. Form will submit to server for processing.
        </p>
      </noscript>
    </form>
  );
};

// Enhanced Button with Progressive Enhancement
export const EnhancedButton: React.FC<{
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}> = ({ onClick, href, children, className = '', type = 'button' }) => {
  const { isEnhanced } = useProgressiveEnhancement();

  if (!isEnhanced && href) {
    // Fallback to link if JavaScript is disabled
    return (
      <a href={href} className={`inline-block ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
};

export default ProgressiveEnhancement;