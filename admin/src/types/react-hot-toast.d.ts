declare module 'react-hot-toast' {
  import * as React from 'react';

  export type ToastType = 'success' | 'error' | 'loading' | 'blank' | 'custom';
  export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  export type Renderable = React.ReactElement | string | null;

  export interface IconTheme {
    primary: string;
    secondary: string;
  }

  export type ValueFunction<TValue, TArg> = (arg: TArg) => TValue;
  export type ValueOrFunction<TValue, TArg> = TValue | ValueFunction<TValue, TArg>;

  export interface Toast {
    type: ToastType;
    id: string;
    toasterId?: string;
    message: ValueOrFunction<Renderable, Toast>;
    icon?: Renderable;
    duration?: number;
    pauseDuration: number;
    position?: ToastPosition;
    removeDelay?: number;
    ariaProps: {
      role: 'status' | 'alert';
      'aria-live': 'assertive' | 'off' | 'polite';
    };
    style?: React.CSSProperties;
    className?: string;
    iconTheme?: IconTheme;
    createdAt: number;
    visible: boolean;
    dismissed: boolean;
    height?: number;
  }

  export type ToastOptions = Partial<Pick<Toast, 'id' | 'icon' | 'duration' | 'ariaProps' | 'className' | 'style' | 'position' | 'iconTheme' | 'toasterId' | 'removeDelay'>>;

  export type DefaultToastOptions = ToastOptions & {
    success?: ToastOptions;
    error?: ToastOptions;
    loading?: ToastOptions;
    blank?: ToastOptions;
    custom?: ToastOptions;
  };

  export interface ToasterProps {
    position?: ToastPosition;
    toastOptions?: DefaultToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    toasterId?: string;
    children?: (toast: Toast) => React.ReactElement;
  }

  export const Toaster: React.FC<ToasterProps>;

  type Message = ValueOrFunction<Renderable, Toast>;
  type ToastHandler = (message: Message, options?: ToastOptions) => string;

  interface ToastFunction {
    (message: Message, opts?: ToastOptions): string;
    error: ToastHandler;
    success: ToastHandler;
    loading: ToastHandler;
    custom: ToastHandler;
    dismiss(toastId?: string, toasterId?: string): void;
    dismissAll(toasterId?: string): void;
    remove(toastId?: string, toasterId?: string): void;
    removeAll(toasterId?: string): void;
    promise<T>(
      promise: Promise<T> | (() => Promise<T>),
      msgs: {
        loading: Renderable;
        success?: ValueOrFunction<Renderable, T>;
        error?: ValueOrFunction<Renderable, any>;
      },
      opts?: DefaultToastOptions
    ): Promise<T>;
  }

  const toast: ToastFunction;
  export default toast;
  export { toast };
  export const resolveValue: <TValue, TArg>(valOrFunction: ValueOrFunction<TValue, TArg>, arg: TArg) => TValue;
}
