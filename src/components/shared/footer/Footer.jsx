export const Footer = () => {
  return (
    <footer className="
      flex flex-col items-center justify-center 
      bg-bgPrimary px-4 py-4 mt-8 shadow-inner text-center
      sm:flex-row sm:justify-between
    ">
      {/* Left side (copyright or brand info) */}
      <div className="mb-2 sm:mb-0">
        <span className="text-txPrimary">
          © 2025 MySite &mdash; All rights reserved
        </span>
      </div>

      {/* Right side (links) */}
      <div className="flex space-x-4 text-sm text-txPrimary">
        <a href="#" className="hover:text-blue-500 transition-colors">
          About
        </a>
        <a href="#" className="hover:text-blue-500 transition-colors">
          Contact
        </a>
        <a href="#" className="hover:text-blue-500 transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};
