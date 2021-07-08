import React from "react";
import {Link} from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import UilHome from "@iconscout/react-unicons/icons/uil-home";
import UilCalendarAlt from "@iconscout/react-unicons/icons/uil-calendar-alt";
import UilPlayCircle from "@iconscout/react-unicons/icons/uil-play-circle";
import * as ROUTES from "../../constants/routes";
import UilMegaphone from "@iconscout/react-unicons/icons/uil-megaphone";


/**
 *  SubNavigation that's usually in the sidebar.
 */
const SubNav = props => {
    return (
        <div className={"subNav " + props.className}>
            <Nav className="flex-column text-left">
                <Link to={ROUTES.FEED}>
                    <UilHome/> Home
                </Link>
                <Link to={ROUTES.EVENTS}>
                    <UilCalendarAlt/> Events
                </Link>
                <Link to={ROUTES.USERS}>
                    <UilPlayCircle/> Find Musicians
                </Link>
                <Link to={ROUTES.BANDS}>
                    <UilMegaphone/> Bands
                </Link>
            </Nav>
        </div>
    );
};

export default SubNav;