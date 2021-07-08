import React, {useContext, useEffect} from 'react';
import {FirebaseContext} from "../Firebase";
import {useRecoilState, useRecoilValue} from "recoil/dist";
import messageStore from "../../recoil/messageStore";
import sessionStore from "../../recoil/sessionStore";

/**
 * Observes RT Database Message Threads for Change.
 * Used mostly to obtain unread message count for nav-icon.
 */
const MessageObserver = () => {
    const firebase = useContext(FirebaseContext);
    const session = useRecoilValue(sessionStore);
    const [messages, setMessages] = useRecoilState(messageStore);

    const countThreads = threads => {
        let buffer = 0;
        Object.entries(threads).forEach(
            entry => {
                buffer += entry[1].unreadCount;
            }
        );
        return buffer;
    }

    const updateThreads = val => {
        if (val) {
            const messageThreads = Object.values(val);

            setMessages({
                ...messages,
                messages: {
                    threads: messageThreads,
                    unreadCount: countThreads(messageThreads)
                }
            });
        }
    }

    // componentDidMount and Clean up (componentDidUnmount)
    useEffect(() => {
        firebase
            .listenToThreads(session.user.id, updateThreads);

        return () => {
            /** Unlisten on Unmount **/
            firebase.unlistenToThreads(session.user.id);
        }
    }, []);


    return null;
};

export default MessageObserver;
