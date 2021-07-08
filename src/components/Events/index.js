import React, {lazy, Suspense} from 'react';
import {AuthRoute} from "../App";
import {Switch} from "react-router-dom";
import Loader from "../Widgets/Loader";


const Event = lazy(() => import("./Event"));
const CreateEvent = lazy(() => import("./CreateEvent"));
const EditEvent = lazy(() => import("./EditEvent"));
const EventsLanding = lazy(() => import("../Landings/EventsLanding"));

/**
 * Router for /events.
 */
const Events = ({match}) => {

    return (
        <Suspense fallback={<Loader/>}>
            <Switch>
                <AuthRoute exact path={match.url + "/edit/:editEventId"}>
                    <EditEvent/>
                </AuthRoute>
                <AuthRoute exact path={match.url + "/create"}>
                    <CreateEvent/>
                </AuthRoute>
                <AuthRoute exact path={match.url}>
                    <EventsLanding/>
                </AuthRoute>
                <AuthRoute path={match.url + "/:eventId"}>
                    <Event/>
                </AuthRoute>
            </Switch>
        </Suspense>
    );
};

export default Events;
