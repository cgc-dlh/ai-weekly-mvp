/**
 * 统一AI客户端配置
 * 支持自定义baseURL（兼容OpenAI API格式的第三方服务）
 */

import { createOpenAI } from "@ai-sdk/openai";

const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const apiKey = process.env.OPENAI_API_KEY || "";

if (!apiKey) {
  console.warn("⚠️ OPENAI_API_KEY not set. AI features will not work.");
}

export const openai = createOpenAI({
  baseURL,
  apiKey,
});

/**
 * 默认模型 — 使用gpt-4o-mini（成本低、速度快）
 * 如果第三方服务不支持此模型名，可通过OPENAI_MODEL环境变量覆盖
 */
export const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
