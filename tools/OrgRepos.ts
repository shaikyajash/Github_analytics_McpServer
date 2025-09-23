import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.tool(
    "Organization-Repos",
    "Fetch and display a paginated list of repositories for a given GitHub organization between two dates, with optional filtering and sorting.",
    {
        OrganizationName: z.enum(VALID_ORGS),
        from: z.string().describe("The start date for filtering pull requests in ISO 8601 format (e.g., '2025-01-01T00:00:00+05:30')."),
        to: z.string().describe("The end date for filtering pull requests in ISO 8601 format (e.g., '2025-02-01T23:59:59+05:30')."),
        page: z.number().optional().describe("The page number for pagination. Defaults to 1."),
        limit: z.number().optional().describe("The number of items per page. Defaults to 10."),
        search: z.string().optional().describe("Search term to filter repositories by name."),
        sortBy: z.enum(['name', 'team', 'total_contributors', 'pull_requests_total', 'pull_requests_open', 'pull_requests_closed', 'pull_requests_merged']).optional().describe("The field to sort by."),
        sortOrder: z.enum(['asc', 'desc']).optional().describe("The sort direction.")
    },
    async (params) => {
        const { OrganizationName, from, to, page, limit, search, sortBy, sortOrder } = params;

        const baseUrl = process.env.BASE_URL ;
        const urlParams = new URLSearchParams();
        urlParams.append('from', from);
        urlParams.append('to', to);

        if (page) urlParams.append('page', page.toString());
        if (limit) urlParams.append('limit', limit.toString());
        if (search) urlParams.append('search', search);
        if (sortBy) urlParams.append('sort_by', sortBy);
        if (sortOrder) urlParams.append('sort_order', sortOrder);

        const url = `${baseUrl}/org/${OrganizationName}/repos?${urlParams.toString()}`;

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
                    text: JSON.stringify(data, null, 2), // LLM can parse this
                }]
            };

        } catch (error) {
            console.error("Error fetching organization repos:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching repositories for ${OrganizationName}: ${error}`,
                }]
            };
        }
    }
);

console.log("✅ OrgRepos tool loaded successfully.");