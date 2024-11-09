import { NextResponse } from "next/server";
import OpenAI from "openai";

interface RequestBody {
  prompt: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string
});

export async function POST(request: Request) {
  try {
   
    const body: RequestBody = await request.json();
    
    if (!body.prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const completion = await openai.completions.create({
      model: "text-davinci-003",
      prompt: `Write a personal journal entry: ${body.prompt}`,
      max_tokens: 150,
    });

    return NextResponse.json({
      content: completion.choices[0].text.trim()
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}