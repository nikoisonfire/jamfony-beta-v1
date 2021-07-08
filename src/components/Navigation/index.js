import React from "react";
import {Link} from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import UilHome from "@iconscout/react-unicons/icons/uil-home";
import ProfileDropdown from "./ProfileDropdown";
import UilEnvelopes from "@iconscout/react-unicons/icons/uil-envelopes";

import * as ROUTES from "../../constants/routes";
import UilMegaphone from "@iconscout/react-unicons/icons/uil-megaphone";
import NotificationDropdown from "./NotificationDropdown";
import MessageUnreadCount from "./MessageUnreadCount";
import SearchBar from "../Search/SearchBar";

/**
 *  Main Navigation (Header) Component.
 */
const MainNav = () => {
    const iconSize = 24;

    // TODO: Refactor notifications to dropdown menu
    return (
        <Navbar className="mainNav sticky-top justify-content-between" expand="md">
            <Navbar>
                <Nav>
                    <Link to={ROUTES.FEED}>
                        <UilHome size={iconSize}/>
                    </Link>
                    <Link to={ROUTES.MESSAGES} className="position-relative">
                        <UilEnvelopes size={iconSize}/>
                        <MessageUnreadCount/>
                    </Link>
                    <NotificationDropdown iconSize={iconSize}/>
                    <Link to={ROUTES.BANDS} alt="Bands">
                        <UilMegaphone size={iconSize}/>
                    </Link>
                </Nav>
            </Navbar>
            <SearchBar/>
            <Navbar>
                <Navbar.Text>
                    <ProfileDropdown/>
                </Navbar.Text>
            </Navbar>

        </Navbar>
    );
};

export default MainNav;