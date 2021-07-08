import React from "react";


import ProfileSnippet from "./ProfileSnippet";

/**
 *  Creates a widget-like box of users (used for People you may know, Band Members, etc.)
 */
const UserSnippet = ({className, heading, users}) => {

    return (
        <div className={"sideBarWidget " + className}>
            <span className="sideBarWidgetHeading">{heading}</span>
            {
                users.map(
                    el => <ProfileSnippet key={el.id} user={el}/>
                )
            }
        </div>
    );
};


export default UserSnippet;