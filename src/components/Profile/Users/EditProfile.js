import React, {useContext, useState} from "react";
import UploadProfilePicture from "../../Buttons/UploadProfilePicture";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import AsyncSelect from "react-select/async/dist/react-select.esm";
import Button from "react-bootstrap/Button";
import defaultPic from "../../../images/defaultProfile.png";
import {FirebaseContext} from "../../Firebase";
import {useRecoilState} from "recoil";
import sessionStore from "../../../recoil/sessionStore";
import {queryCache, useQuery} from "react-query";
import {checkEmptyForm, formatDateInput, handleLocationChange} from "../../../constants/timeHelpers";
import Select from "react-select";
import options from "../../../constants/options";
import UploadPictureButton from "../../Buttons/UploadPictureButton";

import {useHistory} from "react-router-dom";
import * as ROUTES from "../../../constants/routes";
import Loader from "../../Widgets/Loader";
import Alert from "react-bootstrap/Alert";

/**
 *  Edit User Profile
 */
const EditProfile = () => {
    const firebase = useContext(FirebaseContext);
    const [session, setSession] = useRecoilState(sessionStore);
    const [saving, setSaving] = useState(false);
    const userId = session.user?.id;
    const history = useHistory();

    const [error, setError] = useState(null);

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
    const {data} = useQuery(['users', (userId)], fetchUserProfile, {staleTime: Infinity});

    /**
     * Form State
     */
    const [form, setForm] = useState({
        picture: data?.picture || defaultPic
    });
    const [validated, setValidated] = useState(false);
    const handleChange = event => setForm({...form, [event.target.name]: event.target.value});

    const addUpload = url => {
        setForm({...form, "picture": url});
    };

    const addBanner = url => {
        setForm({...form, "banner": url});
    };

    const handleLocationSelectChange = newValue => {
        setForm({...form, "location": newValue.value});
    };

    const handleSelectChange = (e, meta) => {
        const arr = [];
        if (e) {
            e.forEach(obj => arr.push(obj.value));
            setForm({...form, [meta.name]: arr});
        }
    };

    const handleEditSubmit = e => {
        e.preventDefault();
        const curT = e.currentTarget;

        if (curT.checkValidity() === false) {
            e.stopPropagation();
        }

        setValidated(true);

        if (curT.checkValidity() === true && checkEmptyForm(form)) {
            setSaving(true);
            if (form.birthday) {
                form.birthday = firebase.createTimestamp(new Date(form.birthday));
            }
            firebase.updateUser(userId, form)
                .then(() => {
                    setSession({
                        loggedIn: true,
                        dbUser: true,
                        user: {
                            ...session.user,
                            ...form
                        }
                    });
                    setTimeout(() => {
                        queryCache.clear();
                        setSaving(true);
                        history.push(ROUTES.USERS + '/' + userId);
                    }, 3000);
                })
                .catch(error => setError(error));
        }
    };

    const filteredOccupations = data.occupations.map(el => options.occupation.find(e => e.value === el));
    const filteredInstruments = data.instruments.map(el => options.instruments.find(e => e.value === el));
    const filteredGenres = data.genres.map(el => options.genres.find(e => e.value === el));

    const birthday = formatDateInput(data.birthday);

    const defaultLocation = {value: data.location, label: data.location};
    return (
        <div className="editProfile p-4">
            {
                error ?
                    <Alert variant="danger">There was an error trying to process your request, please reload the page
                        and try
                        again.</Alert> : ""
            }
            {!saving ?
                <Col className="m-auto" lg={7} sm={12}>
                    <h2>Edit your profile</h2>
                    <Form onSubmit={handleEditSubmit} noValidate validated={validated}>
                        <div className="w-100 editBanner"
                             style={{backgroundImage: `url(${data.banner || form.banner})`}}>
                            <Form.Group style={{boxShadow: "none"}} controlId="addBanner">
                                <UploadPictureButton callback={addBanner} heading="Upload Banner"
                                                     path={"banners/" + userId}/>
                            </Form.Group></div>
                        <Form.Group controlId="createProfileName">
                            <UploadProfilePicture
                                cur={data.picture}
                                callback={addUpload}
                                uid={userId}
                            />
                        </Form.Group>
                        <Form.Group controlId="createProfileName">
                            <Form.Label>
                                Name or artist name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                required
                                defaultValue={data.name}
                                onChange={handleChange}
                                placeholder="Name or Artist name"/>
                            <Form.Control.Feedback type="invalid">
                                Please provide a name or an artist name
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="createProfileLocation">
                            <Form.Label>
                                Location
                            </Form.Label>
                            <AsyncSelect
                                cacheOptions
                                defaultValue={defaultLocation}
                                loadOptions={handleLocationChange}
                                defaultOptions
                                onChange={handleLocationSelectChange}
                            />
                            <Form.Text muted>Please enter at least 3 characters</Form.Text>
                        </Form.Group>

                        <Form.Group controlId="createProfileBirthday">
                            <Form.Label>
                                Birthday
                            </Form.Label>
                            <Form.Row>
                                <Col lg={6} md={8} xs={12}>
                                    <Form.Control
                                        type="date"
                                        name="birthday"
                                        defaultValue={birthday}
                                        max="2010-01-01"
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Form.Row>
                        </Form.Group>

                        <Form.Group controlId="editOccupation">
                            <Form.Label>
                                Occupations
                            </Form.Label>
                            <Select
                                options={options.occupation}
                                defaultValue={filteredOccupations}
                                isMulti
                                name="occupations"
                                onChange={(ev, meta) => handleSelectChange(ev, meta)}
                                placeholder="Select or type..."
                            />
                            <Form.Text muted>
                                You can select more than one
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="editInstruments">
                            <Form.Label>
                                Instruments
                            </Form.Label>
                            <Select
                                options={options.instruments}
                                defaultValue={filteredInstruments}
                                name="instruments"
                                onChange={(ev, meta) => handleSelectChange(ev, meta)}
                                placeholder="Select or type..."
                                isMulti/>
                            <Form.Text muted>
                                You can select more than one
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="editGenres">
                            <Form.Label>
                                Genres
                            </Form.Label>
                            <Select
                                options={options.genres}
                                defaultValue={filteredGenres}
                                onChange={(ev, meta) => handleSelectChange(ev, meta)}
                                name="genres"
                                placeholder="Select or type..."
                                isMulti/>
                            <Form.Text muted>
                                You can select more than one
                            </Form.Text>
                        </Form.Group>

                        <Button type="submit" variant="primary" block>
                            Save Profile
                        </Button>
                    </Form>
                </Col> : <Loader/>}
        </div>
    );
};

export default EditProfile;