import React from "react";

/**
 *  Creates a large profile picture
 */
const ProfilePicLarge = ({src}) => {

    return (
        <div className="profilePicLarge" alt="Profile Picture" style={{backgroundImage: `url(${src})`}}>
            &nbsp;
        </div>
    );
};

export default ProfilePicLarge;