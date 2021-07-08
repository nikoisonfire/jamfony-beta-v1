import fetchJsonp from "fetch-jsonp";
import * as ROUTE from "./routes";
import * as _ from "lodash";

// Returns the time since a @timestamp in the format of "... minutes ago", "... days ago"
export const timeSince = (timestamp, isNotFB) => {
    let date;

    if (isNotFB) {
        date = new Date(timestamp.seconds * 1000)
    } else {
        date = timestamp.toDate();
    }

    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        const s = interval >= 2 ? "s" : "";
        return interval + " year" + s;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        const s = interval >= 2 ? "s" : "";
        return interval + " month" + s;
    }
    interval = Math.floor(seconds / 86400);
    if (interval > .9) {
        const s = interval >= 2 ? "s" : "";
        return interval + " day" + s;
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        const s = interval >= 2 ? "s" : "";
        return interval + " hour" + s;
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        const s = interval >= 2 ? "s" : "";
        return interval + " minute" + s;
    }
    return Math.floor(seconds) + " seconds";
};

// Converts timestamp to Date in the form of dd M Y - e.g. 22 May 2020
export const formatDate = (timestamp) => {
    return timestamp.toDate().toLocaleString("en-GB", {year: 'numeric', month: 'long', day: 'numeric'});
};

// Converts timestamp to a long date - e.g. Tuesday, 22 May 2020
export const formatDateLong = (timestamp) => {
    return timestamp.toDate().toLocaleString("en-GB", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
// Converts timestamp to corresponding time of day - e.g. 12:30
export const formatTime = (timestamp) => {
    return timestamp.toDate().toLocaleString("en-GB", {hour: 'numeric', minute: 'numeric'});
};

// Converts timestamp to time value for <input type="time" />
export const formatTimeInput = (timestamp) => {
    const date = timestamp.toDate();
    const leadingZeroHour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const leadingZeroMinute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return leadingZeroHour + ':' + leadingZeroMinute;
}

// Converts timestamp to date value for <input type="date" />
export const formatDateInput = (timestamp) => {
    const date = timestamp.toDate();
    const month = date.getMonth() + 1;
    const zeroMonth = month < 10 ? '0' : '';
    const zeroDay = date.getDate() < 10 ? '0' : '';
    return date.getFullYear() + '-' + zeroMonth + month + '-' + zeroDay + date.getDate();
};

export const getDateNowInput = () => {
    const date = new Date(Date.now());
    const month = date.getMonth() + 1;
    const zeroMonth = month < 10 ? '0' : '';
    const zeroDay = date.getDate() < 10 ? '0' : '';
    return date.getFullYear() + '-' + zeroMonth + month + '-' + zeroDay + date.getDate();
};

// Converts timestamp to time since message created
// if > 24 hours : ... days ago
// if < 24 hours : 18:00 (time of current day)
export const formatMsgTime = (timestamp) => {
    const now = Date.now();

    if (now - timestamp > 86400000) {
        return timeSince({seconds: timestamp / 1000}, true) + " ago";
    } else {
        return new Date(timestamp).toLocaleString("en-GB", {hour: 'numeric', minute: 'numeric'});
    }
};

// Converts to value for <input type="datetime-local" />
// UNUSED
export const formatDateTimeInput = (timestamp) => {
    const date = timestamp.toDate();
    const month = date.getMonth() + 1;
    const leadingZeroMonth = month < 10 ? '0' + month : month;
    const leadingZeroDay = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const dateString = date.getFullYear() + '-' + leadingZeroMonth + '-' + leadingZeroDay;
    const dateTime = date.getHours() + ':' + date.getMinutes() + ':00.000';
    const fullDate = dateString + 'T' + dateTime;

    return fullDate;
};

// Creates a unique id after the uuidv4 algorithm
export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
};

// Returns promise to async-select (react-select) field for location search
export const handleLocationChange = inputValue => {
    inputValue = inputValue.replace(/ä/gi, 'a');
    inputValue = inputValue.replace(/ö/gi, 'o');
    inputValue = inputValue.replace(/ü/gi, 'u');
    if (inputValue.length > 2) {
        return new Promise((resolve, reject) => {
            fetchJsonp(`https://secure.geobytes.com/AutoCompleteCity?key=7c756203dbb38590a66e01a5a3e1ad96&q=${inputValue}`)
                .then(response => response.json())
                .then(json => {
                    let buffer = [];
                    json.forEach(
                        element => {
                            const objBuffer = {"value": element, "label": element};
                            buffer.push(objBuffer)
                        }
                    );
                    resolve(buffer);
                })
                .catch(error => reject(error));
        });
    }
};

// Validates URLs for <AddSocialLinks /> inputs.
export const validateSocialURLs = (data) => {
    //Validate Soundcloud
    if (data.soundcloud !== "" && data.soundcloud?.indexOf("soundcloud") < 0 && data.soundcloud?.indexOf("sc") < 0) {
        console.log("Soundcloud link incorrect");
        return false;
    }

    //Validate Spotify
    if (data.spotify !== "" && data.spotify?.indexOf("spotify") < 0 && data.spotify?.indexOf("sptfy") < 0) {
        console.log("Spotify link incorrect");
        return false;
    }

    //Validate Spotify
    if (data.youtube !== "" && data.youtube?.indexOf("youtu") < 0) {
        console.log("Youtube link incorrect");
        return false;
    }

    //Validate Apple Music
    if (data.applemusic !== "" && data.applemusic?.indexOf("apple") < 0) {
        console.log("Apple link incorrect");
        return false;
    }

    //Validate Bandcamp
    if (data.bandcamp !== "" && data.bandcamp?.indexOf("bandcamp") < 0) {
        console.log("Bandcamp link incorrect");
        return false;
    }

    // General Validation
    if (data.link !== ""
        && data.link?.indexOf("youtu") < 0
        && data.link?.indexOf("vim") < 0
        && data.link?.indexOf("soundcl") < 0
        && data.link?.indexOf("sc") < 0
    ) {
        return false;
    }

    return true;
};

// Returns the correct route for post headers according to the type of poster
export const getCorrectRoute = (page) => {
    switch (page) {
        case 'user':
            return ROUTE.USERS;
        case 'band':
            return ROUTE.BANDS;
        default:
            return ROUTE.FEED;
    }
};

// Split Name Function to split first and lastname in user profile
// Used mostly for email messaging
export const splitName = (name) => {
    let firstName = "", lastName = "";
    const splitName = name.split(" ");
    if (splitName.length > 0) {
        firstName = splitName[0];
        splitName.shift();
        splitName.forEach(el => lastName = lastName + el.toString() + " ");
    }

    return {
        firstName,
        lastName
    };
};

// Function to check for an empty form (object)
// Form Validation
export const checkEmptyForm = (form) => _.values(form).every(x => x !== "")