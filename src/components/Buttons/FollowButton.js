import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button";
import UilUserPlus from "@iconscout/react-unicons/icons/uil-user-plus";
import UilCheck from "@iconscout/react-unicons/icons/uil-check";
import {FirebaseContext} from "../Firebase";
import * as ROUTES from "../../constants/routes";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";

/**
 *  Button to Follow/Unfollow a band.
 */
const FollowButton = props => {
    const firebase = useContext(FirebaseContext);
    const user = useRecoilValue(sessionStore).user;
    const {
        bandId,
        isFollowed
    } = props;

    const [followed, setFollowed] = useState(isFollowed);
    const [loading, setLoading] = useState(false);
    const [notificationLocked, setNotificationLocked] = useState(false);

    const followBand = async () => {
        setLoading(true);
        const members = await firebase.getBandMembers(bandId);
        firebase.followBand(user.id, bandId)
            .then(() => {
                members.forEach(
                    el => {
                        if (!el.includes(user.id) && !notificationLocked)
                            firebase.sendNotification({
                                id: user.id,
                                name: user.name,
                                picture: user.picture
                            }, el, "followedBand", ROUTES.USERS + "/" + user.id)
                                .then(() => setNotificationLocked(true))
                                .catch(error => console.log(error))
                    }
                );
                setFollowed(true);
                setLoading(false);
            });
    };

    const unfollowBand = () => {
        setLoading(true);
        firebase.unfollowBand(user.id, bandId)
            .then(() => {
                setFollowed(false);
                setLoading(false);
            })
            .catch(error => console.log(error));
    };

    const handleClick = () => {
        if (followed)
            unfollowBand()
        else
            followBand()
    }

    return (
        <>
            <div className="friendsButton">
                <Button
                    variant={isFollowed ? "outline-info" : "info"}
                    size={"sm"}
                    disabled={loading}
                    onClick={handleClick}
                >
                    {followed ? <><UilCheck/> Unfollow </> : <><UilUserPlus/> Follow </>}
                </Button>
            </div>
        </>
    )
};

export default FollowButton;