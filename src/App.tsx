import './App.css';
import {useEffect, useMemo} from "react";
import {WordEntries} from "./components/WordEntries";
import {CreateRoomButton} from './components/CreateRoomButton';
import {RoomDisplay} from './components/RoomDisplay';
import {PlayerNameDisplay} from './components/PlayerNameDisplay';
import {useSessionValue} from "./utils";

function App() {
    return (
        <div>
            <PlayerPage/>
        </div>
    );
}


async function makeRequest(url: string, requestInfo: RequestInit) {
    const resp = await fetch(url, requestInfo);
    if (!resp.ok) {
        throw new Error(`Error! status: ${resp.status}`);
    }
    return await resp.json();
}

const commonURL = "http://localhost:8080";

class RequestManager {
    setPlayerName: (name: string) => void;
    setRoomID: (val: string) => void;
    setRoundNum: (num: number) => void;
    setLastUpdateTs: (ts: string) => void;

    constructor(setPlayer: (name: string) => void, setRoomID: (name: string) => void, setRound: (num: number) => void, setLastTs: (name: string) => void) {
        this.setPlayerName = setPlayer;
        this.setRoomID = setRoomID;
        this.setRoundNum = setRound;
        this.setLastUpdateTs = setLastTs;
    }

    createRoomRequest(playerName: string) {
        console.log(`Creating room request callback for ${playerName}`)
        return async () => {
            console.log(`Executing room request callback for ${playerName}`)
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
            this.setRoomID(roomID);
        }
    }

    destroy() {
        console.log("I am destroyed")
    }

    joinRoomRequest(playerName: string, roomID: string) {
        return async () => {
            const url = `${commonURL}/room/${roomID}/`
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
                this.setRoomID(roomID);
            }
        }
    }

    resetState() {
        return () => {
            this.setPlayerName("");
            this.setRoomID("");
            this.setRoundNum(0);
            this.setLastUpdateTs("");
        }
    }

    // This is the only function that should have any kind of polling, since it's possible to get the exact
    // same response we got last time, and this should continue until it gets cancelled.
    roomInfoRequest = async (playerName: string, roomID: string, lastTs: string) => {
        return async () => {
            const url = `${commonURL}/room/${roomID}/`;
            let result: any = {};
            console.log("X-Last-Update: " + lastTs);
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
            this.setRoundNum(result.current_round);
            this.setLastUpdateTs(result.last_update);
            console.log("Last update time was set to: " + result.last_update);
            console.log("Expect a rerender now")
        };
    };

    // Expose my list of requests, and then this thing will call all the callbacks to update them!
    // map[requestInfo] -> Set(Fallback)
    // Caller grabs response
    // requestInfo = URL + METHOD + params

    // setCallback(requestKey, callback);
}

/*
// Goals for MVP
1. Two people can connect to the same room. One must be a chameleon and the other a regular player.
2. Words can be retrieved from the backend and displayed.
3. A room can display the players that are present.
4. A room can be reset to return new words and new chameleons.
 */

class RoundInfo {
    wordList: Array<string>;
    role: PlayerRole;
    category: string;

    constructor(role: PlayerRole, category: string, wordList: Array<string>) {
        this.category = category;
        this.role = role;
        this.wordList = wordList;
    }
}

export {RoundInfo};

enum Role {
    Unset = 'UNSET',
    KnowsSecret = 'KNOWS_SECRET',
    IsChameleon = 'CHAMELEON'
}

export {Role};

type PlayerRole =
    { type: Role.Unset } |
    { type: Role.KnowsSecret, word: string } |
    { type: Role.IsChameleon };


function UnsetRole(): PlayerRole {
    return {type: Role.Unset}
}

function SecretWordRole(word: string): PlayerRole {
    return {type: Role.KnowsSecret, word: word}
}

function ChameleonRole(): PlayerRole {
    return {type: Role.IsChameleon}
}

function PlayerPage() {
    const [playerName, setPlayerName] = useSessionValue("playerName", "");
    const [roomID, setRoomID] = useSessionValue("roomID", "");
    const [roundNum, setRoundNum] = useSessionValue("roundNum", 0);
    const [lastUpdateTsVar, setLastUpdateTs] = useSessionValue("lastUpdateTs", "");
    const [playerList, setPlayerList] = useSessionValue("playerList", []);
    const [wordList, setWordList] = useSessionValue("wordList", []);
    const [playerRole, setPlayerRole] = useSessionValue("playerRole", UnsetRole())
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
        return new RequestManager(setPlayerName, setRoomID, setRoundNum, setLastUpdateTs);
    }, [setPlayerName, setRoomID, setRoundNum, setLastUpdateTs]);

    useEffect(() => {
        return () => {
            stateMgr.destroy()
        }
    }, [stateMgr]);

    const handleClick = () => {
        let name = (document.getElementById("name-input") as HTMLInputElement).value || "";
        setPlayerName(name);
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
                    {shouldDisplayCreateRoom && <CreateRoomButton onClick={stateMgr.createRoomRequest(playerName)}/>}
                    {shouldDisplayJoinRoom && <JoinRoom callback={stateMgr.joinRoomRequest(playerName, roomID)}/>}
                    {shouldDisplayRoom &&
                        <RoundContainer playerName={playerName} roomID={roomID} roundNumber={roundNum}
                                        lastUpdateTs={lastUpdateTsVar}/>}
                    {shouldDisplayWords &&
                        <WordEntries words={words} secret_word={"Beef"} is_chameleon={true} category={"Food"}/>}
                    {shouldDisplayPlayerName && <SignOutPlayerButton onClick={stateMgr.resetState()}/>}
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
    const id = Math.round(Math.random() * 10000);
    let players: string[] = ["player"];
    console.log("room_id=" + roomID);
    console.log("player=" + playerNameStr);
    console.log("ts=" + ts);

    /*
    useEffect(() => {
        stateManager.subscribe({type: DataType.RoomUpdate, playerNameStr, roomID})
    }, [stateManager, playerNameStr, roomID]);


    useEffect(() => {
        const interval = setInterval(fn, 5000, playerNameStr, roomID, ts, id);
        return () => {
            clearInterval(interval);
        };
    }, [fn, playerNameStr, roomID, ts, id]);
     */

    return (<div>
        {players.length > 0 && <div>Players: {players.join(", ")}</div>}
    </div>);
}

export default App;
