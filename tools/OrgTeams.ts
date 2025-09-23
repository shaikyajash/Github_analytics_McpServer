import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.registerTool(
    "Organization-Teams",
    {
        title: "Organization Teams",
        description: "Fetch a paginated list of teams in a GitHub organization with optional filtering and sorting.",
        inputSchema: {
            OrganizationName: z.enum(VALID_ORGS),
            from: z.string(),
            to: z.string(),
            page: z.number().optional(),
            limit: z.number().optional(),
            search: z.string().optional(),
            sortBy: z.enum([
                "name",
                "team_lead",
                "total_repos",
                "total_contributors",
                "pull_requests_total",
                "pull_requests_open",
                "pull_requests_closed",
                "pull_requests_merged"
            ]).optional(),
            sortOrder: z.enum(["asc", "desc"]).optional()
        }
    },
    async (params, extra) => {
        const { OrganizationName, from, to, page, limit, search, sortBy, sortOrder } = params;

        const baseUrl = process.env.BASE_URL ;
        const urlParams = new URLSearchParams({ from, to });

        if (page) urlParams.append("page", page.toString());
        if (limit) urlParams.append("limit", limit.toString());
        if (search) urlParams.append("search", search);
        if (sortBy) urlParams.append("sort_by", sortBy);
        if (sortOrder) urlParams.append("sort_order", sortOrder);

        const url = `${baseUrl}/org/${OrganizationName}/teams?${urlParams.toString()}`;

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
                    text: JSON.stringify(data, null, 2) // LLM can parse this
                }]
            };

        } catch (error) {
            console.error("Error fetching teams:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching teams for ${OrganizationName}: ${error}`
                }]
            };
        }
    }
);

console.log("✅ OrgTeams tool registered successfully.");
