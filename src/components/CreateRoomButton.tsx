interface CreateRoomProps {
    onClick: () => {}
}

function CreateRoomButton(props: CreateRoomProps) {
    return (
        <button type="submit"
                onClick={props.onClick}>Create Room
        </button>
    );
}

export {CreateRoomButton};
