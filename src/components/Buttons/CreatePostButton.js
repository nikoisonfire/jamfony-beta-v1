import React, {useState} from "react";
import UilFilePlus from "@iconscout/react-unicons/icons/uil-file-plus";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import DropdownItem from "react-bootstrap/DropdownItem";
import UilCalendarAlt from "@iconscout/react-unicons/icons/uil-calendar-alt";
import UilFileAlt from "@iconscout/react-unicons/icons/uil-file-alt";
import NewPostModal from "../Modals/NewPostModal";
import UilLink from "@iconscout/react-unicons/icons/uil-link";

import {useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";

/**
 *  Dropdown Button to create different types of posts.
 */
const CreatePostButton = props => {


    const [dialogHandler, setDialogHandler] = useState("");

    const showModal = (modalType) => {
        setDialogHandler(modalType);
    };
    const hideModal = () => setDialogHandler("");

    const history = useHistory();

    return (
        <div className={"createPostButton " + props.className}>
            <Dropdown>
                {
                    dialogHandler !== "" ? <NewPostModal show={true} resetModal={hideModal} type={dialogHandler}/> : ''
                }
                <DropdownToggle id={"create-a-post-dropdown"} block="true">
                    <UilFilePlus/> Create a post
                </DropdownToggle>
                <DropdownMenu alignRight className="w-100" block="true">
                    <DropdownItem className="pb-2 pt-2" key="test" onClick={() => showModal("TEXT_POST")}>
                        <UilFileAlt/> Text
                    </DropdownItem>
                    <DropdownItem className="pb-2 pt-2" onClick={() => showModal("YOUTUBE_POST")}>
                        <UilLink/> Link / Media
                    </DropdownItem>
                    <DropdownItem className="pb-2 pt-2" onClick={() => history.push(ROUTES.EVENTS + "/create")}>
                        <UilCalendarAlt/> Event
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
};


export default CreatePostButton;