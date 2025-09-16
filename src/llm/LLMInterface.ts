import { pipeline, Pipeline } from '@xenova/transformers';

// Base interface for all LLM models in Voxlor
export interface LLMResponse {
  content: string;
  model: string;
  tokens: number;
  latency: number;
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

export abstract class BaseLLM {
  protected config: LLMConfig;
  protected pipeline: Pipeline | null = null;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract generate(prompt: string, context?: string): Promise<LLMResponse>;
  abstract stream(prompt: string, context?: string): AsyncGenerator<LLMResponse>;
}

// Specific model implementations
export class FalconLLM extends BaseLLM {
  async initialize(): Promise<void> {
    console.log('🦅 Initializing Falcon model...');
    this.pipeline = await pipeline('text-generation', 'tiiuae/falcon-7b-instruct', {
      quantized: true,
      progress_callback: (progress: any) => {
        console.log(`Falcon loading: ${Math.round(progress.progress * 100)}%`);
      }
    });
    console.log('✅ Falcon model loaded successfully');
  }

  async generate(prompt: string, context?: string): Promise<LLMResponse> {
    if (!this.pipeline) {
      await this.initialize();
    }

    const startTime = Date.now();
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const result = await this.pipeline(fullPrompt, {
      max_new_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      top_p: this.config.topP,
      do_sample: true,
      return_full_text: false
    });

    const content = result[0].generated_text;
    
    return {
      content,
      model: 'falcon-7b-instruct',
      tokens: this.estimateTokens(fullPrompt + content),
      latency: Date.now() - startTime
    };
  }

  async *stream(prompt: string, context?: string): AsyncGenerator<LLMResponse> {
    const response = await this.generate(prompt, context);
    yield response;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation
  }
}

export class MistralLLM extends BaseLLM {
  async initialize(): Promise<void> {
    console.log('🌪️ Initializing Mistral model...');
    this.pipeline = await pipeline('text-generation', 'mistralai/Mistral-7B-Instruct-v0.1', {
      quantized: true,
      progress_callback: (progress: any) => {
        console.log(`Mistral loading: ${Math.round(progress.progress * 100)}%`);
      }
    });
    console.log('✅ Mistral model loaded successfully');
  }

  async generate(prompt: string, context?: string): Promise<LLMResponse> {
    if (!this.pipeline) {
      await this.initialize();
    }

    const startTime = Date.now();
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const result = await this.pipeline(fullPrompt, {
      max_new_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      top_p: this.config.topP,
      do_sample: true,
      return_full_text: false
    });

    const content = result[0].generated_text;
    
    return {
      content,
      model: 'mistral-7b-instruct',
      tokens: this.estimateTokens(fullPrompt + content),
      latency: Date.now() - startTime
    };
  }

  async *stream(prompt: string, context?: string): AsyncGenerator<LLMResponse> {
    const response = await this.generate(prompt, context);
    yield response;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

export class CodeLlamaLLM extends BaseLLM {
  async initialize(): Promise<void> {
    console.log('🦙 Initializing CodeLlama model...');
    this.pipeline = await pipeline('text-generation', 'codellama/CodeLlama-7b-Instruct-hf', {
      quantized: true,
      progress_callback: (progress: any) => {
        console.log(`CodeLlama loading: ${Math.round(progress.progress * 100)}%`);
      }
    });
    console.log('✅ CodeLlama model loaded successfully');
  }

  async generate(prompt: string, context?: string): Promise<LLMResponse> {
    if (!this.pipeline) {
      await this.initialize();
    }

    const startTime = Date.now();
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const result = await this.pipeline(fullPrompt, {
      max_new_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      top_p: this.config.topP,
      do_sample: true,
      return_full_text: false
    });

    const content = result[0].generated_text;
    
    return {
      content,
      model: 'codellama-7b-instruct',
      tokens: this.estimateTokens(fullPrompt + content),
      latency: Date.now() - startTime
    };
  }

  async *stream(prompt: string, context?: string): AsyncGenerator<LLMResponse> {
    const response = await this.generate(prompt, context);
    yield response;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

export class LLaMA3LLM extends BaseLLM {
  async initialize(): Promise<void> {
    console.log('🦙 Initializing LLaMA 3 model...');
    this.pipeline = await pipeline('text-generation', 'meta-llama/Llama-3-8B-Instruct', {
      quantized: true,
      progress_callback: (progress: any) => {
        console.log(`LLaMA 3 loading: ${Math.round(progress.progress * 100)}%`);
      }
    });
    console.log('✅ LLaMA 3 model loaded successfully');
  }

  async generate(prompt: string, context?: string): Promise<LLMResponse> {
    if (!this.pipeline) {
      await this.initialize();
    }

    const startTime = Date.now();
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const result = await this.pipeline(fullPrompt, {
      max_new_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      top_p: this.config.topP,
      do_sample: true,
      return_full_text: false
    });

    const content = result[0].generated_text;
    
    return {
      content,
      model: 'llama-3-8b-instruct',
      tokens: this.estimateTokens(fullPrompt + content),
      latency: Date.now() - startTime
    };
  }

  async *stream(prompt: string, context?: string): AsyncGenerator<LLMResponse> {
    const response = await this.generate(prompt, context);
    yield response;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

// LLM Factory for creating instances
export class LLMFactory {
  static createFalcon(config: Partial<LLMConfig> = {}): FalconLLM {
    return new FalconLLM({
      model: 'falcon-7b-instruct',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      ...config
    });
  }

  static createMistral(config: Partial<LLMConfig> = {}): MistralLLM {
    return new MistralLLM({
      model: 'mistral-7b-instruct',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      ...config
    });
  }

  static createCodeLlama(config: Partial<LLMConfig> = {}): CodeLlamaLLM {
    return new CodeLlamaLLM({
      model: 'codellama-7b-instruct',
      temperature: 0.3,
      maxTokens: 4096,
      topP: 0.95,
      ...config
    });
  }

  static createLLaMA3(config: Partial<LLMConfig> = {}): LLaMA3LLM {
    return new LLaMA3LLM({
      model: 'llama-3-8b-instruct',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      ...config
    });
  }
}