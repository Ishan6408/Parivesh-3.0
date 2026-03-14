import "dotenv/config";
import Groq from "groq-sdk";

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log("GROQ_API_KEY status:", apiKey && !apiKey.includes('placeholder') ? "Set" : "Missing/Placeholder");
  
  if (!apiKey || apiKey.includes('placeholder')) {
    console.log("Please set a valid GROQ_API_KEY in backend/.env to run this test.");
    return;
  }

  const groq = new Groq({ apiKey });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'Groq AI integration successful!'" }],
      model: "llama-3.3-70b-versatile",
    });

    console.log("Groq Response:", chatCompletion.choices[0]?.message?.content);
  } catch (error: any) {
    console.error("Groq Test Failed:", error.message || error);
  }
}

testGroq();
