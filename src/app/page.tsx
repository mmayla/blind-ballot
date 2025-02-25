'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  HStack,
  Tag,
  createListCollection,
} from '@chakra-ui/react';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"


export default function Home() {
  const [sessionName, setSessionName] = useState('');
  const [sessionType, setSessionType] = useState<'approval' | 'clique'>('approval');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createSession = async () => {
    if (!sessionName.trim() || isLoading) return;
    if (!password.trim()) throw new Error("Password is required");
    if (!sessionType.trim()) throw new Error("Select session type");

    try {
      setIsLoading(true);

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sessionName,
          type: sessionType,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { session } = await response.json();
      router.push(`/session/${session.slug}/admin`);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" py={20} display="flex" alignItems="center">
      <Container fluid>
        <VStack gap={8} textAlign="center">
          <Box>
            <Heading as="h1" size="5xl" mb={2}>
              BlindBallot
            </Heading>
            <Text fontSize="xl" color="gray.500">
              Anonymous voting made simple
            </Text>
          </Box>

          <VStack gap={4} w={["full", "full", "50%"]}>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter session name"
              size="lg"
            />
            <SelectRoot collection={sessionTypes} value={[sessionType]} onValueChange={(e) => setSessionType(e.value[0] as 'approval' | 'clique')}>
              <SelectTrigger>
                <SelectValueText placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.items.map((item) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              size="lg"
              onKeyDown={(e) => e.key === 'Enter' && createSession()}
            />
            <Button
              size="lg"
              width="full"
              onClick={createSession}
              loading={isLoading}
              loadingText="Creating..."
              disabled={!sessionName.trim() || !password.trim()}
            >
              Create Session
            </Button>
          </VStack>

          <HStack gap={2} mt={8}>
            <Tag.Root size="xl" rounded={10}>
              <Tag.Label>Secure</Tag.Label>
            </Tag.Root>
            <Tag.Root size="xl" rounded={10}>
              <Tag.Label>Anonymous</Tag.Label>
            </Tag.Root>
            <Tag.Root size="xl" rounded={10}>
              <Tag.Label>Simple</Tag.Label>
            </Tag.Root>
          </HStack>

          <Text fontSize="sm" color="gray.500" maxW="md">
            Create a secure voting session where participants can anonymously vote for their preferred collaborators.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

const sessionTypes = createListCollection({
  items: [{
    label: 'Approval Voting',
    value: 'approval'
  }, {
    label: 'Clique Voting',
    value: 'clique'
  }]
});