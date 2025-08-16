import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    [key: string]: any;
}

export default ({ children, ...props }: AppLayoutProps) => <AppLayoutTemplate {...props}>{children}</AppLayoutTemplate>;
