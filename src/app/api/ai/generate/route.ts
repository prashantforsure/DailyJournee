import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt is too long")
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful writing assistant. Generate content based on the user's prompt while maintaining a natural, engaging writing style."
          },
          {
            role: "user",
            content: `Write a journal entry about: ${validationResult.data.prompt}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      });

      const content = completion.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error("No content generated");
      }

      return NextResponse.json({ content });
    } catch (openaiError) {
      if (openaiError instanceof OpenAI.APIError) {
        // Handle quota exceeded error specifically
        if (openaiError.code === 'insufficient_quota') {
          console.error("OpenAI API quota exceeded:", openaiError);
          return NextResponse.json(
            {
              error: "Service temporarily unavailable",
              message: "API quota exceeded. Please try again later or contact support.",
              details: process.env.NODE_ENV === 'development' ? openaiError.message : undefined
            },
            { status: 429 }
          );
        }

        // Handle rate limiting
        if (openaiError.status === 429) {
          console.error("OpenAI API rate limit reached:", openaiError);
          return NextResponse.json(
            {
              error: "Too many requests",
              message: "Please try again in a few moments.",
              details: process.env.NODE_ENV === 'development' ? openaiError.message : undefined
            },
            { status: 429 }
          );
        }

        // Handle other OpenAI specific errors
        return NextResponse.json(
          {
            error: "AI Service Error",
            message: "There was an error processing your request.",
            details: process.env.NODE_ENV === 'development' ? openaiError.message : undefined
          },
          { status: openaiError.status || 500 }
        );
      }

      // Handle any other errors
      console.error("Unexpected error in AI generation:", openaiError);
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}