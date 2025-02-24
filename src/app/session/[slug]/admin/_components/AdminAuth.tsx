import {
  Box,
  Container,
  VStack,
  Heading,
  Input,
  Button,
  Alert
} from '@chakra-ui/react';

interface AdminAuthProps {
  error: string;
  isLoading: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onVerify: () => void;
}

export function AdminAuth({
  error,
  isLoading,
  password,
  onPasswordChange,
  onVerify
}: AdminAuthProps) {
  return (
    <Box minH="100vh" py={8}>
      <Container maxW="md">
        <VStack gap={4} align="stretch">
          <Heading as="h1" size="lg">Verify Password</Heading>

          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>{error}</Alert.Title>
            </Alert.Root>
          )}

          <VStack gap={4}>
            <Input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter password"
              size="lg"
            />

            <Button
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={onVerify}
              loading={isLoading}
              disabled={!password.trim() || isLoading}
            >
              Verify
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
