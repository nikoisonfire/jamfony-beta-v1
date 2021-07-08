import React, {useState} from "react";
import UilHeart from "@iconscout/react-unicons/icons/uil-heart";

/**
 *  Button for liking / unliking Posts and Comments.
 *  Surface-level logic, DB-logic is implemented by callbacks.
 */
const LoveButton = props => {
    const iconSize = props.size;

    const [color, setColor] = useState(props.initialActive ? "#D10000" : "#000000");
    const [active, setActive] = useState(props.initialActive);
    const changeActive = () => {
        const newActive = !active;
        setActive(newActive);
        color === "#000000" ? setColor("#D10000") : setColor("#000000");
        props.callback(newActive);
    };

    const buttonNotFilled = <div className="loveButtonNotFilled">
        <UilHeart size={iconSize}/>
    </div>;

    return (
        <button className="loveButton" onClick={changeActive}>
            {
                active ? <FilledHeart size={iconSize}/> : buttonNotFilled
            }
            <span style={{fontSize: props.textSize, color: color}}>
                {props.hearts}
            </span>
        </button>
    );
};

const FilledHeart = props =>
    <div className="loveButtonFilled">
        <svg xmlns="http://www.w3.org/2000/svg" height={props.size} width={props.size} viewBox="0 0 24 24">
            <path fill="#d10000"
                  d="M12,20.8623a2.75115,2.75115,0,0,1-1.94922-.80468L3.83691,13.84277A6.27238,6.27238,0,0,1,12,4.36328a6.27239,6.27239,0,0,1,8.16309,9.47949l-6.21338,6.21387A2.75,2.75,0,0,1,12,20.8623Z"/>
        </svg>
    </div>;

export default LoveButton;