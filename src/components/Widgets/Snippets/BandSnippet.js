import {Link} from "react-router-dom";
import * as ROUTES from "../../../constants/routes";
import React from "react";
import ProfilePicSmall from "../ProfilePicSmall";

/**
 *  Like <UserSnippet /> but for bands
 */
const BandSnippet = ({band: data}) => {

    return (
        <Link to={ROUTES.BANDS + "/" + data.id}>
            <div className="miniProfileHorizontal">
                <ProfilePicSmall src={data.picture}/>
                <span className="name">{data.name}</span>
            </div>
        </Link>
    );
};

export default BandSnippet;