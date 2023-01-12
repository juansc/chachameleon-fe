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

export {PlayerNameDisplay};