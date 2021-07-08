import React, {useContext, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {SubModalManager} from "./NewPostModal";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import UilGlobe from "@iconscout/react-unicons/icons/uil-globe";
import icon_sc from "../../images/icons/soundcloud.png";
import icon_spotify from "../../images/icons/spotify.png";
import icon_yt from "../../images/icons/youtube.png";
import icon_applem from "../../images/icons/apple.png";
import icon_bc from "../../images/icons/bandcamp.png";
import Alert from "react-bootstrap/Alert";
import {validateSocialURLs} from "../../constants/timeHelpers";
import Loader from "../Widgets/Loader";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import FirebaseContext from "../Firebase/context";
import {queryCache} from "react-query";

/**
 *  Modal to Add Social Links to User/Band Profile.
 *  This is called by the <LinkSnippet /> Component.
 */
const AddSocialLink = props => {
    const {
        isUser,
        id,
        callback
    } = props;

    const firebase = useContext(FirebaseContext);

    let data;
    if (!isUser) {
        data = queryCache.getQueryData(["bands", id])
    } else {
        data = queryCache.getQueryData(["users", id])
    }

    const [show, setShow] = useState(true);
    const [form, setForm] = useState({
        ...data.links
    });
    const [isValidated, setValidated] = useState(false);
    const [isSubmitted, setSubmitted] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const [error, setError] = useState(null);


    const handleClose = () => {
        setShow(false);
        document.body.className = document.body.className.replace("modal-open", "");
        callback();
    };
    const handleChange = event => setForm({...form, [event.target.name]: event.target.value});
    const submitSocialLinks = event => {
        event.preventDefault();

        const cur = event.currentTarget;
        if (cur.checkValidity() === false) {
            event.stopPropagation();
        }

        setSubmitted(true);
        const validUrls = validateSocialURLs(form);
        setValidated(validUrls);


        if (Object.entries(form).length > 0) {
            // Form is valid
            if (cur.checkValidity() === true && validUrls) {
                // Set Spinner
                setLoading(true);

                if (!isUser) {
                    // Update Band
                    firebase.updateBand(id, {
                        links: form
                    }).then(
                        () => {
                            queryCache.invalidateQueries(["bands", id]);
                            setLoading(false);
                            handleClose();
                        }
                    ).catch(error => setError(error));

                } else {
                    // Update User
                    firebase.updateUser(id, {
                        links: form
                    }).then(
                        () => {
                            queryCache.invalidateQueries(["users", id]);
                            setLoading(false);
                            handleClose();
                        }
                    ).catch(error => setError(error))
                }
            }
        } else {
            handleClose();
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            manager={new SubModalManager()}

        >
            <Modal.Header closeButton>
                <Modal.Title>Add Social Links to your profile</Modal.Title>
            </Modal.Header>
            <Modal.Body className="addSocialLinks">
                {
                    error ? <Alert variant="danger">There was an error trying to process your request, please reload the
                        page and try
                        again.</Alert> : ""
                }
                {!isLoading ?
                    <Form noValidate validated={isValidated} onSubmit={submitSocialLinks}>
                        {
                            !isValidated && isSubmitted ?
                                <Alert variant="danger">
                                    One or more Links are not in the correct format. Please check if the links are
                                    correct.
                                </Alert> : null
                        }
                        <Form.Group controlId="addSocialWeb">
                            <Form.Row>
                                <Col lg={4}>
                                    <UilGlobe/>
                                    Website
                                </Col>
                                <Col lg={8}>
                                    <Form.Control
                                        type="url"
                                        name={"web"}
                                        size={"sm"}
                                        defaultValue={form.web}
                                        onChange={handleChange}
                                        placeholder={"http://..."}
                                    />
                                </Col>
                            </Form.Row>
                        </Form.Group>
                        <Form.Group controlId="addSocialSC">
                            <Form.Row>
                                <Col lg={4}>
                                    <img src={icon_sc} alt=""/>
                                    SoundCloud
                                </Col>
                                <Col lg={8}>
                                    <Form.Control
                                        type="url"
                                        size={"sm"}
                                        defaultValue={form.soundcloud}
                                        name={"soundcloud"}
                                        onChange={handleChange}
                                        placeholder={"http://soundcloud.com/..."}
                                    />
                                </Col>
                            </Form.Row>
                        </Form.Group>
                        <Form.Group controlId="addSocialSpotify">
                            <Form.Row>
                                <Col lg={4}>
                                    <img src={icon_spotify} alt=""/>
                                    Spotify
                                </Col>
                                <Col lg={8}>
                                    <Form.Control
                                        type="url"
                                        size={"sm"}
                                        defaultValue={form.spotify}
                                        onChange={handleChange}
                                        name={"spotify"}
                                        placeholder={"http://spotify.com/..."}
                                    />
                                </Col>
                            </Form.Row>
                        </Form.Group>
                        <Form.Group controlId="addSocialYT">
                            <Form.Row>
                                <Col lg={4}>
                                    <img src={icon_yt} alt=""/>
                                    YouTube
                                </Col>
                                <Col lg={8}>
                                    <Form.Control
                                        type="url"
                                        size={"sm"}
                                        name={"youtube"}
                                        defaultValue={form.youtube}
                                        onChange={handleChange}
                                        placeholder={"http://youtube.com/..."}
                                    />
                                </Col>
                            </Form.Row>
                        </Form.Group>
                        <Form.Group controlId="addSocialAM">
                            <Form.Row>
                                <Col lg={4}>
                                    <img src={icon_applem} alt=""/>
                                    Apple Music
                                </Col>
                                <Col lg={8}>
                                    <Form.Control
                                        type="url"
                                        size={"sm"}
                                        onChange={handleChange}
                                        defaultValue={form.applemusic}
                                        name={"applemusic"}
                                        placeholder={"http://music.apple.com/..."}
                                    />
                                </Col>
                            </Form.Row>
                        </Form.Group>
                        <Form.Group controlId="addSocialBC">
                            <Form.Row>
                                <Col lg={4}>
                                    <img src={icon_bc} alt=""/>
                                    Bandcamp
                                </Col>
                                <Col lg={8}>
                                    <Form.Control
                                        type="url"
                                        size={"sm"}
                                        onChange={handleChange}
                                        defaultValue={form.bandcamp}
                                        name={"bandcamp"}
                                        placeholder={"http://bandcamp.com/..."}
                                    />
                                </Col>
                            </Form.Row>
                        </Form.Group>
                        <Container>
                            <Row className="border-top mt-2 pt-3">
                                <Col lg={3}>
                                    <Button variant="outline-info" onClick={handleClose} block>
                                        Close
                                    </Button>
                                </Col>
                                <Col lg={9}>
                                    <Button variant="info" type="submit" block>
                                        Add to Profile
                                    </Button>
                                </Col>
                            </Row>
                        </Container>
                    </Form> : <Loader/>}
            </Modal.Body>
        </Modal>
    );
};

export default AddSocialLink;