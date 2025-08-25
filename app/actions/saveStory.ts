'use server';

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/config/db';
import { StoryData } from '@/config/schema';

// Helper function to extract text content from various JSON structures
const extractTextContent = (data: any): string => {
  if (!data) return '';
  
  // If it's already a string, return it
  if (typeof data === 'string') return data;
  
  // If it's an object with a content property
  if (typeof data === 'object' && data !== null) {
    // If it has a content property, use that
    if (data.content) return String(data.content);
    
    // If it's an array of chapters or similar
    if (Array.isArray(data)) {
      return data.map(item => extractTextContent(item)).join('\n\n');
    }
    
    // If it's an object with text properties
    if (typeof data === 'object') {
      // Try common text properties
      if (data.text) return String(data.text);
      if (data.story) return String(data.story);
      if (data.content) return String(data.content);
      
      // If no specific text property found, stringify the whole object
      return Object.values(data)
        .filter(value => typeof value === 'string')
        .join('\n\n');
    }
  }
  
  // Fallback: convert to string
  return String(data);
};

export const saveStoryToDB = async (
  formData: {
    storySubject?: string;
    storyType?: string;
    ageGroup?: string;
  },
  output: string,
  userEmail: string,
) => {
  const recordId = uuidv4();

  try {
    let storyContent = output;
    
    // Try to parse JSON if the output is a JSON string
    try {
      const parsed = JSON.parse(output);
      storyContent = extractTextContent(parsed);
    } catch (e) {
      // If it's not valid JSON, use it as is
      storyContent = output;
    }

    // Create a clean story object with just the content we need
    const storyOutput = {
      title: formData?.storySubject || 'Untitled Story',
      content: storyContent,
      generatedAt: new Date().toISOString(),
    };

    const result = await db
      .insert(StoryData)
      .values({
        storyId: recordId,
        ageGroup: formData?.ageGroup ?? '',
        storyType: formData?.storyType ?? '',
        storySubject: formData?.storySubject ?? '',
        output: storyOutput,
        userEmail: userEmail,
      })
      .returning({
        storyId: StoryData.storyId,
      });

    return result;
  } catch (error) {
    console.error('Error saving story:', error);
    throw new Error('Failed to save story');
  }
};
