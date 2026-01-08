const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
let model;

const initGemini = () => {
    if (process.env.GEMINI_API_KEY && !genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
    return model;
};

module.exports = {
    chatWithAI: async (req, res) => {
        try {
            const { message, context, courseTitle } = req.body;

            if (!process.env.GEMINI_API_KEY) {
                return res.status(503).json({
                    success: false,
                    message: "AI service not configured on server (Missing GEMINI_API_KEY)."
                });
            }

            const model = initGemini();
            if (!model) {
                return res.status(500).json({ success: false, message: "Failed to initialize AI model." });
            }

            const systemPrompt = `You are a helpful AI tutor for the course "${courseTitle}".
            Here is some context about the course: "${context}".
            Please answer the student's question based on this context if relevant, but feel free to use your general knowledge to explain concepts clearly.
            Keep your answers concise, encouraging, and easy to understand.`;

            const fullPrompt = `${systemPrompt}\n\nStudent Question: ${message}`;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            res.status(200).json({ success: true, reply: text });
        } catch (error) {
            console.error("AI Chat Error:", error);
            res.status(500).json({ success: false, message: "Failed to get response from AI." });
        }
    }
};
