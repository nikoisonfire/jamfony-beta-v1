import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import {FirebaseContext} from "../Firebase";
import defaultPic from "../../images/defaultProfile.png";
import Alert from "react-bootstrap/Alert";
import UilCamera from "@iconscout/react-unicons/icons/uil-camera";

/**
 *  Button to upload any picture (like banners, post pictures).
 */
const UploadPictureButton = props => {
    const {
        path,
        callback
    } = props;
    const [onlyPictures, setOnlyPictures] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [src, setSrc] = useState(defaultPic);
    const firebase = useContext(FirebaseContext);


    const handleFileChange = e => {
        setOnlyPictures(false);
        if (e.target.files[0]) {
            const fileObject = e.target.files[0];
            const filename = path;

            if (fileObject.type === "image/png" || fileObject.type === "image/jpeg") {
                setLoading(true);
                firebase.uploadAnyPicture(filename, fileObject)
                    .then(snapshot => {
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            setLoading(false);
                            setDone(true);
                            // Upload completed successfully, now we can get the download URL

                            snapshot.ref.getDownloadURL().then(function (downloadURL) {
                                callback(downloadURL);
                                setSrc(downloadURL);
                            });
                        }
                    )
                    .catch(error => console.log);
            } else {
                setOnlyPictures(true);
                return null;
            }
        }
    };

    return (
        <div className="uploadPictureButton">
            {
                onlyPictures ? <Alert variant="danger">Only JPEG and PNG Files (Pictures) are allowed. Please try
                    again.</Alert> : ""
            }
            {
                done ?
                    <Alert variant="success">That looks great! Thank you.</Alert>
                    : <Form.File disabled={done} name="profileFile" label={
                        loading ?
                            <Spinner animation="border" role="status" size="sm">
                                <span className="sr-only">Loading...</span>
                            </Spinner> : <><UilCamera/> {props.heading || "Upload picture"}</>
                    } onChange={handleFileChange}/>
            }
        </div>
    );
};

export default UploadPictureButton;