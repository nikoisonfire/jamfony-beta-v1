import React, {Fragment, Suspense, useContext} from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SmallProfile from "../Widgets/CustomWidgets/SmallProfile";
import SubNav from "../Navigation/SubNav";
import Container from "react-bootstrap/Container";
import Loader from "../Widgets/Loader";
import {useQuery} from "react-query";
import ProfileSnippet from "../Widgets/Snippets/ProfileSnippet";
import {Link, useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Badge from "react-bootstrap/Badge";
import options from "../../constants/options";
import UilMapMarker from "@iconscout/react-unicons/icons/uil-map-marker";
import UilCalendarAlt from "@iconscout/react-unicons/icons/uil-calendar-alt";
import {formatDateLong, formatTime} from "../../constants/timeHelpers";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import FirebaseContext from "../Firebase/context";
import UilHomeAlt from "@iconscout/react-unicons/icons/uil-home-alt";
import UilClockSeven from "@iconscout/react-unicons/icons/uil-clock-seven";
import CreateEventButton from "../Buttons/CreateEventButton";

/**
 *  Landing page for /events
 */
const EventsLanding = () => {
    const session = useRecoilValue(sessionStore);
    const firebase = useContext(FirebaseContext);
    const history = useHistory();

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

    const NewestEvents = () => {
        const getNewestEvents = (key, all) => {
            return new Promise((resolve, reject) => {
                firebase.getNewestEvents().then(
                    snapshot => {
                        let events = [];
                        snapshot.forEach(
                            doc => events.push({...doc.data(), id: doc.ref.id})
                        );
                        return resolve(events);
                    }
                ).catch(
                    error => reject(error)
                );
            });
        };

        const {data} = useQuery(["events", "newest"], getNewestEvents);

        return (
            <Fragment>
                <h2>Newest Events</h2>
                <div className={"landingListEvents"}>
                    {
                        data.map(
                            el =>
                                <EventBox
                                    key={el.id}
                                    data={el}
                                />
                        )
                    }
                </div>
            </Fragment>
        )
    };
    const SoonEvents = () => {
        const getSoonEvents = (key, all) => {
            return new Promise((resolve, reject) => {
                firebase.getSoonEvents().then(
                    snapshot => {
                        let events = [];
                        snapshot.forEach(
                            doc => events.push({...doc.data(), id: doc.ref.id})
                        );
                        return resolve(events);
                    }
                ).catch(
                    error => reject(error)
                );
            });
        };

        const {data} = useQuery(["events", "soon"], getSoonEvents);

        return (
            <Fragment>
                <h2>Events that happen soon</h2>
                <div className={"landingListEvents"}>
                    {
                        data.map(
                            el =>
                                <EventBox
                                    key={el.id}
                                    data={el}
                                />
                        )
                    }
                </div>
            </Fragment>
        )
    };
    const LocalEvents = () => {
        const getLocalEvents = (key, all) => {
            return new Promise((resolve, reject) => {
                firebase.getLocalEvents(user?.location).then(
                    snapshot => {
                        let events = [];
                        snapshot.forEach(
                            doc => events.push({...doc.data(), id: doc.ref.id})
                        );
                        return resolve(events);
                    }
                ).catch(
                    error => reject(error)
                );
            });
        };

        const {data} = useQuery(["events", "local"], getLocalEvents);

        return (
            data?.length > 0 &&
            <Fragment>
                <h2>Events in {user?.location.split(",")[0]}</h2>
                <div className={"landingListEvents"}>
                    {
                        data.map(
                            el =>
                                <EventBox
                                    key={el.id}
                                    data={el}
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
                        <CreateEventButton/>
                    </div>
                </Col>
                {/** Mid Column */}
                <Col md={8} lg={9}>
                    <Container className={"landing eventsLanding"}>
                        <Suspense fallback={<Loader/>}>
                            <NewestEvents/>
                            <SoonEvents/>
                            <LocalEvents/>
                        </Suspense>
                    </Container>
                </Col>
            </Row>
        </div>
    );
};

const EventBox = props => {
    const history = useHistory();

    const {
        id,
        key,
        name,
        banner,
        host,
        type,
        startTime,
        location,
        address
    } = props.data;

    return (
        <div className={"eventBox"} onClick={() => history.push(ROUTES.EVENTS + '/' + id)}>
            <div className={"banner"} style={{backgroundImage: `url(${banner})`}}>
                &nbsp;
            </div>
            <div className={"title"}>
                <Link to={ROUTES.EVENTS + '/' + id}>{name}</Link>
                <Badge variant={"info"}>
                    {
                        options.eventTypes.find(x => x.value === type).label
                    }
                </Badge>
            </div>
            <div className={"host"}>
                <ProfileSnippet user={host}/>
            </div>
            <div className={"details"}>
                <span><UilMapMarker/> {location}</span>
                <span><UilHomeAlt/> {address}</span>
                <span><UilCalendarAlt/> {formatDateLong(startTime)}</span>
                <span><UilClockSeven/> {formatTime(startTime)}</span>
            </div>
        </div>
    );
};

export default EventsLanding;
