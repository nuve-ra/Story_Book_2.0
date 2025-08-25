'use client';
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { BookOpen } from 'lucide-react';

import StorySubjectInput from './_components/StorySubjectInput';
import StoryType from './_components/StoryType';
import AgeGroup from './_components/AgeGroup';
import CustomLoader from './_components/CustomLoader';

import { chatSession } from '@/config/Geminiai';
import { saveStoryToDB } from '@/app/actions/saveStory';

const CREATE_STORY_PROMPT =
  process.env.NEXT_PUBLIC_CREATE_STORY_PROMPT ??
  'Create a kids story for {ageGroup} kids, in the style of a {storyType} story, about: {storySubject}. Provide the story in markdown format with clear chapter divisions.';

export interface fieldData {
  fieldName: string;
  fieldValue: string;
}

export interface formData {
  storySubject: string;
  storyType: string;
  ageGroup: string;
}

function CreateStory() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [formData, setFormData] = useState<formData>({
    storySubject: '',
    storyType: '',
    ageGroup: '',
  });

  // Redirect to sign-in if not authenticated
  React.useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return <CustomLoader isLoading={true} />;
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const onHandleUserSelection = (data: fieldData) => {
    setFormData((prev) => ({
      ...prev,
      [data.fieldName]: data.fieldValue,
    }));
  };

  const generateStory = async () => {
    setLoading(true);
    const FINAL_PROMPT = CREATE_STORY_PROMPT.replace(
      '{ageGroup}',
      formData?.ageGroup ?? '',
    )
      .replace('{storyType}', formData?.storyType ?? '')
      .replace('{storySubject}', formData?.storySubject ?? '');

    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const storyContent = result?.response.text();

      // Create a simple story object with just the content
      const story = {
        title: 'Your Generated Story',
        content: storyContent,
        generatedAt: new Date().toISOString(),
      };

      const resp = await SaveInDB(JSON.stringify(story));

      if (resp && resp[0]?.storyId) {
        router.push(`/view-story/${resp[0].storyId}`);
      } else {
        alert('Error: Could not save story properly');
      }
    } catch (error) {
      alert(
        'Error generating story: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setLoading(false);
    }
  };

  const SaveInDB = async (output: string) => {
    try {
      const userEmail = user?.emailAddresses?.[0]?.emailAddress;

      if (!userEmail) {
        throw new Error('User email not found');
      }
      const result = await saveStoryToDB(formData, output, userEmail);

      return result;
    } catch (error) {}
  };

  return (
    <div className="p-10 md:px-20 lg:px-40 bg-[#cad3ff] min-h-screen">
      {/* Header with My Stories button */}
      <div className="flex justify-between items-center mb-8">
        <div />
        <Button
          className="text-primary hover:bg-primary/10 px-6 py-2"
          variant="ghost"
          onClick={() => router.push('/your-history')}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          My Stories
        </Button>
      </div>

      <h2 className="text-extrabold text-[70px] text-primary text-center">
        CREATE YOUR STORY
      </h2>
      <p className="text-2xl text-primary text-center">
        Unlock your creativity with AI: Craft stories like never before! Let our
        AI bring your imagination to life, one story at a time.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-14">
        <StorySubjectInput userSelection={onHandleUserSelection} />
        <StoryType userSelection={onHandleUserSelection} />
        <AgeGroup userSelection={onHandleUserSelection} />
      </div>
      <div className="flex justify-end my-10">
        <Button
          className="p-10 text-2xl"
          color="primary"
          disabled={loading}
          onClick={generateStory}
        >
          Generate Story
        </Button>
      </div>
      <CustomLoader isLoading={loading} />
    </div>
  );
}

export default CreateStory;
