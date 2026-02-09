import * as React from 'react';
import { AxiosInstance } from 'axios';

declare module '../../Api/axios' {
    const axiosInstance: AxiosInstance;
    export default axiosInstance;
}

declare module '../../components/common/PageMeta' {
    interface PageMetaProps {
        title: string;
    }
    const PageMeta: React.FC<PageMetaProps>;
    export default PageMeta;
}

declare module '../../components/common/PageBreadCrumb' {
    interface PageBreadCrumbProps {
        pageName: string;
        homeLink?: string;
    }
    const PageBreadCrumb: React.FC<PageBreadCrumbProps>;
    export default PageBreadCrumb;
}

declare module '../../components/ui/button' {
    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
        size?: 'sm' | 'md' | 'lg';
        variant?: 'primary' | 'secondary' | 'danger';
        children?: React.ReactNode;
    }
    export const Button: React.FC<ButtonProps>;
}

declare module '../../components/form/input' {
    interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
        label?: string;
    }
    export const Input: React.FC<InputProps>;
}
