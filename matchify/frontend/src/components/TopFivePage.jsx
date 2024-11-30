import React, {useState} from 'react';

function TopFivePage(){

    const [artists, setArtists] = useState("", "","","","");

    const handleChange = (index, event) =>{
        const newArtists = [...artists];
        newArtists[index] = event.target.value;
        setArtists(newArtists)
    };

    const handleSubmit = (event) => {
        event.preventDefault()
        console.log("Submitted Artists: ", artists)
    }
    return (
        <div>
            <h1>Enter in your Top Five Artists: </h1>
            <form onSubmit = {handleSubmit}>
                {artists.map((artist, index) => (
                    <input 
                        key = {index}
                        type = "text"
                        value = {atist}
                        onChange = {(e) => handleChange(index,e)}
                        placeholder = {`Artist #${index + 1}`}
                        style= {{ display: 'block', margin: '10px 0' }}
                        />
                ))}
                <button type = "submit">Submit: </button>
            </form>
            <div>
                <h2> Your top artists: </h2>
                <ul>
                    {artists.map((artis, index) => artist && <li key= {index}>{artist}</li> )}
                </ul>
            </div>
        </div>
    )
}

export default TopFivePage;