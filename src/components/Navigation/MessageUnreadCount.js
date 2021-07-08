import React from 'react';
import {useRecoilValue} from "recoil/dist";
import messageStore from "../../recoil/messageStore";

/**
 *  Listener / Observer for the number of Unread Messages (# Overlay on Icon)
 */
const MessageUnreadCount = () => {
    const unreadCount = useRecoilValue(messageStore).messages.unreadCount;

    return (
        unreadCount > 0
        &&
        <div className={"messageUnreadCount"}>
            {unreadCount}
        </div>
    );
};

export default MessageUnreadCount;
