import React, {Suspense, useContext} from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProfilePicLarge from "../../Widgets/ProfilePicLarge";
import UilGift from "@iconscout/react-unicons/icons/uil-gift";
import UilMapMarker from "@iconscout/react-unicons/icons/uil-map-marker";
import UilHeart from "@iconscout/react-unicons/icons/uil-heart";
import SubNav from "../../Navigation/SubNav";
import defaultPic from "../../../images/defaultProfile.png";
import UserSnippet from "../../Widgets/Snippets/UserSnippet";
import LinkSnippet from "../../Widgets/Snippets/LinkSnippet";
import {useHistory, useParams} from "react-router-dom";
import {FirebaseContext} from "../../Firebase";
import {useQuery} from "react-query";
import NotFoundPage from "../../ErrorPages/NotFoundPage";
import Badge from "react-bootstrap/Badge";
import options from "../../../constants/options";
import sessionStore from "../../../recoil/sessionStore";
import {useRecoilValue} from "recoil/dist";
import CreatePostButton from "../../Buttons/CreatePostButton";
import UserStats from "../../Widgets/CustomWidgets/UserStats";
import Button from "react-bootstrap/Button";
import * as ROUTES from "../../../constants/routes";
import UilBrushAlt from "@iconscout/react-unicons/icons/uil-brush-alt";
import FollowButton from "../../Buttons/FollowButton";
import BandPosts from "../../Widgets/Post/BandPosts";
import Loader from "../../Widgets/Loader";
import BandEvents from "../../Widgets/CustomWidgets/BandEvents";


/**
 *  Main Band Profile Page.
 */
const BandProfile = () => {

    const history = useHistory();
    const {bandId} = useParams();
    const session = useRecoilValue(sessionStore);

    const firebase = useContext(FirebaseContext);
    const fetchBandProfile = (key, bandId) => {
        return new Promise((resolve, reject) => {
            firebase.getBandFromDB(bandId).then(
                doc => {
                    if (doc) {
                        resolve(doc.data());
                    } else {
                        reject("Band not found");
                    }
                }
            ).catch(error => reject(error));
        });
    };

    const {data} = useQuery(["bands", bandId], fetchBandProfile, {
        staleTime: Infinity
    });

    const isPrivate = data.members.includes(session.user.id);

    return (
        !data ? <NotFoundPage title={"Band"}/> :
            <div>
                <Row className="profileBanner" style={{backgroundImage: `url(${data.banner})`}}>
                    <Col lg={12} className="pl-0 pr-0">
                        {isPrivate ?
                            <Button variant="secondary"
                                    onClick={() => history.push(ROUTES.BANDS + "/edit/" + bandId)}><UilBrushAlt/> Edit
                                Profile</Button> : null}
                    </Col>
                </Row>
                <Row className="content profileContent">
                    {/** Left Column */}
                    <Col lg={3}>
                        <div className="text-center">
                            <ProfilePicLarge src={data.picture || defaultPic}/>
                        </div>
                        <div className="profileName">
                            {data.name}

                            <FollowButton
                                bandId={bandId}
                                isFollowed={data.followers.includes(session.user.id)}
                            />
                        </div>
                        <div
                            className="profileSummary sideBarWidget leftSidebarBox sideBarWidget shadow p-3 bg-white rounded">
                        <span className="sideBarWidgetHeading">
                            About
                        </span>
                            <ul>
                                <li><UilGift/> {data.since}</li>
                                <li><UilMapMarker/> {data.location}</li>
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
                            </ul>
                            <UserSnippet users={data.membersDetailed} heading="Bandmembers"/>
                        </div>
                        <LinkSnippet
                            web={data.links?.web}
                            soundcloud={data.links?.soundcloud}
                            applemusic={data.links?.applemusic}
                            spotify={data.links?.spotify}
                            youtube={data.links?.youtube}
                            bandcamp={data.links?.bandcamp}
                            isPrivate={isPrivate}
                            isUser={false}
                            id={bandId}
                            className={"leftSidebarBox shadow bg-white rounded"}/>
                        <SubNav className="leftSidebarBox shadow p-3 bg-white rounded"/>
                    </Col>
                    {/** Mid Column */}
                    <Col lg={6}>
                        <Suspense fallback={<Loader/>}>
                            <BandPosts bandId={bandId}/>
                        </Suspense>
                    </Col>
                    {/** Right Column */}
                    <Col lg={3}>
                        {isPrivate ?
                            <UserStats
                                joined={data.created}
                                followers={data.followerCount}
                            /> : null}
                        {isPrivate ?
                            <CreatePostButton

                            /> : null}
                        <Suspense fallback={<Loader/>}>
                            <BandEvents bandId={bandId}/>
                        </Suspense>
                    </Col>
                </Row>
            </div>
    )
        ;
};

export default BandProfile;