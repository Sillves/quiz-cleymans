import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Quiz({ participantId }) {
    const router = useRouter(); // Use router for navigation
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuestions = async () => {
            const { data } = await supabase.from('questions').select('*');
            setQuestions(data);
        };

        fetchQuestions();
    }, []);

    const handleAnswerSubmit = async () => {
        const currentQuestion = questions[currentQuestionIndex];

        // Evaluate whether the selected answers are correct
        const selectedSet = new Set(selectedAnswers);
        const correctSet = new Set(currentQuestion.correct_answers);

        // Check if any selected answer is incorrect
        const hasIncorrectAnswer = [...selectedSet].some(ans => !correctSet.has(ans));

        // Determine if the user should get a point
        let isCorrect = false;
        if (!hasIncorrectAnswer) {
            // If there are no incorrect answers, check for an exact match
            isCorrect = selectedSet.size === correctSet.size && [...selectedSet].every(ans => correctSet.has(ans));
        }

        // Update score if the answer is correct
        if (isCorrect) {
            setScore(score + 1);
        }

        // Insert the answer into the database
        await supabase.from('answers').insert([{
            participant_id: participantId,
            question_id: currentQuestion.id,
            selected_answers: selectedAnswers,
            is_correct: isCorrect
        }]);

        // Reset the selected answers and move to the next question
        setSelectedAnswers([]);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    if (currentQuestionIndex >= questions.length) {
        return <div>
            <p>Your final score is {score}</p>
            {/* Button to navigate to the scores page */}
            <button onClick={() => router.push('/scores')} style={{ marginTop: '20px' }}>
                View All Scores
            </button></div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const options = Array.from({ length: currentQuestion.number_of_options }, (_, i) => String.fromCharCode(65 + i));

    return (
        <div>
            <h1>{currentQuestion.question_text}</h1>
            {options.map((option) => (
                <div
                key={option}
                onClick={() => {
                    setSelectedAnswers((prev) =>
                        prev.includes(option) ? prev.filter((a) => a !== option) : [...prev, option]
                    );
                }}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    border: '2px solid #0070f3', // Change border color as needed
                    borderRadius: '5px',
                    margin: '5px 0',
                    backgroundColor: selectedAnswers.includes(option) ? '#e0f0ff' : 'white', // Highlight when selected
                }}
            >
                <input
                    type="checkbox"
                    id={option}
                    checked={selectedAnswers.includes(option)}
                    readOnly // Prevent direct interaction with the checkbox
                    style={{
                        display: 'none', // Hide the checkbox
                    }}
                />
                <label htmlFor={option} style={{ marginLeft: '10px' }}>
                    {option}
                </label>
            </div>
            
            ))}

            <button onClick={handleAnswerSubmit}>Submit Answer</button>
        </div>
    );
}

export async function getServerSideProps({ params }) {
    return {
        props: {
            participantId: params.participantId,
        },
    };
}
