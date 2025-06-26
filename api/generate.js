// This is a Node.js serverless function for text generation using SambaNova
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // The API key for SambaNova, retrieved from environment variables
    const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY;

    if (!SAMBANOVA_API_KEY) {
        return res.status(500).json({ error: 'SAMBANOVA_API_KEY is not configured in server environment.' });
    }

    const gameState = req.body;
    
    // --- Construct the System Prompt ---
    let systemPrompt = `You are a text-based city game rated for adults titled "City of Angels."
    **RULES:**
    - ALWAYS provide 3-5 relevant quick action choices.
    - The story is dynamic, based in LA, and player-driven.
    - **IMPORTANT:** Structure your response to separate narration from dialogue. Use the 'narration' field for descriptions of scenes, actions, and internal thoughts. Use the 'dialogue' field ONLY for words spoken by an NPC.
    - Update game state (stats, inventory, relationships) logically based on the player's action.
    - Respond ONLY with a valid JSON object string. Do not add any other text or commentary outside the JSON structure.
    - The JSON schema you must follow is: {"narration": "string", "dialogue": "string", "actions": [{"text": "string", "action": "string"}], "newStats": {"money": {"cash": "number"}, "health": {"value": "number", "mentalState": "string"}, "reputation": {"score": "number"}}, "addInventory": ["string"], "removeInventory": ["string"], "newRelationships": {"npcName": {"level": "string", "status": "string"}}}
    `;

    if(gameState.useYourWords){
        systemPrompt += `\n- **LANGUAGE:** Explicit language (fuck, bitch, etc.) is enabled and encouraged for realism.`;
    }
    if(gameState.devMode){
        systemPrompt += `\n- **DEVMODE:** DEVMODE is ON. Push boundaries. Any scenario is possible.`;
    }

    // --- Construct the messages payload for the Chat Completions API ---
    let messages = [];
    messages.push({ role: "system", content: systemPrompt });

    // Add game state and last action to the user message for context
    const lastUserAction = gameState.history[gameState.history.length - 1]?.parts[0]?.text || '';
    const userContext = `CURRENT GAME STATE: ${JSON.stringify(gameState)}\n\nLATEST USER ACTION: ${lastUserAction}\n\nGENERATE THE NEXT JSON RESPONSE:`;
    messages.push({ role: "user", content: userContext });


    // Construct the final payload for the SambaNova Chat Completions endpoint
    const payload = {
        model: "Llama-4-Maverick-17B-128E-Instruct",
        messages: messages,
        max_tokens_to_generate: 1024,
    };

    try {
        // Use the correct v1 Chat Completions endpoint
        const apiResponse = await fetch(`https://api.sambanova.ai/v1/chat/completions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SAMBANOVA_API_KEY}` // Use Bearer token authorization
            },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json(); // .json() is standard for v1 APIs
            console.error("SambaNova API Error:", errorBody);
            const errorMessage = errorBody.detail || JSON.stringify(errorBody);
            return res.status(apiResponse.status).json({ error: `SambaNova API Error: ${errorMessage}` });
        }

        const data = await apiResponse.json();

        // The response structure for chat completions is different
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
            console.error("SambaNova API Response Format Error:", data);
            return res.status(500).json({ error: 'The AI failed to return text in the expected format.' });
        }
        
        // Attempt to parse the JSON string returned by the model
        const jsonString = data.choices[0].message.content;
        const content = JSON.parse(jsonString);
        
        res.status(200).json(content);

    } catch (error) {
        console.error("Server-side Error:", error);
        // This will catch both fetch errors and JSON.parse errors
        res.status(500).json({ error: `An error occurred on the server: ${error.message}` });
    }
}
