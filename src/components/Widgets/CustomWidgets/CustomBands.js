import React from "react";
import BandSnippet from "../Snippets/BandSnippet";

/**
 *  Shows multiple bands in a widget.
 */
const CustomBands = props => {
    const {
        className,
        heading,
        bands
    } = props;

    return (
        <div className={"sideBarWidget " + className}>
            <span className="sideBarWidgetHeading">{heading}</span>
            {bands.map(
                el =>
                    <BandSnippet key={el.id} band={el}/>
            )}
        </div>
    );
};
//

export default CustomBands;