import React, {useContext, useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import MessageDroplet from "./MessageDroplet";
import WriteMessage from "./WriteMessage";
import FirebaseContext from "../Firebase/context";
import {useRecoilValue} from "recoil/dist";
import {useHistory, useParams} from "react-router-dom";

import _ from "lodash";

import sessionStore from "../../recoil/sessionStore";
import GetMessages from "./GetMessages";
import * as ROUTES from "../../constants/routes";
import messageStore from "../../recoil/messageStore";
import {uuidv4} from "../../constants/timeHelpers";

/**
 *  Main Messages Page.
 *  This component renders regardless of sub-URL as the Messages Page.
 */
const MessageOverview = ({match, ...rest}) => {

    const {userId} = useParams();

    // See if url is pointing to create or read operation.
    const isCreate = match.path.includes("create");
    const isView = match.path.includes("view");

    const threads = useRecoilValue(messageStore).messages.threads;
    const sortedThreads = _.cloneDeep(threads).sort(((a, b) => b.unreadCount - a.unreadCount));

    const firebase = useContext(FirebaseContext);
    const session = useRecoilValue(sessionStore);
    const history = useHistory();

    const [currentUser, setCurrentUser] = useState(userId);


    const sendMessage = message => {
        if (userId && userId !== "") {
            firebase.sendMessage(session.user.id, userId, message).catch(error => console.log(error))
        }
    }

    return (
        <div className={"messages"}>
            <Container>
                <Row className="mt-3">
                    <Col lg={4} className="messageSidebar">
                        {
                            sortedThreads?.length > 0 ? sortedThreads.map(
                                el =>
                                    <MessageDroplet
                                        key={uuidv4()}
                                        user={el}
                                        active={(isCreate && el.id === userId) || (isView && el.id === userId)}
                                        create={isCreate && el.id === userId}
                                        unread={el.unreadCount}
                                        last={el.lastMessage}
                                        onClick={() => {
                                            setCurrentUser(el.id);
                                            history.push(ROUTES.MESSAGES + '/view/' + el.id);
                                        }}
                                    />
                            ) : "No conversations yet."
                        }
                    </Col>
                    <Col lg={8}>
                        {
                            isView || isCreate ? <GetMessages selectedUser={currentUser}/> :
                                <GetMessages user2={threads[0]?.id}/>
                        }
                        <WriteMessage callback={sendMessage}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default MessageOverview;