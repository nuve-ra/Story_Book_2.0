'use server';

import { v4 as uuidv4 } from 'uuid';

import { db } from '@/config/db';
import { StoryData } from '@/config/schema';

export const saveStoryToDB = async (
  formData: any,
  output: string,
  userEmail: string,
) => {
  const recordId = uuidv4();

  console.log('Saving story with data:', {
    formData,
    output,
    userEmail,
    recordId
  });

  try {
    const result = await db
      .insert(StoryData)
      .values({
        storyId: recordId,
        ageGroup: formData?.ageGroup ?? '',
        storyType: formData?.storyType ?? '',
        storySubject: formData?.storySubject ?? '',
        output: JSON.parse(output),
        userEmail: userEmail,
      })
      .returning({
        storyId: StoryData.storyId,
      });

    console.log('Successfully saved story with ID:', result[0]?.storyId);
    return result;
  } catch (error) {
    console.error('Error saving story to database:', error);
    throw error;
  }
};
