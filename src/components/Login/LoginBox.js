import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import LoginForm from "./LoginForm";

/**
 *  Login Box Layout Component. Parent to <LoginForm />
 */
export const LoginBox = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleOpen = () => setShow(true);

    return (
        <>
            <button className="loginButton" onClick={handleOpen}>
                Login
            </button>

            {
                <Modal show={show} centered onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Login to Jamfony</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <LoginForm/>
                    </Modal.Body>
                </Modal>
            }
        </>
    );
};