import React, {useState} from "react";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import FirebaseContext from "../Firebase/context";

/**
 * Password Reset Form with Auth Logic
 */
const PasswordReset = () => {
    const firebase = React.useContext(FirebaseContext);

    const [validated, setValidated] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        }

        setValidated(true);

        // Form is valid
        if (form.checkValidity() === true) {
            // Set Spinner
            setIsLoading(true);

            // TODO: Set Session Persistence (FB -> Auth Persistance) with Checkbox for "Keep signed in"
            // Auth Logic
            firebase.doPasswordReset(email)
                .then(() => {
                    setIsLoading(false);
                    setError({});
                })
                .catch(error => {
                    setError(error);
                    setIsLoading(false);
                    setValidated(false);
                });
        }
    };


    const resetErrorHandler = errorObject => {
        switch (errorObject.code) {
            case "auth/user-not-found":
                return "The email address has not been found. Please check for any typos.";
            case "auth/wrong-password":
                return "Whoops! Looks like you've entered the wrong password. Would you like to reset it?";
            default:
                return error.message;
        }
    };


    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Alert variant="secondary">
                Please enter your email address to reset your password. You will recieve a link to reset your password
                to that email address.
            </Alert>
            {
                error.message &&
                <Alert variant="danger">
                    {resetErrorHandler(error)}
                </Alert>
            }
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    required
                    type="email"
                    placeholder="Enter email"
                    onChange={e => setEmail(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                    Please provide a valid e-mail address.
                </Form.Control.Feedback>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" block disabled={isLoading}>
                {
                    isLoading ?
                        <Spinner animation="border" role="status">
                            <span className="sr-only">Loading...</span>
                        </Spinner> : "Reset Password"
                }
            </Button>
        </Form>
    );
};

export default PasswordReset;