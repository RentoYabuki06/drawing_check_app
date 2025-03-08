import type { Schema } from "./resource";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

// initialize Bedrock runtime client
const client = new BedrockRuntimeClient({
  region: 'us-east-1'
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithDelay = async <T>(
  fn: () => Promise<T>,
  retries = 5,
  delayMs = 500,
  timeout = 28000
): Promise<T> => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeout);
    });
    const resultPromise = fn();
    return await Promise.race([resultPromise, timeoutPromise]) as T;
  } catch (error) {
    if (retries === 0) throw error;
    if (error instanceof Error && 
        (error.message.includes('Too many requests') || error.message.includes('timed out'))) {
      console.log(`Retrying... ${retries} attempts remaining. Waiting ${delayMs/1000} seconds.`);
      await delay(delayMs);
      return retryWithDelay(fn, retries - 1, delayMs * 2, timeout);
    }
    throw error;
  }
};

export const handler: Schema["generateHaiku"]["functionHandler"] = async (
  event,
  context
) => {
  // User input (text prompt and optional images)
  const prompt = event.arguments.prompt;
  const images = event.arguments.images;

  // Validate input
  if (!prompt) {
    throw new Error("The 'prompt' field is required.");
  }

  // Prepare content array
  const content: Array<any> = [
    {
      type: "text",
      text: `${prompt}`
    }
  ];

  // Add images to content if provided
  if (Array.isArray(images) && images.length > 0) {
    images.forEach((image: string) => {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: image,
        },
      });
    });
  }

  // Prepare Bedrock input
  const input = {
    modelId: process.env.MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
    }),
  } as InvokeModelCommandInput;

  const command = new InvokeModelCommand(input);

  try {
    return await retryWithDelay(async () => {
      const response = await client.send(command);
      console.log(`使用したLLMモデル: ${process.env.MODEL_ID}`);
      const responseBody = JSON.parse(Buffer.from(response.body).toString());
      
      if (!responseBody || !responseBody.content || !responseBody.content[0] || !responseBody.content[0].text) {
        console.error('Invalid response structure:', responseBody);
        throw new Error('モデルからの応答が不正な形式です');
      }

      return responseBody.content[0].text;
    });
  } catch (error) {
    console.error("Error invoking model:", error);
    if (error instanceof Error) {
      throw new Error(`モデル呼び出しエラー: ${error.message}`);
    }
    throw new Error('モデル呼び出し中に予期せぬエラーが発生しました');
  }
};
