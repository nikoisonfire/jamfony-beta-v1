import React, {lazy, Suspense} from "react";
import Loader from "../Widgets/Loader";
import {AuthRoute} from "../App";
import {Switch} from "react-router-dom";

const MessageOverview = lazy(() => import( "./MessageOverview"));

/**
 *  Router for /messages.
 *  Also kind of a wrapper for message operations.
 */
const Messages = ({match}) => {

    return (
        <Suspense fallback={<Loader/>}>
            <Switch>
                <AuthRoute exact path={match.url + "/create/:userId"} component={MessageOverview}/>
                <AuthRoute exact path={match.url + "/view/:userId"} component={MessageOverview}/>
                <AuthRoute exact path={match.url} component={MessageOverview}/>
            </Switch>
        </Suspense>
    );
};

export default Messages;