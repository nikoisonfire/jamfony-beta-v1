import React from "react";
import Button from "react-bootstrap/Button";
import {useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";

/**
 * Page that displays when a user is forbidden to access a feature.
 * */
const ForbiddenPage = () => {
    const history = useHistory();

    const redirectToHomepage = () => history.push(ROUTES.FEED);

    return (
        <div className="errorPage">
            <span className="emoji" role="img" aria-label="freeze face">🚷</span>
            <h2>You are not allowed on this page.</h2>
            <span>You may want to head back to the homepage.
            <br/>If you think something is broken, <a href="mailto: error@jamfony.com">report a problem.</a></span>
            <Button onClick={redirectToHomepage}>Go to home</Button>
        </div>);
};

export default ForbiddenPage;