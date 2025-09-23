import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.registerTool(
    "Organization-Team-Contributors",
    {
        title: "Organization Team Contributors",
        description: "Fetch a paginated list of contributors in a specific team in a GitHub organization, including pull request metrics, with optional filtering and sorting.",
        inputSchema: {
            OrganizationName: z.enum(VALID_ORGS),
            teamId: z.number().describe("The unique ID of the team. Use Organization-Teams to fetch team IDs first."),
            from: z.string().describe("Start date for filtering pull requests (ISO format)."),
            to: z.string().describe("End date for filtering pull requests (ISO format)."),
            page: z.number().optional().describe("Page number for pagination (default is 1)"),
            limit: z.number().optional().describe("Number of results per page (default is 10)"),
            search: z.string().optional().describe("Search term to filter contributors by username"),
            sort_by: z.enum([
                "username",
                "total_repos",
                "pull_requests_total",
                "pull_requests_open",
                "pull_requests_closed",
                "pull_requests_merged"
            ]).optional(),
            sort_order: z.enum(["asc", "desc"]).optional()
        }
    },
    async (params, extra) => {
        const { OrganizationName, teamId, from, to, page, limit, search, sort_by, sort_order } = params;

        const baseUrl = process.env.BASE_URL;
        const urlParams = new URLSearchParams({ from, to });

        if (page) urlParams.append("page", page.toString());
        if (limit) urlParams.append("limit", limit.toString());
        if (search) urlParams.append("search", search);
        if (sort_by) urlParams.append("sort_by", sort_by);
        if (sort_order) urlParams.append("sort_order", sort_order);

        const url = `${baseUrl}/org/${OrganizationName}/team/${teamId}/contributors?${urlParams.toString()}`;

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
            console.error("Error fetching team contributors:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching contributors for team ${teamId} in ${OrganizationName}: ${error}`
                }]
            };
        }
    }
);

console.log("✅ TeamContributors tool registered successfully.");
