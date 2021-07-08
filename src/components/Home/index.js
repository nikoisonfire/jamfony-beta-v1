import React, {useEffect} from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SignUpForm from "./SignUpForm";
import {useHistory} from "react-router-dom";
import {useRecoilValue} from "recoil";
import sessionStore from "../../recoil/sessionStore";

/**
 *  Landing page for /
 *  Front page of the entire site.
 *  TODO: Refactor this to static generated page, lazy load JS bundle.
 */
const Home = () => {
    const isLoggedIn = useRecoilValue(sessionStore).loggedIn;
    const history = useHistory();

    useEffect(() => {
        if (isLoggedIn) {
            history.push('/');
        }
    });

    return (
        <Container>
            <Row className="mt-4">
                <Col lg={6}>
                    <div className="homeInfo">
                        <h2>Connect to other people
                            who love making music.</h2>
                        <p>Join now. It's free and easy.</p>
                    </div>
                </Col>
                <Col lg={6}>
                    <SignUpForm/>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
