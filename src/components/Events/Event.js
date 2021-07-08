import React, {useContext} from 'react';
import Col from "react-bootstrap/Col";
import SmallProfile from "../Widgets/CustomWidgets/SmallProfile";
import SubNav from "../Navigation/SubNav";
import Row from "react-bootstrap/Row";
import {queryCache, useQuery} from "react-query";
import {useHistory, useParams} from "react-router-dom";
import FirebaseContext from "../Firebase/context";
import NotFoundPage from "../ErrorPages/NotFoundPage";
import Badge from "react-bootstrap/Badge";

import options from "../../constants/options";
import UilCalendarAlt from "@iconscout/react-unicons/icons/uil-calendar-alt";
import UilMapMarker from "@iconscout/react-unicons/icons/uil-map-marker";
import UilHomeAlt from "@iconscout/react-unicons/icons/uil-home-alt";
import {formatDateLong, formatTime} from "../../constants/timeHelpers";
import UilClockSeven from "@iconscout/react-unicons/icons/uil-clock-seven";
import ProfileSnippet from "../Widgets/Snippets/ProfileSnippet";
import Button from "react-bootstrap/Button";
import * as ROUTES from "../../constants/routes";
import UilBrushAlt from "@iconscout/react-unicons/icons/uil-brush-alt";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import InviteToEventModal from "../Modals/InviteToEventModal";
import PostEventToWall from "../Modals/PostEventToWall";

import _ from "lodash";

import AttendEventButton from "../Buttons/AttendEventButton";
import UilUsersAlt from "@iconscout/react-unicons/icons/uil-users-alt";

/**
 * Display a single event component.
 */
const Event = (props) => {
    const {eventId} = useParams();
    const session = useRecoilValue(sessionStore);
    const firebase = useContext(FirebaseContext);
    const history = useHistory();

    const fetchEventData = (key, eId) => {
        return new Promise((resolve, reject) => firebase.getEvent(eventId)
            .then(
                doc => doc ? resolve(doc.data()) : reject("Event not found")
            ).catch(error => reject(error))
        );
    }

    const {data} = useQuery(["events", eventId], fetchEventData);

    const isPrivate = data?.host.id === session.user.id || session.user.bands.find(x => x.id === data?.host.id)

    const invitedAndAttending = _.uniq(data.attending?.concat(data.invited));

    return (
        <div className={"events"}>
            <Row className="content mt-4">
                {/** Left Column */}
                <Col md={4} lg={3}>
                    <div className="shadow p-3 bg-white mb-4 rounded text-center">
                        <SmallProfile className="leftSidebarBox d-none d-md-block"/>
                        <SubNav className=""/>
                    </div>
                </Col>
                {/** Mid Column */}
                <Col md={8} lg={8}>
                    {
                        !data ? <NotFoundPage title={"Event"}/>
                            :
                            <div className={"event"}>
                                <div className={"eventBanner"} style={{backgroundImage: `url(${data.banner})`}}>
                                    {
                                        isPrivate ?
                                            <Button variant="secondary"
                                                    onClick={() => history.push(ROUTES.EVENTS + "/edit/" + eventId)}><UilBrushAlt/> Edit
                                                Event</Button> : null
                                    }
                                </div>
                                <div className={"title"}>
                                    {data.name}
                                    <Badge>
                                        {
                                            options.eventTypes.find(x => x.value === data.type).label
                                        }
                                    </Badge>
                                </div>
                                <div className={"host"}>
                                    <span>Hosted by <ProfileSnippet type={data.hostType} user={data.host}/></span>
                                    <AttendEventButton
                                        eventId={eventId}
                                        hostId={data.host.id}
                                        isAttending={data.attending?.includes(session.user.id)}
                                    />
                                </div>
                                <div className={"d-flex justify-content-between"}>
                                    <div className={"details"}>
                                        <ul>
                                            <li><UilHomeAlt/> {data.address}</li>
                                            <li><UilMapMarker/> {data.location}</li>
                                            <li><UilCalendarAlt/> {formatDateLong(data.startTime)}</li>
                                            <li><UilClockSeven/> {formatTime(data.startTime)}</li>
                                            <li><UilUsersAlt/> {data.attending?.length} going</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className={"description"}>
                                    <h3>Details</h3>
                                    <p>{data.description}</p>
                                </div>
                                <div className="buttons">
                                    <InviteToEventModal
                                        eventId={eventId}
                                        invited={invitedAndAttending || []}
                                        resetQuery={() => queryCache.invalidateQueries(["events", eventId])}
                                    />
                                    <PostEventToWall eventData={data}
                                                     eventId={eventId}/>
                                </div>
                            </div>
                    }
                </Col>
            </Row>
        </div>
    );
}

export default Event;