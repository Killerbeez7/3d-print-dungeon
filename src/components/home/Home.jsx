export const Home = () => {
    return (
        <main className="text-txt-primary">
            {/* HERO SECTION */}
            <section
                className="
            w-full py-16 px-4 
            bg-gradient-to-r from-accent to-accent-hover 
            flex flex-col items-center
          "
            >
                <h1 className="text-4xl font-bold mb-3">
                    Welcome to 3D Print Dungeon
                </h1>
                <p className="max-w-2xl text-center mb-6 leading-relaxed">
                    Discover, buy, and explore a vast world of 3D models
                    tailored for your next creative project. From gaming to
                    business solutions, we have you covered.
                </p>
                <button
                    className="
              bg-bg-surface text-accent 
              font-semibold py-2 px-6 
              rounded-full hover:bg-bg-reverse
            "
                >
                    Get Started
                </button>
            </section>

            {/* FEATURE HIGHLIGHTS */}
            <section className="py-12 px-4 bg-bg-primary">
                <div className="max-w-screen-xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8">
                        Explore Our Features
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div
                            className="
                  bg-bgSurface border border-br-primary rounded-md 
                  p-6 shadow-sm
                "
                        >
                            <h3 className="text-xl font-semibold mb-3">
                                High-Quality Models
                            </h3>
                            <p className="text-txt-secondary mb-4">
                                All 3D assets pass a rigorous quality check,
                                ensuring you get the best output every time.
                            </p>
                            <button
                                className="
                    text-accent font-medium hover:underline
                  "
                            >
                                Learn More
                            </button>
                        </div>

                        {/* Card 2 */}
                        <div
                            className="
                  bg-bgSurface border border-br-primary rounded-md 
                  p-6 shadow-sm
                "
                        >
                            <h3 className="text-xl font-semibold mb-3">
                                Seamless Upload
                            </h3>
                            <p className="text-txt-secondary mb-4">
                                Easily upload your own 3D models to share or
                                sell with our community.
                            </p>
                            <button className="text-accent font-medium hover:underline">
                                Start Uploading
                            </button>
                        </div>

                        {/* Card 3 */}
                        <div
                            className="
                  bg-bgSurface border border-br-primary rounded-md 
                  p-6 shadow-sm
                "
                        >
                            <h3 className="text-xl font-semibold mb-3">
                                For All Industries
                            </h3>
                            <p className="text-txt-secondary mb-4">
                                We cater to designers, gamers, architects, and
                                more. Everyone is welcome.
                            </p>
                            <button className="text-accent font-medium hover:underline">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section
                className="
            py-12 px-4 
            bg-bg-surface text-center
          "
            >
                <h2 className="text-2xl font-bold mb-4">
                    Start Printing Your Dreams Today
                </h2>
                <p className="text-txt-secondary max-w-xl mx-auto mb-6">
                    Join thousands of creators who trust 3D Print Dungeon for
                    their daily inspiration and 3D printing needs.
                </p>
                <button
                    className="
              bg-accent text-white 
              py-2 px-6 rounded-full
              font-semibold 
              hover:bg-accent-hover
            "
                >
                    Create a Free Account
                </button>
            </section>
        </main>
    );
};
