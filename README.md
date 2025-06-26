# 🌆 Astor Peak: Unlimited 🌆

*v3.2.1 (In Development by OxyIsBad)*

---

### Overview

Welcome to **Astor Peak: Unlimited**, a dynamic, text-based adventure game powered by Google's Gemini API. The narrative is generated in real-time, creating a unique story based on every choice you make. This project combines modern web technologies with cutting-edge AI to deliver a gritty, adult-oriented narrative experience that's different every time you play.

---

### 🔥 Welcome to Astor Peak 🔥

**Your Story. Your Rules. No Limits.**

Ever wanted to live another life? In the sprawling, sun-scorched metropolis of Astor Peak, you can be anyone. A hero, a villain, a lover, a fighter, a kingpin, or a ghost. The choice is yours.

-   **🤖 Truly Dynamic Storytelling**: Powered by the Gemini AI, no two playthroughs are the same. The world reacts to your every decision, creating a story that is uniquely yours. Forget branching paths—we're building living narratives.
-   **🌃 A City of Vice & Virtue**: Explore a gritty, mature world inspired by the darkest corners of Los Angeles. Engage in high-stakes crime, navigate complex relationships, pursue love and lust, or just try to survive.
-   **📊 Live on the Edge**: Keep a close eye on your vitals with a real-time HUD. Manage your **Money** 💵, **Health** ❤️, **Reputation** 😈, and **Relationships** 👥. Every choice has a consequence that's immediately reflected in your stats.
-   **🔞 100% Uncensored**: This is a game for adults. We don't shy away from the realities of a life lived on the fringes. Experience realistic depictions of violence, sex, and drug use, all with tangible consequences.
-   **📱 Play Anywhere**: With a sleek, responsive UI built with Tailwind CSS, you can continue your story on any device, whether you're at your desk or on the go.

**Who will you become in the city of lost angels?**

---

### 🚀 Building and Deployment 🚀

Ready to run your own instance of Astor Peak? Follow these steps to get your own version live in minutes using GitHub and Vercel.

#### Prerequisites

1.  **A GitHub Account**: You'll need a place to store your code. If you don't have one, sign up at [GitHub](https://github.com).
2.  **A Google Gemini API Key**: The AI that powers the game.
    * Go to [Google AI Studio](https://aistudio.google.com/).
    * Sign in and click "**Get API key**" -> "**Create API key in new project**".
    * Copy the generated API key. **Keep this secret!**

#### Deployment Steps

1.  **Set Up Your GitHub Repository**
    * Create a new, empty repository on GitHub.
    * Download all the project files (`index.html`, `package.json`, `vercel.json`, `.gitignore`, and this `README.md`).
    * Upload all the files to your new GitHub repository.

2.  **Add Your API Key**
    * Open the `index.html` file.
    * Find the line: `const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";`
    * Replace `"YOUR_GEMINI_API_KEY"` with the key you got from Google.
    * Save and commit this change to your repository. **IMPORTANT**: For a personal project, this is okay, but for a public one, you should use environment variables to protect your key.

3.  **Deploy with Vercel**
    * Go to [Vercel](https://vercel.com) and sign up with your GitHub account.
    * From your dashboard, click "**Add New...**" -> "**Project**".
    * Find and **Import** your game's repository from the list.
    * Vercel will automatically configure the settings. You don't need to change anything.
    * Click "**Deploy**" and let the magic happen!

Once it's finished, Vercel will provide a URL to your live game. Congratulations, you're now a resident of Astor Peak!
