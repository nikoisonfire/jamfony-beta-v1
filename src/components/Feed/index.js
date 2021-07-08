import React, {lazy, Suspense} from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SubNav from "../Navigation/SubNav";
import SmallProfile from "../Widgets/CustomWidgets/SmallProfile";
import CreatePostButton from "../Buttons/CreatePostButton";
import BandsYouMayLike from "../Widgets/CustomWidgets/BandsYouMayLike";
import Loader from "../Widgets/Loader";
import PeopleYouMayKnow from "../Widgets/CustomWidgets/PeopleYouMayKnow";

const NewestPosts = lazy(() => import("../Widgets/Post/NewestPosts"));

/**
 * Main Feed Component. Basically logged-in homepage.
 */
const Feed = () => {
    return (
        <Row className="content mt-4">
            {/** Left Column */}
            <Col md={4} lg={3}>
                <div className="shadow p-3 bg-white mb-4 rounded text-center">
                    <SmallProfile className="leftSidebarBox d-none d-md-block"/>
                    <SubNav className=""/>
                </div>
                <PeopleYouMayKnow
                    className="leftSidebarBox d-none d-md-block shadow p-3 bg-white rounded"/>
            </Col>
            {/** Mid Column */}
            <Col md={8} lg={6}>
                <CreatePostButton block className={"mb-4 d-lg-none"}/>
                <Suspense fallback={<Loader/>}>
                    <NewestPosts/>
                </Suspense>
            </Col>
            {/** Right Column */}
            <Col className="d-none d-lg-block" lg={3}>
                <CreatePostButton block className="mb-4"/>
                <BandsYouMayLike className="shadow p-3 bg-white mb-4 rounded"/>
            </Col>
        </Row>
    );
};

export default Feed;