import fs from 'fs/promises';
import path from 'path';

const TOKENS_FILE = path.join(process.cwd(), 'src', 'data', 'jira-tokens.json');

interface JiraTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * Stores Jira OAuth tokens for a specific user.
 */
export async function storeJiraTokens(userId: string, tokens: JiraTokens) {
  let allTokens: Record<string, JiraTokens> = {};
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8');
    allTokens = JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, start fresh
  }

  allTokens[userId] = tokens;
  await fs.writeFile(TOKENS_FILE, JSON.stringify(allTokens, null, 2));
}

/**
 * Retrieves Jira OAuth tokens for a specific user.
 */
export async function getJiraTokens(userId: string): Promise<JiraTokens | null> {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8');
    const allTokens = JSON.parse(data);
    return allTokens[userId] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Deletes Jira tokens for a user (disconnect).
 */
export async function deleteJiraTokens(userId: string) {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8');
    const allTokens = JSON.parse(data);
    delete allTokens[userId];
    await fs.writeFile(TOKENS_FILE, JSON.stringify(allTokens, null, 2));
  } catch (error) {
    // Ignore errors during deletion
  }
}

/**
 * Exchanges an authorization code for tokens.
 */
export async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.JIRA_CLIENT_ID;
  const clientSecret = process.env.JIRA_CLIENT_SECRET;
  const redirectUri = process.env.JIRA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Jira OAuth environment variables are missing.');
  }

  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refreshes Jira OAuth tokens for a specific user.
 */
export async function refreshJiraToken(userId: string) {
  const tokens = await getJiraTokens(userId);
  if (!tokens || !tokens.refresh_token) {
    throw new Error('No refresh token available for Jira.');
  }

  const clientId = process.env.JIRA_CLIENT_ID;
  const clientSecret = process.env.JIRA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Jira OAuth environment variables are missing.');
  }

  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refresh_token,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();
  const newTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || tokens.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await storeJiraTokens(userId, newTokens);
  return newTokens;
}

/**
 * Gets the accessible resources (cloudIds) for the Jira instance.
 */
export async function getJiraCloudId(accessToken: string) {
  const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get accessible resources: ${error}`);
  }

  const data = await response.json();
  if (data.length === 0) {
    throw new Error('No Jira resources found for this account.');
  }

  // Use the first available site/resource
  return data[0].id;
}

/**
 * Fetches issue details from Jira.
 */
export async function fetchJiraTicket(accessToken: string, ticketUrl: string) {
  // Extract issue key from URL (e.g., https://domain.atlassian.net/browse/PROJ-123)
  const match = ticketUrl.match(/browse\/([A-Z0-9]+-[0-9]+)/i);
  if (!match) {
    throw new Error('Invalid Jira ticket URL format. Expected: .../browse/ISSUE-KEY');
  }

  const issueKey = match[1];
  const cloudId = await getJiraCloudId(accessToken);

  const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Jira ticket: ${error}`);
  }

  const data = await response.json();
  return {
    key: data.key,
    summary: data.fields.summary,
    description: data.fields.description?.content 
      ? JSON.stringify(data.fields.description.content) 
      : (typeof data.fields.description === 'string' ? data.fields.description : ''),
    project: data.fields.project.name,
    issueType: data.fields.issuetype.name,
    status: data.fields.status.name,
  };
}
