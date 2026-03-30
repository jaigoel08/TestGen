import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getJiraTokens, deleteJiraTokens } from '@/lib/jira';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokens = await getJiraTokens(userId);
  const isConnected = !!tokens;

  return NextResponse.json({ 
    connected: isConnected,
    expiresAt: tokens?.expires_at || null
  });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await deleteJiraTokens(userId);
  return NextResponse.json({ success: true });
}
