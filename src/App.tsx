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
    let roundNumStr = sessionStorage.getItem("roundNum") || "";
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
        setRoundNum({round: ""});
    };

    const joinRoom = () => {
        let roomID = (document.getElementById("room-name-input") as HTMLInputElement).value;
        sessionStorage.setItem("roomID", roomID);
        setRoomID({roomID: roomID});
    };

    const shouldDisplay = Boolean(playerName.name);
    const shouldDisplayRoom = Boolean(playerName.name) && roomID.roomID !== "";
    const shouldDisplayCreateRoom = Boolean(roomID.roomID === "");
    const shouldDisplayJoinRoom = Boolean(roomID.roomID === "" && playerName.name);

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
            <h1 id={"title"}>CHAMELEON</h1>
            <div>
                {shouldDisplay && <PlayerNameDisplay name={playerName.name}/>}
                {shouldDisplay && <SignOutPlayerButton callback={clearName}/>}
                {!shouldDisplay && <PlayerNameSubmitButton callback={handleClick}/>}
                {shouldDisplayRoom && <RoomDisplay roomID={roomID.roomID}/>}
                {shouldDisplayCreateRoom && <CreateRoomButton callback={createRoomRequest}/>}
                {shouldDisplayJoinRoom && <JoinRoom callback={createRoomRequest}/>}
                <WordEntries words={words} secret_word={"Beef"} is_chameleon={true}/>
            </div>
        </div>
    );
}

interface RoomDisplayProps {
    roomID: string,
};

function RoomDisplay(props: RoomDisplayProps) {
    const {roomID} = props;
    return <h1>ROOM {roomID}</h1>;
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
    callback: () => {}
}

function JoinRoom(props: JoinRoomProps) {
    return (<div id="room-name-button">
        <input type="text" placeholder={"Enter your roomID"} id="room-name-input"/>
        <button type="submit"
                onClick={props.callback}>JoinRoom
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
        <h1 style={stuff}>{props.name}</h1>
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
}

function WordEntries(props: WordEntriesProp) {
    let chunks = chunkArray(props.words, 4);
    return (
        <div>
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
            {props.secret_word !== "" && <h1>Secret Word: {props.secret_word}</h1>}
            {props.is_chameleon && <h1>YOU ARE THE CHAMELEON</h1>}
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
