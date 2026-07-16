import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Subscription table for Polar webhook data
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// ========== AI周报助手新增表 ==========

/**
 * 周报生成记录
 */
export const weeklyReport = pgTable("weekly_report", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  templateId: text("templateId").notNull(), // 使用的模板ID
  title: text("title"), // 周报标题
  content: text("content").notNull(), // 生成的周报正文
  rawInput: text("rawInput"), // 用户原始输入
  qualityScore: integer("qualityScore"), // 质检得分 0-100
  qualityIssues: text("qualityIssues"), // JSON: 质检问题列表
  status: text("status").notNull().default("draft"), // draft / finalized
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

/**
 * 用户使用量记录 — Freemium核心
 * 按月统计每个用户的生成次数
 */
export const usageLog = pgTable("usage_log", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // "generate_weekly"
  yearMonth: text("yearMonth").notNull(), // "2026-07" 用于按月统计
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

/**
 * 用户风格档案 — 护城河数据层
 * 存储从用户历史周报中提取的写作风格
 */
export const userStyleProfile = pgTable("user_style_profile", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  tone: text("tone"), // 语气风格
  styleData: text("styleData"), // JSON: 完整风格数据
  reportCount: integer("reportCount").notNull().default(0), // 已学习的周报数量
  lastAnalyzedAt: timestamp("lastAnalyzedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
