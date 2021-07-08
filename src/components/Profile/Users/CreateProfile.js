import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Select from "react-select";
import AsyncSelect from 'react-select/async';

import Button from "react-bootstrap/Button";

import {Route, useHistory} from "react-router-dom";

import options from "../../../constants/options";
import UploadProfilePicture from "../../Buttons/UploadProfilePicture";
import {FirebaseContext} from "../../Firebase";
import sessionStore from "../../../recoil/sessionStore";
import {useRecoilState} from "recoil";
import * as ROUTES from "../../../constants/routes";

import defaultPic from "../../../images/defaultProfile.png";
import {handleLocationChange} from "../../../constants/timeHelpers";
import Alert from "react-bootstrap/Alert";

/**
 *  Create User Profile.
 *  User enters this page after sign up to put in their account details.
 */
const CreateProfile = ({match}) => {
    const [fullForm, setFullForm] = useState({});
    const firebase = useContext(FirebaseContext);
    const [session, setSession] = useRecoilState(sessionStore);
    const [error, setError] = useState(null);

    const history = useHistory();
    if (!session.loggedIn) {
        history.push(ROUTES.LOGIN);
    }

    // Add User to Database (last step)
    const createUser = (selection) => {
        const userId = session.user.id;
        const user = {
            name: fullForm.name,
            location: fullForm.location,
            picture: fullForm.picture || '',
            birthday: fullForm.birthday || '',
            email: session.user.email,
            genres: selection.genres,
            instruments: selection.instruments,
            occupations: selection.occupations
        };

        firebase.createUserInDB(userId, user)
            .then(() => {
                    setSession({
                        loggedIn: true,
                        dbUser: true,
                        user: {
                            ...session.user,
                            name: fullForm.name,
                            picture: fullForm.picture || ''
                        }
                    });
                    history.push(ROUTES.FEED);
                }
            ).catch(error => setError(error));
    };


    const Step1 = () => {
        const [form, setForm] = useState({
            name: session.user?.name || '',
            picture: defaultPic
        });
        const [validated, setValidated] = useState(false);
        const [submitted, setSubmitted] = useState(false);

        const handleChange = event => setForm({...form, [event.target.name]: event.target.value});

        const addUpload = url => {
            setForm({...form, "picture": url});
        };

        const handleSelectChange = newValue => {
            setForm({...form, "location": newValue.value});
        };

        const handleStep1Submit = e => {
            e.preventDefault();
            const curT = e.currentTarget;
            setSubmitted(true);

            if (curT.checkValidity() === false) {
                e.stopPropagation();
            }

            setValidated(true);

            if (curT.checkValidity() === true
                && form.location
                && form.birthday) {
                setFullForm(form);
                history.push(`${match.path}/2`);
            }
        };

        return (
            <Col className="m-auto" lg={6} sm={12}>
                <Form onSubmit={handleStep1Submit} noValidate validated={validated}>
                    {
                        error ?
                            <Alert variant="danger">There was an error trying to process your request, please reload the
                                page and try
                                again.</Alert> : ""
                    }

                    <h2 className="p-3 text-center"><span role="img" aria-label="party">🎉</span> Welcome to
                        Jamfony! <span role="img" aria-label="wave">👋 </span></h2>
                    <h4>Who are you?</h4>

                    <Form.Group controlId="createProfileName">
                        <UploadProfilePicture
                            cur={defaultPic}
                            callback={addUpload}
                            uid={session.user?.id}
                        />
                        <Form.Label>
                            What's your name? (or artist name)
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            required
                            onChange={handleChange}
                            placeholder="Name or Artist name"/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a name or an artist name
                        </Form.Control.Feedback>
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="createProfileLocation">
                        <Form.Label>
                            Where are you from? (eg. Munich, Germany)
                        </Form.Label>
                        <AsyncSelect
                            cacheOptions
                            loadOptions={handleLocationChange}
                            defaultOptions
                            loadingMessage={() => `Please enter 3 or more characters to search...`}
                            onChange={handleSelectChange}
                        />
                        {
                            !form.location && submitted &&
                        <Alert variant={"danger"}>
                            Please enter a valid location.
                        </Alert>
                        }
                    </Form.Group>

                    <Form.Group controlId="createProfileBirthday">
                        <Form.Label>
                            When's your birthday?
                        </Form.Label>
                        <Form.Row>
                            <Col lg={6} md={8} xs={12}>
                                <Form.Control
                                    type="date"
                                    name="birthday"
                                    max="2010-01-01"
                                    onChange={handleChange}
                                    placeholder="Year"/>
                                <Form.Text muted>(optional)</Form.Text>
                            </Col>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Row>
                        {
                            !form.birthday && submitted &&
                                <Alert variant={"danger"}>
                                    Please enter a valid birthday.
                                </Alert>
                        }
                    </Form.Group>


                    <Button type="submit" variant="primary" block>
                        Next Step
                    </Button>
                </Form>
            </Col>);
    };

    const Step2 = props => {
        const [selection, setSelection] = useState({});

        const handleStep2Submit = e => {
            e.preventDefault();
            props.callback(selection);
        };


        const handleSelectChange = (e, meta) => {
            const arr = [];
            if (e) {
                e.forEach(obj => arr.push(obj.value));
                setSelection({...selection, [meta.name]: arr});
            }
        };

        return (
            <Col as={Col} className="m-auto" lg={6} sm={12}>
                <Form onSubmit={handleStep2Submit}>
                    <h3>How about some music related questions?</h3>

                    <Form.Group controlId="createProfileOccupations">
                        <Form.Label>
                            What do you do? (e.g. Producing, Playing, Songwriting)
                        </Form.Label>
                        <Select
                            options={options.occupation}
                            isMulti
                            name="occupations"
                            onChange={(ev, meta) => handleSelectChange(ev, meta)}
                            placeholder="Select or type..."
                        />
                        <Form.Text muted>
                            You can select more than one
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="createProfileInstruments">
                        <Form.Label>
                            Do you sing or play an instrument?
                        </Form.Label>
                        <Select
                            options={options.instruments}
                            name="instruments"
                            onChange={(ev, meta) => handleSelectChange(ev, meta)}
                            placeholder="Select or type..."
                            isMulti/>
                        <Form.Text muted>
                            You can select more than one
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="createProfileGenres">
                        <Form.Label>
                            What genres do you like?
                        </Form.Label>
                        <Select
                            options={options.genres}
                            onChange={(ev, meta) => handleSelectChange(ev, meta)}
                            name="genres"
                            placeholder="Select or type..."
                            isMulti/>
                        <Form.Text muted>
                            You can select more than one
                        </Form.Text>
                    </Form.Group>

                    <Button type="submit" variant="primary" block>
                        Let's go!
                    </Button>
                </Form>
            </Col>);
    };

    return (
        <div className="p-sm-0 p-md-4 createProfile">
            <Route path={`${match.path}/2`} render={() => <Step2 options={options} callback={createUser}/>}/>
            <Route exact path={match.path} component={Step1}/>
        </div>
    );
};

export default CreateProfile;