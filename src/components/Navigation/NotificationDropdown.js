import React, {useContext, useEffect, useRef, useState} from 'react';
import Overlay from "react-bootstrap/Overlay";
import Popover from "react-bootstrap/Popover";
import Button from "react-bootstrap/Button";
import UilBell from "@iconscout/react-unicons/icons/uil-bell";
import FirebaseContext from "../Firebase/context";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";

import {Link} from "react-router-dom";
import Image from "react-bootstrap/Image";
import options from "../../constants/options";

import _ from "lodash";
import AcceptFriendsButton from "../Buttons/AcceptFriendsButton";
import {timeSince, uuidv4} from "../../constants/timeHelpers";
import UilClock from "@iconscout/react-unicons/icons/uil-clock";
import NotificationUnreadCount from "./NotificationUnreadCount";

/**
 *  Notification Dropdown in MainNav.
 */
const NotificationDropdown = (props) => {
    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);
    const ref = useRef(null);

    const firebase = useContext(FirebaseContext);
    const session = useRecoilValue(sessionStore);

    const handleClick = (event) => {
        setShow(oldVal => !oldVal);
        setTarget(event.target);
        firebase.resetNotificationCount(session.user.id).catch(error => console.log(error));
    };

    const [userNotifications, setUserNotifications] = useState({});

    const updateNotifications = val => {
        const buffer = [];
        if (val) {
            Object.entries(val).map(
                entry => buffer.push({key: entry[0], values: entry[1]})
            )
            setUserNotifications(_.reverse(buffer));
        }
    }

    const removeNotification = key => {
        firebase.removeNotification(session.user.id, key);
        setShow(false);
    }

    useEffect(() => {
        firebase.getNotifications(session.user.id)
            .then(snapshot => updateNotifications(snapshot.val()));
    }, [show]);


    return (
        <div className={"notificationDropdown position-relative"}>
            <Button variant={"link"} onClick={handleClick}><UilBell size={props.iconSize}/></Button>
            <NotificationUnreadCount/>
            <Overlay
                show={show}
                target={target}
                placement="bottom"
                container={ref.current}
                containerPadding={20}
                rootClose={true}
                onHide={handleClick}
            >
                <Popover id="popover-contained">
                    <Popover.Title as="h3">
                        <UilBell/> Notifications</Popover.Title>
                    <Popover.Content>
                        {
                            !_.isEmpty(userNotifications) ? userNotifications.map(
                                (entry, key) => {
                                    return <Notification
                                        data={entry.values}
                                        key={uuidv4()}
                                        onRemove={() => removeNotification(entry.key)}
                                    />
                                }
                                ) :
                                <div className={"noNotification"}>
                                    No new notifications
                                </div>
                        }
                    </Popover.Content>
                </Popover>
            </Overlay>
        </div>
    );
};

/**
 *  Single Notification Component.
 */
const Notification = props => {
    const session = useRecoilValue(sessionStore);

    const {
        id,
        name,
        picture,
        action,
        created,
        redirect,
    } = props.data;


    const actionInfo = options.notificationActions.find(x => x.action === action);

    const redirectAndDelete = () => {
        props.onRemove();
    }

    return (
        <div className={"notification "}>
            <Link to={redirect} onClick={redirectAndDelete}>
                <Image roundedCircle src={picture} loading={"lazy"}/>
                <span className={"name"}>{name}</span>
                <span className={"action"}>
                    {actionInfo.icon} {actionInfo.text}
                </span>
            </Link>
            <div className={"actionButton"}>
                {
                    action === "addFriend" ?
                        <>
                            <AcceptFriendsButton
                                size={"sm"}
                                from={session.user}
                                to={id}
                                callback={props.onRemove}
                            />
                        </> :
                        <span className={"timeSince"}>
                            <UilClock size="11"/> {timeSince(created, true)} ago
                        </span>
                }
            </div>

        </div>
    );
};

export default NotificationDropdown;