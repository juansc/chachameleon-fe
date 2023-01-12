interface RoomDisplayProps {
    roomID: string,
};

function RoomDisplay(props: RoomDisplayProps) {
    const {roomID} = props;
    return <h3>ROOM {roomID}</h3>;
}

export {RoomDisplay};
