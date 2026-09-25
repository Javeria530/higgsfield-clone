import React from "react";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand"><span className="footer-mark">J</span><strong>Javeria's studio</strong><span className="footer-divider" /><span className="footer-caption">Javeria's workspace</span></div>
        <div className="footer-contact" id="contact"><span>hello@javeria.studio</span><span>Chiniot, Punjab, Pakistan</span><span>+92 303 1233445</span></div>
        <span className="footer-copy">© {new Date().getFullYear()} Javeria's studio</span>
      </div>
    </footer>
  );
};

export default Footer;
