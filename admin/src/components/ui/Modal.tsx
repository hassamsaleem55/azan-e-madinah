import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/button/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

/**
 * Standard modal component with consistent styling
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] overflow-y-auto">
      {/* Backdrop with premium blur */}
      <div
        className="fixed inset-0 bg-linear-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md transition-all duration-300 animate-fadeIn"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          className={`relative w-full ${sizeClasses[size]} backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl sm:rounded-3xl shadow-2xl shadow-brand-500/10 dark:shadow-brand-500/5 border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-500 max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-scaleIn`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-linear-to-r from-brand-50/50 via-white to-brand-50/50 dark:from-gray-800/50 dark:via-gray-900 dark:to-gray-800/50 sticky top-0 z-10 backdrop-blur-xl">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 sm:p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90 group"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>

          {/* Content with premium scrollbar */}
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-180px)] premium-scrollbar">
            {children}
          </div>

          {/* Footer with gradient */}
          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-linear-to-r from-gray-50/80 via-white to-gray-50/80 dark:from-gray-800/80 dark:via-gray-900 dark:to-gray-800/80 rounded-b-2xl sm:rounded-b-3xl backdrop-blur-xl sticky bottom-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ModalFooterProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelText?: string;
  submitText?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

/**
 * Standard modal footer with cancel and submit buttons
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({
  onCancel,
  onSubmit,
  cancelText = 'Cancel',
  submitText = 'Save',
  isSubmitting = false,
  submitDisabled = false,
}) => {
  return (
    <>
      {onCancel && (
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
          className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md"
        >
          {cancelText}
        </Button>
      )}
      {onSubmit && (
        <Button 
          onClick={onSubmit} 
          disabled={submitDisabled || isSubmitting}
          className="bg-linear-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              <span className="font-medium">Saving...</span>
            </div>
          ) : (
            <span className="font-medium">{submitText}</span>
          )}
        </Button>
      )}
    </>
  );
};

export default Modal;
