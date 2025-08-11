import React from 'react';

interface ResponsiveHeadingProps {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: React.ReactNode;
    className?: string;
    // Custom sizes for each breakpoint (optional)
    sizes?: {
        mobile?: string;
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
        '2xl'?: string;
    };
}

export const ResponsiveHeading: React.FC<ResponsiveHeadingProps> = ({
    level,
    children,
    className = '',
    sizes = {}
}) => {
    // Apply custom sizes if provided
    const customStyles: Record<string, string> = {};
    
    if (sizes.mobile) {
        customStyles[`--heading-h${level}-mobile`] = sizes.mobile;
    }
    if (sizes.sm) {
        customStyles[`--heading-h${level}-sm`] = sizes.sm;
    }
    if (sizes.md) {
        customStyles[`--heading-h${level}-md`] = sizes.md;
    }
    if (sizes.lg) {
        customStyles[`--heading-h${level}-lg`] = sizes.lg;
    }
    if (sizes.xl) {
        customStyles[`--heading-h${level}-xl`] = sizes.xl;
    }
    if (sizes['2xl']) {
        customStyles[`--heading-h${level}-2xl`] = sizes['2xl'];
    }

    const props = {
        className,
        style: Object.keys(customStyles).length > 0 ? customStyles : undefined,
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
export const PageTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <ResponsiveHeading level={1} className={`text-txt-primary font-bold text-center ${className}`}>
        {children}
    </ResponsiveHeading>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <ResponsiveHeading level={2} className={`text-txt-primary font-semibold ${className}`}>
        {children}
    </ResponsiveHeading>
);

export const SubsectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <ResponsiveHeading level={3} className={`text-txt-primary font-semibold ${className}`}>
        {children}
    </ResponsiveHeading>
);

// Compact heading for mobile-first designs
export const CompactHeading: React.FC<{ 
    level: 1 | 2 | 3 | 4 | 5 | 6; 
    children: React.ReactNode; 
    className?: string;
}> = ({ level, children, className }) => (
    <ResponsiveHeading 
        level={level} 
        className={className}
        sizes={{
            mobile: '0.875rem', // 14px
            sm: '1rem',         // 16px
            md: '1.125rem',     // 18px
            lg: '1.25rem',      // 20px
            xl: '1.5rem',       // 24px
            '2xl': '1.75rem'    // 28px
        }}
    >
        {children}
    </ResponsiveHeading>
);

// Large heading for hero sections
export const HeroHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <ResponsiveHeading 
        level={1} 
        className={`text-txt-primary font-bold text-center ${className}`}
        sizes={{
            mobile: '1.5rem',   // 24px
            sm: '1.875rem',     // 30px
            md: '2.25rem',      // 36px
            lg: '3rem',         // 48px
            xl: '3.75rem',      // 60px
            '2xl': '4.5rem'     // 72px
        }}
    >
        {children}
    </ResponsiveHeading>
); 