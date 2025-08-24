
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavLinkProps = {
    href: string;
    children: React.ReactNode;
    className?: string;
};

export function NavLink({ href, children, className }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);

    return (
        <Link 
            href={href} 
            className={cn(
                "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                isActive && "bg-accent/50 text-accent-foreground",
                className
            )}
        >
            {children}
        </Link>
    );
}
