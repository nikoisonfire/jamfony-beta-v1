import {Link} from "react-router-dom";
import * as ROUTES from "../../../constants/routes";
import React from "react";
import ProfilePicSmall from "../ProfilePicSmall";

/**
 *  Creates a linked profile snippet with user data.
 */
const ProfileSnippet = ({type, user: data}) => {
    const route = type === "band" ? ROUTES.BANDS : ROUTES.USERS;
    return (
        <Link to={route + "/" + data.id}>
            <div className="miniProfileHorizontal">
                <ProfilePicSmall src={data.picture}/>
                <span className="name">{data.name}</span>
            </div>
        </Link>
    );
};

export default ProfileSnippet;