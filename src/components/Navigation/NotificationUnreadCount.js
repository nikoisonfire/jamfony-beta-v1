import React, {useContext, useEffect, useState} from 'react';
import {useRecoilValue} from "recoil/dist";
import {FirebaseContext} from "../Firebase";
import sessionStore from "../../recoil/sessionStore";

/**
 *  Listener / Observer for unread Notifications. (shows in MainNav)
 */
const NotificationUnreadCount = () => {
    const [notCount, setNotCount] = useState(0);
    const firebase = useContext(FirebaseContext);
    const session = useRecoilValue(sessionStore);

    const updateCount = val => {
        if (val) {
            setNotCount(val.unreadCount);
        }
    }

    // componentDidMount and Clean up (componentDidUnmount)
    useEffect(() => {
        firebase
            .listenToNotificationCount(session.user.id, updateCount);

        return () => {
            /** Unlisten on Unmount **/
            firebase.unlistenToNotificationCount(session.user.id);
        }
    }, []);

    return (
        notCount > 0
        &&
        <div className={"messageUnreadCount"}>
            {notCount}
        </div>
    );
};

export default NotificationUnreadCount;
