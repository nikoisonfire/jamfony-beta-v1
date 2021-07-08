import React, {lazy, Suspense} from "react";
import {Switch} from "react-router-dom";
import Loader from "../../Widgets/Loader";
import {AuthRoute} from "../../App";

const BandProfile = lazy(() => import( "./BandProfile"));
const CreateBand = lazy(() => import( "./CreateBand"));
const BandsLanding = lazy(() => import( "../../Landings/BandsLanding"));
const EditBand = lazy(() => import( "./EditBand"));

/**
 *  Router for /bands and subpages
 */
const Bands = ({match}) => {

    return (
        <Suspense fallback={<Loader/>}>
            <Switch>
                <AuthRoute exact path={match.url + "/create"}>
                    <CreateBand/>
                </AuthRoute>
                <AuthRoute exact path={match.url + "/edit/:editBandId"}>
                    <EditBand/>
                </AuthRoute>
                <AuthRoute exact path={match.url}>
                    <BandsLanding/>
                </AuthRoute>
                <AuthRoute path={match.url + "/:bandId"}>
                    <BandProfile/>
                </AuthRoute>
            </Switch>
        </Suspense>
    );
};

export default Bands;