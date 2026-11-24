// Netlify serverless function: keeps the OpenAI API key on the server.
export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST for AI requests." }), {
      status: 405, headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "The site owner still needs to add OPENAI_API_KEY in Netlify site environment variables." }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 8000) : "";
    const mode = typeof body.mode === "string" ? body.mode : "idea";
    const tone = typeof body.tone === "string" ? body.tone : "creative";

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Please enter an idea or question first." }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const modeNames = {
      idea: "idea development",
      design: "design direction and creative briefs",
      website: "website planning and content",
      code: "technology and software development",
      writing: "writing and editing",
      plan: "step-by-step planning"
    };
    const systemPrompt = `You are Mlindos AI Gumede, a helpful, creative assistant inside a public creation platform. Help users with ${modeNames[mode] || "creative work"}. Use a ${tone} tone. Be practical, clear, and structured. If code is requested, provide safe, runnable examples and explain where they belong. Never claim you have deployed, purchased, or changed something unless you actually have. Do not ask for passwords, API keys, or other secrets.`;

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: systemPrompt,
        input: prompt,
        max_output_tokens: 1200
      })
    });

    const result = await upstream.json();
    if (!upstream.ok) {
      const message = result?.error?.message || "The AI provider returned an error.";
      return new Response(JSON.stringify({ error: message }), {
        status: upstream.status, headers: { "Content-Type": "application/json" }
      });
    }

    const text = (result.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text)
      .join("\n");

    return new Response(JSON.stringify({ text: text || "I couldn't create a response this time. Please try again." }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Something went wrong while processing your request. Please try again." }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};
