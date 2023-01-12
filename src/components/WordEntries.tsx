interface WordEntriesProp {
    words: Array<string>;
    secret_word: string,
    is_chameleon: boolean,
    category: string,
}


function WordEntries(props: WordEntriesProp) {
    let chunks = chunkArray(props.words, 4);
    return (
        <div>
            <table id={"words-table"}>
                <caption style={{"color": "#03316d", "fontSize": "30px"}}>{props.category}</caption>
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
            {props.secret_word !== "" && <h3>Secret Word: {props.secret_word}</h3>}
            {props.is_chameleon && <h3>YOU ARE THE CHAMELEON</h3>}
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
