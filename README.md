# TestGEn: AI-Powered QA Test Case Generator

TestGEn is a sophisticated tool designed to automate the initial phases of QA engineering. By extracting UI elements from target websites and leveraging advanced LLMs (Google Gemini), it generates comprehensive, structured test cases for various features (like Authentication, Search, etc.) in seconds.

## 🚀 Features

-   **Deep Scraper**: Uses Playwright to extract input fields, buttons, links, and forms with high precision.
-   **Visual Context**: Automatically captures and displays page screenshots for visual verification.
-   **Smart Feature Detection**: Identifies login patterns (Manual, OAuth, Social) to tailor test generation.
-   **Vector Memory (Chroma Cloud)**: Utilizes a cloud-based vector database to store and retrieve past UI contexts for improved semantic matching.
-   **AI Test Drafting**: Leverages **Google Gemini Flash Latest** to generate prioritized test cases (Positive, Negative, Edge, Security).
-   **Premium Dashboard**: A sleek, dark-themed Next.js dashboard for effortless workflow orchestration.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Automation**: [Playwright](https://playwright.dev/)
-   **AI Engine**: [Google Generative AI (Gemini)](https://ai.google.dev/)
-   **Vector Database**: [Chroma Cloud](https://docs.trychroma.com/cloud)
-   **Backend**: Node.js & Next.js API Routes

## 📦 Getting Started

### Prerequisites

-   Node.js 18+ or Bun
-   A Google AI API Key
-   A Chroma Cloud Account (API Key, Tenant, Database)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd TestGen
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root (refer to `.env.example`):
    ```env
    # LLM API Keys
    GOOGLE_GENAI_API_KEY=your_key_here

    # Vector DB (Chroma Cloud)
    CHROMA_API_KEY=your_chroma_api_key
    CHROMA_TENANT=your_tenant_id
    CHROMA_DATABASE=Testgen
    CHROMA_COLLECTION_NAME=ui-contexts
    ```

4.  **Install Playwright Browsers**:
    ```bash
    npx playwright install chromium
    ```

5.  **Run the development server**:
    ```bash
    npm run dev
    # or
    bun run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## 📂 Project Structure

-   `src/app`: Next.js pages and API routes (Orchestrator at `/api/generate-tests`).
-   `src/lib/scraper`: Playwright logic for website extraction.
-   `src/lib/feature-detection`: Heuristics for identifying login types.
-   `src/lib/vector`: Chroma Cloud integration and Gemini embeddings.
-   `src/lib/test-generator`: Prompt engineering and Gemini generation logic.
-   `public/screenshots`: Local storage for captured visual context.

## 🧪 Usage

1.  Enter the **Website URL** of the page you want to test (e.g., a login page).
2.  Specify the **Feature Name** (e.g., "Login", "Password Reset").
3.  Click **Generate Test Cases**.
4.  View the detected login type, the captured screenshot, and the AI-generated test cases in a structured table.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
