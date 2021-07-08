import React from "react";
import {Link} from "react-router-dom";

/**
 * Footer Component
 */
const Footer = () => (
    <footer className="homeFooter">
        &copy; 2020 - Jamfony.com - All rights reserved - <Link to={'/privacy'}>Privacy Policy</Link> - <Link
        to={'/termsofuse'}>Terms of Use</Link>
    </footer>
);

export default Footer;