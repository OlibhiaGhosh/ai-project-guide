const OpenAI = require("openai");
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";
require("dotenv").config();
function safeJsonParse(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.log("Direct JSON parsing failed, attempting to clean...");
    
    let cleaned = jsonString
      // Remove markdown code blocks
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      // Replace unescaped newlines in strings with escaped newlines
      .replace(/(?<!\\)\n/g, "\\n")
      // Replace unescaped tabs with escaped tabs
      .replace(/(?<!\\)\t/g, "\\t")
      // Replace unescaped carriage returns with escaped carriage returns
      .replace(/(?<!\\)\r/g, "\\r")
      // Replace unescaped backslashes (but not already escaped ones)
      .replace(/(?<!\\)\\(?![\\"/bfnrt])/g, "\\\\")
      // Fix any remaining control characters
      .replace(/[\x00-\x1F\x7F]/g, "");

    // Extract JSON from the cleaned string
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.log("Second parsing attempt failed, trying more aggressive cleaning...");
      
      // More aggressive cleaning - escape all quotes within string values
      let aggressiveCleaned = cleaned
        // Fix unescaped quotes in string values
        .replace(/"([^"\\]*(\\.[^"\\]*)*)"(\s*:\s*"[^"]*"[^"]*)"([^"\\]*(\\.[^"\\]*)*)"(\s*[,}])/g, 
                 '"$1"$3\\"$4\\"$5$6')
        // Remove any remaining problematic characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

      return JSON.parse(aggressiveCleaned);
    }
  }
}

export async function POST(req: NextRequest) {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "30 d"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
  // Get client IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "127.0.0.1";
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    console.log("Rate limit exceeded for IP:", ip);
    return Response.json(
      {
        reset: new Date(reset).toISOString(),
        error: "Rate limit exceeded. Please try again!",
        limit,
        remaining,
        
      },
      { status: 429 }
    );
  }
  try {
    const {
      projectIdea,
      applicationType,
      developmentType,
      additionalRequirements,
      technicalLevel,
      preferredTechStack,
    } = await req.json();

    if (!process.env.NEBIUS_API_KEY) {
      return Response.json(
        { error: "NEBIUS_API_KEY is not set" },
        { status: 500 }
      );
    }
    if (
      !projectIdea ||
      !applicationType ||
      !developmentType ||
      !technicalLevel
    ) {
      return Response.json(
        {
          error:
            "Project idea, application type, development type, and technical level are required",
        },
        { status: 400 }
      );
    }

    const prompt = `
    Generate a comprehensive project guide for the following project:

    Project Idea: ${projectIdea}
    Application Type: ${applicationType}
    Development Type: ${developmentType}
    Additional Requirements: ${additionalRequirements}
    Technical Level: ${technicalLevel}
    Preferred Tech Stack: ${preferredTechStack}

    Please provide a detailed response in the following JSON format without any extra word outside this format. Just give the JSON response without any explanation or additional text. Also remove any extra markdown formatting:
    {
      "projectAnalysis": "Detailed analysis of the project idea, its feasibility, target audience, and key features",
      "recommendedStack": "Recommended technology stack with explanations for each choice",
      "initialSetupSteps": "Step-by-step initial setup instructions",
      "projectStructure": "Recommended project folder structure and organization",
      "implementationStrategy": "Phase-by-phase implementation approach with priorities",
      "resources": "Useful resources, tutorials, documentation, and tools"
    }
    Inside every section in response provide detailed info in array format. For example, for the 'projectAnalysis' section, provide an array of element of structure element {
  key: string
  value: string
} where each element has a detailed point or explanation in value section.

    Make sure each section is comprehensive and tailored to the user's technical level and requirements.
    Also give code examples where applicable, especially in the 'initialSetupSteps' and 'implementationStrategy' sections.
    Ensure the response is well-structured and easy to follow.
    while gining the response, make sure to use the following format: Give a solely json response without any explanation or additional text. Just give the JSON response without any extra word outside this format.
    Remove any extra markdown formatting.
    Make sure to provide a detailed and comprehensive guide that covers all aspects of the project.
    `;
    const client = new OpenAI({
      baseURL: "https://api.studio.nebius.com/v1/",
      apiKey: process.env.NEBIUS_API_KEY,
    });

    let completion = await client.chat.completions.create({
      temperature: 0.6,
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    // console.log(completion);
    try {
      const result = await safeJsonParse(completion.choices[0].message.content);
      console.log("Parsed result:", result);
      return Response.json({result, remaining},{ status: 200 });
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.log("Raw AI response:", completion.choices[0].message.content);
      }
    }
    catch (error) {
    console.error("Error generating guide:", error);
    return Response.json(
      { error: "Failed to generate project guide. Please try again." },
      { status: 500 }
    );
  }
}
