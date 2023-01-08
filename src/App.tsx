import './App.css';
import {useState} from "react";

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

function PlayerPage() {
    let playerNameStr = sessionStorage.getItem("playerName") || "";
    let roomIDStr = sessionStorage.getItem("roomID") || "";
    let roundNumStr = Number(sessionStorage.getItem("roundNum")) || 0;
    console.log("My roundNum is", roundNumStr);
    console.log("My playerName is", playerNameStr);

    const [playerName, setPlayerName] = useState({name: playerNameStr});
    const [roomID, setRoomID] = useState({roomID: roomIDStr});
    const [roundNum, setRoundNum] = useState({round: roundNumStr});

    console.log("setup: My roundNum is", playerName);
    console.log("setup: My playerName is", roomID);
    const createRoomRequest = async () => {
        const url = commonURL + "/room";
        let result: any = {};
        console.log("will send" + JSON.stringify({player: playerNameStr}));
        try {
            result = await makeRequest(url, {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:8080',
                    'Access-Control-Allow-Methods': 'POST',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({player: playerNameStr}),
            });
        } catch (err) {
            console.log(err);
            return
        }
        const roomID = result.room_id || "";
        console.log("Got roomID: " + roomID);
        sessionStorage.setItem("roomID", roomID);
        setRoomID({roomID: roomID});
    };

    const joinRoomRequest = async (roomIDStr: string) => {
        const url = commonURL + "/room/" + roomIDStr + "/";
        let result: any = {};
        console.log("will send" + JSON.stringify({player: playerNameStr}));
        try {
            result = await makeRequest(url, {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:8080',
                    'Access-Control-Allow-Methods': 'POST',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({player: playerNameStr}),
            });
        } catch (err) {
            console.log(err);
            return
        }
        const success = result.message === "joined room";
        if (success) {
            sessionStorage.setItem("roomID", roomIDStr);
            setRoomID({roomID: roomIDStr});
        }
    };

    const handleClick = () => {
        let name = (document.getElementById("name-input") as HTMLInputElement).value || "";
        sessionStorage.setItem("playerName", name);
        setPlayerName({name: name});
    };

    const clearName = () => {
        sessionStorage.setItem("playerName", "");
        sessionStorage.setItem("roomID", "");
        sessionStorage.setItem("roundNum", "");
        setPlayerName({name: ""});
        setRoomID({roomID: ""});
        setRoundNum({round: 0});
    };

    const joinRoom = () => {
        let roomID = (document.getElementById("room-name-input") as HTMLInputElement).value;
        sessionStorage.setItem("roomID", roomID);
        setRoomID({roomID: roomID});
    };

    const playerNameSet = Boolean(playerName.name);
    const roomIDSet = Boolean(roomID.roomID);
    const roundNumSet = Boolean(roundNum.round);

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
    console.log("Can I display room", shouldDisplayRoom);

    return (
        <div id={"container"}>
            <div id={"name-container"}>
                <h1 id={"title"}>CHACHAMELEON</h1>
                <div>
                    <div style={{"display": "flex", "flexDirection": "row", "justifyContent": "space-between"}}>
                        {shouldDisplayPlayerName && <PlayerNameDisplay name={playerName.name}/>}
                        {!shouldDisplayPlayerName && <PlayerNameSubmitButton callback={handleClick}/>}
                        {shouldDisplayRoom && <RoomDisplay roomID={roomID.roomID}/>}
                    </div>
                    {shouldDisplayCreateRoom && <CreateRoomButton callback={createRoomRequest}/>}
                    {shouldDisplayJoinRoom && <JoinRoom callback={joinRoomRequest}/>}
                    {shouldDisplayRoom && <RoundContainer playerName={playerName.name} roomID={roomID.roomID} roundNumber={roundNum.round}/>}
                    {shouldDisplayWords &&
                        <WordEntries words={words} secret_word={"Beef"} is_chameleon={true} category={"Food"}/>}
                    {shouldDisplayPlayerName && <SignOutPlayerButton callback={clearName}/>}
                </div>
            </div>
        </div>
    );
}

interface RoomDisplayProps {
    roomID: string,
};

function RoomDisplay(props: RoomDisplayProps) {
    const {roomID} = props;
    return <h3>ROOM {roomID}</h3>;
}

interface CreateRoomProps {
    callback: () => {}
}

function CreateRoomButton(props: CreateRoomProps) {
    return (
        <button type="submit"
                onClick={props.callback}>Create Room
        </button>
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

interface PlayerNameDisplayProps {
    name: string
}

function PlayerNameDisplay(props: PlayerNameDisplayProps) {
    const stuff = {
        fontFamily: "Bradley Hand",
        fontWeight: "20px",
    };
    return (<div>
        <h3 style={stuff}>CODENAME: {props.name}</h3>
    </div>)
}

interface SignOutPlayerButtonProps {
    callback: () => void
}

function SignOutPlayerButton(props: SignOutPlayerButtonProps) {
    return (
        <button type="submit"
                onClick={props.callback}>I'm out!
        </button>
    );
}

interface PlayNameSubmitButtonProps {
    callback: () => void
};

function PlayerNameSubmitButton(props: PlayNameSubmitButtonProps) {
    return (<div id="name-button">
        <input type="text" placeholder={"Enter your name"} id="name-input"/>
        <button type="submit"
                onClick={props.callback}>Submit
        </button>
    </div>);
}

interface WordEntriesProp {
    words: Array<string>;
    secret_word: string,
    is_chameleon: boolean,
    category: string,
}

interface RoundContainerProps {
    roundNumber: number
    roomID: string
    playerName: string
}

function RoundContainer(props: RoundContainerProps) {
    const roundNumberSet = props.roundNumber > 0;
    const roomID = props.roomID;
    const playerNameStr = props.playerName
    let players: string[] = [];

    const roomInfoRequest = async () => {
        const url = commonURL + "/room/" + roomID + "/";
        let result: any = {};
        try {
            result = await makeRequest(url, {
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:8080',
                    'Access-Control-Allow-Methods': 'GET',
                    'Content-Type': 'application/json',
                    'X-Player': playerNameStr,
                },
            });
        } catch (err) {
            console.log(err);
            return
        }
        players = result.players;
        props.roundNumber = result.current_round;
    }
    setInterval(roomInfoRequest, 5000);

    return (<div>
        {players.length > 0 && <div>Players: {players.join(", ")}</div>}
    </div>);
}

function WordEntries(props: WordEntriesProp) {
    let chunks = chunkArray(props.words, 4);
    return (
        <div>
            <table id={"words-table"}>
                <caption style={{"color": "#03316d", "fontSize": "30px"}}>{props.category}</caption>
                <tbody id={"words"}>
                {chunks.map(row => {
                    return (
                        <tr>
                            <td>{row[0]}</td>
                            <td>{row[1]}</td>
                            <td>{row[2]}</td>
                            <td>{row[3]}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            {props.secret_word !== "" && <h3>Secret Word: {props.secret_word}</h3>}
            {props.is_chameleon && <h3>YOU ARE THE CHAMELEON</h3>}
        </div>
    )
        ;
}

function chunkArray(list: Array<string>, n: number): Array<Array<string>> {
    if (list.length === 0) {
        return [] as string[][];
    }
    let chunked: string[][] = [];
    for (let i = 0; i < list.length; i += n) {
        chunked.push(list.slice(i, i + n));
    }
    return chunked
}

export default App;
