import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import {SubModalManager} from "./NewPostModal";

/**
 *  Modal to share a post by link. (beta).
 */
const SharePostModal = props => {
    const [show, setShow] = useState(true);

    const handleClose = () => {
        setShow(false);
        props.callback();
        document.body.className = document.body.className.replace("modal-open", "");
    };
    return (
        <Modal show={show} onHide={handleClose} manager={new SubModalManager()}>
            <Modal.Header closeButton>
                <Modal.Title>Share this post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormControl type="text" value={props.url}/>
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
                <span>Thank you for sharing!</span>
                <Button variant="info" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SharePostModal;