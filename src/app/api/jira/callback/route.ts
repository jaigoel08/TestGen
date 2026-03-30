import { NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeJiraTokens } from '@/lib/jira';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // In our case, this is the userId

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await storeJiraTokens(state, tokens);

    // Redirect back to dashboard with success
    return NextResponse.redirect(new URL('/dashboard/jira?success=true', request.url));
  } catch (error: any) {
    console.error('Jira OAuth Error:', error);
    return NextResponse.redirect(new URL(`/dashboard/jira?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
