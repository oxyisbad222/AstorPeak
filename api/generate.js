// This is a Node.js serverless function
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment.' });
    }

    const gameState = req.body;
    
    // --- Construct the System Prompt ---
    let systemPrompt = `You are a text-based city game rated for adults titled "City of Angels."
    **RULES:**
    - ALWAYS provide 3-5 relevant quick action choices.
    - The story is dynamic, based in LA, and player-driven.
    - **IMPORTANT:** Structure your response to separate narration from dialogue. Use the 'narration' field for descriptions of scenes, actions, and internal thoughts. Use the 'dialogue' field ONLY for words spoken by an NPC.
    - Update game state (stats, inventory, relationships) logically based on the player's action.
    - Respond ONLY with a valid JSON object.
    `;

    if(gameState.useYourWords){
        systemPrompt += `\n- **LANGUAGE:** Explicit language (fuck, bitch, etc.) is enabled and encouraged for realism.`;
    }
    if(gameState.devMode){
        systemPrompt += `\n- **DEVMODE:** DEVMODE is ON. Push boundaries. Any scenario is possible.`;
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
                    narration: { "type": "STRING", description: "The descriptive text of the scene or outcome of an action." },
                    dialogue: { "type": "STRING", description: "Words spoken by an NPC. Leave empty if no one speaks." },
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
                    newStats: { 
                        type: "OBJECT",
                        description: "Updates to the player's stats. Only include changed values.",
                        properties: {
                            money: { type: "OBJECT", properties: { cash: { type: "NUMBER" }, assets: { type: "ARRAY", items: { type: "STRING" } } } },
                            health: { type: "OBJECT", properties: { value: { type: "NUMBER" }, mentalState: { type: "STRING" }, injuries: { type: "ARRAY", items: { type: "STRING" } }, intoxication: { type: "ARRAY", items: { type: "STRING" } } } },
                            reputation: { type: "OBJECT", properties: { score: { type: "NUMBER" }, factions: { type: "OBJECT", properties: { factionName: { type: "STRING" } } } } }
                        }
                    },
                    addInventory: { type: "ARRAY", items: { type: "STRING" }},
                    removeInventory: { type: "ARRAY", items: { type: "STRING" }},
                    newRelationships: { 
                        type: "OBJECT",
                        description: "Updates to relationships. The key is the NPC's name.",
                        properties: {
                            npcName: { // This is a placeholder to satisfy the schema rule for dynamic keys
                                type: "OBJECT",
                                properties: {
                                    level: { type: "STRING", description: "e.g., Acquaintance, Friend, Enemy, Lover" },
                                    status: { type: "STRING", description: "A brief description of their current feeling, e.g., 'Thinks you are funny'" }
                                }
                            }
                        }
                    }
                },
                required: ["narration", "actions"]
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
        
        res.status(200).json(content);

    } catch (error) {
        console.error("Server-side Error:", error);
        res.status(500).json({ error: `An error occurred on the server: ${error.message}` });
    }
}
