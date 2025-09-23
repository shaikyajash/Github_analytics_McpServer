import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.registerTool(
    "Organization-Team-Stats",
    {
        title: "Organization Team Statistics",
        description: "Fetch detailed statistics for a specific team in a GitHub organization, including repositories and pull request metrics.",
        inputSchema: {
            OrganizationName: z.enum(VALID_ORGS),
            teamId: z.number().describe("The unique ID of the team. Use Organization-Teams to fetch team IDs first."),
            from: z.string().describe("Start date for filtering pull requests (ISO format)."),
            to: z.string().describe("End date for filtering pull requests (ISO format).")
        }
    },
    async (params, extra) => {
        const { OrganizationName, teamId, from, to } = params;

        const baseUrl = process.env.BASE_URL ;
        const urlParams = new URLSearchParams({ from, to });

        const url = `${baseUrl}/org/${OrganizationName}/team/${teamId}/stats?${urlParams.toString()}`;

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
                    text: JSON.stringify(data, null, 2)
                }]
            };

        } catch (error) {
            console.error("Error fetching team stats:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching stats for team ${teamId} in ${OrganizationName}: ${error}`
                }]
            };
        }
    }
);

console.log("✅ TeamStats tool registered successfully.");
