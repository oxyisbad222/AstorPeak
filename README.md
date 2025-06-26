# 🌆 Astor Peak: Unlimited 🌆

*v3.2.2 (In Development by OxyIsBad)*

---

### 🔥 Welcome to Astor Peak 🔥

**Your Story. Your Rules. No Limits.**

Ever wanted to live another life? In the sprawling, sun-scorched metropolis of Astor Peak, you can be anyone. A hero, a villain, a lover, a fighter, a kingpin, or a ghost. The choice is yours.

-   **🤖 Truly Dynamic Storytelling**: Powered by the Gemini AI, no two playthroughs are the same.
-   **🌃 A City of Vice & Virtue**: Explore a gritty, mature world inspired by the darkest corners of Los Angeles.
-   **📊 Live on the Edge**: Keep a close eye on your vitals with a real-time HUD (Money 💵, Health ❤️, Reputation 😈, Relationships 👥).
-   **🔞 100% Uncensored**: This is a game for adults with realistic consequences.
-   **📱 Play Anywhere**: With a sleek, responsive UI, play on any device.

**Who will you become in the city of lost angels?**

---

### 🚀 Building and Deployment (Secure) 🚀

This guide explains how to securely deploy your own instance of Astor Peak using Vercel Environment Variables to protect your API key.

#### Prerequisites

1.  **A GitHub Account**: If you don't have one, sign up at [GitHub](https://github.com).
2.  **A Google Gemini API Key**:
    * Go to [Google AI Studio](https://aistudio.google.com/).
    * Sign in and click "**Get API key**" -> "**Create API key in new project**".
    * Copy the generated API key. **Keep this secret!**

#### Deployment Steps

1.  **Set Up Your GitHub Repository**
    * Create a new, empty repository on GitHub.
    * Make sure your project has the following structure:
      ```
      /
      ├── api/
      │   └── generate.js  (The serverless function)
      │   └── image.js     (The image generation function)
      ├── .gitignore
      ├── index.html       (The main game file)
      ├── package.json
      └── README.md
      ```
    * Upload all the project files to your new GitHub repository. **Your `index.html` should NOT contain your API key.**

2.  **Deploy Project to Vercel**
    * Go to [Vercel](https://vercel.com) and sign up with your GitHub account.
    * From your dashboard, click "**Add New...**" -> "**Project**".
    * Find and **Import** your game's repository from the list.

3.  **Add Your Environment Variable**
    * In the "Configure Project" screen, expand the **Environment Variables** section.
    * Add a new variable:
        * **Name**: `GEMINI_API_KEY`
        * **Value**: Paste your secret Gemini API key here.
    * Click **Add**.

4.  **Deploy!**
    * Click the **Deploy** button.
    * Vercel will build your project. It will automatically detect the files in the `api/` directory and set them up as serverless functions that can securely access your `GEMINI_API_KEY`.

Once it's finished, Vercel will provide a URL to your live, secure game.
