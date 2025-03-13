export const Footer = () => {
  return (
    <footer className="
      flex flex-col items-center justify-center 
      bg-bg-primary px-4 py-4 mt-8 shadow-inner text-center
      sm:flex-row sm:justify-between
    ">
      {/* Left side (copyright or brand info) */}
      <div className="mb-2 sm:mb-0">
        <span className="text-txt-secondary">
          © 2025 MySite &mdash; All rights reserved
        </span>
      </div>

      {/* Right side (links) */}
      <div className="flex space-x-4 text-sm text-txt-secondary">
        <a href="#" className="hover:text-txt-link-hover">
          About
        </a>
        <a href="#" className="hover:text-txt-link-hover">
          Contact
        </a>
        <a href="#" className="hover:text-txt-link-hover">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};
