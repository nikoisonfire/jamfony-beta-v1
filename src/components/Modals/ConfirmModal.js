import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {SubModalManager} from "./NewPostModal";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

/**
 *  Generic Modal to Confirm Actions (mostly deleting stuff.)
 */
const ConfirmModal = props => {
    const {
        text,
        onConfirmed
    } = props;

    const [show, setShow] = useState(true);

    const handleClose = () => {
        setShow(false);
        document.body.className = document.body.className.replace("modal-open", "");
        props.callback();
    };
    const confirm = () => {
        setShow(false);
        document.body.className = document.body.className.replace("modal-open", "");
        onConfirmed();
    };
    return (
        <Modal show={show} onHide={handleClose} manager={new SubModalManager()}>
            <Modal.Header closeButton>
                <Modal.Title>Please confirm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {text}
            </Modal.Body>
            <Modal.Footer>
                <Container>
                    <Row>
                        <Col>
                            <Button variant="outline-info" onClick={confirm} block>
                                Yes
                            </Button>
                        </Col>
                        <Col>
                            <Button variant="info" onClick={handleClose} block>
                                No
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;