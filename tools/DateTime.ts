import z from "zod";
import { server } from "../src/InitializeMcp.js";

server.tool(
  "current-datetime",
  "Get the current date and time in UTC and IST",
  {},
  {
    title: "Current Date and Time",
    description: "Fetches the current datetime in both UTC and Asia/Kolkata timezone",
  },
  async () => {
    const now = new Date();

    const iso = now.toISOString();
    const human = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ utc: iso, local: human }, null, 2),
        },
      ],
    };
  }
);

console.log("🕒 Current DateTime tool loaded");
