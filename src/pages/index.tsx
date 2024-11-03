import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const HomePage = () => {
    const router = useRouter();
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState('');

    useEffect(() => {
        const fetchParticipants = async () => {
            const { data, error } = await supabase
                .from('participants') // Assuming you have a 'participants' table
                .select('*');

            if (error) {
                console.error('Error fetching participants:', error);
            } else {
                setParticipants(data);
            }
        };

        fetchParticipants();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Redirect to the quiz page with the selected participant ID
        router.push(`/quiz/${selectedParticipant}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Select Your Name</h1>
            <form onSubmit={handleSubmit}>
                <select
                    value={selectedParticipant}
                    onChange={(e) => setSelectedParticipant(e.target.value)}
                    required
                >
                    <option value="">Select your name</option>
                    {participants.map((participant) => (
                        <option key={participant.id} value={participant.id}>
                            {participant.name} {/* Assuming each participant has a 'name' field */}
                        </option>
                    ))}
                </select>
                <button type="submit" style={{ marginLeft: '10px' }}>
                    Start Quiz
                </button>
            </form>
        </div>
    );
};

export default HomePage;
