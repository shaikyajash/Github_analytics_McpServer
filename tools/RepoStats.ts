import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.registerTool(
    "Organization-Repo-Stats",
    {
        title: "Organization Repository Stats",
        description: "Fetch statistics for a specific repository in a GitHub organization, including teams, branches, and pull request metrics.",
        inputSchema: {
            OrganizationName: z.enum(VALID_ORGS),
            repoId: z.number().describe("When a user requests repository details by name, first use the Organization-Repos tool to fetch all repositories in the organization, identify the matching repository by name, and then use its repoId here "),

            from: z.string(),
            to: z.string()
        }
    },
    async (params, extra) => {
        const { OrganizationName, repoId, from, to } = params;

        const baseUrl = process.env.BASE_URL;
        const urlParams = new URLSearchParams({ from, to });

        const url = `${baseUrl}/org/${OrganizationName}/repo/${repoId}/stats?${urlParams.toString()}`;

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
                    text: JSON.stringify(data, null, 2) // LLM can parse this nicely
                }]
            };

        } catch (error) {
            console.error("Error fetching repository stats:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching stats for repo ${repoId} in ${OrganizationName}: ${error}`
                }]
            };
        }
    }
);

console.log("✅ RepoStats tool registered successfully.");
