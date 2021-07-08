import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Select from "react-select";
import AsyncSelect from 'react-select/async';

import {cloneDeep} from "lodash";

import Button from "react-bootstrap/Button";

import {useHistory} from "react-router-dom";

import options from "../../../constants/options";
import UploadProfilePicture from "../../Buttons/UploadProfilePicture";
import {FirebaseContext} from "../../Firebase";

import defaultPic from "../../../images/defaultProfile.png";
import {handleLocationChange, uuidv4} from "../../../constants/timeHelpers";
import UploadPictureButton from "../../Buttons/UploadPictureButton";
import Table from "react-bootstrap/Table";
import SearchBandMembers from "../../Forms/SearchBandMembers";
import ProfilePicSmall from "../../Widgets/ProfilePicSmall";
import UilMultiply from "@iconscout/react-unicons/icons/uil-multiply";
import Alert from "react-bootstrap/Alert";
import Loader from "../../Widgets/Loader";
import * as ROUTES from "../../../constants/routes";
import {useRecoilState} from "recoil/dist";
import sessionStore from "../../../recoil/sessionStore";

/**
 *  Create new band.
 */
const CreateBand = () => {
    const [session, setSession] = useRecoilState(sessionStore);
    const [submitted, setSubmitted] = useState(false);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        location: '',
        banner: '',
        picture: defaultPic,
        since: '',
        bio: '',
        genres: [],
        management: '',
        followers: []
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
            && members.length > 0
            && !isNaN(form.since)
            && form.location !== ""
            && form.name !== ""
            && form.genres.length > 0
            && members.length > 0
            && members.every(x => x.instruments.length > 0)
        ) {
            setLoading(true);

            const newData = {
                ...form,
                members: members.map(x => x.id),
                membersDetailed: members
            };
            firebase.createBand(newData).then(
                snapshot => {
                    setLoading(false);
                    const newBand = cloneDeep(session.user.bands) || [];
                    newBand.push({
                        id: snapshot.id,
                        name: form.name,
                        picture: form.picture
                    });
                    setSession({
                        ...session,
                        user: {
                            ...session.user,
                            bands: newBand
                        }
                    });
                    history.push(ROUTES.BANDS + "/" + snapshot.id);
                }
            );
        }
    };

    // Form Handlers
    const addUpload = url => {
        setForm(
            {
                ...form,
                picture: url
            }
        )
    };
    const handleChange = event => setForm({...form, [event.target.name]: event.target.value});
    const handleSelectChange = newValue => {
        setForm({...form, "location": newValue.value});
    };
    const handleGenre = event => setForm({...form, genres: event.map(x => x.value)});

    const [members, setMembers] = useState([{
        id: session.user.id,
        name: session.user.name,
        picture: session.user.picture,
        instruments: []
    }]);

    // Function for instrument changes in members section of "Create Bands"
    const handleMemberChange = (event, meta, id) => {
        const instruments = event.map(x => x.value);
        let buffer = cloneDeep(members);
        const index = members.findIndex(x => x.id === id);
        buffer[index] = {
            ...buffer[index],
            instruments: instruments
        };
        setMembers(buffer);
    };

    return (
        <div className="editProfile p-4">
            {!loading ?
                <Col className="m-auto" lg={7} sm={12}>
                    <h2>Create a band</h2>
                    <Form onSubmit={submitForm} noValidate validated={validated}>
                        <div className="w-100 editBanner" style={{backgroundImage: `url(${form.banner})`}}>
                            <Form.Group style={{boxShadow: "none"}} controlId="addBanner">
                                <UploadPictureButton heading="Upload Banner" path={"banners/"}
                                                     callback={(src) => setForm({...form, banner: src})}/>
                            </Form.Group>
                        </div>
                        <Form.Group controlId="uploadAvatar">
                            <UploadProfilePicture
                                cur={defaultPic}
                                callback={addUpload}
                                uid={tempFileName}
                            />
                        </Form.Group>

                        <Form.Group controlId="createBandName">
                            <Form.Label>
                                Band name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                required
                                onChange={handleChange}
                                placeholder="Band name"/>
                            <Form.Control.Feedback type="invalid">
                                Please provide a bandname
                            </Form.Control.Feedback>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="createBandMembers">
                            <Form.Label>
                                Members
                            </Form.Label>
                            {members.length > 0 ?
                                <Table striped bordered hover size="sm" className={"createBandMembers"}>
                                    <thead>
                                    <tr>
                                        <th>Member</th>
                                        <th>Instrument</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {members.map
                                    (
                                        el =>
                                            <tr key={el.id}>
                                                <td>
                                                    <div className="miniProfileHorizontal">
                                                        <ProfilePicSmall src={el.picture}/>
                                                        <span className="name">{el.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Select
                                                        options={options.instruments}
                                                        onChange={(ev, meta) => handleMemberChange(ev, meta, el.id)}
                                                        name="instruments"
                                                        placeholder="Select or type..."
                                                        isMulti/>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant={"secondary"}
                                                        size={"sm"}
                                                        label={"Remove"}
                                                        onClick={() => setMembers(members.filter(x => x.id !== el.id))}
                                                    >
                                                        <UilMultiply size={16}/>
                                                    </Button>
                                                </td>
                                            </tr>
                                    )
                                    }
                                    </tbody>
                                </Table> : null}
                            <SearchBandMembers callback={(value) => {
                                if (!members.some(x => x.id === value.id))
                                    setMembers(members.concat(value));
                            }}/>
                            {
                                members.length < 1 && submitted &&
                                <Alert variant={"danger"}>
                                    Please add at least one band member.
                                </Alert>
                            }
                            {
                                !members.every(x => x.instruments.length > 0) && submitted &&
                                <Alert variant={"danger"}>
                                    Please make sure every member has an instrument selected.
                                </Alert>
                            }
                        </Form.Group>

                        <Form.Group controlId="createProfileLocation">
                            <Form.Label>
                                Location (City)
                            </Form.Label>
                            <AsyncSelect
                                cacheOptions
                                loadOptions={handleLocationChange}
                                defaultOptions
                                loadingMessage={() => `Please enter 3 or more characters to search...`}
                                onChange={handleSelectChange}
                            />
                            {
                                validated && form.location === "" ?
                                    <Alert variant="danger">
                                        Pleas enter a valid location
                                    </Alert>
                                    : null
                            }
                        </Form.Group>

                        <Form.Group controlId="createBandSince">
                            <Form.Label>
                                Active since
                            </Form.Label>
                            <Form.Row>
                                <Col lg={6} md={8} xs={12}>
                                    <Form.Control
                                        type="text"
                                        name="since"
                                        maxLength="4"
                                        required
                                        onChange={handleChange}
                                        placeholder="Year"/>
                                </Col>
                                <Form.Control.Feedback type="invalid">
                                    Please enter a valid year
                                </Form.Control.Feedback>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Row>
                        </Form.Group>

                        <Form.Group controlId="createBandBio">
                            <Form.Label>
                                About you
                            </Form.Label>
                            <Form.Row>
                                <Form.Control
                                    as="textarea"
                                    type="textarea"
                                    name="bio"
                                    onChange={handleChange}
                                    placeholder="How did you meet? What's the story behind your first song? ..."/>
                            </Form.Row>
                            <Form.Text muted>(optional)</Form.Text>
                        </Form.Group>

                        <Form.Group controlId="createBandGenres">
                            <Form.Label>
                                Genre(s)
                            </Form.Label>
                            <Select
                                options={options.genres}
                                onChange={handleGenre}
                                name="genres"
                                placeholder="Select or type..."
                                isMulti/>
                            {
                                validated && form.genres.length < 1 ?
                                    <Alert variant="danger">
                                        Pleas enter at least one genre
                                    </Alert>
                                    : null
                            }
                            <Form.Text muted>
                                You can select more than one
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="createBandManagement">
                            <Form.Label>
                                Representation (Label, Management, Contact, etc.)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="management"
                                onChange={handleChange}
                                placeholder="Name, website or email"/>
                            <Form.Text muted>(optional)</Form.Text>
                        </Form.Group>

                        <Button type="submit" variant="primary" block>
                            Create Band
                        </Button>
                    </Form>
                </Col> : <Loader/>}
        </div>
    );
};

export default CreateBand;