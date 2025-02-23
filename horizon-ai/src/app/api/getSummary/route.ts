import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!, // Ensure to set your API key in the environment variable
});

export async function POST(request: Request) {

    const SYSTEM_PROMPT = 'You are providing a summary of a therapy call between a counselor and a patient. You must summarize the conversation in a way that is concise and easy to understand. You must clearly define the areas that the patient said they were struggling with. You must give a brief overview of the advice that the counselor gave to the patient. You must only include advice that the counselor said.';
    const FORMAT_PROMPT = ''

    try {
        const { prompt } = await request.json(); // Get the prompt from the incoming request body

        console.log(prompt)
        // Send the request to GPT-4 using OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // GPT-4 model
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: `This is the transcribed therapy appointment: "${prompt}"`,
                },
            ],

        });

        console.log('🤬🤬🤬🤬🤬🤬🤬:', response.choices[0].message.content);
        // Return the response from OpenAI API
        return NextResponse.json({
            success: true,
            data: response.choices[0]?.message.content,
        });
    } catch (error) {
        // Handle any errors
        return NextResponse.json({
            success: false,
            error: 'Failed to communicate with OpenAI API',
        }, { status: 500 });
    }
}
