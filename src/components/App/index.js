import React, {lazy, Suspense} from "react";
import {BrowserRouter as Router, Link, Redirect, Route, Switch} from "react-router-dom";
import * as ROUTES from "../../constants/routes";

import {useRecoilValue} from 'recoil';

import PersistenceObserver from "./PersistenceObserver";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import logo from "../../images/logo_alt.png";
import {LoginBox} from "../Login/LoginBox";
import sessionStore from "../../recoil/sessionStore";
import Footer from "../Footer";
import ScrollToTop from "./ScrollToTop";
import {ReactQueryConfigProvider} from "react-query";
import Loader from "../Widgets/Loader";
import MainNav from "../Navigation";
import MessageObserver from "./MessageObserver";
import Privacy from "../Static/Privacy";
import ToS from "../Static/ToS";

// Suspense Lazy Loads
const Home = lazy(() => import( "../Home"));
const Feed = lazy(() => import( "../Feed"));
const CreateProfile = lazy(() => import( "../Profile/Users/CreateProfile"));
const Profile = lazy(() => import( "../Profile"));
const Messages = lazy(() => import( "../Messages"));
const Error404 = lazy(() => import( "../ErrorPages/ErrorPage"));
const Events = lazy(() => import( "../Events"));
const PostByID = lazy(() => import("../Widgets/Post/PostByID"));
const Bands = lazy(() => import( "../Profile/Bands"));

// React Query Global Config
const queryConfig = {
    shared: {
        suspense: true
    },
    queries: {
        suspense: true, // defaults to `shared.suspense`
        enabled: true,
        retry: 2,
        staleTime: 0,
        cacheTime: 20 * 60 * 1000,
        refetchOnWindowFocus: false
    }
};

/**
 *  Main Entry Point for Application
 *  has Main Router, RQuery Provider and Observers.
 */
const App = () => {
    const session = useRecoilValue(sessionStore);
    const loggedIn = !!session.loggedIn;

    return (
        <ReactQueryConfigProvider config={queryConfig}>
            <PersistenceObserver/>
            {session.user?.id && <MessageObserver/>}
            <Router>
                <Container className="h-100">
                    <Row>
                        <Col lg={12} className="pl-0 pr-0 text-md-center position-relative bg-primary">
                            <div className="headerLogo pt-2 d-inline-block">
                                <Link to={ROUTES.FEED}><img src={logo} height="80" href={"/"} className="logo"
                                                            alt="Jamfony Logo"/></Link>
                            </div>
                            <div className="d-inline-block logBox">
                                {!loggedIn ? <LoginBox/> : ""}
                            </div>
                        </Col>
                    </Row>
                    <Row className="header sticky-top bg-white">
                        <Col lg={12} className="pl-0 pr-0">
                            {
                                session.dbUser ? <MainNav/> : ""
                            }
                        </Col>
                    </Row>
                    <Suspense fallback={<Loader/>}>
                        <ScrollToTop>
                            <Switch>
                                <AuthRoute loggedIn={loggedIn} path={ROUTES.USERS} component={Profile}/>
                                <AuthRoute loggedIn={loggedIn} path={ROUTES.POSTS + "/:postId"}
                                           component={PostByID}/>
                                <AuthRoute loggedIn={loggedIn} path={ROUTES.MESSAGES}
                                           component={Messages}/>
                                <AuthRoute loggedIn={loggedIn} path={ROUTES.BANDS} component={Bands}/>
                                <AuthRoute loggedIn={loggedIn} path={ROUTES.EVENTS} component={Events}/>
                                <AuthRoute loggedIn={loggedIn} exact path={ROUTES.FEED}
                                           component={Feed}/>
                                <Route path={ROUTES.CREATE_PROFILE}
                                       component={CreateProfile}/>
                                <Route exact path={ROUTES.LOGIN}>
                                    <Home/>
                                </Route>
                                <Route exact path={'/privacy'}>
                                    <Privacy/>
                                </Route>
                                <Route exact path={'/termsofuse'}>
                                    <ToS/>
                                </Route>
                                <Route path="*">
                                    <Error404/>
                                </Route>
                            </Switch>
                        </ScrollToTop>
                    </Suspense>
                    <Row>
                        <Footer/>
                    </Row>
                </Container>
            </Router>
        </ReactQueryConfigProvider>
    );
};

/**
 *  Custom Auth Route component to redirect loggedOut-Users to Login
 */
export const AuthRoute = ({component, loggedIn, ...rest}) => {
    const session = useRecoilValue(sessionStore);


    if (session.loggedIn) {
        if (!session.dbUser) {
            console.log("")
            return <Redirect to={ROUTES.CREATE_PROFILE}/>;
        } else {
            return <Route {...rest} component={component}/>;
        }
    } else {
        console.log("Redirecting to login");
        return <Redirect to={ROUTES.LOGIN}/>;
    }
};

export default App;