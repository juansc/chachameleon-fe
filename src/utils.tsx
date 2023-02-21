// useSessionValue
import {useEffect, useState} from "react";

/*
* Whenever a value is changed, we will update the session storage.
* */
function useSessionValue<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const [value, setValue] = useState<T>(() => {
            try {
                // Get from session storage by key
                const item = sessionStorage.getItem(key);
                // Parse stored json or if none return initialValue
                if (key === "lastUpdateTs") {
                    console.log("last update ts" + item);
                    console.log("last update ts parsed" +  JSON.parse(item || ""));
                }
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                return defaultValue;
            }
        }
    );

    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(value));
    }, [value]);
    return [value, setValue];
}

export {useSessionValue};
