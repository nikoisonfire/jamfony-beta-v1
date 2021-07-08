import React, {lazy, Suspense} from "react";

import {Switch} from "react-router-dom";
import Loader from "../Widgets/Loader";
import {AuthRoute} from "../App";

const PrivateProfile = lazy(() => import( "./Users/PrivateProfile"));
const EditProfile = lazy(() => import( "./Users/EditProfile"));
const SettingsProfile = lazy(() => import( "./Users/SettingsProfile"));
const UsersLanding = lazy(() => import("../Landings/UsersLanding"));


/**
 *  Router for /users and subpages
 */
const Profile = ({match}) => {

    return (
        <Suspense fallback={<Loader/>}>
            <Switch>
                <AuthRoute exact path={match.url + "/edit"}>
                    <EditProfile/>
                </AuthRoute>
                <AuthRoute exact path={match.url + "/settings"}>
                    <SettingsProfile/>
                </AuthRoute>
                <AuthRoute exact path={match.url}>
                    <UsersLanding/>
                </AuthRoute>
                <AuthRoute path={match.url + "/:userId"}>
                    <PrivateProfile/>
                </AuthRoute>
            </Switch>
        </Suspense>
    );
};


export default Profile;