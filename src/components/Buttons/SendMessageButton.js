import React, {useContext} from 'react';
import UilEnvelopeAdd from "@iconscout/react-unicons/icons/uil-envelope-add";
import Button from "react-bootstrap/Button";
import {useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import FirebaseContext from "../Firebase/context";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";

/**
 *  Button to send a message to a friend from their profile.
 */
const SendMessageButton = (props) => {
    const history = useHistory();
    const firebase = useContext(FirebaseContext);
    const session = useRecoilValue(sessionStore);

    const createThreadAndRedirect = () => {
        firebase.createMessageThread(session.user, props.to)
            .then(() =>
                history.push(ROUTES.MESSAGES + "/create/" + props.to.id)
            ).catch(error => console.log(error))
    }

    return (
        <Button
            variant="primary"
            block
            className={props.className}
            onClick={createThreadAndRedirect}
        >
            <UilEnvelopeAdd/> Send Message
        </Button>
    )
};

export default SendMessageButton;