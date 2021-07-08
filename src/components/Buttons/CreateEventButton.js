import React from "react";
import Button from "react-bootstrap/Button";
import {useHistory} from "react-router-dom";

import * as ROUTES from "../../constants/routes";
import UilCalendarAlt from "@iconscout/react-unicons/icons/uil-calendar-alt";

/**
 *  (Dumb) Button to redirect to "Create Event" Page.
 */
const CreateEventButton = props => {
    const history = useHistory();

    return (
        <div className={"createPostButton " + props.className}>
            <Button onClick={() => history.push(ROUTES.EVENTS + "/create")}>
                <UilCalendarAlt/>
                &nbsp; Create a new Event
            </Button>
        </div>
    );
};


export default CreateEventButton;