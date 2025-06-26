// This is a Node.js serverless function for generating images
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Use the same environment variable or a specific one for Imagen
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'API_KEY is not configured in server environment.' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    const payload = {
        instances: [{ prompt: prompt }],
        parameters: { "sampleCount": 1 }
    };

    try {
        // Note the different model and endpoint for Imagen
        const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!imageResponse.ok) {
            const errorBody = await imageResponse.json();
            console.error("Imagen API Error:", errorBody);
            return res.status(imageResponse.status).json({ error: `Imagen API Error: ${errorBody.error?.message || 'Unknown error'}` });
        }

        const data = await imageResponse.json();

        if (!data.predictions || data.predictions.length === 0 || !data.predictions[0].bytesBase64Encoded) {
            return res.status(500).json({ error: 'The AI failed to return an image.' });
        }

        const imageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
        
        // Send the complete data URL back to the client
        res.status(200).json({ imageUrl: imageUrl });

    } catch (error) {
        console.error("Server-side Image Gen Error:", error);
        res.status(500).json({ error: `An error occurred on the server: ${error.message}` });
    }
}
