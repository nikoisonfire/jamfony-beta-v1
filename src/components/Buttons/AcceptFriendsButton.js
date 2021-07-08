import React, {Fragment, useContext, useState} from 'react';
import Button from "react-bootstrap/Button";
import FirebaseContext from "../Firebase/context";
import * as ROUTES from "../../constants/routes";

const AcceptFriendsButton = (props) => {
    const {
        size,
        from,
        to,
        callback
    } = props;

    const firebase = useContext(FirebaseContext);
    const [submitted, setSubmitted] = useState(false);

    const acceptFriendRequest = () => {
        callback();
        firebase.acceptFriendRequest(from.id, to)
            .then(
                () => {
                    firebase.sendNotification({
                        id: from.id,
                        picture: from.picture,
                        name: from.name
                    }, to, "acceptedFriend", ROUTES.USERS + "/" + from.id)
                    setSubmitted(true);
                    callback();
                }
            )
            .catch(error => console.log(error))
    }

    const denyFriendRequest = () => {
        firebase.denyFriendRequest(from.id, to)
            .then(
                () => {
                    firebase.sendNotification({
                        id: from.id,
                        picture: from.picture,
                        name: from.name
                    }, to, "deniedFriend", ROUTES.FEED)
                        .catch(error => console.log(error))
                    setSubmitted(true);
                    callback();
                }
            )
            .catch(error => console.log(error))
    }

    return (
        <Fragment>
            <Button
                size={size}
                onClick={acceptFriendRequest}
                disabled={submitted}
            >
                Accept
            </Button>
            <Button
                size={size}
                onClick={denyFriendRequest}
                disabled={submitted}
                variant={"outline-secondary"}
            >
                Deny
            </Button>
        </Fragment>
    )
};

export default AcceptFriendsButton;