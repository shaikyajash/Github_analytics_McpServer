import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.tool(
    "Organization-Statistics",
    "Fetch and display statistics for a given GitHub organization between two dates.",
    {
        OrganizationName: z.enum(VALID_ORGS),
        // UPDATED DESCRIPTION to match the required format
        from: z.string().describe("The start date in ISO 8601 format (e.g., '2025-01-01T00:00:00+05:30')"),
        // UPDATED DESCRIPTION to match the required format
        to: z.string().describe("The end date in ISO 8601 format (e.g., '2025-02-01T23:59:59+05:30')"),
    },
    async (params) => {
        const { OrganizationName, from, to } = params;

        // URL encode the parameters to handle special characters like '+'
        const encodedFrom = encodeURIComponent(from);
        const encodedTo = encodeURIComponent(to);

        const baseUrl = process.env.BASE_URL ;
        const url = `${baseUrl}/org/${OrganizationName}/stats?from=${encodedFrom}&to=${encodedTo}`;
        try {
            const response = await fetch(url);



            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(data, null, 2),
                }]
            };

        } catch (error) {
            console.error("Error fetching organization stats:", error);
            // Pass the error message as a string for better AI processing
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching stats for ${OrganizationName}: ${error}`,
                }]
            };
        }
    }
);

console.log("✅ OrgStats tool loaded successfully.");