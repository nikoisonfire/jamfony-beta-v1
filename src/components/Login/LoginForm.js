import React, {useState} from "react";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import GoogleButton from "../Home/GoogleButton";
import FacebookButton from "../Home/FacebookButton";
import PasswordReset from "./PasswordReset";
import FirebaseContext from "../Firebase/context";
import {useSetRecoilState} from "recoil";
import {useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import sessionStore from "../../recoil/sessionStore";

import defaultPic from "../../images/defaultProfile.png";


/**
 * Login Form with Auth Logic
 */
const LoginForm = () => {
    const firebase = React.useContext(FirebaseContext);

    const [validated, setValidated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [pwReset, setPwReset] = useState(false);

    const setSession = useSetRecoilState(sessionStore);

    const history = useHistory();

    const setUserAndRedirect = authUser => {
        return firebase.getUserFromDB(authUser.user.uid)
            .then(user => {
                const dbUser = user.data();

                const newUser = authUser.additionalUserInfo?.isNewUser;
                const userName = dbUser?.name || authUser.user.displayName || '';

                setSession({
                    loggedIn: true,
                    dbUser: !!dbUser,
                    user: {
                        isNewUser: newUser,
                        id: authUser.user.uid,
                        name: userName,
                        email: authUser.user.email,
                        emailVerified: authUser.user.emailVerified,
                        picture: dbUser?.picture || defaultPic,
                        bands: dbUser?.bands || []
                    }
                });
                !dbUser || newUser ? history.push(ROUTES.CREATE_PROFILE) : history.push(ROUTES.FEED);
            })
            .catch(error => console.log(error));
    };

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
            firebase.doSignInWithEmailAndPassword(email, password)
                .then(auth => {
                    // Save the user session
                    setUserAndRedirect(auth);
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


    const loginErrorHandler = errorObject => {
        switch (errorObject.code) {
            case "auth/user-not-found":
                return "The email address has not been found. Try signing in with a different method (Google, Facebook)";
            case "auth/wrong-password":
                return "Whoops! Looks like you've entered the wrong password. Would you like to reset it?";
            default:
                return error.message;
        }
    };


    return (
        <>
            {
                !pwReset ?
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        {
                            error.message &&
                            <Alert variant="danger">
                                {loginErrorHandler(error)}
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

                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Enter Password"
                                onChange={e => setPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter your password.
                            </Form.Control.Feedback>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            <div className="passwordResetLink">
                                <Button variant="link" onClick={setPwReset}>Reset Password</Button>
                            </div>
                        </Form.Group>

                        <Button variant="primary" type="submit" block disabled={isLoading}>
                            {
                                isLoading ?
                                    <Spinner animation="border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </Spinner> : "Login"
                            }
                        </Button>
                        <GoogleButton type="signin" block callback={setUserAndRedirect}/>
                        <FacebookButton type="signin" block callback={setUserAndRedirect}/>
                        <Alert variant={"info"} className={"mt-2"}>
                            If the Google / Facebook Login dosen't work, try disabling your Ad Blocker.
                        </Alert>
                    </Form> : <PasswordReset/>
            }
        </>
    );
};

export default LoginForm;