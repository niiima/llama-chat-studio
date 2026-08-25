export const AISettings = {
  // Default settings (can be overridden per model)
  max_tokens: 8192,
  max_response_tokens: 2048,
  temperature: 0.6,
  top_p: 0.95,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
};

export const engines = [
  // ========== Qwen3-8B (Fast & efficient) ==========
  {
    id: 2,
    name: "Qwen3-8B",
    key: "Qwen3-8B-Q4_K_M",          // exact model id from /v1/models
    maxTokens: 8192,  
    max_response_tokens: 2048,
    temperature: 0.6,
    top_p: 0.95,
    top_k: 20,
    costPerKiloToken: 0,
    description: "Fast local Qwen3 8B. Best for everyday chat, coding and quick tasks. Fully on GPU.",
    descriptionFa: "مدل سریع محلی Qwen3 هشت‌ میلیاردی. مناسب گفتگوی روزمره، کدنویسی و کارهای سریع. کاملاً روی GPU.",
    abilities: "Chat, coding, reasoning, multilingual",
    // Recommended llama.cpp flags when loading this model:
    // -ngl 99 -c 8192 --cache-type-k q8_0 --cache-type-v q8_0 --flash-attn on
  },

  // ========== Qwen3.8-27B (Strongest quality) ==========
  {
    id: 1,
    name: "Qwen3.8-27B",
    key: "Qwen3.8-27B-Q4_K_M",
    maxTokens: 8192,
    max_response_tokens: 4096,
    temperature: 0.6,
    top_p: 0.95,
    top_k: 20,
    costPerKiloToken: 0,
    description: "Strongest local model. Excellent for complex coding, research and long reasoning. Partial GPU offload.",
    descriptionFa: "قوی‌ترین مدل محلی. عالی برای کدنویسی پیچیده، تحقیق و استدلال طولانی. بارگذاری جزئی روی GPU.",
    abilities: "Advanced coding, long reasoning, agentic tasks, multimodal (if mmproj present)",
    // Recommended llama.cpp flags:
    // -ngl 28 -c 8192 -n 4096 --cache-type-k q4_0 --cache-type-v q4_0 --flash-attn on
  },

  // ========== Gemma 4 12B ==========
  {
    id: 0,
    name: "Gemma 4 12B",
    key: "gemma-4-12B-it-Q4_0",
    maxTokens: 8192,
    max_response_tokens: 2048,
    temperature: 1.0,          // official Gemma 4 recommendation
    top_p: 0.95,
    top_k: 64,                 // official Gemma 4 recommendation
    costPerKiloToken: 0,
    description: "Google Gemma 4 12B. Strong multimodal model with excellent instruction following and 256K context.",
    descriptionFa: "مدل Gemma 4 دوازده‌ میلیاردی گوگل. مدل چندوجهی قوی با دنبال کردن عالی دستورات و کانتکست ۲۵۶ هزارتایی.",
    abilities: "Chat, coding, vision (with mmproj), long context, multilingual",
    // Recommended llama.cpp flags:
    // -ngl 99 -c 8192 --cache-type-k q8_0 --cache-type-v q8_0 --flash-attn on
  },
];

// You can keep experimentalEngines empty or remove it
export const experimentalEngines = [...engines];