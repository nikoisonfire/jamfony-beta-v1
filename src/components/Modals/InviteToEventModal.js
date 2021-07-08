import React, {useContext, useState} from 'react';
import Button from "react-bootstrap/Button";
import {useQuery} from "react-query";
import {FirebaseContext} from "../Firebase";
import {useRecoilState} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import {SubModalManager} from "./NewPostModal";
import Modal from "react-bootstrap/Modal";
import Loader from "../Widgets/Loader";
import ProfilePicSmall from "../Widgets/ProfilePicSmall";
import FormControl from "react-bootstrap/FormControl";
import {uuidv4} from "../../constants/timeHelpers";
import _ from "lodash";
import UilEnvelopeAdd from "@iconscout/react-unicons/icons/uil-envelope-add";

/**
 *  Modal to invite Users (Friends, Followers of Band) to an event.
 *  Fetches only, when the modal is open.
 */
const InviteToEventModal = ({eventId, invited, resetQuery}) => {
        const [enableFetch, setEnableFetch] = useState(false);
        const firebase = useContext(FirebaseContext);
        const [session, setSession] = useRecoilState(sessionStore);

        const fetchUserList = (key) => {
            const userIdList = [];
            const bandIds = [];
            const userArray = [];
            return new Promise((resolve, reject) => {
                firebase.getUserFromDB(session.user.id)
                    .then(doc => {
                        if (doc) {
                            doc.data().friends.forEach(el => userIdList.push(el))
                            doc.data().bands.forEach(el => bandIds.push(el.id))
                        }
                    }).then(() => {
                    if (bandIds.length > 0) {
                        bandIds.forEach(
                            el => {
                                firebase.getBandFromDB(el).then(doc => {
                                    if (doc) {
                                        doc.data().followers.forEach(el => userIdList.push(el))
                                    }
                                }).catch(error => reject(error))
                            }
                        )
                    }
                }).then(() => {
                    const newUserList = _.difference(userIdList, invited);
                    if (newUserList.length > 0) {
                        newUserList.forEach(
                            el => firebase.getUserFromDB(el).then(
                                doc => {
                                    if (doc) {
                                        userArray.push({
                                            ...doc.data(),
                                            id: doc.ref.id
                                        });
                                    }
                                }
                            ).then(
                                () => {
                                    resolve(userArray)
                                }
                            )
                                .catch(error => reject(error))
                        );
                    } else {
                        resolve([])
                    }
                })
                    .catch(error => {
                        reject(error);
                    });
            });
        }

        const {data, status} = useQuery("inviteList", fetchUserList, {
            enabled: enableFetch,
            suspense: false
        });


        const [query, setQuery] = useState("");

        const filterItems = (arr, query) => {
            return arr.filter(el => el.name.toLowerCase().indexOf(query.toLowerCase()) !== -1)
        }

        const inviteUser = (userId) => {
            firebase.inviteUser(eventId, userId, session.user)
                .then(
                    () => {
                        document.getElementById(userId).setAttribute("disabled", "true");
                    }
                )
        }


        const [show, setShow] = useState(false);
        const handleClick = e => {
            setShow(true);
            setEnableFetch(true);
        }
        const handleClose = () => {
            setShow(false);
            document.body.className = document.body.className.replace("modal-open", "");
            resetQuery();
        };

        return (
            <div className={"inviteToEvent"}>
                <Modal show={show} onHide={handleClose} manager={new SubModalManager()}>
                    <Modal.Header>
                        <Modal.Title>Invite people</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FormControl
                            type={"search"}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <div className={"inviteUserWrapper"}>
                            {status === "loading" ? <Loader/> :
                                data?.length > 0 ?
                                    filterItems(data, query).map(
                                        el => {
                                            const btnDis = session.events?.find(x => x.id === eventId).disabled?.includes(el.id);
                                            const variant = btnDis ? "success" : "info";
                                            return (<div className={"inviteUser"} key={uuidv4()}>
                                                <div>
                                            <span className={"picture"}>
                                                <ProfilePicSmall src={el.picture}/>
                                            </span>
                                                    <span className={"name"}>
                                                {el.name}
                                            </span>
                                                </div>
                                                <Button
                                                    variant={variant}
                                                    size={"sm"}
                                                    id={el.id}
                                                    disabled={btnDis}
                                                    onClick={event => inviteUser(el.id)}>
                                                    {btnDis ? "Invited" : "Invite"}
                                                </Button>
                                            </div>)
                                        })
                                    : <div className={"noData"}>
                                        No users found
                                    </div>
                            }
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={handleClose} block>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Button variant={"info"} onClick={handleClick} size={"sm"}>
                    <UilEnvelopeAdd/> Invite people
                </Button>
            </div>

        );
    }
;

export default InviteToEventModal;
