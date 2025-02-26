import { ClipboardIconButton, ClipboardRoot } from '@/components/ui/clipboard';
import { Box, Grid, GridItem, Heading, Text, Flex, Card } from '@chakra-ui/react';

interface VotingToken {
  token: string;
  used: boolean;
  label?: string;
}

interface TokenListProps {
  tokens: VotingToken[];
  votingUrl: string;
  className?: string;
}

export function TokenList({ tokens, votingUrl, className }: TokenListProps) {
  return (
    <Box className={className}>
      <Heading as="h2" size="lg" mb={4}>Voting Tokens</Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={4} marginTop={5}>
        {tokens.map((token, index) => (
          <GridItem key={index} borderRadius="lg">
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="xl">{token.label ?? token.token}</Text>
                    <Text fontSize="sm">
                      {token.used ? 'Used' : 'Available'}
                    </Text>
                  </Box>
                  <ClipboardRoot value={`${votingUrl}?token=${encodeURIComponent(token.token)}`}>
                    <ClipboardIconButton disabled={token.used} />
                  </ClipboardRoot>
                </Flex>
              </Card.Body>
            </Card.Root>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
}
