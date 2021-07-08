import Button from "react-bootstrap/Button";
import React from "react";
import FirebaseContext from "../Firebase/context";


/**
 *  Facebook Signup / Login Button.
 */
const FacebookButton = props => {
    const firebase = React.useContext(FirebaseContext);

    const handleFacebookLogin = () => {
        firebase.doFBSignIn()
            .then(
                // TODO: Get Profile Picture on Signup
                auth => {
                    props.callback(auth.user.displayName);
                }
            )
            .catch(
                error => console.log(error)
            );
    };

    return (
        <Button variant="info" className="signupbutton" block={props.block} onClick={handleFacebookLogin}>
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="24" fill="white" viewBox="0 0 1792 1792">
                <path
                    d="M1376 128q119 0 203.5 84.5t84.5 203.5v960q0 119-84.5 203.5t-203.5 84.5h-188v-595h199l30-232h-229v-148q0-56 23.5-84t91.5-28l122-1v-207q-63-9-178-9-136 0-217.5 80t-81.5 226v171h-200v232h200v595h-532q-119 0-203.5-84.5t-84.5-203.5v-960q0-119 84.5-203.5t203.5-84.5h960z"/>
            </svg>
            {
                props.type === "signin" ? "Sign in with Facebook" : "Join with Facebook"
            }
        </Button>);
};

export default FacebookButton;