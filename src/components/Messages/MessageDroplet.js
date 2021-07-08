import ProfilePicSmall from "../Widgets/ProfilePicSmall";
import UilClock from "@iconscout/react-unicons/icons/uil-clock";
import UilEnvelopeOpen from "@iconscout/react-unicons/icons/uil-envelope-open";
import React, {useState} from "react";
import UilEnvelope from "@iconscout/react-unicons/icons/uil-envelope";
import UilArrowCircleRight from "@iconscout/react-unicons/icons/uil-arrow-circle-right";
import {formatMsgTime} from "../../constants/timeHelpers";

/**
 *  "Conversation" Sidebar widgets for conversations with users.
 *  Shows name and unread message count (passed as prop by parent component)
 */
const MessageDroplet = ({active, create, last, onClick, unread, user}) => {

    const [unreadNr, setUnread] = useState(unread);
    const [lastMsg, setLastMsg] = useState(last);

    const activeClass = active ? "active" : "";

    const handleClick = () => {
        onClick();
        setUnread(0);
    }

    return (
        <div className={"messageDroplet " + activeClass} onClick={handleClick}>
            <ProfilePicSmall src={user?.picture}/>
            <div className="messageAuthor">
                <div className="messageFrom">
                    {user?.name}
                </div>
                <div className="messageTimestamp">
                    <UilClock size="11"/>
                    <span>{formatMsgTime(lastMsg)}</span>
                </div>
            </div>
            <div className="unreadCount">
                {unreadNr} {create ? <UilArrowCircleRight/> : unreadNr > 0 ? <UilEnvelope/> :
                <UilEnvelopeOpen color="gray"/>}
            </div>
        </div>
    );
}

export default MessageDroplet;