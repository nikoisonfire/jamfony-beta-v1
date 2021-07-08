import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProfilePicLarge from "../../Widgets/ProfilePicLarge";
import SubNav from "../../Navigation/SubNav";
import UserStats from "../../Widgets/CustomWidgets/UserStats";
import CreatePostButton from "../../Buttons/CreatePostButton";
import BandsYouMayLike from "../../Widgets/CustomWidgets/BandsYouMayLike";
import React, {lazy, Suspense, useContext} from "react";
import {FirebaseContext} from "../../Firebase";
import {useQuery} from "react-query";
import UilGift from "@iconscout/react-unicons/icons/uil-gift";
import UilMapMarker from "@iconscout/react-unicons/icons/uil-map-marker";
import UilHeart from "@iconscout/react-unicons/icons/uil-heart";
import UilBriefcase from "@iconscout/react-unicons/icons/uil-briefcase";
import UilHeadphonesAlt from "@iconscout/react-unicons/icons/uil-headphones-alt";
import CustomBands from "../../Widgets/CustomWidgets/CustomBands";
import Badge from "react-bootstrap/Badge";

import options from "../../../constants/options";
import {formatDate} from "../../../constants/timeHelpers";
import Loader from "../../Widgets/Loader";

import {useHistory, useParams} from "react-router-dom";
import NotFoundPage from "../../ErrorPages/NotFoundPage";
import Button from "react-bootstrap/Button";
import UilBrushAlt from "@iconscout/react-unicons/icons/uil-brush-alt";
import * as ROUTES from "../../../constants/routes";
import FriendsButton from "../../Buttons/FriendsButton";
import LinkSnippet from "../../Widgets/Snippets/LinkSnippet";
import {useRecoilValue} from "recoil";
import sessionStore from "../../../recoil/sessionStore";
import SendMessageButton from "../../Buttons/SendMessageButton";

// Suspense
const UserPosts = lazy(() => import("../../Widgets/Post/UserPosts"));

/**
 *  Main User Profile Page.
 */
const PrivateProfile = () => {
    const {userId} = useParams();

    const session = useRecoilValue(sessionStore);
    const myId = session.user.id;
    const isPrivate = myId === userId;


    const history = useHistory();

    const firebase = useContext(FirebaseContext);
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

    const staletime = isPrivate ? Infinity : 0;

    const {data} = useQuery(["users", userId], fetchUserProfile, {
        staleTime: staletime
    });

    const isFriends = data.friends.includes(myId);

    return (
        <div className="">
            {!data ? <NotFoundPage title="User"/> :
                <>
                    <Row className="profileBanner" style={{backgroundImage: `url(${data.banner})`}}>
                        <Col lg={12} className="pl-0 pr-0">
                            {isPrivate ?
                                <Button variant="secondary"
                                        onClick={() => history.push(ROUTES.EDITPROFILE)}><UilBrushAlt/> Edit
                                    Profile</Button> : null}
                        </Col>
                    </Row>
                    <Row className="content profileContent">
                        {/** Left Column */}
                        <Col lg={3}>
                            <div className="text-center">
                                <ProfilePicLarge src={data.picture}/>
                            </div>
                            <div className="profileName">
                                {data.name}
                                {isPrivate ? null :
                                    <FriendsButton
                                        from={session.user}
                                        to={userId}
                                        isFriends={isFriends}
                                        isPending={data.requests.includes(myId)}
                                    />}
                            </div>
                            <div
                                className="profileSummary sideBarWidget leftSidebarBox sideBarWidget shadow p-3 bg-white rounded">
                        <span className="sideBarWidgetHeading">
                            About
                        </span>
                                <ul>
                                    <li><UilGift/> {formatDate(data.birthday)}</li>
                                    <li><UilMapMarker/> {data.location} </li>
                                    <li>
                                        <UilHeart/>
                                        {
                                            data.genres.map(
                                                el =>
                                                    <Badge key={el}>
                                                        {options.genres.find(e => e.value === el).label}
                                                    </Badge>
                                            )
                                        }
                                    </li>
                                    <li>
                                        <UilBriefcase/>
                                        {
                                            data.occupations.map(
                                                el =>
                                                    <Badge key={el}>
                                                        {options.occupation.find(e => e.value === el).label}
                                                    </Badge>
                                            )
                                        }
                                    </li>
                                    <li>
                                        <UilHeadphonesAlt/>
                                        {
                                            data.instruments.map(
                                                el =>
                                                    <Badge key={el}>
                                                        {options.instruments.find(e => e.value === el).label}
                                                    </Badge>
                                            )
                                        }
                                    </li>
                                </ul>
                                <CustomBands bands={data.bands} heading={isPrivate ? "Your bands" : "Bands"}/>
                            </div>
                            <LinkSnippet
                                web={data.links?.web}
                                soundcloud={data.links?.soundcloud}
                                applemusic={data.links?.applemusic}
                                spotify={data.links?.spotify}
                                youtube={data.links?.youtube}
                                bandcamp={data.links?.bandcamp}
                                isPrivate={isPrivate}
                                isUser={true}
                                id={userId}
                                className={"leftSidebarBox shadow bg-white rounded"}/>
                            <SubNav className="leftSidebarBox shadow p-3 bg-white rounded"/>
                        </Col>
                        {/** Mid Column */}
                        <Col lg={6}>
                            <Suspense fallback={<Loader/>}>
                                <UserPosts userId={userId}/>
                            </Suspense>
                        </Col>
                        {/** Right Column */}
                        <Col lg={3}>
                            {
                                isFriends && !isPrivate &&
                                <SendMessageButton to={{
                                    id: userId,
                                    name: data.name,
                                    picture: data.picture
                                }} className={"mb-3"}/>
                            }
                            {
                                isPrivate ?
                                    <>
                                        <UserStats joined={data.joined}
                                                   friends={data.friends.length}
                                        />
                                        <CreatePostButton block className="mb-4"/>
                                    </> : undefined
                            }
                            <BandsYouMayLike className="shadow p-3 bg-white mb-4 rounded"/>
                        </Col>
                    </Row>
                </>
            }
        </div>
    );
};

export default PrivateProfile;