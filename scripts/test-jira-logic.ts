import { fetchJiraTicket } from '../src/lib/jira';

// Mock fetch for testing
async function test() {
  console.log("Testing Jira Ticket URL parsing...");
  const urls = [
    "https://example.atlassian.net/browse/PROJ-123",
    "https://my-team.atlassian.net/browse/SCRUM-456",
    "https://atlassian.net/browse/ABC-789"
  ];

  for (const url of urls) {
    const match = url.match(/browse\/([A-Z0-9]+-[0-9]+)/i);
    console.log(`URL: ${url} -> Issue Key: ${match ? match[1] : 'FAILED'}`);
  }

  console.log("\nNote: Full API verification requires a valid Jira OAuth token.");
}

test();
