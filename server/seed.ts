import { db } from "./db";
import { users, dashboardMetrics, chatMessages, dashboardWidgets } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Create sample user
    const [sampleUser] = await db.insert(users).values({
      email: "demo@oraclio.com",
      password: "demo123",
      companyName: "Oraclio Demo Corp",
      role: "Business Owner",
      tools: ["Bitrix24", "Excel", "Slack"],
      onboardingCompleted: true,
    }).returning();

    console.log("Created sample user:", sampleUser.id);

    // Create sample dashboard metrics
    const sampleMetrics = [
      {
        userId: sampleUser.id,
        metricType: "revenue",
        value: 125000,
        change: 12,
        period: "monthly",
        data: { target: 130000, currency: "USD" }
      },
      {
        userId: sampleUser.id,
        metricType: "expenses",
        value: 45000,
        change: -5,
        period: "monthly",
        data: { categories: ["operations", "marketing", "hr"] }
      },
      {
        userId: sampleUser.id,
        metricType: "sales",
        value: 234,
        change: 18,
        period: "monthly",
        data: { leads: 456, conversion: 51.3 }
      },
      {
        userId: sampleUser.id,
        metricType: "hr",
        value: 87,
        change: 3,
        period: "monthly",
        data: { satisfaction: 87, employees: 45 }
      }
    ];

    await db.insert(dashboardMetrics).values(sampleMetrics);
    console.log("Created sample metrics");

    // Create sample chat messages
    const sampleMessages = [
      {
        userId: sampleUser.id,
        message: "What's our revenue trend this quarter?",
        response: "Your revenue has grown 12% this month to $125,000. The quarterly trend shows consistent growth with Q1 up 8% from last quarter."
      },
      {
        userId: sampleUser.id,
        message: "How is our team performance?",
        response: "Team satisfaction is at 87%, up 3% from last month. Your 45-person team shows strong engagement levels across all departments."
      }
    ];

    await db.insert(chatMessages).values(sampleMessages);
    console.log("Created sample chat messages");

    // Create sample dashboard widgets
    const sampleWidgets = [
      {
        userId: sampleUser.id,
        widgetType: "financial",
        title: "Financial Metrics",
        isEnabled: true,
        position: 0,
        config: { showChart: true, period: "monthly" }
      },
      {
        userId: sampleUser.id,
        widgetType: "team_performance",
        title: "Team Performance",
        isEnabled: true,
        position: 1,
        config: { departments: ["sales", "support", "dev"] }
      }
    ];

    await db.insert(dashboardWidgets).values(sampleWidgets);
    console.log("Created sample widgets");

    console.log("Database seeded successfully!");
    return sampleUser;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}