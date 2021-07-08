import React, {Fragment, Suspense, useContext} from "react";
import {useQuery} from "react-query";
import FirebaseContext from "../Firebase/context";
import Loader from "../Widgets/Loader";
import Image from "react-bootstrap/Image";
import {Link, useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import UilMapMarker from "@iconscout/react-unicons/icons/uil-map-marker";
import CreateBandButton from "../Buttons/CreateBandButton";
import Col from "react-bootstrap/Col";
import SmallProfile from "../Widgets/CustomWidgets/SmallProfile";
import SubNav from "../Navigation/SubNav";
import Row from "react-bootstrap/Row";
import options from "../../constants/options";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import UilUsersAlt from "@iconscout/react-unicons/icons/uil-users-alt";

/**
 *  Landing page for /bands
 */
const BandsLanding = () => {
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

    const NewestBands = () => {
        const getNewestBands = (key, all) => {
            return new Promise((resolve, reject) => {
                firebase.getNewestBands().then(
                    snapshot => {
                        let bands = [];
                        snapshot.forEach(
                            doc => bands.push({...doc.data(), id: doc.id})
                        );
                        return resolve(bands.filter(x => !x.members.includes(session.user.id)));
                    }
                ).catch(
                    error => reject(error)
                );
            });
        };

        const {data} = useQuery(["bands", "newest"], getNewestBands);

        return (
            <Fragment>
                <h2>Newest Bands</h2>
                <div className={"landingList"}>
                    {
                        data?.length > 0 ?
                            data.map(
                                el =>
                                    <BandBox
                                        id={el.id}
                                        key={el.id}
                                        name={el.name}
                                        picture={el.picture}
                                        genres={el.genres}
                                    />
                            ) : <NoBandsYet/>
                    }
                </div>
            </Fragment>
        )
    };

    const PopularBands = () => {
        const getPopularBands = (key, all) => {
            return new Promise((resolve, reject) => {
                firebase.getPopularBands().then(
                    snapshot => {
                        let bands = [];
                        snapshot.forEach(
                            doc => bands.push({...doc.data(), id: doc.id})
                        );
                        return resolve(bands.filter(x => !x.members.includes(session.user.id)));
                    }
                ).catch(
                    error => reject(error)
                );
            });
        };

        const {data} = useQuery(["bands", "popular"], getPopularBands);

        return (
            <Fragment>
                <h2>Popular Bands</h2>
                <div className={"landingList"}>
                    {
                        data?.length > 0 ?
                            data.map(
                                el =>
                                    <BandBox
                                        id={el.id}
                                        key={el.id}
                                        name={el.name}
                                        picture={el.picture}
                                        followerCount={el.followerCount}
                                        members={el.membersDetailed}
                                    />
                            ) : <NoBandsYet/>
                    }
                </div>
            </Fragment>
        )
    };

    const LocalBands = () => {
        const getLocalBands = (key, all) => {
            return new Promise((resolve, reject) => {
                firebase.getLocalBands(user?.location).then(
                    snapshot => {
                        console.log(snapshot)
                        let bands = [];
                        snapshot.forEach(
                            doc => bands.push({...doc.data(), id: doc.ref.id})
                        );
                        //return resolve(bands.filter(x => !x.members.includes(session.user.id)));
                        return resolve(bands);
                    }
                ).catch(
                    error => reject(error)
                );
            });
        };

        const {data} = useQuery(["bands", "local"], getLocalBands);

        const location = user?.location.split(",")[0];

        return (
            <Fragment>
                <h2>Bands from {location} </h2>
                <div className={"landingList"}>
                    {
                        data?.length > 0 ?
                            data.map(
                                el =>
                                    <BandBox
                                        key={el.id}
                                        id={el.id}
                                        name={el.name}
                                        picture={el.picture}
                                        genres={el.genres}
                                        members={el.membersDetailed}
                                    />
                            ) : <NoBandsYet/>
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
                                <NewestBands/>
                            </Row>
                            <Row>
                                <Col>
                                    <PopularBands/>
                                </Col>
                                <Col>
                                    <LocalBands/>
                                </Col>
                            </Row>
                        </Suspense>
                    </Container>
                </Col>
            </Row>
        </div>
    )
};

const BandBox = props => {
    const history = useHistory();

    const {
        id,
        name,
        picture,
        genres,
        location,
        followerCount
    } = props;

    return (
        <div className={"userBox"} onClick={() => history.push(ROUTES.BANDS + '/' + id)}>
            <Image src={picture} roundedCircle className={"avatar"}/>
            <div className="name">
                <Link to={ROUTES.BANDS + "/" + id}>{name}</Link>
            </div>
            <div className="location">

                {
                    location ? <><UilMapMarker/> {location} </> : ""
                }
            </div>
            <div className={"followerCount"}>
                {
                    followerCount ? <><UilUsersAlt/> {followerCount} </> : ""
                }
            </div>
            {/*<div className="members">
                <h3>Members</h3>
                {
                    members.map(
                        el =>
                            <Link key={el.id} to={ROUTES.USERS + "/" + el.id}>
                                <ProfilePicSmall src={el.picture}/>
                                <span className={"memberName"}>{el.name}</span>
                            </Link>
                    )
                }
            </div>*/}
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


const NoBandsYet = () => (
    <div className={"userBox noFound"}>
        <span>No bands yet. You can create your own:</span>
    </div>
);


export default BandsLanding;