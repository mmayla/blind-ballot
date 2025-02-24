import { VStack, Text, Flex, Card, Progress } from '@chakra-ui/react';
import { SessionLayout } from './SessionLayout';

interface Result {
  optionId: number;
  label: string;
  voteCount: number;
}

interface ResultsProps {
  results: Result[];
}

export function Results({ results }: ResultsProps) {
  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

  return (
    <SessionLayout title="Voting Results">
      <VStack align="stretch" gap={4}>
        {[...results]
          .sort((a, b) => b.voteCount - a.voteCount)
          .map((result) => {
            const percentage = totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;

            return (
              <Card.Root key={result.optionId} variant="outline">
                <Card.Body>
                  <VStack align="stretch" gap={2}>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xl" fontWeight="medium">{result.label}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {result.voteCount} vote{result.voteCount !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                      </Text>
                    </Flex>
                    <Progress.Root value={percentage}>
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </VStack>
                </Card.Body>
              </Card.Root>
            );
          })}
        <Text fontSize="sm" color="gray.600" textAlign="center">
          Total Votes: {totalVotes}
        </Text>
      </VStack>
    </SessionLayout>
  );
}
