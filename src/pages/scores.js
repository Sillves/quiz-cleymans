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
            // Fetch all participants
            const { data: participants, error: participantError } = await supabase
                .from('participants')
                .select('id, name'); // Get all participants

            if (participantError) {
                console.error('Error fetching participants:', participantError);
                setLoading(false);
                return;
            }

            // Fetch answers and aggregate scores
            const { data: answers, error: answerError } = await supabase
                .from('answers')
                .select('participant_id, is_correct');

            if (answerError) {
                console.error('Error fetching answers:', answerError);
                setLoading(false);
                return;
            }

            // Create a score map
            const scoreMap = participants.map(participant => {
                const participantAnswers = answers.filter(ans => ans.participant_id === participant.id);
                const correctAnswersCount = participantAnswers.filter(ans => ans.is_correct).length; // Count correct answers
                return { name: participant.name, score: correctAnswersCount }; // Return name and score
            });

            // Sort participants by score in descending order
            scoreMap.sort((a, b) => b.score - a.score);

            setScores(scoreMap);
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
                    <li key={index}>
                        {index === 0 && '🥇'} {/* Gold medal for 1st place */}
                        {index === 1 && '🥈'} {/* Silver medal for 2nd place */}
                        {index === 2 && '🥉'} {/* Bronze medal for 3rd place */}
                        {name}: {score}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Scores;
