// type definitions for backboard-sdk
// backboard.io provides access to multiple llm providers through a unified api

declare module "backboard-sdk" {
  export interface BackboardClientOptions {
    apiKey: string;
  }

  export interface CreateAssistantOptions {
    name: string;
    system_prompt: string;
  }

  export interface Assistant {
    assistantId: string;
    name: string;
  }

  export interface Thread {
    threadId: string;
    assistantId: string;
  }

  export interface MessageOptions {
    content: string;
    llm_provider?: "openai" | "anthropic" | "google" | "meta" | "mistral";
    model_name?: string;
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
  }

  export interface MessageResponse {
    content: string;
    messageId: string;
    role: "assistant" | "user";
  }

  export class BackboardClient {
    constructor(options: BackboardClientOptions);
    
    // create a new assistant with a system prompt
    createAssistant(options: CreateAssistantOptions): Promise<Assistant>;
    
    // create a conversation thread tied to an assistant
    createThread(assistantId: string): Promise<Thread>;
    
    // send a message and get a response
    addMessage(threadId: string, options: MessageOptions): Promise<MessageResponse>;
  }
}
