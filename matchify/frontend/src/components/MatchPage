import React, {useState, useEffect} from 'react';

function MatchPage() {
    const [match, setMatch] = useState({
        username: "userMatch",
        matchPercentage: 80,
        topGenre: "Rap",
        personality: "Chill"
    });

    useEffect(() => {
        fetch('/api/match')
        .then(res => res.json())
        .then(data => setMatch(data))
        .catch(error => console.error('Error fetching match data:', error));
    }, []);


    return (
        <div>
            <h1>Your Top Match</h1>
            <div>
                <h2>Username: {match.username}</h2>
                <p>Match Percentage: {match.matchPercentage}%</p>
                <p>Top Genre: {match.topGenre}</p>
                <p>Personality Type: {match.personality}</p>
            </div>
        </div>
    );
}
export default MatchPage;

