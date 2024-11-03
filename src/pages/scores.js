import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Scores = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            const { data, error } = await supabase
                .from('answers')
                .select('participant_id, is_correct, participants(name)') // Join with participants table
                .eq('is_correct', true); // Fetch only correct answers

            if (error) {
                console.error('Error fetching scores:', error);
            } else {
                const scoreMap = data.reduce((acc, { participant_id, participants }) => {
                    const name = participants.name; // Get participant name from the join
                    acc[name] = (acc[name] || 0) + 1; // Increment score for each correct answer
                    return acc;
                }, {});

                const scoresArray = Object.entries(scoreMap).map(([name, score]) => ({ name, score }));
                setScores(scoresArray);
            }

            setLoading(false);
        };

        fetchScores();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Scores</h2>
            <ul>
                {scores.map(({ name, score }, index) => (
                    <li key={index}>{name}: {score}</li> // Use a unique key for each item
                ))}
            </ul>
        </div>
    );
};

export default Scores;
