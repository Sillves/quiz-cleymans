export interface Participant {
    id: string;           // Unique identifier for the participant
    name: string;         // Name of the participant
    score?: number;       // Total score of the participant (optional)
    createdAt?: Date;     // Date the participant was created (optional)
    updatedAt?: Date;     // Date the participant was last updated (optional)
}