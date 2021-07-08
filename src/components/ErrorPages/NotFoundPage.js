import React from "react";
import Button from "react-bootstrap/Button";
import {useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";

/**
 * Like a 404 Page, but for more specific "not founds" like wrong ID in url ("User not found")
 */
const NotFoundPage = props => {
    const history = useHistory();

    const redirectToHomepage = () => history.push(ROUTES.FEED);

    return (
        <div className="errorPage">
            <span className="emoji" role="img" aria-label="sad boi">☹️</span>
            <h2>{props.title} not found</h2>
            <span>You may want to head back to the homepage.
            <br/>If you think something is broken, <a href="mailto: error@jamfony.com">report a problem.</a></span>
            <Button onClick={redirectToHomepage}>Go to home</Button>
        </div>
    );
};

export default NotFoundPage;