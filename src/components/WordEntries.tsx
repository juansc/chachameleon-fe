import {Role, RoundInfo} from "../App";

interface WordEntriesProp {
    info: RoundInfo,
}


function WordEntries(props: WordEntriesProp) {
    const words = props.info.wordList;
    const category = props.info.category;
    const role = props.info.role;
    let secretWord = "";
    let isChameleon = false;

    switch (role.type) {
        case Role.IsChameleon:
            isChameleon = true;
            break;
        case Role.KnowsSecret:
            secretWord = role.word;
            break;
    }

    let chunks = chunkArray(words, 4);
    return (
        <div>
            <table id={"words-table"}>
                <caption style={{"color": "#03316d", "fontSize": "30px"}}>{category}</caption>
                <tbody id={"words"}>
                {chunks.map((row, ind) => {
                    return (
                        <tr key={ind}>
                            <td key={row[0]}>{row[0]}</td>
                            <td key={row[1]}>{row[1]}</td>
                            <td key={row[2]}>{row[2]}</td>
                            <td key={row[3]}>{row[3]}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            {secretWord !== "" && <h3>Secret Word: {secretWord}</h3>}
            {isChameleon && <h3>YOU ARE THE CHAMELEON</h3>}
        </div>
    );
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

export {WordEntries};
