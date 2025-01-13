import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'; // Import social icons (optional)

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-10">
      <div className="container mx-auto text-center">
        {/* Copyright Section */}
        <p className="text-sm mb-4">
          &copy; {new Date().getFullYear()} MyApp. All rights reserved.
        </p>

        {/* Social Media Links (optional) */}
        <div className="flex justify-center space-x-6 mb-4">
          <a href="https://facebook.com" className="text-blue-500 hover:text-blue-700" aria-label="Facebook">
            <FaFacebook size={24} />
          </a>
          <a href="https://twitter.com" className="text-blue-400 hover:text-blue-600" aria-label="Twitter">
            <FaTwitter size={24} />
          </a>
          <a href="https://linkedin.com" className="text-blue-600 hover:text-blue-800" aria-label="LinkedIn">
            <FaLinkedin size={24} />
          </a>
          <a href="https://instagram.com" className="text-pink-500 hover:text-pink-700" aria-label="Instagram">
            <FaInstagram size={24} />
          </a>
        </div>

        {/* Links Section */}
        <div className="text-sm">
          <a
            href="/privacy-policy"
            className="text-blue-400 hover:underline mr-4"
            aria-label="Privacy Policy"
          >
            Privacy Policy
          </a>
          <span>|</span>
          <a
            href="/terms-of-service"
            className="text-blue-400 hover:underline ml-4"
            aria-label="Terms of Service"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
