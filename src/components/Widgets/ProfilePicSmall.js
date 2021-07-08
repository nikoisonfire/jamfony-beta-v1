import React from "react";
import Image from "react-bootstrap/Image";

/**
 *  Creates a small Profile Picture from Source (used for snippets)
 */
const ProfilePicSmall = ({src}) => {

    return (
        <Image roundedCircle src={src} className="profilePicSmall"/>
    );
};

export default ProfilePicSmall;