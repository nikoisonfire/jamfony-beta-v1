import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import BootstrapModalManager from "react-bootstrap/cjs/BootstrapModalManager";
import {FirebaseContext} from "../Firebase";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import {queryCache} from "react-query";
import UploadPictureButton from "../Buttons/UploadPictureButton";
import {uuidv4, validateSocialURLs} from "../../constants/timeHelpers";

import soundcloud from "../../images/icons/soundcloud.png";
import youtube from "../../images/icons/youtube.png";
import vimeo from "../../images/icons/vimeo.png";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import SelectPostAs from "../Forms/SelectPostAs";

/**
 *  Hotfix for Bootstrap bug.
 *  Modal on open creates extra padding on sticky MainNav.
 *  -> this fixes the issue.
 */
export class SubModalManager extends BootstrapModalManager {
    constructor() {
        super();
    }

    setContainerStyle(containerState, container) {

    }

    removeContainerStyle(containerState, container) {

    }
}

/**
 * Modal to write a new Post of any kind.
 */
const NewPostModal = props => {

    const [show, setShow] = useState(props.show);
    const modalType = props.type;

    const handleClose = () => {
        document.body.className = document.body.className.replace("modal-open", "");
        props.resetModal();
        setShow(false);
    };

    return (
        <Modal show={show} onHide={handleClose} manager={new SubModalManager()}>
            <FormFactory type={modalType} closeCallback={handleClose}/>
        </Modal>
    );
};

/**
 *  Factory Pattern to generate a singleton form to post a text / video / etc. post.
 */
const FormFactory = props => {
    const firebase = useContext(FirebaseContext);
    const user = useRecoilValue(sessionStore).user;

    const minCharsText = 10;

    const [error, setError] = useState(null);


    const TextPostForm = props => {
        const [text, setText] = useState("");
        const [poster, setPoster] = useState("");

        /** Form Defaults **/
        const [isValidated, setValidated] = useState(false);
        const [isSubmitted, setSubmitted] = useState(false);
        const [isLoading, setLoading] = useState(false);

        const [imgUrl, setImgUrl] = useState(null);

        const postImgPath = "posts/" + uuidv4();

        const handleChange = event => setText(event.target.value);

        const submitTextPost = event => {
            event.preventDefault();
            setSubmitted(true);

            const cur = event.currentTarget;
            if (cur.checkValidity() === false) {
                event.stopPropagation();
            }

            setValidated(true);

            // Form is valid
            if (cur.checkValidity() === true && text !== "" && text.length >= minCharsText) {
                // Set Spinner
                setLoading(true);

                const posterData = user.id === poster ? user : user.bands?.find(x => x.id === poster);
                const userOrBand = user.id === poster ? "user" : "band";

                const postData = {
                    text: text,
                    comments: [],
                    commenters: [],
                    cover: imgUrl || "",
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
                        queryCache.invalidateQueries(["posts", user.id]);
                        queryCache.invalidateQueries(["posts", "newest"]);
                    })
                    .catch(error => setError(error));

                setLoading(false);
                props.closeCallback();
            }
        };
        return (
            <Form noValidate validated={isValidated} onSubmit={submitTextPost}>
                <Modal.Header closeButton>
                    <Modal.Title>Share a text post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        error ?
                            <Alert variant="danger">
                                There was an error trying to process your request. Please reload the page and try again.
                            </Alert> : null
                    }
                    {
                        isSubmitted && poster === "" ?
                            <Alert variant="danger">
                                Please choose a user or band to post
                            </Alert> : null
                    }
                    <Form.Group controlId="postAs">
                        <Form.Label srOnly>Post as</Form.Label>
                        <SelectPostAs
                            callback={(val) => setPoster(val)}
                            user={user}
                        />
                    </Form.Group>

                    <Form.Group controlId="newPostText">
                        <Form.Label srOnly>Create a text Post</Form.Label>
                        <Form.Control
                            as="textarea"
                            type="textarea"
                            name="postText"
                            required
                            minLength={minCharsText}
                            onChange={handleChange}
                            placeholder="Write something nice..."/>
                        <Form.Control.Feedback type="invalid">
                            Please make sure your post is at least {minCharsText} characters long. <br/> You're just
                            &nbsp;{minCharsText - text.length} characters away!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="newPostCover">
                        <div className="uploadPicturePost">

                            <UploadPictureButton path={postImgPath} callback={setImgUrl}/>
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" variant="primary" block>
                        {
                            isLoading ?
                                <Spinner animation="border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </Spinner> : "Post"
                        }
                    </Button>
                </Modal.Footer>

            </Form>
        );
    };

    const YouTubePostForm = props => {
        const [form, setFields] = useState({});
        const [isValidated, setValidated] = useState(false);
        const [isLoading, setLoading] = useState(false);

        const [poster, setPoster] = useState("");
        const [isSubmitted, setSubmitted] = useState(false);

        const handleChange = event => setFields({...form, [event.target.name]: event.target.value});

        const submitTextPost = event => {
            event.preventDefault();
            setSubmitted(true);

            const cur = event.currentTarget;
            if (cur.checkValidity() === false) {
                event.stopPropagation();
            }

            //setValidated(true);
            const validUrl = validateSocialURLs({
                link: form.link
            });

            // Form is valid
            if (cur.checkValidity() === true && form.link !== "" && validUrl) {
                // Set Spinner
                setLoading(true);

                const posterData = user.id === poster ? user : user.bands?.find(x => x.id === poster);
                const userOrBand = user.id === poster ? "user" : "band";

                const postData = {
                    text: form.postText || "",
                    link: form.link,
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
                        queryCache.invalidateQueries(["posts", user.id]);
                        queryCache.invalidateQueries(["posts", "newest"]);
                    })
                    .catch(error => setError(error));

                setLoading(false);
                props.closeCallback();
            }
        };
        return (
            <Form noValidate validated={isValidated} onSubmit={submitTextPost}>
                <Modal.Header closeButton>
                    <Modal.Title>Share a media post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        error ?
                            <Alert variant="danger">
                                There was an error trying to process your request. Please reload the page and try again.
                            </Alert> : null
                    }
                    <Form.Group controlId="newPostYT">
                        <Form.Label srOnly>Share a Youtube Video or SoundCloud Link</Form.Label>
                        <Form.Text>Supported media:
                            <div className="supportedMedia">
                                <img src={youtube} height={50}/>
                                <img src={soundcloud} height={50}/>
                                <img src={vimeo} height={50}/>
                            </div>
                        </Form.Text>
                        {
                            isSubmitted &&
                            poster === "" &&
                            <Alert variant="danger">
                                Please choose a user or band to post
                            </Alert>
                        }
                        {
                            isSubmitted && !validateSocialURLs({link: form.link}) &&
                            <Alert variant="danger">
                                Please make sure the link is correct
                            </Alert>
                        }
                        <Form.Group controlId="postAs">
                            <Form.Label srOnly>Post as</Form.Label>
                            <SelectPostAs
                                callback={(val) => setPoster(val)}
                                user={user}
                            />
                        </Form.Group>
                        <Form.Control
                            as="input"
                            type="url"
                            name="link"
                            isInvalid={isSubmitted && !validateSocialURLs({link: form.link})}
                            onChange={handleChange}
                            required
                            placeholder="Media Link... (http://....)"/>
                    </Form.Group>
                    <Form.Group controlId="newPostYTText">
                        <Form.Label srOnly>Add Text (optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            type="textarea"
                            name="postText"
                            minLength={minCharsText}
                            onChange={handleChange}
                            placeholder="Write something nice... (optional)"/>
                        <Form.Control.Feedback type="invalid">
                            Please make sure your post is at least {minCharsText} characters long. <br/> You're just
                            &nbsp;{minCharsText - form.postText?.length} characters away!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" variant="primary" block>
                        {
                            isLoading ?
                                <Spinner animation="border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </Spinner> : "Post"
                        }
                    </Button>
                </Modal.Footer>

            </Form>
        );
    };
    switch (props.type) {
        case 'TEXT_POST':
            return <TextPostForm closeCallback={props.closeCallback}/>;

        case 'YOUTUBE_POST':
            return <YouTubePostForm closeCallback={props.closeCallback}/>;
        /*
                        case 'EVENT':
                            return <FeedbackModal {...props}/>;

                        case 'FIND_MUSICIANS':
                            return <BoxDetailsModal {...props}/>;

                        case 'CLASSIFIED':
                            return <BoxDetailsModal {...props}/>;
                */
        default:
            return null;
    }
};

export default NewPostModal;