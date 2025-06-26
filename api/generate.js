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

    // Combine system prompt with the latest user action
    const lastUserAction = gameState.history[gameState.history.length - 1]?.parts[0]?.text || '';
    const fullPrompt = `${systemPrompt}\n\nCURRENT GAME STATE: ${JSON.stringify(gameState)}\n\nLATEST USER ACTION: ${lastUserAction}\n\nGENERATE THE NEXT JSON RESPONSE:`

    // Construct the payload for the SambaNova text generation endpoint
    const payload = {
        instance: fullPrompt,
        params: {
            model: "Llama-4-Maverick-17B-128E-Instruct",
            max_tokens_to_generate: 1024,
            // Add other parameters like temperature if needed
        }
    };

    try {
        // The SambaNova API endpoint for text generation
        const apiResponse = await fetch(`https://cloud.sambanova.ai/api/predict/generic/text-generation`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'key': SAMBANOVA_API_KEY // SambaNova uses 'key' in the header
            },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error("SambaNova API Error:", errorBody);
            return res.status(apiResponse.status).json({ error: `SambaNova API Error: ${errorBody}` });
        }

        const data = await apiResponse.json();

        // The generated JSON string is in 'result.completion'
        if (!data.result || !data.result.completion) {
            console.error("SambaNova API Response Format Error:", data);
            return res.status(500).json({ error: 'The AI failed to return text in the expected format.' });
        }
        
        // Attempt to parse the JSON string returned by the model
        const jsonString = data.result.completion;
        const content = JSON.parse(jsonString);
        
        res.status(200).json(content);

    } catch (error) {
        console.error("Server-side Error:", error);
        // This will catch both fetch errors and JSON.parse errors
        res.status(500).json({ error: `An error occurred on the server: ${error.message}` });
    }
}
