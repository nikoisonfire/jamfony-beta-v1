import React from "react";
import Button from "react-bootstrap/Button";
import {useHistory} from "react-router-dom";
import UilMegaphone from "@iconscout/react-unicons/icons/uil-megaphone";

import * as ROUTES from "../../constants/routes";

/**
 *  (Dumb) Button to redirect to "Create Band" Page.
 */
const CreateBandButton = props => {
    const history = useHistory();

    return (
        <div className={"createPostButton " + props.className}>
            <Button onClick={() => history.push(ROUTES.BANDS + "/create")}>
                <UilMegaphone/>
                &nbsp; Create a new Band
            </Button>
        </div>
    );
};


export default CreateBandButton;