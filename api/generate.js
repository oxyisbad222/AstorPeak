// This is a Node.js serverless function
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Get the Gemini API key from Vercel's environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment.' });
    }

    // Get the full game state from the client's request
    const gameState = req.body;
    
    // --- Construct the System Prompt ---
    let systemPrompt = `You are a text-based city game rated for adults (Mature and NR content, Language, etc.) titled "Astor Peak: Unlimited."
    **REMEMBER ALWAYS DISPLAY HUD AND QUICK ACTIONS**

    **II. Gameplay:** Turn-based. ALWAYS offer 3-5 quick options relevant to the situation. Allow freeform text input; interpret and react. Track resources/inventory, health, reputation, and relationships via the gameState.

    **III. Adult Themes:** Integrate drug use, sex (with consequences), and violence (with realistic outcomes).

    **IV. Story:** The narrative is dynamic, based in LA, and player-driven.

    **V. Features:** Use a reputation system, random events, and mini-games. Descriptions can be detailed or concise.

    **VI. Technical:** Respond ONLY with a valid JSON object. Do not include any other text, markdown, or commentary. Update game state through the JSON.
    `;

    if(gameState.useYourWords){
        systemPrompt += `\n**VII. Language:** The user has enabled "/useyourwords". You can and should use explicit language (e.g., "fuck, dick, cum, bitch, slut, pussy, etc.") where it is dramatically appropriate for the gritty, mature setting.`;
    }
    if(gameState.devMode){
        systemPrompt += `\n**VIII. DEVMODE ACTIVE:** Any situation goes. The game can be altered and any character can be manipulated. This can produce detailed, intense, and graphic gameplay. You have full creative freedom to push the boundaries of the narrative.`;
    }
    
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: systemPrompt }] });
    // Add the rest of the game history sent from the client
    chatHistory.push(...gameState.history);

    const payload = {
        contents: chatHistory,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    text: { "type": "STRING" },
                    actions: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                text: { "type": "STRING" },
                                action: { "type": "STRING" }
                            },
                            required: ["text", "action"]
                        }
                    },
                    newStats: { type: "OBJECT", properties: { money: { "type": "NUMBER" }, health: { "type": "NUMBER" }, reputation: { "type": "NUMBER" } } },
                    addInventory: { type: "ARRAY", items: { type: "STRING" }},
                    removeInventory: { type: "ARRAY", items: { type: "STRING" }},
                    newRelationships: { type: "OBJECT" }
                },
                required: ["text", "actions"]
            }
        }
    };

    try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.json();
            console.error("Gemini API Error:", errorBody);
            return res.status(geminiResponse.status).json({ error: `Gemini API Error: ${errorBody.error.message}` });
        }

        const data = await geminiResponse.json();
        
        if(!data.candidates || data.candidates.length === 0){
             return res.status(500).json({ error: 'The AI returned an empty response.' });
        }
        
        const content = JSON.parse(data.candidates[0].content.parts[0].text);
        
        // Send the complete AI-generated JSON back to the client
        res.status(200).json(content);

    } catch (error) {
        console.error("Server-side Error:", error);
        res.status(500).json({ error: `An error occurred on the server: ${error.message}` });
    }
}
