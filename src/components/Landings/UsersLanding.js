import React, {Fragment, Suspense, useContext} from "react";
import {useQuery} from "react-query";
import FirebaseContext from "../Firebase/context";
import Loader from "../Widgets/Loader";
import Image from "react-bootstrap/Image";
import Badge from "react-bootstrap/Badge";
import options from "../../constants/options";
import {useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import UilMapMarker from "@iconscout/react-unicons/icons/uil-map-marker";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SmallProfile from "../Widgets/CustomWidgets/SmallProfile";
import SubNav from "../Navigation/SubNav";
import CreateBandButton from "../Buttons/CreateBandButton";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

/**
 *  Landing page for /users
 */
const UsersLanding = () => {
    const firebase = useContext(FirebaseContext);
    const session = useRecoilValue(sessionStore);

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

    const {data: user} = useQuery(["users", session.user.id], fetchUserProfile);

    const NewestUsers = () => {
        const getNewestUsers = (key, all) => {
            return new Promise((resolve, reject) => {
                firebase.getNewestUsers().then(
                    snapshot => {
                        let users = [];
                        snapshot.forEach(
                            doc => users.push({...doc.data(), id: doc.id})
                        );
                        return resolve(users.filter(x => x.id !== session.user.id));
                    }
                ).catch(
                    error => reject(error)
                );
            });
        };

        const {data} = useQuery(["users", "newest"], getNewestUsers);

        return (
            <Fragment>
                <h2>Newest Musicians</h2>
                <div className={"landingList"}>
                    {
                        data.filter(x => x.id !== session.user.id).map(
                            el =>
                                <UserBox
                                    id={el.id}
                                    key={el.id}
                                    name={el.name}
                                    location={el.location}
                                    picture={el.picture}
                                    genres={el.genres}
                                    instruments={el.instruments}
                                />
                        )
                    }
                </div>
            </Fragment>
        )
    };
    const LocalUsers = () => {
        const getLocalUsers = (key, all) => {
            return new Promise((resolve, reject) => {
                firebase.getLocalUsers(user.location).then(
                    snapshot => {
                        let users = [];
                        snapshot.forEach(
                            doc => users.push({...doc.data(), id: doc.id})
                        );
                        return resolve(users.filter(x => x.id !== session.user.id));
                    }
                ).catch(
                    error => reject(error)
                );
            });
        };

        const {data} = useQuery(["users", "local"], getLocalUsers);

        const location = user?.location.split(",")[0];

        return (
            <Fragment>
                <h2>Musicians from {location}</h2>
                <div className={"landingList"}>
                    {
                        data.filter(x => x.id !== session.user.id).map(
                            el =>
                                <UserBox
                                    key={el.id}
                                    id={el.id}
                                    name={el.name}
                                    location={el.location}
                                    picture={el.picture}
                                    genres={el.genres}
                                    instruments={el.instruments}
                                />
                        )
                    }
                </div>
            </Fragment>
        )
    };

    return (
        <div>
            <Row className="content mt-4">
                {/** Left Column */}
                <Col md={4} lg={3}>
                    <div className="shadow p-3 bg-white mb-4 rounded text-center">
                        <SmallProfile className="leftSidebarBox d-none d-md-block"/>
                        <SubNav className=""/>
                    </div>
                    <div className="shadow p-3 bg-white mb-4 rounded text-center">
                        <CreateBandButton/>
                    </div>
                </Col>
                {/** Mid Column */}
                <Col md={8} lg={9}>
                    <Container className={"landing"}>
                        <Suspense fallback={<Loader/>}>
                            <Row>
                                <NewestUsers/>
                                <LocalUsers/>
                            </Row>
                        </Suspense>
                    </Container>
                </Col>
            </Row>
        </div>
    )
};

const UserBox = props => {
    const history = useHistory();
    const {
        id,
        name,
        location,
        picture,
        instruments,
        genres,
    } = props;

    return (
        <div className="userBox" onClick={() => history.push(ROUTES.USERS + '/' + id)}>
            <Image src={picture} roundedCircle className={"avatar"}/>
            <div className="name">{name}</div>
            <div className="location">
                <UilMapMarker/>
                {location}
            </div>
            <div className="instruments">
                {
                    instruments.map(
                        el =>
                            <Badge key={el} variant="primary">
                                {options.instruments.find(e => e.value === el).label}
                            </Badge>
                    )
                }
            </div>
            <div className={"genres"}>
                {
                    genres && genres.map(
                        el =>
                            <Button key={el} variant="outline-secondary" size={"sm"}>
                                {options.genres.find(e => e.value === el).label}
                            </Button>
                    )
                }
            </div>
        </div>
    );
};


export default UsersLanding;