import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getJiraTokens, refreshJiraToken, fetchJiraTicket } from '@/lib/jira';
import { generateTestCasesFromJira } from '@/lib/test-generator/jiraTestGenerator';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ticketUrl } = await request.json();
    if (!ticketUrl) {
      return NextResponse.json({ error: 'Ticket URL is required' }, { status: 400 });
    }

    let tokens = await getJiraTokens(userId);
    if (!tokens) {
      return NextResponse.json({ error: 'Jira account not connected' }, { status: 401 });
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (Date.now() + 5 * 60 * 1000 > tokens.expires_at) {
      try {
        tokens = await refreshJiraToken(userId);
      } catch (refreshError) {
        console.error('Failed to refresh Jira token:', refreshError);
        return NextResponse.json({ error: 'Jira session expired. Please reconnect.' }, { status: 401 });
      }
    }

    // 1. Fetch ticket details
    const ticketData = await fetchJiraTicket(tokens.access_token, ticketUrl);

    // 2. Generate test cases using LLM
    const testCases = await generateTestCasesFromJira(ticketData);

    return NextResponse.json({ 
      success: true, 
      ticket: {
        key: ticketData.key,
        summary: ticketData.summary
      },
      testCases 
    });
  } catch (error: any) {
    console.error('Jira Generation Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate test cases from Jira.' 
    }, { status: 500 });
  }
}
