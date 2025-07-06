import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"


export async function POST(req: Request) {
  try {
    const {
      projectIdea,
      applicationType,
      developmentType,
      additionalRequirements,
      technicalLevel,
      preferredTechStack,
      apiKey,
    } = await req.json()

    // Validate API key
    if (!apiKey || !apiKey.trim()) {
      return Response.json({ error: "OpenAI API key is required" }, { status: 400 })
    }

    // Create OpenAI instance with user-provided API key
    const openai = createOpenAI({
      apiKey: apiKey.trim(),
    })

    const prompt = `
    Generate a comprehensive project guide for the following project:

    Project Idea: ${projectIdea}
    Application Type: ${applicationType}
    Development Type: ${developmentType}
    Additional Requirements: ${additionalRequirements}
    Technical Level: ${technicalLevel}
    Preferred Tech Stack: ${preferredTechStack}

    Please provide a detailed response in the following JSON format:
    {
      "projectAnalysis": "Detailed analysis of the project idea, its feasibility, target audience, and key features",
      "recommendedStack": "Recommended technology stack with explanations for each choice",
      "initialSetupSteps": "Step-by-step initial setup instructions",
      "projectStructure": "Recommended project folder structure and organization",
      "implementationStrategy": "Phase-by-phase implementation approach with priorities",
      "resources": "Useful resources, tutorials, documentation, and tools"
    }

    Make sure each section is comprehensive and tailored to the user's technical level and requirements.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    // Try to parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(text)
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      parsedResponse = {
        projectAnalysis: text.substring(0, text.length / 6),
        recommendedStack: text.substring(text.length / 6, text.length / 3),
        initialSetupSteps: text.substring(text.length / 3, text.length / 2),
        projectStructure: text.substring(text.length / 2, (text.length * 2) / 3),
        implementationStrategy: text.substring((text.length * 2) / 3, (text.length * 5) / 6),
        resources: text.substring((text.length * 5) / 6),
      }
    }

    return Response.json(parsedResponse)
  } catch (error) {
    console.error("Error generating guide:", error)

    // Handle specific OpenAI API errors
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        return Response.json({ error: "Invalid API key. Please check your OpenAI API key." }, { status: 401 })
      }
      if (error.message.includes("429")) {
        return Response.json({ error: "API rate limit exceeded. Please try again later." }, { status: 429 })
      }
      if (error.message.includes("insufficient_quota")) {
        return Response.json({ error: "Insufficient API quota. Please check your OpenAI account." }, { status: 402 })
      }
    }

    return Response.json({ error: "Failed to generate project guide. Please try again." }, { status: 500 })
  }
}
