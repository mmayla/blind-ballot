import { VStack, Input, Button, Alert } from '@chakra-ui/react';
import { SessionLayout } from './SessionLayout';
import { useState } from 'react';

interface TokenVerificationProps {
  onVerify: (token: string) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export function TokenVerification({ onVerify, error, loading }: TokenVerificationProps) {
  const [token, setToken] = useState('');

  const handleVerify = () => {
    if (!token.trim() || loading) return;
    onVerify(token);
  };

  return (
    <SessionLayout title="Enter Voting Token">
      <VStack align="stretch" gap={4}>
        {error && (
          <Alert.Root status="error">
            <Alert.Description>
              {error}
            </Alert.Description>
          </Alert.Root>
        )}
        <Input
          size="xl"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your token"
        />
        <Button
          size="lg"
          onClick={handleVerify}
          loading={loading}
          loadingText="Verifying..."
          disabled={!token.trim()}
          colorScheme="blue"
        >
          Verify Token
        </Button>
      </VStack>
    </SessionLayout>
  );
}
