import React from "react";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../recoil/sessionStore";
import {formatMsgTime} from "../../constants/timeHelpers";

/**
 *  Single Message Component.
 */
const Message = props => {
    const {
        from,
        text,
        read,
        created
    } = props.msg;

    const session = useRecoilValue(sessionStore);

    const direction = from !== session.user.id ? "left" : "right";

    return (
        <div className={"message " + direction}>
            <span>{text}</span>
            <small>{formatMsgTime(created.seconds * 1000)}</small>
        </div>
    );
}

export default Message;