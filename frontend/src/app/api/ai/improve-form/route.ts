import { NextRequest, NextResponse } from 'next/server';
import { aiFormService, FormGenerationResponse } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body: { currentForm: FormGenerationResponse; feedback: string } = await request.json();
    
    if (!body.feedback || !body.currentForm) {
      return NextResponse.json(
        { error: 'Current form and feedback are required' },
        { status: 400 }
      );
    }

    const improvedFields = await aiFormService.improveSuggestions(body.currentForm, body.feedback);
    
    return NextResponse.json({ fields: improvedFields });
  } catch (error) {
    console.error('Error improving form:', error);
    return NextResponse.json(
      { error: 'Failed to improve form' },
      { status: 500 }
    );
  }
}