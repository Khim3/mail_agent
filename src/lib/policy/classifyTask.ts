import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export enum TaskType {
  PAYROLL = "PAYROLL",
  INVOICE = "INVOICE",
  LEAVE = "LEAVE",
  GENERAL = "GENERAL",
}

export async function classifyTaskType(
  content: string
): Promise<TaskType> {

  const result = await generateObject({
    model: openai("gpt-4.1-mini"), // better enum enforcement
    output: "enum",
    enum: Object.values(TaskType),
    prompt: `
You are a classifier.

Classify the following email content into ONE of:

- PAYROLL
- INVOICE
- LEAVE
- GENERAL

Email:
${content}

Return only the label.
`,
  });
  console.log((result.object as string).toLowerCase());
  return result.object as TaskType;
}