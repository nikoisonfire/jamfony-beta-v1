import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import AsyncSelect from 'react-select/async';

import Button from "react-bootstrap/Button";

import {useHistory} from "react-router-dom";
import {FirebaseContext} from "../Firebase";
import {checkEmptyForm, getDateNowInput, handleLocationChange, uuidv4} from "../../constants/timeHelpers";
import UploadPictureButton from "../Buttons/UploadPictureButton";
import Alert from "react-bootstrap/Alert";
import Loader from "../Widgets/Loader";
import * as ROUTES from "../../constants/routes";
import {useRecoilState} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import SelectPostAs from "../Forms/SelectPostAs";
import Select from "react-select";
import options from "../../constants/options";

/**
 * Page to create an event.
 */
const CreateEvent = () => {
    const [session, setSession] = useRecoilState(sessionStore);
    const [submitted, setSubmitted] = useState(false);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        address: '',
        location: '',
        type: '',
        description: '',
        host: '',
        hostType: '',
        startTime: '',
        startDate: '',
    });
    const firebase = useContext(FirebaseContext);

    const history = useHistory();

    const tempFileName = uuidv4();


    const submitForm = e => {
        e.preventDefault();
        setSubmitted(true);

        const curT = e.currentTarget;

        if (curT.checkValidity() === false) {
            e.stopPropagation();
        }

        setValidated(true);

        if (curT.checkValidity() === true
            && checkEmptyForm(form)
        ) {
            setLoading(true);

            firebase.createEvent(form)
                .then(
                    snapshot => {
                        history.push(ROUTES.EVENTS + "/" + snapshot.id);
                    }
                ).catch(error => console.log(error));
        }
    };

    // Form Handlers
    const handleChange = event => setForm({...form, [event.target.name]: event.target.value});

    const setHost = (val, type, userObj) => setForm({...form, host: userObj, hostType: type});

    const handleLocationSelect = newValue => {
        setForm({...form, location: newValue.value});
    };
    const handleTypeChange = newValue => {
        setForm({...form, type: newValue.value});
    };

    return (
        <div className="editProfile p-4">
            {!loading ?
                <Col className="m-auto" lg={7} sm={12}>
                    <h2>Create an event</h2>
                    <Form onSubmit={submitForm} noValidate validated={validated}>

                        <div className="w-100 editBanner mb-0" style={{backgroundImage: `url(${form.banner})`}}>
                            <Form.Group style={{boxShadow: "none"}} controlId="addBanner">
                                <UploadPictureButton heading="Upload Banner" path={"banners/" + tempFileName}
                                                     callback={(src) => setForm({...form, banner: src})}/>
                            </Form.Group>
                        </div>

                        <Form.Group controlId="createEventName">
                            <Form.Label>
                                Event name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                required
                                onChange={handleChange}
                                placeholder="Event name"/>
                            <Form.Control.Feedback type="invalid">
                                Please provide a name for the event
                            </Form.Control.Feedback>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="createEventType">
                            <Form.Label>
                                Event type
                            </Form.Label>
                            <Select
                                options={options.eventTypes}
                                name={"type"}
                                onChange={handleTypeChange}
                            />
                            {
                                submitted && form.type === ""
                                && <Alert variant={"danger"}>
                                    Please select an event type
                                </Alert>
                            }
                        </Form.Group>

                        <Form.Group controlId="createEventAddress">
                            <Form.Label>
                                Address (Club, Street, etc.)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                required
                                onChange={handleChange}
                                placeholder="Where is the event?"/>
                            <Form.Control.Feedback type="invalid">
                                Please provide an address for the event
                            </Form.Control.Feedback>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="createEventLocation">
                            <Form.Label>
                                Location (City)
                            </Form.Label>
                            <AsyncSelect
                                cacheOptions
                                loadOptions={handleLocationChange}
                                defaultOptions
                                loadingMessage={() => `Please enter 3 or more characters to search...`}
                                onChange={handleLocationSelect}
                            />
                            {
                                submitted && !form.location &&
                                <Alert variant="danger">
                                    Please enter a valid location
                                </Alert>
                            }
                        </Form.Group>

                        <Form.Group controlId="createEventHost">
                            <Form.Label>
                                Host
                            </Form.Label>
                            <SelectPostAs
                                callback={setHost}
                                user={session.user}
                            />
                            {
                                submitted && form.host === ""
                                && <Alert variant={"danger"}>
                                    Please select a host
                                </Alert>
                            }
                            <Form.Text muted>
                                Select yourself or one of your bands to host.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="createEventDescription">
                            <Form.Label>
                                Description
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                type="textarea"
                                minLength="20"
                                required
                                name="description"
                                onChange={handleChange}
                                placeholder="Describe your event (Tickets, Bands playing, etc.)"/>
                            <Form.Control.Feedback type="invalid">
                                Please provide a description (min. 20 characters) for the event
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="createEventTimeStart">
                            <Form.Label>
                                Start time and date
                            </Form.Label>
                            <Form.Row>
                                <Col lg={4} sm={6}>
                                    <Form.Control
                                        type={"date"}
                                        name={"startDate"}
                                        min={getDateNowInput()}
                                        max={"2030-01-01"}
                                        required
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={3} sm={6}>
                                    <Form.Control
                                        type={"time"}
                                        name={"startTime"}
                                        required
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Form.Row>


                            <Form.Control.Feedback type="invalid">
                                Please provide a start time and date
                            </Form.Control.Feedback>
                        </Form.Group>

                        {
                            submitted && !checkEmptyForm(form)
                            && <Alert variant={"danger"}>
                                There was an error processing your request. Please check the form.
                            </Alert>
                        }

                        <Button type="submit" variant="primary" block>
                            Create Event
                        </Button>
                    </Form>
                </Col> : <Loader/>}
        </div>
    );
};

export default CreateEvent;