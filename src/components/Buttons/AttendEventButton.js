import React, {useContext, useState} from 'react';
import Button from "react-bootstrap/Button";
import FirebaseContext from "../Firebase/context";
import UilCheck from "@iconscout/react-unicons/icons/uil-check";
import UilUserCheck from "@iconscout/react-unicons/icons/uil-user-check";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import * as ROUTES from "../../constants/routes";

/**
 *  Button to Attend/Unattend Events as user.
 */
const AttendEventButton = ({eventId, isAttending, hostId}) => {
    const firebase = useContext(FirebaseContext);
    const session = useRecoilValue(sessionStore);
    const [attending, setAttending] = useState(isAttending);

    let counter = 0;

    const handleClick = () => {
        if (!attending) {
            firebase.attendEvent(eventId, session.user.id)
                .then(
                    () => {
                        if (counter < 1) {
                            firebase.sendNotification(session.user, hostId, "attendingEvent", ROUTES.EVENTS + '/' + eventId)
                                .catch(error => console.log(error))
                        }
                        counter++;
                        setAttending(true)
                    }
                )
        } else {
            firebase.unattendEvent(eventId, session.user.id)
                .then(
                    () => setAttending(false)
                )
        }
    }

    const btnVariant = attending ? "secondary" : "primary";

    return (
        <Button size={"sm"} variant={btnVariant} onClick={handleClick}>
            {
                attending ?
                    <><UilCheck/> Attending </>
                    :
                    <><UilUserCheck/> Attend </>
            }
        </Button>
    )
};

export default AttendEventButton;