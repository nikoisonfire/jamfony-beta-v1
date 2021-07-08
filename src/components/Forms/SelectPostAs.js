import {iconOptionLabel} from "./IconSelect";
import Select from "react-select";
import React from "react";

/**
 *  React-Select Form Component to choose whether to post as Band or User.
 */
const SelectPostAs = props => {
    const {
        callback,
        user,
        defaultVal
    } = props;

    const handleSelectChange = event => callback(event.value, event.type, {
        name: event.label,
        id: event.value,
        picture: event.icon
    });

    const options = [
        {value: user.id, label: user.name, icon: user.picture, type: 'user'}
    ];
    if (user.bands) {
        user.bands.map(
            el => options.push({
                value: el.id,
                label: el.name,
                icon: el.picture,
                type: 'band'
            })
        );
    }

    return (
        <Select
            placeholder="Post as..."
            options={options}
            defaultValue={
                defaultVal ? options.find(x => x.value === defaultVal.id) : ""
            }
            onChange={handleSelectChange}
            formatOptionLabel={iconOptionLabel}
        />
    )
};

export default SelectPostAs;