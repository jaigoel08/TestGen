import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.JIRA_CLIENT_ID;
  const redirectUri = process.env.JIRA_REDIRECT_URI;
  const scopes = 'read:jira-work offline_access'; // Basic required scopes
  const state = userId; // Simplified: Use userId as state to link back

  const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri!)}&state=${state}&response_type=code&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
