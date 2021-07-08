import React, {useContext, useState} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import defaultPic from "../../../images/defaultProfile.png";
import {FirebaseContext} from "../../Firebase";
import {useRecoilState} from "recoil";
import sessionStore from "../../../recoil/sessionStore";
import {queryCache, useQuery} from "react-query";

import {useHistory} from "react-router-dom";
import * as ROUTES from "../../../constants/routes";
import Loader from "../../Widgets/Loader";
import {useRecoilValue} from "recoil/dist";
import Alert from "react-bootstrap/Alert";
import {settings} from "../../../constants/config";
import GoogleButton from "../../Home/GoogleButton";
import FacebookButton from "../../Home/FacebookButton";
import ConfirmModal from "../../Modals/ConfirmModal";
import Modal from "react-bootstrap/Modal";

// FIXME: do profile persistence via cloud function, not client sided

/**
 *  Account Settings page
 */
const SettingsProfile = () => {
    const firebase = useContext(FirebaseContext);
    const [session, setSession] = useRecoilState(sessionStore);
    const [saving, setSaving] = useState(false);
    const userId = session.user?.id;
    const history = useHistory();

    const [confirm, showConfirm] = useState(false);
    const [deleteLogin, showDeleteLogin] = useState(false);

    /**
     * Get User Profile Info
     * */
    const fetchUserProfile = (key, user) => {
        return new Promise((resolve, reject) => {
            firebase.getUserFromDB(user).then(
                doc => {
                    if (doc) {
                        resolve(doc.data());
                    } else {
                        reject("User not found");
                    }
                }
            ).catch(error => reject(error));
        });
    };
    const {data} = useQuery(['users', userId], fetchUserProfile, {staleTime: Infinity});

    /**
     * Form State
     */
    const [form, setForm] = useState({
        picture: data?.picture || defaultPic
    });
    const [validated, setValidated] = useState(false);
    const handleChange = event => setForm({...form, [event.target.name]: event.target.value});

    const handleStep1Submit = e => {
        e.preventDefault();
        const curT = e.currentTarget;

        if (curT.checkValidity() === false) {
            e.stopPropagation();
        }

        setValidated(true);

        if (curT.checkValidity() === true) {
            setSaving(true);
            if (form.birthday) {
                form.birthday = firebase.createTimestamp(new Date(form.birthday));
            }
            firebase.updateUser(userId, form)
                .then(() =>
                    setSession({
                        loggedIn: true,
                        dbUser: true,
                        user: {
                            ...session.user,
                            ...form
                        }
                    })
                )
                .then(() => {
                    setTimeout(() => {
                        queryCache.clear();
                        setSaving(true);
                        history.push(ROUTES.USERS + '/' + userId);
                    }, 3000);
                })
                .catch(error => console.log(error));
        }
    };

    const defaultPrivacyVals = settings.privacy.map(x => ({
        db: x.db,
        value: x.default
    }));
    const [privacyValues, setPrivacyValues] = useState(defaultPrivacyVals);
    const handleSwitch = event => setPrivacyValues(defaultPrivacyVals.map(x => {
        if (x.db === event.target.id) {
            return x.value = event.target.checked
        }
    }));

    return (
        <div className="editProfile p-4">
            {!saving ?
                <Col className="m-auto" lg={7} sm={12}>
                    <h2>Account Settings</h2>
                    <PasswordChangeForm email={data.email}/>
                    <Form onSubmit={handleStep1Submit} noValidate validated={validated}>
                        <Form.Group controlId="accountSettingsEmail">
                            <Form.Label>
                                Change your email address
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                required
                                defaultValue={data.email}
                                onChange={handleChange}
                                placeholder="E-Mail Address"/>
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid email address
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/*<Form.Group controlId="accountSettingsEmail">
                            <Form.Label>
                                Privacy settings
                            </Form.Label>
                            {
                                settings.privacy.map(
                                    (el, key) => (
                                        <div className={"settingsRow"} key={el.db}>
                                            <Form.Switch
                                                id={el.db}
                                                label={el.text}
                                                checked={privacyValues[key].value}
                                                onChange={handleSwitch}
                                            />
                                        </div>
                                    )
                                )
                            }
                        </Form.Group>*/}


                        <Button type="submit" variant="primary" block>
                            Save Profile
                        </Button>
                    </Form>
                    {confirm && <ConfirmModal
                        onConfirmed={() => showDeleteLogin(true)}
                        text={"Are you sure you want to delete your account?" +
                        " This action is permanent and cannot be undone."}
                    />}
                    {deleteLogin && <DeleteFormCustom
                        show={true}
                        email={data.email}
                    />}
                    <Form>
                        <Form.Group controlId="accountSettingsEmail">
                            <Form.Label>
                                Delete account
                            </Form.Label>
                            <br/>
                            <Button onClick={() => showConfirm(true)}>
                                Delete my account
                            </Button>
                            <Form.Text muted>
                                You need to sign-in again before you do this.
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Col> : <Loader/>}
        </div>
    );
};

const PasswordChangeForm = props => {
    const firebase = useContext(FirebaseContext);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const session = useRecoilValue(sessionStore);

    const handlePasswordChange = event => {
        event.preventDefault();

        setLoading(true);

        if (session.user.email === props.email) {
            firebase.doPasswordReset(session.user.email)
                .then(() => {
                    setSuccess(true);
                    setLoading(false)
                })
                .catch(error => console.log(error));
        } else {
            setError("There has been an error processing your request.");
        }
    };

    return (
        !isLoading ?
            <Form onSubmit={handlePasswordChange}>
                <Form.Group controlId="accountSettingsPassword">
                    {
                        error ?
                            <Alert variant={"danger"}>
                                {error}
                            </Alert> : null
                    }
                    {
                        success ?
                            <Alert variant="success">
                                A password reset email has been sent to your inbox. Please follow the instructions in
                                that email.
                            </Alert> : null
                    }
                    <Form.Label>
                        Change your password
                    </Form.Label>
                    <Form.Row>
                        <Col lg={9}>
                            <Form.Control
                                type="email"
                                name="email"
                                disabled
                                defaultValue={session.user.email}/>
                        </Col>
                        <Col lg={3}>
                            <Button type={"submit"} size={"sm"}>
                                Change Password
                            </Button>
                        </Col>
                    </Form.Row>
                </Form.Group>
            </Form> : <Loader/>);
};

const DeleteFormCustom = props => {
    const firebase = React.useContext(FirebaseContext);

    const [validated, setValidated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({});

    const [isLoading, setLoading] = useState(false);

    const history = useHistory();

    const deleteUserAndRedirect = auth => {
        return firebase.deleteUser(auth.user.uid).then(
            () =>
                auth.user
                    .delete()
                    .then(() => {
                        firebase.doSignOut()
                            .then(
                                () => {
                                    window.localStorage.clear();
                                    setTimeout(() => history.push(ROUTES.LOGIN), 2000);
                                    setLoading(false);
                                    setShow(false);
                                }
                            )
                            .catch(error => console.log(error));
                    })
                    .catch(error => console.log(error))
        ).catch(error => console.log(error));
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
            setLoading(true);

            // Auth Logic
            firebase.doSignInWithEmailAndPassword(email, password)
                .then(auth => {
                    // Save the user session
                    deleteUserAndRedirect(auth);
                })
                .catch(error => {
                    setError(error);
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

    const [show, setShow] = useState(props.show);
    const handleClose = () => setShow(false);

    return (
        <Modal show={show} centered onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Login to Jamfony</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!isLoading ?
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
                        </Form.Group>

                        <Button variant="primary" type="submit" block>
                            Login
                        </Button>
                        <GoogleButton type="signin" block callback={deleteUserAndRedirect}/>
                        <FacebookButton type="signin" block callback={deleteUserAndRedirect}/>
                    </Form> : <Loader/>}
            </Modal.Body>
        </Modal>
    );
};

export default SettingsProfile;