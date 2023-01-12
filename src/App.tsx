import './App.css';
import {useEffect, useState} from "react";
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

function PlayerPage() {
    const [playerName, setPlayerName] = useSessionValue("playerName", "");
    const [roomID, setRoomID] = useSessionValue("roomID", "");
    const [roundNum, setRoundNum] = useSessionValue("roundNum", 0);

    const createRoomRequest = async () => {
        const url = `${commonURL}/room`
        let result: any = {};
        console.log("will send" + JSON.stringify({player: playerName}));
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
        console.log("Got roomID: " + roomID);
        setRoomID(roomID);
    };

    const joinRoomRequest = async (roomIDStr: string) => {
        const url = `${commonURL}/room/${roomIDStr}/`
        let result: any = {};
        console.log("will send" + JSON.stringify({player: playerName}));
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
    };

    const joinRoom = () => {
        let roomID = (document.getElementById("room-name-input") as HTMLInputElement).value;
        setRoomID(roomID);
    };

    const roomInfoRequest = async (playerName: string, roomID: string) => {
        const url = `${commonURL}/room/${roomID}/`
        let result: any = {};
        try {
            result = await makeRequest(url, {
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:8080',
                    'Access-Control-Allow-Methods': 'GET',
                    'Content-Type': 'application/json',
                    'X-Player': playerName,
                },
            });
        } catch (err) {
            console.log(err);
            return
        }
        console.log("Got response, the current round is ", result.current_round)
        setRoundNum(result.current_round);
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
                        <RoundContainer playerName={playerName} roomID={roomID} roundNumber={roundNum}
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
    roundRequestFn: (roomID: string, playerName: string) => void
}

function RoundContainer(props: RoundContainerProps) {
    const roomID = props.roomID;
    const playerNameStr = props.playerName
    let players: string[] = [];

    useEffect(() => {
        const interval = setInterval(props.roundRequestFn, 5000, playerNameStr, roomID);
        return () => clearInterval(interval);
    }, []);

    return (<div>
        {players.length > 0 && <div>Players: {players.join(", ")}</div>}
    </div>);
}

export default App;
