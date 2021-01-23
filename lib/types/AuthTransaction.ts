export interface OAuthTransaction {
  redirectUri: string;
  state: string;
  nonce: string;
}

export interface PKCETransaction extends OAuthTransaction {
  codeVerifier: string;
  codeChallengeMethod: string;
  codeChallenge: string;
}

export interface IdxTransaction extends PKCETransaction {
  interactionHandle: string;
}

export type CustomAuthTransaction = Record<string, string>;

export type AuthTransaction = IdxTransaction | PKCETransaction | OAuthTransaction | CustomAuthTransaction;

function isObjectWithProperties(obj) {
  if (!obj || typeof obj !== 'object' || Object.values(obj).length === 0) {
    return false;
  }
  return true;
}

export function isOAuthTransaction(obj: any): obj is OAuthTransaction {
  if (!isObjectWithProperties(obj)) {
    return false;
  }
  return !!obj.redirectUri;
}

export function isPKCETransaction(obj: any): obj is PKCETransaction {
  if (!isOAuthTransaction(obj)) {
    return false;
  }
  return !!(obj as any).codeVerifier;
}

export function isIdxTransaction(obj: any): obj is IdxTransaction {
  if (!isPKCETransaction(obj)) {
    return false;
  }
  return !!(obj as any).interactionHandle;
}

export function isCustomAuthTransaction(obj: any): obj is CustomAuthTransaction {
  if (!isObjectWithProperties(obj)) {
    return false;
  }
  const isAllStringValues = Object.values(obj).find((value) => (typeof value !== 'string')) === undefined;
  return isAllStringValues;
}

export function isAuthTransaction(obj: any): obj is AuthTransaction {
  if (isOAuthTransaction(obj) || isCustomAuthTransaction(obj)) {
    return true;
  }
  return false;
}
