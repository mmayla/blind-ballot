export type Votes = Record<string, {
    label: string;
    weight: number;
}[]>

export type Cliques = {
    largestMutualGroup: {
        labels: string[];
        weight: number;
    };
    excludedLabelsMutual: {
        label: string;
        votesCount: number;
        weight: number;
    }[];
    excludedLabelsAll: {
        label: string;
        votesCount: number;
        weight: number;
    }[];
}

export function computeCliques(votes: Votes): Cliques {
    // 1. Process the input data
    const voters = Object.keys(votes);
    if (voters.length === 0) {
        return {
            largestMutualGroup: { labels: [], weight: 0 },
            excludedLabelsMutual: [],
            excludedLabelsAll: []
        };
    }

    // 2. Create a simplified representation of votes
    // For each voter, we track who they voted for and with what weight
    const voteGraph: Record<string, Record<string, number>> = {};

    for (const voter of voters) {
        voteGraph[voter] = {};
        const voteData = votes[voter];

        if (Array.isArray(voteData)) {
            // Process array of votes
            for (const vote of voteData) {
                if (vote && typeof vote === 'object' && 'label' in vote && 'weight' in vote) {
                    voteGraph[voter][vote.label] = vote.weight;
                }
            }
        }
    }

    // 3. Find the mutual group (people who voted for each other)
    // Start with all voters and remove those who don't have mutual votes
    let mutualGroup = [...voters];
    let changed = true;

    // Keep refining the mutual group until it stabilizes
    while (changed) {
        changed = false;

        for (let i = 0; i < mutualGroup.length; i++) {
            const voter = mutualGroup[i];

            // Check if this voter has voted for everyone else in the mutual group
            for (const otherVoter of mutualGroup) {
                if (voter !== otherVoter &&
                    (!voteGraph[voter]?.[otherVoter] || !voteGraph[otherVoter]?.[voter])) {
                    // Remove this voter from the mutual group
                    mutualGroup.splice(i, 1);
                    i--; // Adjust index after removal
                    changed = true;
                    break;
                }
            }
        }
    }

    // 4. If mutual group is too small, use a different approach
    // Find the top voted people instead
    if (mutualGroup.length < 2) {
        // Calculate total votes and weights for each person
        const voteCounts: Record<string, { count: number, weight: number }> = {};

        for (const voter of voters) {
            voteCounts[voter] = { count: 0, weight: 0 };
        }

        for (const voter of voters) {
            for (const [votedFor, weight] of Object.entries(voteGraph[voter] || {})) {
                if (voteCounts[votedFor]) {
                    voteCounts[votedFor].count += 1;
                    voteCounts[votedFor].weight += weight;
                }
            }
        }

        // Sort by weight and then by count
        mutualGroup = Object.entries(voteCounts)
            .sort((a, b) => {
                // First by weight
                if (b[1].weight !== a[1].weight) {
                    return b[1].weight - a[1].weight;
                }
                // Then by count
                return b[1].count - a[1].count;
            })
            .slice(0, Math.min(3, voters.length)) // Take top 3 or fewer
            .map(([voter]) => voter);
    }

    // 5. Calculate the total weight of the mutual group
    let mutualGroupWeight = 0;
    for (const voter of mutualGroup) {
        for (const otherVoter of mutualGroup) {
            if (voter !== otherVoter) {
                mutualGroupWeight += voteGraph[voter]?.[otherVoter] || 0;
            }
        }
    }

    // 6. Find excluded voters from the mutual group
    const excludedVoters = voters.filter(voter => !mutualGroup.includes(voter));

    // 7. Calculate votes from mutual group for excluded voters
    const mutualGroupVotes: Record<string, { count: number, weight: number }> = {};

    for (const excluded of excludedVoters) {
        mutualGroupVotes[excluded] = { count: 0, weight: 0 };

        for (const mutual of mutualGroup) {
            const weight = voteGraph[mutual]?.[excluded] || 0;
            if (weight > 0) {
                mutualGroupVotes[excluded].count += 1;
                mutualGroupVotes[excluded].weight += weight;
            }
        }
    }

    // 8. Calculate votes from all voters for excluded voters
    const allVotes: Record<string, { count: number, weight: number }> = {};

    for (const excluded of excludedVoters) {
        allVotes[excluded] = { count: 0, weight: 0 };

        for (const voter of voters) {
            const weight = voteGraph[voter]?.[excluded] || 0;
            if (weight > 0) {
                allVotes[excluded].count += 1;
                allVotes[excluded].weight += weight;
            }
        }
    }

    // 9. Format the results according to the required interface
    return {
        largestMutualGroup: {
            labels: mutualGroup,
            weight: mutualGroupWeight
        },
        excludedLabelsMutual: Object.entries(mutualGroupVotes)
            .map(([label, { count, weight }]) => ({
                label,
                votesCount: count,
                weight
            }))
            .sort((a, b) => b.weight - a.weight),
        excludedLabelsAll: Object.entries(allVotes)
            .map(([label, { count, weight }]) => ({
                label,
                votesCount: count,
                weight
            }))
            .sort((a, b) => b.weight - a.weight)
    };
}
