import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import AsyncSelect from 'react-select/async';

import Button from "react-bootstrap/Button";

import {useHistory, useParams} from "react-router-dom";
import {FirebaseContext} from "../Firebase";
import {
    checkEmptyForm,
    formatDateInput,
    formatTimeInput,
    handleLocationChange,
    uuidv4
} from "../../constants/timeHelpers";
import UploadPictureButton from "../Buttons/UploadPictureButton";
import Alert from "react-bootstrap/Alert";
import Loader from "../Widgets/Loader";
import * as ROUTES from "../../constants/routes";
import {useRecoilState} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import SelectPostAs from "../Forms/SelectPostAs";
import Select from "react-select";
import options from "../../constants/options";
import {queryCache, useQuery} from "react-query";
import ConfirmModal from "../Modals/ConfirmModal";
import ForbiddenPage from "../ErrorPages/ForbiddenPage";

/**
 * Edit Event Page.
 */
const EditEvent = () => {
    const [session, setSession] = useRecoilState(sessionStore);
    const [submitted, setSubmitted] = useState(false);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const firebase = useContext(FirebaseContext);

    const {editEventId} = useParams();

    const fetchEventData = (key, eId) => {
        return new Promise((resolve, reject) => firebase.getEvent(editEventId)
            .then(
                doc => doc ? resolve(doc.data()) : reject("Event not found")
            ).catch(error => reject(error))
        );
    }

    const {data} = useQuery(["events", editEventId], fetchEventData);

    const [form, setForm] = useState({
        ...data,
        startDate: formatDateInput(data.startTime),
        startTime: formatTimeInput(data.startTime)
    });

    const isPrivate = data.host.id === session.user.id || session.user.bands.find(x => x.id === data.host.id);

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

            firebase.editEvent(editEventId, form)
                .then(
                    () => {
                        history.push(ROUTES.EVENTS + "/" + editEventId);
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

    const DeleteEvent = props => {
        const [confirm, setConfirm] = useState(false);

        const deleteEvent = () => {
            // Check if user has permission by search in db response and local storage
            if (
                isPrivate
            ) {
                firebase.deleteEvent(editEventId)
                    .then(() => {
                        setForm(null);
                        queryCache.invalidateQueries(["events", editEventId])
                            .then(() => history.push(ROUTES.FEED))
                            .catch(error => console.log(error));
                    });
            } else {
                // User is not permitted to delete
            }
        }

        const submitDelete = event => {
            event.preventDefault();

            setConfirm(true);
        }

        return (
            <Form onSubmit={submitDelete}>
                <Form.Group>

                    {
                        confirm && <ConfirmModal
                            onConfirmed={deleteEvent}
                            text={"Are you sure you want to delete " + data.name + " ? This action is permanent and cannot be undone."}
                        />
                    }
                    <Form.Label>
                        Delete Event
                    </Form.Label>
                    <br/>
                    <Button type={"submit"} variant={"outline-secondary"}>
                        Delete Event
                    </Button>
                    <Form.Text muted>
                        Warning: This action is permanent and cannot be undone.
                    </Form.Text>
                </Form.Group>
            </Form>
        )

    }

    return (
        <div className="editProfile p-4">
            {!loading ?
                isPrivate ?
                    <Col className="m-auto" lg={7} sm={12}>
                        <h2>Edit "{form.name}"</h2>
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
                                    defaultValue={form.name}
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
                                    defaultValue={
                                        options.eventTypes.find(x => x.value === form.type)
                                    }
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
                                    defaultValue={form.address}
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
                                    defaultValue={{
                                        value: form.location,
                                        label: form.location
                                    }}
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
                                    defaultVal={form.host}
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
                                    defaultValue={form.description}
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
                                            defaultValue={form.startDate}
                                            required
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col lg={3} sm={6}>
                                        <Form.Control
                                            type={"time"}
                                            name={"startTime"}
                                            defaultValue={form.startTime}
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
                                Save Event
                            </Button>

                        </Form>
                        <DeleteEvent/>
                    </Col> : <ForbiddenPage/>
                : <Loader/>}
        </div>
    );
};

export default EditEvent;