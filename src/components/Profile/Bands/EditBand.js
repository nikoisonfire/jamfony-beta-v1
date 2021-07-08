import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Select from "react-select";
import AsyncSelect from 'react-select/async';

import {cloneDeep} from "lodash";

import Button from "react-bootstrap/Button";

import {useHistory, useParams} from "react-router-dom";

import options from "../../../constants/options";
import UploadProfilePicture from "../../Buttons/UploadProfilePicture";
import {FirebaseContext} from "../../Firebase";
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
import {queryCache, useQuery} from "react-query";
import ForbiddenPage from "../../ErrorPages/ForbiddenPage";
import ConfirmModal from "../../Modals/ConfirmModal";

/**
 *  Edit Band
 */
const EditBand = () => {
    const [session, setSession] = useRecoilState(sessionStore);
    const [submitted, setSubmitted] = useState(false);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [removed, setRemoved] = useState([]);

    const {editBandId} = useParams();

    const firebase = useContext(FirebaseContext);
    const fetchBandProfile = (key, bandId) => {
        return new Promise((resolve, reject) => {
            firebase.getBandFromDB(bandId).then(
                doc => {
                    if (doc) {
                        resolve(doc.data());
                    } else {
                        reject("Band not found");
                    }
                }
            ).catch(error => reject(error));
        });
    };

    const {data} = useQuery(["bands", editBandId], fetchBandProfile, {
        staleTime: Infinity
    });

    const [form, setForm] = useState({
        name: data.name,
        location: data.location,
        banner: data.banner,
        picture: data.picture,
        since: data.since,
        bio: data.bio,
        genres: data.genres,
        management: data.management,
        members: data.members,
        membersDetailed: data.membersDetailed
    });

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
            firebase.updateBand(editBandId, newData).then(
                () => {
                    if (newData.members.includes(session.user.id)) {
                        const otherBands = session.user.bands?.filter(x => x.id !== editBandId);
                        const newBand = {
                            id: editBandId,
                            picture: newData.picture,
                            name: newData.name
                        };
                        otherBands.push(newBand);
                        setSession({
                            ...session,
                            user: {
                                ...session.user,
                                bands: otherBands
                            }
                        });
                    }
                    /**
                     * If the removes removes itself, delete the band from local storage
                     * This case will probably NEVER happen, but you also never know...
                     */
                    if (removed.length > 0 && removed.includes(session.user.id)) {
                        setSession({
                            ...session,
                            user: {
                                ...session.user,
                                bands: session.user.bands.filter(x => x.id !== editBandId)
                            }
                        })
                    }
                    queryCache.invalidateQueries(["bands", editBandId]).then(
                        () => history.push(ROUTES.BANDS + "/" + editBandId)
                    )
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

    const [members, setMembers] = useState(
        form.membersDetailed.map(
            x => ({
                id: x.id,
                name: x.name,
                picture: x.picture,
                instruments: x.instruments
            })
        )
    );

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

    const DeleteBand = props => {
        const [confirm, setConfirm] = useState(false);
        const [session, setSession] = useRecoilState(sessionStore);

        const deleteBand = () => {
            // Check if user has permission by search in db response and local storage
            if (
                data.members.includes(session.user.id)
                && session.user.bands.some(x => x.id === editBandId)
            ) {
                firebase.deleteBand(editBandId)
                    .then(() => {
                        setSession({
                            ...session,
                            user: {
                                ...session.user,
                                bands: session.user.bands.filter(x => x.id !== editBandId)
                            }
                        })
                        queryCache.clear();
                        history.push(ROUTES.FEED);
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
                            onConfirmed={deleteBand}
                            text={"Are you sure you want to delete " + data.name + " ? This action is permanent and cannot be undone."}
                        />
                    }
                    <Form.Label>
                        Delete band
                    </Form.Label>
                    <br/>
                    <Button type={"submit"} variant={"outline-secondary"}>
                        Delete Band
                    </Button>
                    <Form.Text muted>
                        Warning: This action is permanent and cannot be undone.
                    </Form.Text>
                </Form.Group>
            </Form>
        )

    };

    return (
        <div className="editProfile p-4">
            {!loading ?
                data.members.includes(session.user.id) ?
                    <Col className="m-auto" lg={7} sm={12}>
                        <h2>Edit "{form.name}"</h2>
                        <Form onSubmit={submitForm} noValidate validated={validated}>
                            <div className="w-100 editBanner" style={{backgroundImage: `url(${form.banner})`}}>
                                <Form.Group style={{boxShadow: "none"}} controlId="addBanner">
                                    <UploadPictureButton heading="Upload Banner" path={"banners/"}
                                                         callback={(src) => setForm({...form, banner: src})}/>
                                </Form.Group>
                            </div>
                            <Form.Group controlId="uploadAvatar">
                                <UploadProfilePicture
                                    cur={form.picture}
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
                                    defaultValue={form.name}
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
                                                            defaultValue={
                                                                el.instruments.map(
                                                                    x => options.instruments.find(
                                                                        y => y.value === x)
                                                                )
                                                            }
                                                            isMulti/>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant={"secondary"}
                                                            size={"sm"}
                                                            label={"Remove"}
                                                            onClick={() => {
                                                                setRemoved([...removed, el.id]);
                                                                setMembers(members.filter(x => x.id !== el.id))
                                                            }}
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
                                    console.log(value)
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
                                    defaultValue={{
                                        value: form.location,
                                        label: form.location
                                    }}
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
                                            defaultValue={form.since}
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
                                        defaultValue={form.bio}
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
                                    defaultValue={
                                        form.genres.map(
                                            x => options.genres.find(
                                                y => y.value === x
                                            )
                                        )
                                    }
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
                                    defaultValue={form.management}
                                    name="management"
                                    onChange={handleChange}
                                    placeholder="Name, website or email"/>
                                <Form.Text muted>(optional)</Form.Text>
                            </Form.Group>

                            <Button type="submit" variant="primary" block>
                                Save
                            </Button>

                        </Form>
                        <DeleteBand/>
                    </Col> : <ForbiddenPage/>
                : <Loader/>}
        </div>
    );
};

export default EditBand;