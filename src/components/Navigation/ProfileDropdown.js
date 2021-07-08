import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "react-bootstrap/Image";
import UilBackspace from "@iconscout/react-unicons/icons/uil-backspace";
import UilUserCircle from "@iconscout/react-unicons/icons/uil-user-circle";
import UilCog from "@iconscout/react-unicons/icons/uil-cog";
import {useRecoilState} from "recoil";
import {FirebaseContext} from "../Firebase";
import {useHistory} from "react-router-dom";
import sessionStore from "../../recoil/sessionStore";
import * as ROUTES from "../../constants/routes";

/**
 *  Small Dropdown with Logout, Settings, etc.
 */
const ProfileDropdown = () => {
    const [session, setSession] = useRecoilState(sessionStore);
    const firebase = React.useContext(FirebaseContext);
    const history = useHistory();

    /**
     * Logout Function
     */
    const logOut = () => {
        firebase.doSignOut()
            .then(() => {
                    window.localStorage.clear();
                    setSession({
                        loggedIn: false
                    });
                    history.push('/login');
                }
            ).catch(error => console.log);
    };

    return (
        <div className="profileDropdown">
            <Dropdown>
                <Dropdown.Toggle variant="link">
                    <Image roundedCircle src={session.user.picture} height="24" className="mr-2"/>
                    <span className="profileDropdownName d-none d-sm-inline">{session.user.name}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu alignRight className="w-100">
                    <Dropdown.Item eventKey="1"
                                   onClick={() => history.push(ROUTES.USERS + "/" + session.user.id)}><UilUserCircle/> Profile</Dropdown.Item>
                    <Dropdown.Item eventKey="2"
                                   onClick={() => history.push(ROUTES.USERS + "/settings")}><UilCog/> Settings</Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item eventKey="4" onClick={logOut}><UilBackspace/> Log out</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

export default ProfileDropdown;