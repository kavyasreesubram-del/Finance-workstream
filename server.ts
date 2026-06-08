import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Agent Chat Proxy
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, activeTransaction, history, activeAgentName } = req.body;

      if (!ai) {
        return res.json({
          text: "System Note: Gemini API Key is not configured in Secrets. In offline demonstration mode, I suggest reviewing invoice details, releasing current approvals, or proceeding to the reconciliation clearance step."
        });
      }

      // Format custom system guidelines with memory injection
      let systemInstruction = `You are FinFlow's transaction execution assistant, a calm, precise, senior financial systems supervisor. You assist other agents and the corporate user.
The active enterprise transaction currently under review is:
- ID: ${activeTransaction?.id || 'N/A'}
- Vendor Name: ${activeTransaction?.vendorName || 'N/A'}
- Invoice Number: ${activeTransaction?.invoiceNumber || 'N/A'}
- Invoice Amount: $${activeTransaction?.amount?.toLocaleString() || '0'}
- Match Status: ${activeTransaction?.matchDetails?.status || 'N/A'}
- Current Stage: ${activeTransaction?.currentStage || 'N/A'}
- Active Agent Orchestrated: ${activeAgentName || 'None'}
- PO Ref: ${activeTransaction?.poReference || 'N/A'}
- Goods Receipt (GR) Ref: ${activeTransaction?.grReference || 'N/A'}
`;

      if (activeTransaction?.matchDetails?.discrepancy) {
        systemInstruction += `\nEMERGENCY CONTEXT: A match mismatch has been detected! Field: ${activeTransaction.matchDetails.discrepancy.field}. Message: ${activeTransaction.matchDetails.discrepancy.message}. A draft supplier email is suggested in the system: "${activeTransaction.matchDetails.emailDraft || ''}".`;
      }

      if (activeTransaction?.approvalDetails) {
        systemInstruction += `\nAPPROVAL POLICY DETAILS: Policy is "${activeTransaction.approvalDetails.policyApplied}". Level assigned to: ${activeTransaction.approvalDetails.approverName} (${activeTransaction.approvalDetails.approverRole}). Cost Center: ${activeTransaction.approvalDetails.costCenter}. Purpose: ${activeTransaction.approvalDetails.businessPurpose}. SLA remaining: ${activeTransaction.approvalDetails.slaMinutesRemaining} minutes.`;
      }

      if (activeTransaction?.reconciliationDetails) {
        systemInstruction += `\nRECONCILIATION DETAILS: Bank Reference: ${activeTransaction.reconciliationDetails.bankReference}. Match GL: ${activeTransaction.reconciliationDetails.matchStatus}. Account: ${activeTransaction.reconciliationDetails.glAccount}.`;
      }

      systemInstruction += `\n\nYOUR PERSONA & TONE GUIDELINES:
1. Speak in plain business English - absolutely NO technical jargon, code elements, or system indices unless explicitly asked.
2. Be professional, direct, quiet, and helpful. Always offer actionable next steps like approving, escalating, emailing vendor, or matching GL journal tags.
3. Identify yourself as the active agent: "${activeAgentName || 'FinFlow Assistant'}". If there is no active agent (CLOSED), speak as the General System Auditor.
4. Keep answers concise (1-2 clear paragraphs, perhaps brief bullet points). Avoid repeating the prompt or echoing long structural blocks.`;

      // Map prior frontend conversation format into Google GenAI Chat parameters
      // Note: We'll construct a simple prompt with the chat history appended so we don't have to worry about chat state conflicts on the SDK.
      let chatPromptContext = "";
      if (history && history.length > 0) {
        chatPromptContext += "Previous Conversation:\n";
        history.forEach((msg: any) => {
          chatPromptContext += `${msg.sender}: ${msg.text}\n`;
        });
        chatPromptContext += "\n";
      }
      chatPromptContext += `User Query: "${message}"\nResponse:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatPromptContext,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred with FinFlow AI core Services." });
    }
  });

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "active", version: "3.2.0-core", apiConfigured: !!ai });
  });

  // Vite development vs production frontend serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FinFlow Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch(err => {
  console.error("Critical failure seeding FinFlow Server Core:", err);
});
