import {useTransactionObservation_UNSTABLE} from "recoil";
import {putObjectInStorage} from "../../recoil/storageHelpers";

// TODO: Experimental state! Check for Recoil API Changes!
/**
 * Global State (Recoil) Atom Observer. Any changes are automatically stored in local storage to keep
 * persistence after closing the browser window.
 * Warning: This is still unstable as of July 2020!
 */
const PersistenceObserver = () => {
    useTransactionObservation_UNSTABLE(({atomValues, modifiedAtoms}) => {
        for (const modifiedAtom of modifiedAtoms) {
            putObjectInStorage(modifiedAtom, atomValues.get(modifiedAtom));
        }
    });
    return null;
};

// OLD Observer using regular React Hooks
// Only updates a single store. Explicit extension for every store needed.
/*const PersistenceObserver = () => {
    const observeSession = useRecoilValue(sessionStore);
    useEffect(() => {
        putObjectInStorage("sessionStore", observeSession);
    }, [observeSession]);

    return null;
};*/

export default PersistenceObserver;