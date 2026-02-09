declare module 'react-hot-toast' {
    export interface ToastOptions {
        duration?: number;
        position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    }

    export const toast: {
        (message: string, options?: ToastOptions): void;
        success: (message: string, options?: ToastOptions) => void;
        error: (message: string, options?: ToastOptions) => void;
        loading: (message: string, options?: ToastOptions) => void;
    };
}
