// This is a Node.js serverless function for generating images using SambaNova
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // The API key for SambaNova
    const SAMBANOVA_API_KEY = "259a9ebb-06de-4c7b-9439-3617e2e42f0e";

    if (!SAMBANOVA_API_KEY) {
        return res.status(500).json({ error: 'SAMBANOVA_API_KEY is not configured in server environment.' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Construct the payload for the SambaNova text-to-image endpoint
    const payload = {
        instance: prompt,
        params: {
            // Using the specified model name, although it appears to be a text model.
            // For actual image generation, a model like 'stable-diffusion-xl-base-1.0' would typically be used.
            model: "Llama-4-Maverick-17B-128E-Instruct", 
            num_inference_steps: 25,
            height: 512,
            width: 512,
        }
    };

    try {
        // The SambaNova API endpoint for text-to-image
        const imageResponse = await fetch(`https://cloud.sambanova.ai/api/predict/generic/text-to-image`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'key': SAMBANOVA_API_KEY // SambaNova uses 'key' in the header
            },
            body: JSON.stringify(payload)
        });

        if (!imageResponse.ok) {
            const errorBody = await imageResponse.text(); // Use .text() for potentially non-JSON errors
            console.error("SambaNova API Error:", errorBody);
            return res.status(imageResponse.status).json({ error: `SambaNova API Error: ${errorBody}` });
        }

        const data = await imageResponse.json();

        // The image data is typically in a field like 'result.image_b64'
        if (!data.result || !data.result.image_b64) {
            console.error("SambaNova API Response Format Error:", data);
            return res.status(500).json({ error: 'The AI failed to return an image in the expected format.' });
        }

        const imageUrl = `data:image/jpeg;base64,${data.result.image_b64}`;
        
        // Send the complete data URL back to the client
        res.status(200).json({ imageUrl: imageUrl });

    } catch (error) {
        console.error("Server-side Image Gen Error:", error);
        res.status(500).json({ error: `An error occurred on the server: ${error.message}` });
    }
}
