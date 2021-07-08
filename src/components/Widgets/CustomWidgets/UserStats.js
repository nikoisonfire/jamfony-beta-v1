import React from "react";
import UilUsersAlt from "@iconscout/react-unicons/icons/uil-users-alt";
import UilCalender from "@iconscout/react-unicons/icons/uil-calender";
import {formatDate} from "../../../constants/timeHelpers";

/**
 *  User Stat Widget (followers, join date, etc.)
 */
const UserStats = ({className, followers, friends, joined}) => {
    const joinedD = formatDate(joined);

    return (
        <div
            className={"profileSummary sideBarWidget leftSidebarBox sideBarWidget shadow p-3 bg-white rounded " + className}>
            <span className="sideBarWidgetHeading">Your stats</span>
            <ul>
                <li><UilCalender/>joined {joinedD}</li>
                {
                    friends && <li><UilUsersAlt/>{friends} friends</li>
                }
                {
                    followers && <li><UilUsersAlt/>{followers} followers</li>
                }
            </ul>
        </div>
    );
};

export default UserStats;