import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button";
import UilUserPlus from "@iconscout/react-unicons/icons/uil-user-plus";
import UilCheck from "@iconscout/react-unicons/icons/uil-check";
import {FirebaseContext} from "../Firebase";
import * as ROUTES from "../../constants/routes";
import UilSmile from "@iconscout/react-unicons/icons/uil-smile";
import {UilFrown} from "@iconscout/react-unicons";
import Dropdown from "react-bootstrap/Dropdown";
import {queryCache} from "react-query";

/**
 * Button for Add Friend / You are friends / Unfriend
 */
const FriendsButton = props => {
    const firebase = useContext(FirebaseContext);
    const {
        from,
        to,
        isFriends,
        isPending
    } = props;

    const [pending, setPending] = useState(isPending);
    const [friends, setFriends] = useState(isFriends);

    const showUnfriend = e => {
        return e.target.value = "Test";
    }

    const addFriend = () => {
        firebase.sendFriendRequest(from.id, to)
            .then(() => {
                firebase.sendNotification(from, to, "addFriend", ROUTES.USERS + "/" + from.id).catch(error => console.log((error)))
                setPending(true);
            }).catch(error => console.log(error))
    };

    const removeFriend = () => {
        firebase.removeFriend(from.id, to)
            .then(() => {
                queryCache.invalidateQueries(["users", to])
                setFriends(false)
            })
            .catch(error => console.log(error))
    }

    return (
        <>
            <div className="friendsButton">
                {friends ?
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-info" size="sm">
                            <UilSmile/> You are friends!
                        </Dropdown.Toggle>
                        <Dropdown.Menu alignRight className="w-100">
                            <Dropdown.Item variant="info" eventKey="1"
                                           onClick={removeFriend}><UilFrown/> Unfriend</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown> :
                    <Button
                        variant={pending ? "success" : "info"}
                        disabled={pending}
                        size={"sm"}
                        onClick={addFriend}
                    >
                        {pending ? <><UilCheck/> Request sent </> : <><UilUserPlus/> Add friend </>}
                    </Button>}
            </div>
        </>
    )
};

export default FriendsButton;