import './App.css';
import {useState} from "react";

function App() {
    return (
        <div>
            <PlayerPage/>
        </div>
    );
}

async function makeRequest(url, requestInfo) {
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
    const [roundNum, setRoundNum] = useState(roundNumStr);

    console.log("setup: My roundNum is", playerName);
    console.log("setup: My playerName is", roomID);
    const createRoomRequest = async () => {
        const url = commonURL + "/room";
        let result = {};
        console.log("will send" + JSON.stringify({player: playerNameStr}));
        try {
            result = await makeRequest(url, {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:8080',
                    'Access-Control-Allow-Methods': 'POST',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({player: playerNameStr})
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
        let name = document.getElementById("name-input").value;
        sessionStorage.setItem("playerName", name);
        setPlayerName({name: name});
    };

    const clearName = () => {
        sessionStorage.setItem("playerName", "");
        setPlayerName({name: ""});
    };

    const joinRoom = () => {
        let roomID = document.getElementById("room-name-input").value;
        sessionStorage.setItem("roomID", roomID);
        setRoomID({roomID: roomID});
    };

    return (
        <div>
            <PlayerName props={playerName} clickHandler={handleClick} clearName={clearName}/>
            <CreateRoomButton props={{roomID: roomID, playerID: playerName}} createRoomButton={createRoomRequest}/>
            <RoomDisplay props={{roomID: roomID, playerID: playerName}} fake={true} />
            <JoinRoom props={roomID} joinRoomFn={joinRoom}/>
        </div>
    );
}

function RoomDisplay({props, fake}) {
    console.log("My props are", props);
    let playerID = props.playerID;
    let roomID = props.roomID.roomID;
    return (
        <div>
            {roomID === "" ? <div></div> :
                <h1>ROOM {roomID}</h1>
            }
        </div>
    );
}

function CreateRoomButton(props, createRoomButton) {
    let playerID = props.playerID;
    let roomID = props.roomID;
    return (
        <div>
            {(playerID === "" || roomID !== "") ? <div></div> :
                <button type="submit"
                        onClick={createRoomButton}>Create Room
                </button>
            }
        </div>
    );
}

function JoinRoom({props, joinRoomFn}) {
    let playerID = props.playerID;
    let roomID = props.roomID;
    return (
        <div>
            {(roomID !== "" || playerID === "") ? <div></div> :
                (<div id="room-name-button">
                    <input type="text" placeholder={"Enter your roomID"} id="room-name-input"/>
                    <button type="submit"
                            onClick={joinRoomFn}>JoinRoom
                    </button>
                </div>)
            }
        </div>
    );
}

function PlayerName({props, clickHandler, clearName}) {
    let playerName = props.name;
    return (
        <div>
            {playerName !== "" ? (<div>
                    <h1>Hello {playerName}!</h1>
                    <button type="submit"
                            onClick={clearName}>I'm out!
                    </button>
                </div>) :
                (<div id="name-button">
                    <input type="text" placeholder={"Enter your name"} id="name-input"/>
                    <button type="submit"
                            onClick={clickHandler}>Submit
                    </button>
                </div>)}
        </div>
    );
}


export default App;
