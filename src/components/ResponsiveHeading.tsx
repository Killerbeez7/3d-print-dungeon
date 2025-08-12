import React from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";

interface ResponsiveHeadingProps {
    level: HeadingLevel;
    children: React.ReactNode;
    size?: HeadingSize;
    className?: string;
    color?: "primary" | "secondary" | "muted" | "highlighted";
}

const headingStyles: Record<HeadingSize, string> = {
    xs: "text-xs",
    sm: "text-sm", 
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl"
};

const colorStyles: Record<string, string> = {
    primary: "text-txt-primary",
    secondary: "text-txt-secondary",
    muted: "text-txt-muted", 
    highlighted: "text-txt-highlighted"
};

export const ResponsiveHeading = ({ 
    level, 
    children, 
    size = "base",
    className = "", 
    color = "primary"
}: ResponsiveHeadingProps) => {
    const baseStyles = headingStyles[size];
    const colorStyle = colorStyles[color];
    
    const props = {
        className: `font-michroma ${baseStyles} ${colorStyle} ${className}`,
        children
    };

    switch (level) {
        case 1: return <h1 {...props} />;
        case 2: return <h2 {...props} />;
        case 3: return <h3 {...props} />;
        case 4: return <h4 {...props} />;
        case 5: return <h5 {...props} />;
        case 6: return <h6 {...props} />;
        default: return <h1 {...props} />;
    }
};

// Convenience components for common use cases
export const H1 = ({ children, className, size, color }: Omit<ResponsiveHeadingProps, 'level'>) => (
    <ResponsiveHeading level={1} className={className} size={size} color={color}>{children}</ResponsiveHeading>
);

export const H2 = ({ children, className, size, color }: Omit<ResponsiveHeadingProps, 'level'>) => (
    <ResponsiveHeading level={2} className={className} size={size} color={color}>{children}</ResponsiveHeading>
);

export const H3 = ({ children, className, size, color }: Omit<ResponsiveHeadingProps, 'level'>) => (
    <ResponsiveHeading level={3} className={className} size={size} color={color}>{children}</ResponsiveHeading>
);

export const H4 = ({ children, className, size, color }: Omit<ResponsiveHeadingProps, 'level'>) => (
    <ResponsiveHeading level={4} className={className} size={size} color={color}>{children}</ResponsiveHeading>
);

export const H5 = ({ children, className, size, color }: Omit<ResponsiveHeadingProps, 'level'>) => (
    <ResponsiveHeading level={5} className={className} size={size} color={color}>{children}</ResponsiveHeading>
);

export const H6 = ({ children, className, size, color }: Omit<ResponsiveHeadingProps, 'level'>) => (
    <ResponsiveHeading level={6} className={className} size={size} color={color}>{children}</ResponsiveHeading>
);

// Specialized components for common use cases
export const PageTitle = ({ children, className, color }: Omit<ResponsiveHeadingProps, 'level' | 'size'>) => (
    <ResponsiveHeading level={1} size="4xl" color={color} className={`font-bold text-center ${className}`}>
        {children}
    </ResponsiveHeading>
);

export const SectionTitle = ({ children, className, color }: Omit<ResponsiveHeadingProps, 'level' | 'size'>) => (
    <ResponsiveHeading level={2} size="2xl" color={color} className={`font-semibold ${className}`}>
        {children}
    </ResponsiveHeading>
);

export const SubsectionTitle = ({ children, className, color }: Omit<ResponsiveHeadingProps, 'level' | 'size'>) => (
    <ResponsiveHeading level={3} size="xl" color={color} className={`font-semibold ${className}`}>
        {children}
    </ResponsiveHeading>
);

export const CompactHeading = ({ 
    level, 
    children, 
    className, 
    color 
}: Omit<ResponsiveHeadingProps, 'size'>) => (
    <ResponsiveHeading 
        level={level} 
        size="lg" 
        color={color} 
        className={className}
    >
        {children}
    </ResponsiveHeading>
);

export const HeroHeading = ({ children, className, color }: Omit<ResponsiveHeadingProps, 'level' | 'size'>) => (
    <ResponsiveHeading 
        level={1} 
        size="6xl" 
        color={color} 
        className={`font-bold text-center ${className}`}
    >
        {children}
    </ResponsiveHeading>
);
