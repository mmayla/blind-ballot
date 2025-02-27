import { useCallback, useEffect, useState } from 'react';
import { Box, Grid, GridItem, Heading, Text, Flex, Card, Alert } from '@chakra-ui/react';
import { getStoredToken } from '@/lib/auth';

type Props = {
    slug: string;
    adminPassword: string;
}

export function CliqueResults({ slug, adminPassword }: Props) {
    const [error, setError] = useState('')
    const [result, setResult] = useState<Cliques>()

    const fetchCliqueResults = useCallback(async () => {
        try {
            const authToken = getStoredToken(slug);
            const response = await fetch(`/api/sessions/${slug}/clique-results`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await response.json();
            const result = computeCliques(data)
            setResult(result);
            setError("")
        } catch (error) {
            console.error('Error fetching results:', error);
            setError('Failed to fetch results');
        }
    }, [slug]);

    useEffect(() => {
        fetchCliqueResults();
    }, [fetchCliqueResults, adminPassword]);

    return (
        <Box>
            <Heading as="h2" size="lg" mb={4}>Voting Results</Heading>
            {error && (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
            )}
        </Box>
    );
}

type Votes = Record<string, {
    label: string;
    weight: number;
}>

type Cliques = {
    largestMutualGroup: {
        labels: string[];
        weight: number;
    };
    execludedLabelsMutual: {
        label: string;
        votesCount: number;
        weight: number;
    }[];
    execludedLabelsAll: {
        label: string;
        votesCount: number;
        weight: number;
    }[];
}

function computeCliques(votes: Votes): Cliques {
    return {
        largestMutualGroup: {
            labels: ['Mayla', 'Boda'],
            weight: 250,
        },
        execludedLabelsMutual: [{
            label: 'Ashraf',
            votesCount: 5,
            weight: 35,
        }, {
            label: 'Gamal',
            votesCount: 6,
            weight: 14,
        }],
        execludedLabelsAll: [{
            label: 'Gamal',
            votesCount: 10,
            weight: 53,
        }, {
            label: 'Ashraf',
            votesCount: 7,
            weight: 50,
        }],
    }
}