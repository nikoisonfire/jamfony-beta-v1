/**
 * Privacy options
 * @type {{privacy: [{default: boolean, text: string, db: string}, {default: boolean, text: string, db: string}, {default: boolean, text: string, db: string}]}}
 */
export const settings = {
    privacy: [
        {
            db: "hideStatus",
            text: "Hide Online Status",
            default: true
        },
        {
            db: "excludeFromSearch",
            text: "Exclude from Searches (People can only find your profile via link)",
            default: false
        },
        {
            db: "msgOnlyFriends",
            text: "Receive messages only from friends",
            default: false
        }
    ]
};