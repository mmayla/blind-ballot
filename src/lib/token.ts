import { customAlphabet } from 'nanoid';
import { decrypt, encrypt } from './crypto';

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

export function generateUniqueVotingEncryptedTokensFromLabels(labels: string[], password: string): Promise<{
  ciphertext: string
  iv: string
  salt: string
}[]> {
  const tokens = generateUniqueVotingTokens(labels.length);
  if (tokens.length !== labels.length) throw new Error('Not enough tokens');
  const labeledTokens = tokens.map((token, index) => `${token}:${labels[index]}`);

  const encryptedTokensPromises = labeledTokens.map(token => encrypt(token, password));

  return Promise.all(encryptedTokensPromises);
}

type Token = {
  token: string
  salt: string
  iv: string
  used: boolean
}

export async function decryptTokens(tokens: Token[], password: string): Promise<Token[]> {
  const decryptedTokens: Token[] = [];
  for (const token of tokens) {
    const decryptedToken = await decrypt(token.token, token.iv, token.salt, password);
    decryptedTokens.push({
      ...token,
      token: decryptedToken,
    });
  }

  return decryptedTokens;
}