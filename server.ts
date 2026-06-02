import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase the limit for body parser as base64 images can be quite large
  app.use(express.json({ limit: "15mb" }));

  // Initialize Gemini if key is present
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Face detection will be bypassed or restricted.");
  }

  // API routing for face validation
  app.post("/api/detect-face", async (req, res) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({
          hasFace: false,
          confidence: 0,
          message: "No image content provided."
        });
      }

      // If GEMINI_API_KEY is not configured, fallback or warn
      if (!ai) {
        return res.json({
          hasFace: true, // Allow everything when API key is missing to avoid blocking users
          confidence: 1.0,
          message: "API key is not configured; letting image pass by default."
        });
      }

      let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;

      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          imagePart = {
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          };
        }
      } else if (image.startsWith("http")) {
        try {
          const imgRes = await fetch(image);
          if (!imgRes.ok) {
            throw new Error(`Failed to fetch image from URL: ${imgRes.statusText}`);
          }
          const buf = await imgRes.arrayBuffer();
          const base64Data = Buffer.from(buf).toString("base64");
          const contentType = imgRes.headers.get("content-type") || "image/jpeg";
          imagePart = {
            inlineData: {
              mimeType: contentType,
              data: base64Data,
            },
          };
        } catch (fetchErr: any) {
          console.error("Error fetching remote image URL:", fetchErr);
          return res.status(400).json({
            hasFace: false,
            confidence: 0,
            message: `Could not fetch image from URL: ${fetchErr.message}`
          });
        }
      }

      if (!imagePart) {
        return res.status(400).json({
          hasFace: false,
          confidence: 0,
          message: "Invalid image format received. Supported data URIs or http/https URLs."
        });
      }

      const prompt = "Analyze this image. Does this image contain a real human face or a real human profile portrait? Reject cartoons, abstract vectors, non-human objects, landscapes, animals, generic placeholder icons/patterns, and unrecognisable shapes. Respond only in JSON coordinates conforming to schema.";

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: {
          parts: [
            imagePart,
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasFace: {
                type: Type.BOOLEAN,
                description: "True if the image contains a clear, real human face or portrait; false otherwise."
              },
              confidence: {
                type: Type.NUMBER,
                description: "The level of confidence in the assessment, from 0.0 to 1.0."
              },
              message: {
                type: Type.STRING,
                description: "A friendly, ultra-short sentence explaining why it passed or failed (e.g. 'This is a cartoon', 'No human face detected', 'Clear portrait detected')."
              }
            },
            required: ["hasFace", "confidence", "message"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini.");
      }

      const assessment = JSON.parse(responseText.trim());
      return res.json(assessment);

    } catch (err: any) {
      console.error("Face detection endpoint error:", err);
      const errString = String(err.message || err);
      
      if (
        errString.includes("503") || 
        errString.includes("high demand") || 
        errString.includes("UNAVAILABLE") ||
        errString.includes("overloaded")
      ) {
        return res.json({
          hasFace: true, // Graceful fallback
          confidence: 0.5,
          isTransientError: true,
          message: "AI service busy; letting image pass as fallback."
        });
      }

      return res.status(500).json({
        hasFace: false,
        confidence: 0,
        message: `Internal processing error: ${errString}`
      });
    }
  });

  // API routing for proof of payment verification
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({
          isValid: false,
          confidence: 0,
          message: "No payment proof image provided."
        });
      }

      if (!ai) {
        return res.json({
          isValid: true, // Bypass if AI not configured
          confidence: 1.0,
          message: "AI verification disabled: assuming validity."
        });
      }

      let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;

      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          imagePart = {
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          };
        }
      }

      if (!imagePart) {
        return res.status(400).json({
          isValid: false,
          confidence: 0,
          message: "Unsupported image format."
        });
      }

      const prompt = "Analyze this image. Is this a valid proof of bank payment, EFT receipt, transaction confirmation, or payment slip? Look for bank names, account numbers, dates, amounts, or 'Successful' status text. If it is a generic photo, a selfie, or unrelated content, mark as invalid. Response must be JSON.";

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: {
          parts: [
            imagePart,
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: {
                type: Type.BOOLEAN,
                description: "True if the image is a valid payment receipt or confirmation; false otherwise."
              },
              confidence: {
                type: Type.NUMBER,
                description: "AI confidence score 0.0-1.0."
              },
              message: {
                type: Type.STRING,
                description: "Short reason for the decision."
              }
            },
            required: ["isValid", "confidence", "message"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Empty response from AI");

      const assessment = JSON.parse(responseText.trim());
      return res.json(assessment);

    } catch (err: any) {
      console.error("Payment verification error:", err);

      const errString = String(err.message || err);
      // Handle transient AI service errors gracefully
      if (
        errString.includes("503") || 
        errString.includes("high demand") || 
        errString.includes("UNAVAILABLE") ||
        errString.includes("overloaded") ||
        errString.includes("rate_limit")
      ) {
        return res.json({
          isValid: true,
          isTransientError: true,
          confidence: 0.5,
          message: "AI service is currently busy. Proceeding with manual fallback."
        });
      }

      return res.status(500).json({
        isValid: false,
        confidence: 0,
        message: `Verification system error: ${errString}`
      });
    }
  });

  // Serve static UI assets or mount Vite middleware depending on mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
