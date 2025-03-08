import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
} from "@aws-amplify/backend";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

export const generateHaikuFunction = defineFunction({
  entry: "./generateHaiku.ts",
  environment: {
    MODEL_ID: process.env.MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0",
  },
});

const schema = a.schema({
  generateHaiku: a
    .query()
    .arguments({
      prompt: a.string().required(),
      images: a.json(), 
    })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(generateHaikuFunction)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

export const handler = async (event: { arguments: { prompt: string; images: string } }) => {
  const modelId = process.env.MODEL_ID;
  console.log('Using Bedrock Model:', modelId);  // モデルIDをログ出力
  
  const bedrockClient = new BedrockRuntimeClient({
    region: "ap-northeast-1",
  });

  try {
    const command = new InvokeModelCommand({
      modelId: modelId || '',
      body: JSON.stringify({
        prompt: event.arguments.prompt,
        max_tokens: 100,
      }),
      contentType: "application/json",
      accept: "application/json",
    });
    
    const response = await bedrockClient.send(command);
    console.log('Bedrock API call successful with model:', modelId);
    
    // ... rest of the code ...
    
  } catch (error) {
    console.error('Error occurred with model:', modelId);  // エラー時にもモデルIDを出力
    console.error('Error details:', error);
    throw error;
  }
};
