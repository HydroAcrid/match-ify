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
        </div>
    )
}

export default TopFivePage;