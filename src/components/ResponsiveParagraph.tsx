import { ReactNode } from "react";

type ParagraphSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";

interface ResponsiveParagraphProps {
    children: ReactNode;
    size?: ParagraphSize;
    className?: string;
    as?: "p" | "span" | "div";
    color?: "primary" | "secondary" | "muted" | "highlighted";
}

const paragraphStyles: Record<ParagraphSize, string> = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl"
};

const colorStyles: Record<string, string> = {
    primary: "text-txt-primary",
    secondary: "text-txt-secondary", 
    muted: "text-txt-muted",
    highlighted: "text-txt-highlighted"
};

export const ResponsiveParagraph = ({ 
    children, 
    size = "base", 
    className = "", 
    as = "p",
    color = "primary"
}: ResponsiveParagraphProps) => {
    const baseStyles = paragraphStyles[size];
    const colorStyle = colorStyles[color];
    
    const props = {
        className: `${baseStyles} ${colorStyle} ${className}`,
        children
    };

    switch (as) {
        case "span": return <span {...props} />;
        case "div": return <div {...props} />;
        default: return <p {...props} />;
    }
};

// Convenience components for common use cases
export const ParagraphLarge = ({ children, className, as, color }: Omit<ResponsiveParagraphProps, 'size'>) => (
    <ResponsiveParagraph size="lg" className={className} as={as} color={color}>{children}</ResponsiveParagraph>
);

export const ParagraphSmall = ({ children, className, as, color }: Omit<ResponsiveParagraphProps, 'size'>) => (
    <ResponsiveParagraph size="sm" className={className} as={as} color={color}>{children}</ResponsiveParagraph>
);

export const ParagraphExtraSmall = ({ children, className, as, color }: Omit<ResponsiveParagraphProps, 'size'>) => (
    <ResponsiveParagraph size="xs" className={className} as={as} color={color}>{children}</ResponsiveParagraph>
);

export const ParagraphBase = ({ children, className, as, color }: Omit<ResponsiveParagraphProps, 'size'>) => (
    <ResponsiveParagraph size="base" className={className} as={as} color={color}>{children}</ResponsiveParagraph>
);

// Specialized components for common use cases
export const Caption = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="xs" color="secondary" className={className} as={as}>{children}</ResponsiveParagraph>
);

export const Label = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="sm" color="secondary" className={className} as={as}>{children}</ResponsiveParagraph>
);

export const Description = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="lg" color="secondary" className={className} as={as}>{children}</ResponsiveParagraph>
);

export const Metadata = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="xs" color="muted" className={className} as={as}>{children}</ResponsiveParagraph>
);

// Additional specialized components for common use cases
export const StatValue = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="3xl" color="highlighted" className={`font-bold ${className}`} as={as}>{children}</ResponsiveParagraph>
);

export const StatValueSecondary = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="2xl" color="primary" className={`font-bold ${className}`} as={as}>{children}</ResponsiveParagraph>
);

export const Badge = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="xs" color="primary" className={`font-semibold ${className}`} as={as}>{children}</ResponsiveParagraph>
);

export const BadgeSmall = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="xs" color="secondary" className={`font-medium ${className}`} as={as}>{children}</ResponsiveParagraph>
);

export const TabLabel = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="sm" color="secondary" className={`font-medium ${className}`} as={as}>{children}</ResponsiveParagraph>
);

export const FormLabel = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="sm" color="secondary" className={`font-medium ${className}`} as={as}>{children}</ResponsiveParagraph>
);

export const HelpText = ({ children, className, as }: Omit<ResponsiveParagraphProps, 'size' | 'color'>) => (
    <ResponsiveParagraph size="xs" color="muted" className={className} as={as}>{children}</ResponsiveParagraph>
);
