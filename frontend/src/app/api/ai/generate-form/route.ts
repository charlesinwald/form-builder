import { NextRequest, NextResponse } from 'next/server';
import { aiFormService, FormGenerationRequest } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body: FormGenerationRequest = await request.json();
    
    if (!body.description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const formData = await aiFormService.generateForm(body);
    
    return NextResponse.json(formData);
  } catch (error) {
    console.error('Error generating form:', error);
    return NextResponse.json(
      { error: 'Failed to generate form' },
      { status: 500 }
    );
  }
}