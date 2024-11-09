
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

  } catch (error) {
    console.error("Error in AI generation:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: "OpenAI API error", details: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
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