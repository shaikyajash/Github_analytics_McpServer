import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.registerTool(
    "Organization-Contributors",  // 1️⃣ tool name
    {                             // 2️⃣ config
        title: "Organization Contributors",
        description: "Fetch a paginated list of contributors in a GitHub organization with optional filtering and sorting.",
        inputSchema: {           // ZodRawShape
            OrganizationName: z.enum(VALID_ORGS),
            from: z.string(),
            to: z.string(),
            page: z.number().optional(),
            limit: z.number().optional(),
            search: z.string().optional(),
            sortBy: z.enum([
                "username",
                "team_name",
                "total_repos",
                "pull_requests_total",
                "pull_requests_open",
                "pull_requests_closed",
                "pull_requests_merged"
            ]).optional(),
            sortOrder: z.enum(["asc", "desc"]).optional()
        }
    },
    async (params, extra) => {   // 3️⃣ callback
        const { OrganizationName, from, to, page, limit, search, sortBy, sortOrder } = params;

        const baseUrl = process.env.BASE_URL ;
        const urlParams = new URLSearchParams({ from, to });

        if (page) urlParams.append("page", page.toString());
        if (limit) urlParams.append("limit", limit.toString());
        if (search) urlParams.append("search", search);
        if (sortBy) urlParams.append("sort_by", sortBy);
        if (sortOrder) urlParams.append("sort_order", sortOrder);

        const url = `${baseUrl}/org/${OrganizationName}/contributors?${urlParams.toString()}`;

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
            console.error("Error fetching contributors:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching contributors for ${OrganizationName}: ${error}`
                }]
            };
        }
    }
);

console.log("✅ OrgContributors tool registered successfully.");
