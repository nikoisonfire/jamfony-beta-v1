import React, {useState} from "react";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import GoogleButton from "./GoogleButton";
import FacebookButton from "./FacebookButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import FirebaseContext from "../Firebase/context";

import * as ROUTES from "../../constants/routes";
import {useHistory} from "react-router-dom";
import defaultPic from "../../images/defaultProfile.png";
import {useSetRecoilState} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";

/**
 *  SignUp Form Component
 */
const SignUpForm = () => {
    const firebase = React.useContext(FirebaseContext);

    const setSession = useSetRecoilState(sessionStore);

    const [validated, setValidated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const history = useHistory();

    const setUserAndRedirect = authUser => {
        return firebase.getUserFromDB(authUser.user.uid)
            .then(user => {
                const dbUser = user.data();

                const newUser = authUser.additionalUserInfo?.isNewUser;
                const userName = dbUser?.name || authUser.user.displayName || '';

                setSession({
                    loggedIn: true,
                    dbUser: dbUser,
                    user: {
                        isNewUser: newUser,
                        id: authUser.user.uid,
                        name: userName,
                        email: authUser.user.email,
                        emailVerified: authUser.user.emailVerified,
                        picture: dbUser?.picture || defaultPic,
                        bands: dbUser?.bands
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
        if (form.checkValidity() === true) {
            setIsLoading(true);

            // Register in FB Auth
            firebase.doCreateUserWithEmailAndPassword(email, password)
                .then(() => {
                    setIsLoading(false);
                    firebase.doSignInWithEmailAndPassword(email, password)
                        .then(authUser => {
                            setUserAndRedirect(authUser);
                        })
                        .catch(error => setError(error))
                })
                .catch(error => {
                    console.log(error);
                    setError(error);
                    setIsLoading(false);
                    setValidated(false);
                });
        }
    };

    const signupErrorHandler = errorObject => {
        switch (errorObject.code) {
            case "auth/email-already-in-use":
                return "This email address is already registered. Try a different one or sign up with Google/Facebook";
            case "auth/weak-password":
                return "The password is not strong enough.";
            default:
                return "An error occured while trying to sign in.";
        }
    };

    const handleShowPassword = () =>
        showPassword ? setShowPassword(false) : setShowPassword(true);

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {
                error &&
                <Alert variant="danger">
                    {signupErrorHandler(error)}
                </Alert>
            }
            <Form.Group controlId="signUpEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    required
                    type="email"
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email addres"/>
                <Form.Control.Feedback type="invalid">
                    Please provide a valid e-mail address.
                </Form.Control.Feedback>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="signUpPassword">
                <Form.Label>Password</Form.Label>
                <InputGroup className="mb-3">
                    <Form.Control
                        required
                        pattern="(?=.*).{8,}"
                        type={showPassword ? "text" : "password"}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter (a safe) Password"/>
                    <InputGroup.Append>
                        <Button variant="dark" onClick={handleShowPassword}>
                            {
                                showPassword ? "Hide Password" : "Show Password"
                            }
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                    Please choose a password that is at least 8 characters long.
                </Form.Control.Feedback>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Text className="text-muted">
                    Choose a safe password by including numbers and upper-/lowercase letters.
                </Form.Text>
            </Form.Group>
            <ButtonGroup vertical>
                <Button type="submit" large="true" disabled={isLoading}>
                    {
                        isLoading ?
                            <Spinner animation="border" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner> : "Join Jamfony"
                    }
                </Button>
                <GoogleButton callback={setUserAndRedirect}/>
                <FacebookButton callback={setUserAndRedirect}/>
            </ButtonGroup>
            <Alert variant={"info"} className={"mt-2"}>
                If the Google / Facebook Login dosen't work, try disabling your Ad Blocker.
            </Alert>

        </Form>
    );
};

export default SignUpForm;

