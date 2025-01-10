const Footer = () => {
    return (
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
        <p>
          <a
            href="/privacy-policy"
            className="text-blue-400 hover:underline"
          >
            Privacy Policy
          </a>{' '}
          |{' '}
          <a
            href="/terms-of-service"
            className="text-blue-400 hover:underline"
          >
            Terms of Service
          </a>
        </p>
      </div>
    );
  };
  
  export default Footer;
  