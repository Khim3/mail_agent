import { ToolLoopAgent, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export async function GET() {
  const weatherAgent = new ToolLoopAgent({
    model: openai("gpt-4o-mini"),

    tools: {
      weather: tool({
        description: "Get the weather in a location (Fahrenheit)",
        inputSchema: z.object({
          location: z.string(),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72,
        }),
      }),

      convertFahrenheitToCelsius: tool({
        description: "Convert Fahrenheit to Celsius",
        inputSchema: z.object({
          temperature: z.number(),
        }),
        execute: async ({ temperature }) => {
          const celsius = Math.round((temperature - 32) * (5 / 9));
          return { celsius };
        },
      }),
    },
  });

  const result = await weatherAgent.generate({
    prompt: "What is the weather in San Francisco in celsius?",
  });

  return Response.json({
    answer: result.text,
    steps: result.steps,
  });
}
