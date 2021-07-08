import Button from "react-bootstrap/Button";
import React from "react";

import google from '../../images/icons/google.png';
import FirebaseContext from "../Firebase/context";


/**
 *  Google Signup / Login Button.
 */
const GoogleButton = props => {
    const firebase = React.useContext(FirebaseContext);

    const handleGoogleLogin = () => {
        firebase.doGoogleSignIn()
            .then(
                auth => props.callback(auth)
            )
            .catch(
                error => console.log(error)
            );
    };

    return (
        <Button variant="outline-secondary" className="signupbutton" block={props.block} onClick={handleGoogleLogin}>
            <img src={google} alt="Sign in with Google"/>
            {
                props.type === "signin" ? "Sign in with Google" : "Join with Google"
            }
        </Button>);
};

export default GoogleButton;