import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Heading,
    Text,
    Flex,
    Card,
    Alert,
    VStack,
    Badge,
    Table,
    Tag,
    Button,
    Spinner
} from '@chakra-ui/react';
import { getStoredToken } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';

type Props = {
    slug: string;
    adminPassword: string;
}

export function CliqueResults({ slug, adminPassword }: Props) {
    const [error, setError] = useState('')
    const [result, setResult] = useState<Cliques>()
    const [loading, setLoading] = useState(false)

    const fetchCliqueResults = useCallback(async () => {
        try {
            setLoading(true);
            const authToken = getStoredToken(slug);

            const votingTokensResponse = await fetch(`/api/sessions/${slug}/tokens`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!votingTokensResponse.ok) {
                throw new Error('Failed to fetch voting tokens');
            }

            const votingTokens = await votingTokensResponse.json();

            const cliqueResultResponse = await fetch(`/api/sessions/${slug}/clique-results`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!cliqueResultResponse.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await cliqueResultResponse.json();
            const decryptedVotes = await decryptCliqueData(data, votingTokens.tokens, adminPassword);
            const result = computeCliques(decryptedVotes)
            setResult(result);
            setError("")
        } catch (error) {
            console.error('Error fetching results:', error);
            setError('Failed to fetch results');
        } finally {
            setLoading(false);
        }
    }, [slug, adminPassword]);

    useEffect(() => {
        fetchCliqueResults();
    }, [fetchCliqueResults, adminPassword]);

    return (
        <Card.Root p={6} mt={6}>
            <VStack gap={6} align="stretch">
                <Flex justifyContent="space-between" alignItems="center">
                    <Heading size="md">Clique Voting Results</Heading>
                    <Button
                        colorScheme="blue"
                        onClick={fetchCliqueResults}
                        loading={loading}
                        loadingText="Loading"
                    >
                        Refresh Results
                    </Button>
                </Flex>

                {loading && (
                    <Flex justify="center" py={8}>
                        <Spinner size="xl" />
                    </Flex>
                )}

                {error && (
                    <Alert.Root status="error">
                        <Alert.Description>
                            {error}
                        </Alert.Description>
                    </Alert.Root>
                )}

                {result && !loading && (
                    <VStack gap={8} align="stretch">
                        <Box>
                            <Heading size="sm" mb={3}>
                                Largest Mutual Group
                                <Badge ml={2} colorScheme="green">
                                    Weight: {result.largestMutualGroup.weight}
                                </Badge>
                            </Heading>
                            <Card.Root variant="outline" p={4}>
                                <Flex wrap="wrap" gap={2}>
                                    {result.largestMutualGroup.labels.map((label, index) => (
                                        <Tag.Root key={index} size="xl" rounded={10} variant="solid">
                                            <Tag.Label>{label}</Tag.Label>
                                        </Tag.Root>
                                    ))}
                                </Flex>
                            </Card.Root>
                        </Box>

                        {result.execludedLabelsMutual.length > 0 && (
                            <Box>
                                <Heading size="sm" mb={3}>
                                    Excluded from Mutual Group
                                </Heading>
                                <Box>
                                    <Table.Root size="sm" variant="line">
                                        <Table.Header bg="gray.100">
                                            <Table.Row>
                                                <Table.ColumnHeader>Option</Table.ColumnHeader>
                                                <Table.ColumnHeader>Votes</Table.ColumnHeader>
                                                <Table.ColumnHeader>Weight</Table.ColumnHeader>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {result.execludedLabelsMutual.map((item, index) => (
                                                <Table.Row key={index}>
                                                    <Table.Cell>{item.label}</Table.Cell>
                                                    <Table.Cell>{item.votesCount}</Table.Cell>
                                                    <Table.Cell>{item.weight}</Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Root>
                                </Box>
                            </Box>
                        )}

                        {result.execludedLabelsAll.length > 0 && (
                            <Box>
                                <Heading size="sm" mb={3}>
                                    Excluded from All Groups
                                </Heading>
                                <Box>
                                    <Table.Root size="sm" variant="line">
                                        <Table.Header bg="gray.100">
                                            <Table.Row>
                                                <Table.ColumnHeader>Option</Table.ColumnHeader>
                                                <Table.ColumnHeader>Votes</Table.ColumnHeader>
                                                <Table.ColumnHeader>Weight</Table.ColumnHeader>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {result.execludedLabelsAll.map((item, index) => (
                                                <Table.Row key={index}>
                                                    <Table.Cell>{item.label}</Table.Cell>
                                                    <Table.Cell>{item.votesCount}</Table.Cell>
                                                    <Table.Cell>{item.weight}</Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Root>
                                </Box>
                            </Box>
                        )}
                    </VStack>
                )}

                {!result && !loading && !error && (
                    <Box textAlign="center" py={8}>
                        <Text color="gray.500">
                            No results available yet
                        </Text>
                    </Box>
                )}
            </VStack>
        </Card.Root>
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

type VotingToken = {
    token: string;
    salt: string;
    iv: string;
}

async function decryptCliqueData(encryptedVotes: Votes, votingTokens: VotingToken[], decryptionKey: string): Promise<Votes> {
    const decryptedVote: Votes = {};

    for (const [key, value] of Object.entries(encryptedVotes)) {
        const token = votingTokens.find((votingToken) => votingToken.token === key);

        if (!token) {
            throw new Error(`Token ${key} not found`);
        }

        const decryptedKey = await decrypt(token.token, token.iv, token.salt, decryptionKey);
        const [, label] = decryptedKey.split(':');

        if (!decryptedKey) {
            throw new Error(`Failed to decrypt key for token ${key}`);
        }
        decryptedVote[label] = value;
    }

    return decryptedVote;
}