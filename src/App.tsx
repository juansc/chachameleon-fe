import './App.css';
import {useCallback, useEffect, useState, useMemo} from "react";
import {WordEntries} from "./components/WordEntries";
import { CreateRoomButton } from './components/CreateRoomButton';
import { RoomDisplay } from './components/RoomDisplay';
import { PlayerNameDisplay } from './components/PlayerNameDisplay';

function App() {
    return (
        <div>
            <PlayerPage/>
        </div>
    );
}

// useSessionValue
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

async function makeRequest(url: string, requestInfo: RequestInit) {
    const resp = await fetch(url, requestInfo);
    if (!resp.ok) {
        throw new Error(`Error! status: ${resp.status}`);
    }
    return await resp.json();
}

/*
* Whenever a value is changed, we will update the session storage.
* */

const commonURL = "http://localhost:8080";

class RequestManager {

    // map[requestInfo] -> Set(Fallback)
    // Caller grabs response
    // requestInfo = URL + METHOD + params

    // setCallback(requestKey, callback);
};

function PlayerPage() {
    const [playerName, setPlayerName] = useSessionValue("playerName", "");
    const [roomID, setRoomID] = useSessionValue("roomID", "");
    const [roundNum, setRoundNum] = useSessionValue("roundNum", 0);
    const [lastUpdateTsVar, setLastUpdateTs] = useSessionValue("lastUpdateTs", "");
    console.log("\n\n");
    console.log("BEGIN RENDERING PLAYER PAGE");
    console.log("VALUES")
    console.log("playerName: " + playerName);
    console.log("roomID: " + roomID.toString());
    console.log("roundNum: " + roundNum.toString());
    console.log("lastUpdate: " + lastUpdateTsVar);
    console.log("END VALUES")
    console.log("LAST UPDATE TS: " + lastUpdateTsVar);

    const stateMgr = useMemo(() => {
        return new StateManager(setPlayerName, setRoomID, setRoundNum);
    }, [setPlayerName, setRoomID, setRoundNum]);

    useEffect(() => {
        return () => {
            stateMgr.destroy()
        }
    }, [stateMgr]);

    const myCallback = useCallback(() => {}, []);

    const createRoomRequest = async () => {
        const url = `${commonURL}/room`
        let result: any = {};
        try {
            result = await makeRequest(url, {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:8080',
                    'Access-Control-Allow-Methods': 'POST',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({player: playerName}),
            });
        } catch (err) {
            console.log(err);
            return
        }
        const roomID = result.room_id || "";
        setRoomID(roomID);
    };

    const joinRoomRequest = async (roomIDStr: string) => {
        const url = `${commonURL}/room/${roomIDStr}/`
        let result: any = {};
        try {
            result = await makeRequest(url, {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:8080',
                    'Access-Control-Allow-Methods': 'POST',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({player: playerName}),
            });
        } catch (err) {
            console.log(err);
            return
        }
        const success = result.message === "joined room";
        if (success) {
            setRoomID(roomIDStr);
        }
    };

    const handleClick = () => {
        let name = (document.getElementById("name-input") as HTMLInputElement).value || "";
        setPlayerName(name);
    };

    const clearName = () => {
        setPlayerName("");
        setRoomID("");
        setRoundNum(0);
        setLastUpdateTs("");
    };

    const joinRoom = () => {
        let roomID = (document.getElementById("room-name-input") as HTMLInputElement).value;
        setRoomID(roomID);
    };

    const roomInfoRequest = async (playerName: string, roomID: string, lastTs: string, id : number) => {
        const url = `${commonURL}/room/${roomID}/`
        let result: any = {};
        console.log("X-Last-Update: " + lastTs);
        console.log("id: " + id.toString());
        try {
            result = await makeRequest(url, {
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:8080',
                    'Access-Control-Allow-Methods': 'GET',
                    'Content-Type': 'application/json',
                    'X-Player': playerName,
                    'X-Last-Update': lastTs,
                },
            });
        } catch (err) {
            console.log(err);
            return
        }
        console.log("Got response, the last update is ", result.last_update)
        setRoundNum(result.current_round);
        setLastUpdateTs(result.last_update);
        console.log("Last update time was set to: " + result.last_update);
        console.log("Expect a rerender now")
    };

    const playerNameSet = Boolean(playerName);
    const roomIDSet = Boolean(roomID);
    const roundNumSet = Boolean(roundNum);

    const playerNotInARoom = playerNameSet && !roomIDSet;

    const shouldDisplayPlayerName = playerNameSet;
    const shouldDisplayRoom = playerNameSet && roomIDSet;
    const shouldDisplayCreateRoom = playerNotInARoom;
    const shouldDisplayJoinRoom = playerNotInARoom;
    const shouldDisplayWords = playerNameSet && roomIDSet && roundNumSet;

    const words: string[] = [
        "Pizza",
        "Potatoes",
        "Fish",
        "Cake",

        "Pasta",
        "Salad",
        "Soup",
        "Bread",

        "Eggs",
        "Cheese",
        "Fruit",
        "Chicken",

        "Sausage",
        "Ice Cream",
        "Chocolate",
        "Beef",
    ];
    console.log("finished declaring words")
    console.log("\n\n")

    return (
        <div id={"container"}>
            <div id={"name-container"}>
                <h1 id={"title"}>CHACHAMELEON</h1>
                <div>
                    <div style={{"display": "flex", "flexDirection": "row", "justifyContent": "space-between"}}>
                        {shouldDisplayPlayerName && <PlayerNameDisplay name={playerName}/>}
                        {!shouldDisplayPlayerName && <PlayerNameSubmitButton onClick={handleClick}/>}
                        {shouldDisplayRoom && <RoomDisplay roomID={roomID}/>}
                    </div>
                    {shouldDisplayCreateRoom && <CreateRoomButton onClick={createRoomRequest}/>}
                    {shouldDisplayJoinRoom && <JoinRoom callback={joinRoomRequest}/>}
                    {shouldDisplayRoom &&
                        <RoundContainer playerName={playerName} roomID={roomID} roundNumber={roundNum} lastUpdateTs={lastUpdateTsVar}
                                        roundRequestFn={roomInfoRequest}/>}
                    {shouldDisplayWords &&
                        <WordEntries words={words} secret_word={"Beef"} is_chameleon={true} category={"Food"}/>}
                    {shouldDisplayPlayerName && <SignOutPlayerButton onClick={clearName}/>}
                </div>
            </div>
        </div>
    );
}


interface JoinRoomProps {
    callback: (roomID: string) => {}
}

function JoinRoom(props: JoinRoomProps) {
    return (<div id="room-name-button">
        <input type="text" placeholder={"Enter your roomID"} id="room-name-input"/>
        <button type="submit"
                onClick={() => {
                    const roomID = (document.getElementById("room-name-input") as HTMLInputElement).value;
                    props.callback(roomID);
                }}>JoinRoom
        </button>
    </div>);
}


interface SignOutPlayerButtonProps {
    onClick: () => void
}

function SignOutPlayerButton(props: SignOutPlayerButtonProps) {
    return (
        <button type="submit"
                onClick={props.onClick}>I'm out!
        </button>
    );
}

interface PlayNameSubmitButtonProps {
    onClick: () => void
};

function PlayerNameSubmitButton(props: PlayNameSubmitButtonProps) {
    return (<div id="name-button">
        <input type="text" placeholder={"Enter your name"} id="name-input"/>
        <button type="submit"
                onClick={props.onClick}>Submit
        </button>
    </div>);
}

interface RoundContainerProps {
    roundNumber: number
    roomID: string
    playerName: string
    roundRequestFn: (roomID: string, playerName: string, lastUpdateTs: string, id : number) => void
    lastUpdateTs: string
}


enum DataType {
    RoomUpdate = 'ROOM_UPDATE',
    PlayerUpdate = 'PLAYER_UPDATE'
}

type Data =
    { type: DataType.RoomUpdate, playerName: string, roomID: string } |
    { type: DataType.PlayerUpdate, playerName: string };

function subscribe(data: Data) {
    switch (data.type) {
        case DataType.RoomUpdate:
            break;
    }
}


function RoundContainer(props: RoundContainerProps) {
    const roomID = props.roomID;
    const playerNameStr = props.playerName
    const ts = props.lastUpdateTs;
    const fn = props.roundRequestFn;
    const id = Math.round(Math.random() * 10000);
    let players: string[] = ["player"];
    console.log("room_id="+ roomID);
    console.log("player="+ playerNameStr);
    console.log("ts="+ ts);

    useEffect(() => {
        stateManager.subscribe({type: DataType.RoomUpdate, playerNameStr, roomID} )
    }, [stateManager, playerNameStr, roomID]);


    useEffect(() => {
        const interval = setInterval(fn, 5000, playerNameStr, roomID, ts, id);
        return () => {clearInterval(interval);};
    }, [fn, playerNameStr, roomID, ts, id]);

    return (<div>
        {players.length > 0 && <div>Players: {players.join(", ")}</div>}
    </div>);
}

export default App;
