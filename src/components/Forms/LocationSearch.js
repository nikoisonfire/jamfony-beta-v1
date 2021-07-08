import React, {useState} from 'react';
import PlacesAutocomplete, {geocodeByAddress, getLatLng,} from 'react-places-autocomplete';


// TODO: Fucking setup this GCP Billing Garbage, this is so fucking ridicoulous, just for a few fucking place autocompletes

/**
 * Beta Location Search Form to look up places using Algolia.
 * UNUSED.
 */
const LocationSearch = props => {
    const [current, setCurrent] = useState("");

    const handleChange = address => {
        setCurrent(address);
    };

    const handleSelect = address => {
        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(latLng => console.log('Success', latLng))
            .catch(error => console.error('Error', error));
    };

    return (
        <PlacesAutocomplete
            value={current}
            onChange={handleChange}
            onSelect={handleSelect}
        >
            {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
                <div>
                    <input
                        {...getInputProps({
                            placeholder: 'Search Places ...',
                            className: 'location-search-input',
                        })}
                    />
                    <div className="autocomplete-dropdown-container">
                        {loading && <div>Loading...</div>}
                        {suggestions.map(suggestion => {
                            const className = suggestion.active
                                ? 'suggestion-item--active'
                                : 'suggestion-item';
                            // inline style for demonstration purpose
                            const style = suggestion.active
                                ? {backgroundColor: '#fafafa', cursor: 'pointer'}
                                : {backgroundColor: '#ffffff', cursor: 'pointer'};
                            return (
                                <div
                                    {...getSuggestionItemProps(suggestion, {
                                        className,
                                        style,
                                    })}
                                >
                                    <span>{suggestion.description}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </PlacesAutocomplete>
    );
};

export default LocationSearch;