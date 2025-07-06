import { parseJSON } from "date-fns";

const OpenAI = require("openai");
require("dotenv").config();
export async function POST(req: Request) {
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
    The response should be in JSON format only, without any additional text or markdown formatting.
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
    console.log(completion);
    try {
      const result = await JSON.parse(completion.choices[0].message.content);
      console.log("Parsed result:", result);
      return Response.json(result, { status: 200 });
    } catch (parseError) {
      console.log("Error parsing response:", parseError);
      return Response.json(
        { error: "Failed to parse response from AI model." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating guide:", error);
    return Response.json(
      { error: "Failed to generate project guide. Please try again." },
      { status: 500 }
    );
  }
}
