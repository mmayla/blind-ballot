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
    const selectionMap: Record<string, Record<string, number>> = {};

    for (const voter of voters) {
        selectionMap[voter] = {};
        const voteData = votes[voter];

        if (Array.isArray(voteData)) {
            // Process array of votes
            for (const vote of voteData) {
                if (vote && typeof vote === 'object' && 'label' in vote && 'weight' in vote) {
                    selectionMap[voter][vote.label] = vote.weight;
                }
            }
        }
    }

    // 3. Find all cliques and their weights using the same algorithm as the Python code
    const allCliques = findAllCliques(selectionMap);

    // 4. Find the largest weighted clique
    const [largestGroup, largestWeight] = findLargestWeightedClique(allCliques);

    // 5. Find excluded names with weighted votes of mutual group
    const excludedVotesMutual = findExcludedNamesWithVotesOfMutualGroup(selectionMap, largestGroup);

    // 6. Find excluded names with weighted votes of all participants
    const excludedVotesAll = findExcludedNamesWithVotesOfAll(selectionMap, largestGroup);

    // 7. Format the results according to the required interface
    return {
        largestMutualGroup: {
            labels: largestGroup,
            weight: largestWeight
        },
        excludedLabelsMutual: excludedVotesMutual.map(([label, votesCount, weight]) => ({
            label,
            votesCount,
            weight
        })),
        excludedLabelsAll: excludedVotesAll.map(([label, votesCount, weight]) => ({
            label,
            votesCount,
            weight
        }))
    };
}

// Helper function to find all cliques and their weights
function findAllCliques(selectionMap: Record<string, Record<string, number>>): [string[], number][] {
    const graph: Record<string, Set<string>> = {};

    // Build the graph
    for (const [person, choices] of Object.entries(selectionMap)) {
        graph[person] = new Set(Object.keys(choices));
    }

    const allCliques: [string[], number][] = [];

    // Calculate weight of a clique
    function calculateWeight(clique: string[]): number {
        let weight = 0;
        for (const person of clique) {
            for (const other of clique) {
                if (other !== person) {
                    weight += selectionMap[person]?.[other] || 0;
                }
            }
        }
        return weight;
    }

    // Generate all possible combinations of a specific size
    function combinations<T>(array: T[], size: number): T[][] {
        if (size === 0) return [[]];
        if (array.length === 0) return [];

        const result: T[][] = [];
        const restCombinations = combinations(array.slice(1), size - 1);

        for (const combination of restCombinations) {
            result.push([array[0], ...combination]);
        }

        result.push(...combinations(array.slice(1), size));

        return result;
    }

    // Check if all members of a subset form a clique
    function isClique(subset: string[]): boolean {
        for (let i = 0; i < subset.length; i++) {
            for (let j = i + 1; j < subset.length; j++) {
                const person = subset[i];
                const other = subset[j];

                // Check if person has other in their selections AND other has person in their selections
                if (!graph[person]?.has(other) || !graph[other]?.has(person)) {
                    return false;
                }
            }
        }
        return true;
    }

    const allPeople = Object.keys(graph);

    // Find cliques of size 2 or larger
    for (let size = 2; size <= allPeople.length; size++) {
        const subsets = combinations(allPeople, size);

        for (const subset of subsets) {
            if (isClique(subset)) {
                const weight = calculateWeight(subset);
                allCliques.push([subset, weight]);
            }
        }
    }

    // Sort by size (descending) and then by weight (descending)
    return allCliques.sort((a, b) => {
        // First compare by size (length of the clique)
        const sizeComparison = b[0].length - a[0].length;
        if (sizeComparison !== 0) {
            return sizeComparison;
        }
        // If sizes are equal, compare by weight
        return b[1] - a[1];
    });
}

// Helper function to find the largest weighted clique
function findLargestWeightedClique(allCliques: [string[], number][]): [string[], number] {
    return allCliques.length > 0 ? allCliques[0] : [[], 0];
}

// Helper function to find excluded names with weighted votes of mutual group
function findExcludedNamesWithVotesOfMutualGroup(
    selectionMap: Record<string, Record<string, number>>,
    largestGroup: string[]
): [string, number, number][] {
    const excludedNames = new Set(
        Object.keys(selectionMap).filter(name => !largestGroup.includes(name))
    );

    const voteCounts: Record<string, [number, number]> = {};

    // Initialize vote counts
    for (const name of excludedNames) {
        voteCounts[name] = [0, 0]; // [vote count, total weight]
    }

    // Count votes from the largest group
    for (const person of largestGroup) {
        const votes = selectionMap[person] || {};

        for (const [vote, weight] of Object.entries(votes)) {
            if (excludedNames.has(vote)) {
                voteCounts[vote][0] += 1; // Increment vote count
                voteCounts[vote][1] += weight; // Add weight
            }
        }
    }

    // Convert to array and sort by weight (descending)
    return Object.entries(voteCounts)
        .map(([name, [count, weight]]) => [name, count, weight] as [string, number, number])
        .sort((a, b) => b[2] - a[2]); // Sort by weight descending
}

// Helper function to find excluded names with weighted votes of all participants
function findExcludedNamesWithVotesOfAll(
    selectionMap: Record<string, Record<string, number>>,
    largestGroup: string[]
): [string, number, number][] {
    const allNames = new Set(Object.keys(selectionMap));
    const excludedNames = new Set(
        Array.from(allNames).filter(name => !largestGroup.includes(name))
    );

    const voteCounts: Record<string, [number, number]> = {};

    // Initialize vote counts
    for (const name of excludedNames) {
        voteCounts[name] = [0, 0]; // [vote count, total weight]
    }

    // Count votes from all participants
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [person, votes] of Object.entries(selectionMap)) {
        for (const [vote, weight] of Object.entries(votes)) {
            if (excludedNames.has(vote)) {
                voteCounts[vote][0] += 1; // Increment vote count
                voteCounts[vote][1] += weight; // Add weight
            }
        }
    }

    // Convert to array and sort by weight (descending)
    return Object.entries(voteCounts)
        .map(([name, [count, weight]]) => [name, count, weight] as [string, number, number])
        .sort((a, b) => b[2] - a[2]); // Sort by weight descending
}
