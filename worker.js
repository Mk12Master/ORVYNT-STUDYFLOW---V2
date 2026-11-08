const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "").split(",").map(v => v.trim()).filter(Boolean);
    if (!allowed.includes(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed." }), {
        status: 403, headers: { "Content-Type": "application/json" }
      });
    }
    const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/api/chat") {
      return new Response(JSON.stringify({ error: "Not found." }), { status: 404, headers });
    }
    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service is not configured." }), { status: 503, headers });
    }
    try {
      const body = await request.json();
      const messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
      if (!messages.length || messages.length > 16) {
        return new Response(JSON.stringify({ error: "Send between 1 and 16 messages." }), { status: 400, headers });
      }
      const clean = [];
      for (const m of messages) {
        if (!["user", "assistant"].includes(m.role) || typeof m.content !== "string" || !m.content.trim() || m.content.length > 1200) {
          return new Response(JSON.stringify({ error: "Invalid message format or message too long." }), { status: 400, headers });
        }
        clean.push({ role: m.role, content: m.content.trim() });
      }
      const aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions: [
            "You are ORVYNT AI Study Companion, an educational assistant for school students.",
            "Explain ICSE Grade 9-10 topics clearly, accurately, and step by step when relevant.",
            "Help with study planning and explain how to use ORVYNT StudyFlow.",
            "Use age-appropriate language. Do not request personal information.",
            "If uncertain, say so and suggest checking the student's textbook or teacher.",
            "Do not claim to access or modify planner data; you only see messages sent in this chat."
          ].join(" "),
          input: clean.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] }))
        })
      });
      const result = await aiResponse.json();
      if (!aiResponse.ok) {
        return new Response(JSON.stringify({ error: "The AI provider returned an error. Check the backend configuration." }), { status: 502, headers });
      }
      const reply = (result.output || [])
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("\n")
        .trim();
      if (!reply) return new Response(JSON.stringify({ error: "No text response was returned." }), { status: 502, headers });
      return new Response(JSON.stringify({ reply }), { status: 200, headers });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid request or temporary server error." }), { status: 400, headers });
    }
  }
};
