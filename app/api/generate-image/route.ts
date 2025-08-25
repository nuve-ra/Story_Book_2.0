// import { writeFile, mkdir } from 'fs/promises';
// import { join, dirname } from 'path';

// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const { prompt } = await req.json();

//     const formData = new FormData();

//     formData.append('prompt', prompt);
//     formData.append('output_format', 'webp');
//     formData.append('aspect_ratio', '1:1');
//     formData.append('output_quality', '60');

//     const response = await fetch(
//       'https://api.stability.ai/v2beta/stable-image/generate/ultra',
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
//           Accept: 'image/*',
//         },
//         body: formData,
//       },
//     );

//     if (!response.ok) {
//       const errorText = await response.text();

//       return NextResponse.json(
//         {
//           error: `Stability AI API Error: ${response.status} - ${errorText}`,
//         },
//         { status: response.status },
//       );
//     }

//     const imageBlob = await response.blob();
//     const arrayBuffer = await imageBlob.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const filename = `story-cover-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
//     const filepath = join(
//       process.cwd(),
//       'public',
//       'generated-images',
//       filename,
//     );

//     await mkdir(dirname(filepath), { recursive: true });
//     await writeFile(filepath, buffer);

//     const imageUrl = `/generated-images/${filename}`;

//     return NextResponse.json({
//       imageUrl,
//       success: true,
//       size: imageBlob.size,
//       filename,
//     });
//   } catch (err) {
//     return NextResponse.json(
//       {
//         error: `Internal server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
//       },
//       { status: 500 },
//     );
//   }
// }
