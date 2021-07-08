import React, {useContext, useEffect, useState} from 'react';
import {FirebaseContext} from "../Firebase";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import Message from "./Message";
import {uuidv4} from "../../constants/timeHelpers";

/**
 *  Loader for a conversation (chat) between users.
 *  Basically the right hand page once you click on a <MessageDroplet />.
 */
const GetMessages = (props) => {
    const {
        selectedUser
    } = props;

    const session = useRecoilValue(sessionStore);
    const firebase = useContext(FirebaseContext);

    const [messages, setMessages] = useState([]);

    const updateMessages = val => {
        // Reset unread Count upon view
        firebase.readMessages(session.user.id, selectedUser).catch(error => console.log(error));
        // Set local state (view) to messages
        setMessages(Object.values(val));
    }

    useEffect(() => {
        setMessages([]);
        firebase.getMessages(session.user.id, selectedUser, updateMessages);

        return () => {
            firebase.detachMessageListener(session.user.id, selectedUser);
        };
    }, [selectedUser]);

    useEffect(() => {
        const objDiv = document.getElementById("getMessages");
        objDiv.scrollTop = objDiv.scrollHeight;
    }, [messages]);


    return (
        <div className={"getMessages"} id={"getMessages"}>
            {
                messages.map(
                    el => <Message
                        key={uuidv4()}
                        msg={el}/>
                )
            }
        </div>
    );
};

export default GetMessages;