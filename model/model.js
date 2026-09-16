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
    key: "Qwen3-8B-Q4_K_M",
    maxTokens: 8192,
    max_response_tokens: 2048,
    temperature: 0.6,
    top_p: 0.95,
    top_k: 20,
    presence_penalty: 1.5, // recommended for quantized Qwen3 to reduce repetition
    costPerKiloToken: 0,
    description: "Fast local Qwen3 8B. Best for everyday chat, coding and quick tasks. Fully on GPU.",
    descriptionFa: "مدل سریع محلی Qwen3 هشت‌ میلیاردی. مناسب گفتگوی روزمره، کدنویسی و کارهای سریع. کاملاً روی GPU.",
    abilities: "Chat, coding, reasoning, multilingual",
    // Recommended llama.cpp flags:
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
    presence_penalty: 0.0,
    costPerKiloToken: 0,
    description: "Strongest local model. Excellent for complex coding, research and long reasoning. Partial GPU offload.",
    descriptionFa: "قوی‌ترین مدل محلی. عالی برای کدنویسی پیچیده، تحقیق و استدلال طولانی. بارگذاری جزئی روی GPU.",
    abilities: "Advanced coding, long reasoning, agentic tasks, multimodal (if mmproj present)",
    // Recommended llama.cpp flags:
    // -ngl 28 -c 8192 -n 4096 --cache-type-k q4_0 --cache-type-v q4_0 --flash-attn on
  },

  // ========== Gemma 3 12B Abliterated ==========
  {
    id: 4,
    name: "Gemma 3 12B Abliterated",
    key: "gemma-3-12b-it-ablit-norms-biproj-Q4_K_M",
    maxTokens: 8192,
    max_response_tokens: 2048,
    temperature: 1.0,
    top_p: 0.95,
    top_k: 64,
    costPerKiloToken: 0,
    description: "Abliterated Gemma 3 12B. Uncensored, strong instruction following and coding. Good all-rounder.",
    descriptionFa: "نسخه بدون سانسور Gemma 3 دوازده‌ میلیاردی. دنبال کردن دستورات قوی و کدنویسی عالی.",
    abilities: "Chat, coding, creative writing, uncensored",
    // Recommended llama.cpp flags:
    // -ngl 99 -c 8192 --cache-type-k q8_0 --cache-type-v q8_0 --flash-attn on
  },

  // ========== Gemma 4 12B ==========
  {
    id: 3,
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

  // ========== Gemma 4 E4B (Q8) ==========
  {
    id: 5,
    name: "Gemma 4 E4B",
    key: "gemma-4-E4B-it-Q8_0",
    maxTokens: 8192,
    max_response_tokens: 2048,
    temperature: 1.0,
    top_p: 0.95,
    top_k: 64,
    costPerKiloToken: 0,
    description: "Google Gemma 4 E4B (higher quality Q8). Fast multimodal model, great instruction following, 128K context.",
    descriptionFa: "مدل Gemma 4 E4B با کوانتیزه Q8. مدل چندوجهی سریع با کیفیت بالا و کانتکست ۱۲۸ هزارتایی.",
    abilities: "Chat, coding, vision (with mmproj), long context, multilingual",
    // Recommended llama.cpp flags:
    // -ngl 99 -c 8192 --cache-type-k q8_0 --cache-type-v q8_0 --flash-attn on
  },

  // ========== Gemma 4 E4B Ultra-Uncensored ==========
  {
    id: 0,
    name: "Gemma 4 E4B Uncensored",
    // key: "gemma-4-E4B-it-ultra-uncensored-heretic-Q6_K",
    key: "gemma-4-E4B-it-ultra-uncensored-heretic-Q6_K",
    maxTokens: 8192,
    max_response_tokens: 2048,
    temperature: 1.0,
    top_p: 0.95,
    top_k: 64,
    costPerKiloToken: 0,
    description: "Ultra-uncensored Gemma 4 E4B (Heretic). Strong multimodal model with excellent instruction following.",
    descriptionFa: "نسخه فوق‌العاده بدون سانسور Gemma 4 E4B. مدل چندوجهی قوی با دنبال کردن عالی دستورات.",
    abilities: "Chat, coding, vision (with mmproj), long context, multilingual, uncensored",
    // Recommended llama.cpp flags:
    // -ngl 99 -c 8192 --cache-type-k q8_0 --cache-type-v q8_0 --flash-attn on
  },
];

// You can keep experimentalEngines empty or remove it
export const experimentalEngines = [...engines];