import { Box, Container, VStack, Heading } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface SessionLayoutProps {
  children: ReactNode;
  title: string;
}

export function SessionLayout({ children, title }: SessionLayoutProps) {
  return (
    <Box minH="100vh" py={8}>
      <Container maxW="4xl">
        <VStack align="stretch" gap={4}>
          <Heading size="2xl">{title}</Heading>
          {children}
        </VStack>
      </Container>
    </Box>
  );
}
