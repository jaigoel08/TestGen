import { generateWithFallback } from '../gemini';

export async function generateTestCasesFromJira(ticketData: any): Promise<string> {
  const prompt = `
You are a senior QA engineer. Your task is to generate comprehensive test cases based on a Jira feature ticket (FRS).

Jira Ticket Details:
- Key: ${ticketData.key}
- Summary: ${ticketData.summary}
- Project: ${ticketData.project}
- Issue Type: ${ticketData.issueType}
- Status: ${ticketData.status}
- Description: ${ticketData.description}

Generate comprehensive test cases that cover all scenarios mentioned or implied by the ticket.

Include:
- Positive cases (functional requirements)
- Negative cases (error handling, invalid inputs)
- Edge cases (boundary values, unusual conditions)
- Security cases (if relevant)
- UI/UX considerations (if mentioned)

Return output EXACTLY in this format for each test case:

Test Case ID: [JIRA-KEY]-TC-X
Title:
Steps:
Expected Result:
Priority:
`;

  try {
    return await generateWithFallback(prompt, { temperature: 0.7 });
  } catch (error: any) {
    console.error('Error generating test cases from Jira with Gemini:', error);
    throw new Error(`Jira test case generation failed: ${error.message}`);
  }
}
