import React, {useContext} from 'react';
import {useQuery} from "react-query";
import {FirebaseContext} from "../../Firebase";
import {formatDateLong} from "../../../constants/timeHelpers";
import {Link} from "react-router-dom";
import * as ROUTES from "../../../constants/routes";
import Badge from "react-bootstrap/Badge";
import options from "../../../constants/options";
import UilMapMarker from "@iconscout/react-unicons/icons/uil-map-marker";
import UilCalendarAlt from "@iconscout/react-unicons/icons/uil-calendar-alt";

/**
 *   Widget to show a bands' upcoming events.x
 */
const BandEvents = props => {
    const firebase = useContext(FirebaseContext);

    const fetchBandEvents = (key, bandId) => {
        return new Promise((resolve, reject) =>
            firebase.getEventsByBand(bandId)
                .then(snapshot => {
                    const buffer = [];
                    snapshot.forEach(
                        doc => {
                            if (doc) {
                                buffer.push({
                                    ...doc.data(),
                                    id: doc.ref.id
                                });
                            }
                        }
                    )
                    resolve(buffer);
                })
                .catch(error => {
                    console.log(error)
                    reject(error)
                })
        );
    }

    const {data} = useQuery(["eventsBy", props.bandId], fetchBandEvents)

    return (
        data ?
            <div className={"bandEvents mt-4"}>
                <h3>Next events</h3>
                {data.map(
                    el =>
                        <div key={el.id} className={"eventPostWidget"} style={{backgroundImage: `url(${el.banner})`}}>
                            <div className={"title"}>
                                <Link to={ROUTES.EVENTS + '/' + el.id}>{el.name}</Link>
                                <Badge variant={"info"}>
                                    {
                                        options.eventTypes.find(x => x.value === el.type).label
                                    }
                                </Badge>
                            </div>
                            <div className={"details"}>
                                <span><UilMapMarker/> {el.location}</span>
                                <span><UilCalendarAlt/> {formatDateLong(el.startTime)}</span>
                            </div>
                        </div>
                )}
            </div> : ""
    );
};

export default BandEvents;
