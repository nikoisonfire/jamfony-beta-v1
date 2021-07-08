import React from "react";

/**
 *  React-Select Custom Component to display icons on select values.
 **/
export const iconOptionLabel = ({value, label, icon}) => (
    <div style={{display: "flex"}}>
        <div style={{marginRight: "10px"}}>
            <img alt="" src={icon} width={30} height={30} style={{borderRadius: `100%`}}/>
        </div>
        <div>{label}</div>
    </div>
);
