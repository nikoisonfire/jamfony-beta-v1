import React, {useContext, useState} from "react";
import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import {FirebaseContext} from "../Firebase";
import Alert from "react-bootstrap/Alert";
import UilCamera from "@iconscout/react-unicons/icons/uil-camera";
import * as ROUTES from "../../constants/routes";

/**
 *  Button to upload a profile picture.
 */
const UploadProfilePicture = props => {
    const {
        cur,
        callback,
        uid
    } = props;
    const [onlyPictures, setOnlyPictures] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [src, setSrc] = useState(cur);
    const [error, setError] = useState(null);
    const firebase = useContext(FirebaseContext);

    const handleFileChange = e => {
        setOnlyPictures(false);
        if (e.target.files[0]) {
            const fileObject = e.target.files[0];
            const filename = uid;

            if (fileObject.type === "image/png" || fileObject.type === "image/jpeg") {
                setLoading(true);
                firebase.uploadProfilePicture(filename, fileObject)
                    .then(snapshot => {
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            setDone(true);
                            // Upload completed successfully, now we can get the download URL
                        const newFileName = "thumb@200_" + filename;
                        const newUrlThumb = `https://firebasestorage.googleapis.com/v0/b/${ROUTES.PROJECTNAME}.appspot.com/o/profilePictures%2F${newFileName}?alt=media`;
                            callback(newUrlThumb);
                            setTimeout(() => {
                                setSrc(URL.createObjectURL(fileObject));
                                setLoading(false)
                            }, 2000);
                        }
                    )
                    .catch(error => setError(error));
            } else {
                setOnlyPictures(true);
                return null;
            }
        }
    };

    return (
        <div className="uploadPicture">
            <Image src={src} height={120} width={120} roundedCircle/>
            {
                onlyPictures ? <Alert variant="danger">Only JPEG and PNG Files (Pictures) are allowed. Please try
                    again.</Alert> : ""
            }
            {
                error ? <Alert variant="danger">There was an error trying to process your request, please try
                    again.</Alert> : ""
            }
            {
                done ?
                    <Alert variant="success">That looks great! Thank you.</Alert>
                    : <Form.File disabled={done} name="profileFile" label={
                        loading ?
                            <Spinner animation="border" role="status" size="sm">
                                <span className="sr-only">Loading...</span>
                            </Spinner> : <><UilCamera/> Upload Avatar </>
                    } onChange={handleFileChange}/>
            }
        </div>
    );
};

export default UploadProfilePicture;