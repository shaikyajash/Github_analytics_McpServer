import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.registerTool(
    "Organization-Contributor-Stats",
    {
        title: "Organization Contributor Stats",
        description: "Fetch detailed statistics for a specific contributor in a GitHub organization, including teams and pull request metrics.",
        inputSchema: {
            OrganizationName: z.enum(VALID_ORGS),
            contributorId: z.number().describe("The unique ID of the contributor. Use Organization-Contributors to fetch contributor IDs first."),
            from: z.string().describe("Start date for filtering pull requests (ISO format)."),
            to: z.string().describe("End date for filtering pull requests (ISO format).")
        }
    },
    async (params, extra) => {
        const { OrganizationName, contributorId, from, to } = params;

        const baseUrl = process.env.BASE_URL ;
        const urlParams = new URLSearchParams({ from, to });

        const url = `${baseUrl}/org/${OrganizationName}/contributor/${contributorId}/stats?${urlParams.toString()}`;

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
            console.error("Error fetching contributor stats:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching stats for contributor ${contributorId} in ${OrganizationName}: ${error}`
                }]
            };
        }
    }
);

console.log("✅ ContributorStats tool registered successfully.");
