import { GoogleGenerativeAI } from '@google/generative-ai';
import { FormField } from '../../../shared/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface FormGenerationRequest {
  description: string;
  context?: string;
}

export interface FormGenerationResponse {
  title: string;
  description: string;
  fields: FormField[];
}

export class AIFormService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateForm(request: FormGenerationRequest): Promise<FormGenerationResponse> {
    const prompt = this.buildPrompt(request.description, request.context);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseFormResponse(text);
    } catch (error) {
      console.error('Error generating form:', error);
      throw new Error('Failed to generate form with AI');
    }
  }

  private buildPrompt(description: string, context?: string): string {
    return `
You are a form generation AI. Based on the user's description, generate a complete form configuration.

User Description: "${description}"
${context ? `Additional Context: "${context}"` : ''}

Please generate a form with the following JSON structure:
{
  "title": "Form Title",
  "description": "Brief description of the form's purpose",
  "fields": [
    {
      "id": "field-1",
      "type": "text|email|number|textarea|select|radio|checkbox|date|rating|signature|file",
      "label": "Field Label",
      "description": "Optional field description",
      "required": true|false,
      "placeholder": "Optional placeholder text",
      "options": ["option1", "option2"] // Only for select, radio, checkbox fields
    }
  ]
}

Guidelines:
1. Create relevant field types based on the description
2. Use appropriate validation (required fields, email validation, etc.)
3. Include helpful placeholders and descriptions
4. For select/radio/checkbox fields, provide realistic options
5. Order fields logically
6. Keep form concise but comprehensive
7. Use semantic field IDs like "name", "email", "phone", etc.

Available field types:
- text: Basic text input
- email: Email validation
- number: Numeric input
- textarea: Multi-line text
- select: Dropdown selection
- radio: Single choice from options
- checkbox: Multiple choice from options
- date: Date picker
- rating: Star/number rating
- signature: Digital signature
- file: File upload

Return ONLY the JSON response, no additional text or formatting.
`;
  }

  private parseFormResponse(response: string): FormGenerationResponse {
    try {
      // Remove any markdown code blocks or extra text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const cleanJson = jsonMatch[0];
      const parsed = JSON.parse(cleanJson);
      
      // Validate and sanitize the response
      return {
        title: parsed.title || 'Generated Form',
        description: parsed.description || '',
        fields: this.validateAndSanitizeFields(parsed.fields || [])
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  private validateAndSanitizeFields(fields: any[]): FormField[] {
    const validTypes: FormField['type'][] = [
      'text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'rating', 'signature', 'file'
    ];

    return fields
      .filter(field => field.type && validTypes.includes(field.type))
      .map((field, index) => ({
        id: field.id || `field-${index + 1}`,
        type: field.type,
        label: field.label || `Field ${index + 1}`,
        description: field.description,
        required: Boolean(field.required),
        placeholder: field.placeholder,
        options: field.options && Array.isArray(field.options) ? field.options : undefined,
        validation: field.validation || undefined,
        fileOptions: field.type === 'file' ? {
          accept: field.fileOptions?.accept || '*/*',
          multiple: field.fileOptions?.multiple || false,
          maxSize: field.fileOptions?.maxSize || 15
        } : undefined
      }));
  }

  async improveSuggestions(currentForm: FormGenerationResponse, feedback: string): Promise<FormField[]> {
    const prompt = `
Given this current form:
${JSON.stringify(currentForm, null, 2)}

User feedback: "${feedback}"

Please suggest improvements or additions to the form based on the feedback. Return only the updated fields array as JSON:
[
  {
    "id": "field-1",
    "type": "text",
    "label": "Field Label",
    "required": true
  }
]

Focus on:
1. Adding missing fields based on feedback
2. Improving existing field labels or types
3. Adjusting field order or requirements
4. Adding appropriate validation

Return ONLY the JSON array of fields, no additional text.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return this.validateAndSanitizeFields(parsed);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw new Error('Failed to generate form suggestions');
    }
  }
}

export const aiFormService = new AIFormService();