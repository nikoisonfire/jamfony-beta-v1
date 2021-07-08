import React, {Fragment, useContext, useState} from 'react';
import SelectPostAs from "../Forms/SelectPostAs";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import Button from "react-bootstrap/Button";
import {SubModalManager} from "./NewPostModal";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {queryCache} from "react-query";
import {useHistory} from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import {FirebaseContext} from "../Firebase";
import * as ROUTES from "../../constants/routes";
import UilShareAlt from "@iconscout/react-unicons/icons/uil-share-alt";

/**
 *  Modal to post an Event to a user/band profile.
 */
const PostEventToWall = ({eventData, eventId, callback}) => {
    const session = useRecoilValue(sessionStore);
    const [poster, setPoster] = useState(session.user.id);
    const [validated, setValidated] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const firebase = useContext(FirebaseContext);

    const [show, setShow] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [text, setText] = useState("");

    const history = useHistory();

    const submitForm = event => {
        event.preventDefault();
        setSubmitted(true);
        setDisabled(true);

        if (poster === "" || poster.length < 1) {
            return null;
        }
        if (text !== "" && text.length < 10) {
            return null;
        }

        // Form is valid
        if (poster !== "") {
            // Set Spinner
            setLoading(true);

            const posterData = session.user.id === poster ? session.user : session.user.bands?.find(x => x.id === poster);
            const userOrBand = session.user.id === poster ? "user" : "band";

            const postData = {
                text: text,
                event: {
                    ...eventData,
                    id: eventId
                },
                comments: [],
                commenters: [],
                likes: [],
                page: userOrBand,
                user: {
                    id: posterData.id,
                    name: posterData.name,
                    picture: posterData.picture
                }
            };

            firebase.createPost(postData)
                .then(() => {
                    queryCache.invalidateQueries(["posts", session.user.id]);
                    queryCache.invalidateQueries(["posts", "newest"]);
                    handleClose();
                    history.push(ROUTES.FEED);
                })
                .catch(error => {
                    setError(error);
                    setDisabled(false);
                });

            setLoading(false);
        }
    }

    const handleClose = () => {
        setShow(false);
        document.body.className = document.body.className.replace("modal-open", "");
    }

    return (
        <Fragment>
            <Button variant="outline-info" size="sm" onClick={() => setShow(true)}>
                <UilShareAlt/> Share as post
            </Button>
            <Form onSubmit={submitForm} validated={validated} noValidate>
                {error && <Alert variant={"danger"}>
                    Error: {error.code}
                </Alert>}
                <Modal show={show} onHide={handleClose} manager={new SubModalManager()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Share as post</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {
                            submitted && poster === ""
                            && <Alert variant="danger">
                                Please choose a user or band to post from.
                            </Alert>
                        }
                        {
                            submitted && text !== "" && text.length < 10
                            && <Alert variant="danger">
                                Please make sure your post is at least 10 characters long. <br/> You're just
                                &nbsp;{10 - text.length} characters away!
                            </Alert>
                        }
                        <SelectPostAs
                            callback={setPoster}
                            user={session.user}
                            defaultVal={session.user}
                        />
                        <Form.Group controlId="eventPostText" className="pt-2">
                            <Form.Label srOnly>Add Text (optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                type="textarea"
                                name="postText"
                                minLength={10}
                                onChange={e => setText(e.target.value)}
                                placeholder="Write something nice... (optional)"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"outline-secondary"} onClick={handleClose}>Close
                        </Button>
                        <Button disabled={disabled} onClick={submitForm}>
                            Share as post
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Form>
        </Fragment>

    );
};

export default PostEventToWall;
