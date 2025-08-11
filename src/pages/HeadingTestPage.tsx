import React from 'react';

export const HeadingTestPage = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Title */}
            <h1 className="text-txt-primary font-bold mb-8 text-center">
                Responsive Heading Test Page
            </h1>

            {/* Introduction */}
            <div className="mb-12">
                <h2 className="text-txt-primary font-semibold mb-4">
                    About This Test Page
                </h2>
                <p className="text-txt-secondary mb-4">
                    This page demonstrates how our responsive heading system works. 
                    Resize your browser window to see how the headings automatically scale 
                    across different screen sizes. The headings use CSS media queries 
                    instead of Tailwind classes for automatic responsiveness.
                </p>
                <p className="text-txt-secondary">
                    <strong>Breakpoints:</strong> Mobile (default) → Small (640px+) → Medium (768px+) → Large (1024px+) → XL (1280px+) → 2XL (1536px+)
                </p>
            </div>

            {/* H1 Examples */}
            <section className="mb-12">
                <h1 className="text-txt-primary font-bold mb-4">
                    H1 - Main Page Title (18px → 20px → 24px → 30px → 36px → 36px)
                </h1>
                <p className="text-txt-secondary mb-4">
                    This is the largest heading level, typically used for main page titles. 
                    It starts at 18px on mobile and scales up to a maximum of 36px on very large screens.
                </p>
                <div className="bg-bg-surface p-4 rounded-lg border border-br-secondary">
                    <h1 className="text-txt-primary font-bold">
                        Sample H1 Title
                    </h1>
                </div>
            </section>

            {/* H2 Examples */}
            <section className="mb-12">
                <h2 className="text-txt-primary font-semibold mb-4">
                    H2 - Section Headings (16px → 18px → 20px → 24px → 30px → 32px)
                </h2>
                <p className="text-txt-secondary mb-4">
                    Section headings are used to organize content into major sections. 
                    They provide clear visual hierarchy and help users navigate the page.
                </p>
                <div className="bg-bg-surface p-4 rounded-lg border border-br-secondary">
                    <h2 className="text-txt-primary font-semibold">
                        Sample H2 Section
                    </h2>
                </div>
            </section>

            {/* H3 Examples */}
            <section className="mb-12">
                <h3 className="text-txt-primary font-semibold mb-4">
                    H3 - Subsection Headings (14px → 16px → 18px → 20px → 24px → 28px)
                </h3>
                <p className="text-txt-secondary mb-4">
                    Subsection headings break down content within major sections. 
                    They help organize information into logical groups.
                </p>
                <div className="bg-bg-surface p-4 rounded-lg border border-br-secondary">
                    <h3 className="text-txt-primary font-semibold">
                        Sample H3 Subsection
                    </h3>
                </div>
            </section>

            {/* H4 Examples */}
            <section className="mb-12">
                <h4 className="text-txt-primary font-semibold mb-4">
                    H4 - Minor Headings (12px → 14px → 16px → 18px → 20px → 24px)
                </h4>
                <p className="text-txt-secondary mb-4">
                    Minor headings are used for smaller content divisions. 
                    They provide additional structure without overwhelming the hierarchy.
                </p>
                <div className="bg-bg-surface p-4 rounded-lg border border-br-secondary">
                    <h4 className="text-txt-primary font-semibold">
                        Sample H4 Minor Heading
                    </h4>
                </div>
            </section>

            {/* H5 Examples */}
            <section className="mb-12">
                <h5 className="text-txt-primary font-semibold mb-4">
                    H5 - Small Headings (12px → 14px → 16px → 18px → 20px → 24px)
                </h5>
                <p className="text-txt-secondary mb-4">
                    Small headings are used for very specific content divisions. 
                    They maintain hierarchy while being less prominent.
                </p>
                <div className="bg-bg-surface p-4 rounded-lg border border-br-secondary">
                    <h5 className="text-txt-primary font-semibold">
                        Sample H5 Small Heading
                    </h5>
                </div>
            </section>

            {/* H6 Examples */}
            <section className="mb-12">
                <h6 className="text-txt-primary font-semibold mb-4">
                    H6 - Tiny Headings (12px → 14px → 16px → 18px → 20px → 24px)
                </h6>
                <p className="text-txt-secondary mb-4">
                    The smallest heading level, used for very specific content labels. 
                    They provide minimal visual hierarchy.
                </p>
                <div className="bg-bg-surface p-4 rounded-lg border border-br-secondary">
                    <h6 className="text-txt-primary font-semibold">
                        Sample H6 Tiny Heading
                    </h6>
                </div>
            </section>

            {/* Complete Page Structure Example */}
            <section className="mb-12">
                <h2 className="text-txt-primary font-semibold mb-6">
                    Complete Page Structure Example
                </h2>
                
                <div className="bg-bg-surface p-6 rounded-lg border border-br-secondary space-y-6">
                    <h1 className="text-txt-primary font-bold">
                        Article Title (H1)
                    </h1>
                    
                    <p className="text-txt-secondary">
                        This is the introduction paragraph that explains what the article is about. 
                        It provides context and sets expectations for the reader.
                    </p>
                    
                    <h2 className="text-txt-primary font-semibold">
                        Main Section (H2)
                    </h2>
                    
                    <p className="text-txt-secondary">
                        This is the main content section. It contains the primary information 
                        that readers are looking for.
                    </p>
                    
                    <h3 className="text-txt-primary font-semibold">
                        Subsection (H3)
                    </h3>
                    
                    <p className="text-txt-secondary">
                        This subsection provides more detailed information about a specific 
                        aspect of the main topic.
                    </p>
                    
                    <h4 className="text-txt-primary font-semibold">
                        Detail Section (H4)
                    </h4>
                    
                    <p className="text-txt-secondary">
                        This section goes into specific details or examples that support 
                        the subsection above.
                    </p>
                    
                    <h5 className="text-txt-primary font-semibold">
                        Specific Point (H5)
                    </h5>
                    
                    <p className="text-txt-secondary">
                        This covers a very specific point or example that relates to 
                        the detail section.
                    </p>
                    
                    <h6 className="text-txt-primary font-semibold">
                        Note (H6)
                    </h6>
                    
                    <p className="text-txt-secondary">
                        This is a small note or reference that provides additional context.
                    </p>
                </div>
            </section>

            {/* Responsive Testing Instructions */}
            <section className="mb-8">
                <h2 className="text-txt-primary font-semibold mb-4">
                    Testing Instructions
                </h2>
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                    <h3 className="text-txt-primary font-semibold mb-3">
                        How to Test Responsive Headings:
                    </h3>
                    <ul className="text-txt-secondary space-y-2 list-disc list-inside">
                        <li>Open your browser&apos;s developer tools (F12)</li>
                        <li>Click the device toggle button (mobile/tablet icon)</li>
                        <li>Try different device sizes: iPhone, iPad, Desktop</li>
                        <li>Or manually resize the browser window</li>
                        <li>Observe how headings scale smoothly across breakpoints</li>
                        <li>Check that text remains readable at all sizes</li>
                    </ul>
                </div>
            </section>

            {/* Current Screen Size Display */}
            <div className="fixed bottom-4 right-4 bg-bg-secondary border border-br-secondary rounded-lg p-3 shadow-lg">
                <div className="text-xs text-txt-muted">
                    <div>Screen: <span className="font-semibold text-txt-primary" id="screen-size">Loading...</span></div>
                    <div>Breakpoint: <span className="font-semibold text-txt-primary" id="breakpoint">Loading...</span></div>
                </div>
            </div>
        </div>
    );
};

// Add this script to the page to show current screen size
if (typeof window !== 'undefined') {
    const updateScreenInfo = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        let breakpoint = 'Mobile';
        if (width >= 1536) breakpoint = '2XL (1536px+)';
        else if (width >= 1280) breakpoint = 'XL (1280px+)';
        else if (width >= 1024) breakpoint = 'Large (1024px+)';
        else if (width >= 768) breakpoint = 'Medium (768px+)';
        else if (width >= 640) breakpoint = 'Small (640px+)';
        else breakpoint = 'Mobile (<640px)';
        
        const screenSizeEl = document.getElementById('screen-size');
        const breakpointEl = document.getElementById('breakpoint');
        
        if (screenSizeEl) screenSizeEl.textContent = `${width}×${height}`;
        if (breakpointEl) breakpointEl.textContent = breakpoint;
    };
    
    window.addEventListener('resize', updateScreenInfo);
    updateScreenInfo();
} 