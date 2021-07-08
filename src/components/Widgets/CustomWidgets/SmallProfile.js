import React from "react";
import Image from "react-bootstrap/Image";
import {Link} from "react-router-dom";
import {useRecoilValue} from "recoil";
import UilUserCircle from "@iconscout/react-unicons/icons/uil-user-circle";
import * as ROUTES from "../../../constants/routes";
import sessionStore from "../../../recoil/sessionStore";

/**
 *  Small Profile Widget that appears in left sidebar at the top.
 */
const SmallProfile = props => {

    const user = useRecoilValue(sessionStore).user;

    return (
        <div className={"smallProfile " + props.className}>
            <Image src={user.picture} roundedCircle height="100"/>
            <span className="smallProfileText">{user.name}</span>
            <Link to={ROUTES.USERS + "/" + user.id}><UilUserCircle/> My profile</Link>
        </div>
    );
};

export default SmallProfile;