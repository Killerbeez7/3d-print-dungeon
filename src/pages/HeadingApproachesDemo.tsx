import React from 'react';
import { ResponsiveHeading, PageTitle, SectionTitle, SubsectionTitle, CompactHeading, HeroHeading } from '../components/ui/ResponsiveHeading';

export const HeadingApproachesDemo = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Approach 1: Basic HTML with CSS Custom Properties */}
            <section className="mb-16">
                <h1 className="text-txt-primary font-bold mb-8 text-center">
                    Approach 1: Basic HTML + CSS Custom Properties
                </h1>
                <p className="text-txt-secondary mb-6">
                    This uses regular HTML headings with automatic responsive sizing via CSS custom properties.
                    Clean and simple, but less flexible.
                </p>
                
                <div className="space-y-4">
                    <h1 className="text-txt-primary font-bold">Regular H1 (18px → 36px)</h1>
                    <h2 className="text-txt-primary font-semibold">Regular H2 (16px → 32px)</h2>
                    <h3 className="text-txt-primary font-semibold">Regular H3 (14px → 28px)</h3>
                </div>
            </section>

            {/* Approach 2: ResponsiveHeading Component */}
            <section className="mb-16">
                <ResponsiveHeading level={1} className="text-txt-primary font-bold mb-8 text-center">
                    Approach 2: ResponsiveHeading Component
                </ResponsiveHeading>
                <p className="text-txt-secondary mb-6">
                    Uses the ResponsiveHeading component with default responsive sizing.
                    More flexible than basic HTML.
                </p>
                
                <div className="space-y-4">
                    <ResponsiveHeading level={1} className="text-txt-primary font-bold">
                        Custom H1 with ResponsiveHeading
                    </ResponsiveHeading>
                    <ResponsiveHeading level={2} className="text-txt-primary font-semibold">
                        Custom H2 with ResponsiveHeading
                    </ResponsiveHeading>
                    <ResponsiveHeading level={3} className="text-txt-primary font-semibold">
                        Custom H3 with ResponsiveHeading
                    </ResponsiveHeading>
                </div>
            </section>

            {/* Approach 3: Custom Sizes */}
            <section className="mb-16">
                <ResponsiveHeading 
                    level={1} 
                    className="text-txt-primary font-bold mb-8 text-center"
                    sizes={{
                        mobile: '1.25rem',  // 20px
                        sm: '1.5rem',       // 24px
                        md: '1.875rem',     // 30px
                        lg: '2.25rem',      // 36px
                        xl: '3rem',         // 48px
                        '2xl': '3.75rem'    // 60px
                    }}
                >
                    Approach 3: Custom Sizes
                </ResponsiveHeading>
                <p className="text-txt-secondary mb-6">
                    Uses ResponsiveHeading with completely custom sizes for each breakpoint.
                    Maximum flexibility.
                </p>
                
                <div className="space-y-4">
                    <ResponsiveHeading 
                        level={2} 
                        className="text-txt-primary font-semibold"
                        sizes={{
                            mobile: '1rem',      // 16px
                            sm: '1.125rem',      // 18px
                            md: '1.25rem',       // 20px
                            lg: '1.5rem',        // 24px
                            xl: '1.875rem',      // 30px
                            '2xl': '2rem'        // 32px
                        }}
                    >
                        Custom H2 with Specific Sizes
                    </ResponsiveHeading>
                </div>
            </section>

            {/* Approach 4: Convenience Components */}
            <section className="mb-16">
                <PageTitle className="mb-8">
                    Approach 4: Convenience Components
                </PageTitle>
                <p className="text-txt-secondary mb-6">
                    Pre-built components for common use cases. Clean and semantic.
                </p>
                
                <div className="space-y-6">
                    <div>
                        <PageTitle>Page Title Component</PageTitle>
                        <p className="text-txt-secondary">Perfect for main page titles</p>
                    </div>
                    
                    <div>
                        <SectionTitle>Section Title Component</SectionTitle>
                        <p className="text-txt-secondary">Great for major sections</p>
                    </div>
                    
                    <div>
                        <SubsectionTitle>Subsection Title Component</SubsectionTitle>
                        <p className="text-txt-secondary">Ideal for subsections</p>
                    </div>
                </div>
            </section>

            {/* Approach 5: Specialized Components */}
            <section className="mb-16">
                <HeroHeading className="mb-8">
                    Approach 5: Specialized Components
                </HeroHeading>
                <p className="text-txt-secondary mb-6">
                    Components designed for specific use cases with optimized sizing.
                </p>
                
                <div className="space-y-6">
                    <div>
                        <HeroHeading>Hero Heading</HeroHeading>
                        <p className="text-txt-secondary">Large, impactful heading for hero sections</p>
                    </div>
                    
                    <div>
                        <CompactHeading level={2} className="text-txt-primary font-semibold">
                            Compact Heading
                        </CompactHeading>
                        <p className="text-txt-secondary">Smaller, more compact for mobile-first designs</p>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="mb-8">
                <h2 className="text-txt-primary font-semibold mb-6">Comparison of Approaches</h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-br-secondary">
                        <thead>
                            <tr className="bg-bg-surface">
                                <th className="border border-br-secondary p-3 text-left">Approach</th>
                                <th className="border border-br-secondary p-3 text-left">Flexibility</th>
                                <th className="border border-br-secondary p-3 text-left">Ease of Use</th>
                                <th className="border border-br-secondary p-3 text-left">Best For</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-br-secondary p-3 font-semibold">Basic HTML + CSS</td>
                                <td className="border border-br-secondary p-3">Low</td>
                                <td className="border border-br-secondary p-3">High</td>
                                <td className="border border-br-secondary p-3">Simple, consistent headings</td>
                            </tr>
                            <tr className="bg-bg-surface">
                                <td className="border border-br-secondary p-3 font-semibold">ResponsiveHeading</td>
                                <td className="border border-br-secondary p-3">Medium</td>
                                <td className="border border-br-secondary p-3">Medium</td>
                                <td className="border border-br-secondary p-3">Custom sizing when needed</td>
                            </tr>
                            <tr>
                                <td className="border border-br-secondary p-3 font-semibold">Custom Sizes</td>
                                <td className="border border-br-secondary p-3">High</td>
                                <td className="border border-br-secondary p-3">Low</td>
                                <td className="border border-br-secondary p-3">Unique designs</td>
                            </tr>
                            <tr className="bg-bg-surface">
                                <td className="border border-br-secondary p-3 font-semibold">Convenience Components</td>
                                <td className="border border-br-secondary p-3">Medium</td>
                                <td className="border border-br-secondary p-3">High</td>
                                <td className="border border-br-secondary p-3">Common use cases</td>
                            </tr>
                            <tr>
                                <td className="border border-br-secondary p-3 font-semibold">Specialized Components</td>
                                <td className="border border-br-secondary p-3">Low</td>
                                <td className="border border-br-secondary p-3">High</td>
                                <td className="border border-br-secondary p-3">Specific design patterns</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Recommendations */}
            <section className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                <h2 className="text-txt-primary font-semibold mb-4">Recommendations</h2>
                <ul className="text-txt-secondary space-y-2 list-disc list-inside">
                    <li><strong>Start with Basic HTML + CSS:</strong> For most cases, this is sufficient and clean</li>
                    <li><strong>Use ResponsiveHeading:</strong> When you need custom sizing for specific components</li>
                    <li><strong>Use Convenience Components:</strong> For common patterns like page titles and sections</li>
                    <li><strong>Use Specialized Components:</strong> For hero sections or mobile-first designs</li>
                    <li><strong>Avoid Custom Sizes:</strong> Unless you have very specific design requirements</li>
                </ul>
            </section>
        </div>
    );
}; 