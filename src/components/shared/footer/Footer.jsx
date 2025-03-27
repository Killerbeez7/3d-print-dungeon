import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';

export const Footer = () => {
  return (
    <footer className="bg-bg-primary text-txt-secondary py-10 mt-8 shadow-inner">
      <div className="container mx-auto px-6 sm:px-8">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          
          {/* Company Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-accent">3D Print Dungeon</h3>
            <p className="text-sm mt-2">Your one-stop shop for all things 3D printing. Innovating your designs with the power of 3D printing technology.</p>
          </div>

          {/* Useful Links */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-accent">Useful Links</h3>
            <ul className="mt-2 text-sm">
              <li>
                <a href="#" className="block hover:text-accent-hover transition-colors duration-200">About Us</a>
              </li>
              <li>
                <a href="#" className="block hover:text-accent-hover transition-colors duration-200">Contact</a>
              </li>
              <li>
                <a href="#" className="block hover:text-accent-hover transition-colors duration-200">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="block hover:text-accent-hover transition-colors duration-200">Terms & Conditions</a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-accent">Contact</h3>
            <ul className="mt-2 text-sm">
              <li>123 3D Print St., Tech City, TX 75001</li>
              <li>Email: <a href="mailto:contact@3dprintdungeon.com" className="hover:text-accent-hover">contact@3dprintdungeon.com</a></li>
              <li>Phone: +1 (800) 123-4567</li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-accent">Follow Us</h3>
            <div className="flex justify-center sm:justify-start space-x-4 text-xl mt-2">
              <a href="#" className="hover:text-accent-hover transition-colors duration-200" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-accent-hover transition-colors duration-200" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-accent-hover transition-colors duration-200" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-accent-hover transition-colors duration-200" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription Section */}
        <div className="bg-accent-light p-6 rounded-lg text-center mt-8">
          <h3 className="text-xl font-semibold text-accent">Subscribe to Our Newsletter</h3>
          <p className="text-sm mt-2">Stay updated with the latest news and offers from 3D Print Dungeon.</p>
          <form className="mt-4 flex justify-center items-center space-x-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-2 rounded-lg border border-txt-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent w-2/3 sm:w-1/2"
            />
            <button 
              type="submit"
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors duration-300"
            >
              <AiOutlineMail className="inline mr-2 text-lg" />
              Subscribe
            </button>
          </form>
        </div>

        {/* Footer Bottom Section */}
        <div className="border-t border-txt-secondary mt-8 pt-6 text-center text-sm">
          <p>&copy; 2025 3D Print Dungeon — All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};
