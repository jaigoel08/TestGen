import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url, feature } = await req.json();

    if (!url || !feature) {
      return NextResponse.json(
        { error: "URL and Feature Name are required" },
        { status: 400 }
      );
    }

    // Mock delay for AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockTestCases = `### Test Cases for ${feature} on ${url}

1. **Successful Navigation**
   - **Pre-condition:** User is on the homepage.
   - **Step:** Navigate to the ${feature} section by clicking the link.
   - **Expected Result:** The page renders correctly with the ${feature} header.

2. **Form Validation (Empty Input)**
   - **Pre-condition:** User is on the ${feature} page.
   - **Step:** Submit the form without filling any fields.
   - **Expected Result:** Validation errors are displayed for required fields.

3. **Responsive Layout Check**
   - **Pre-condition:** Viewing the page on a mobile device (375x812).
   - **Step:** Resize the browser window or view on mobile emulator.
   - **Expected Result:** The layout adjusts correctly and no horizontal scrolling appears.

4. **Interaction Feedback**
   - **Pre-condition:** User hovers over the submit button.
   - **Step:** Hover cursor over the primary action button.
   - **Expected Result:** Button changes color or shows a subtle hover effect as defined in the UI spec.

5. **API Integration (Mock)**
   - **Pre-condition:** Network tab is open.
   - **Step:** Click the generate/submit button.
   - **Expected Result:** A POST request is sent to the backend and a success message is shown.`;

    return NextResponse.json({
      testCases: mockTestCases,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
