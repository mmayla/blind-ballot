import { customAlphabet } from 'nanoid';

// Using a custom alphabet that excludes similar-looking characters
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const generateId = customAlphabet(alphabet, 4);

// Generates a secure random token that is easy to read and share
// Format: XXXX-XXXX-XXXX where X is a number or uppercase letter
// Excludes similar looking characters like 0/O, 1/I/L
export function generateVotingToken(): string {
  return `${generateId()}-${generateId()}-${generateId()}`;
}

export function generateUniqueVotingTokens(count: number): string[] {
  const tokens = new Set<string>();

  while (tokens.size < count) {
    tokens.add(generateVotingToken());
  }

  return Array.from(tokens);
}
