// This is a Node.js serverless function
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Use the new environment variable for the AIMLAPI key
    const AIML_API_KEY = "690d2684a0304f3fb9d5a06b0871432c";

    if (!AIML_API_KEY) {
        return res.status(500).json({ error: 'AIML_API_KEY is not configured in server environment.' });
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
    - The JSON schema you must follow is: {"narration": "string", "dialogue": "string", "actions": [{"text": "string", "action": "string"}], "newStats": {"money": {"cash": "number"}, "health": {"value": "number", "mentalState": "string"}, "reputation": {"score": "number"}}, "addInventory": ["string"], "removeInventory": ["string"], "newRelationships": {"npcName": {"level": "string", "status": "string"}}}
    `;

    if(gameState.useYourWords){
        systemPrompt += `\n- **LANGUAGE:** Explicit language (fuck, bitch, etc.) is enabled and encouraged for realism.`;
    }
    if(gameState.devMode){
        systemPrompt += `\n- **DEVMODE:** DEVMODE is ON. Push boundaries. Any scenario is possible.`;
    }
    
    // --- Construct the messages payload for AIMLAPI ---
    let messages = [];
    messages.push({ role: "system", content: systemPrompt });

    // Convert gameState history to the new message format
    gameState.history.forEach(entry => {
        messages.push({
            role: entry.role === 'model' ? 'assistant' : 'user',
            content: entry.parts[0].text
        });
    });

    const payload = {
        model: gameState.selectedModel || 'mistral-7b-instruct', // Use selected model or default
        messages: messages,
        response_format: { type: "json_object" }
    };

    try {
        const apiResponse = await fetch(`https://api.aimlapi.com/chat/completions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AIML_API_KEY}` // Use Bearer token authorization
            },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error("AIMLAPI Error:", errorBody);
            return res.status(apiResponse.status).json({ error: `API Error: ${errorBody.error.message}` });
        }

        const data = await apiResponse.json();
        
        if(!data.choices || data.choices.length === 0){
             return res.status(500).json({ error: 'The AI returned an empty response.' });
        }
        
        // The JSON response is a string inside the 'content' field
        const content = JSON.parse(data.choices[0].message.content);
        
        res.status(200).json(content);

    } catch (error) {
        console.error("Server-side Error:", error);
        res.status(500).json({ error: `An error occurred on the server: ${error.message}` });
    }
}
