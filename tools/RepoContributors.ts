import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.registerTool(
    "Organization-Repo-Contributors",
    {
        title: "Organization Repository Contributors",
        description: "Fetch a paginated list of contributors for a specific repository in a GitHub organization, with optional filtering and sorting.",
        inputSchema: {
            OrganizationName: z.enum(VALID_ORGS),
            repoId: z.number().describe("When a user requests contributor details by repository name, first use the Organization-Repos tool to fetch all repositories in the organization, identify the matching repository by name, and then use its repoId here."),
            from: z.string(),
            to: z.string(),
            page: z.number().optional().describe("Page number for pagination (default is 1)"),
            limit: z.number().optional().describe("Number of results to return per page (default is 10)"),
            search: z.string().optional().describe("Search term to filter contributors by username"),
            sort_by: z.enum([
                "username",
                "contributor",
                "pull_requests_total",
                "pull_requests_open",
                "pull_requests_closed",
                "pull_requests_merged",
                "total_additions",
                "total_deletions",
                "total_changed_files"
            ]).optional(),
            sort_order: z.enum(["asc", "desc"]).optional()
        }
    },
    async (params, extra) => {
        const { OrganizationName, repoId, from, to, page, limit, search, sort_by, sort_order } = params;

        const baseUrl = process.env.BASE_URL ;
        const urlParams = new URLSearchParams({ from, to });

        if (page) urlParams.append("page", page.toString());
        if (limit) urlParams.append("limit", limit.toString());
        if (search) urlParams.append("search", search);
        if (sort_by) urlParams.append("sort_by", sort_by);
        if (sort_order) urlParams.append("sort_order", sort_order);

        const url = `${baseUrl}/org/${OrganizationName}/repo/${repoId}/contributors?${urlParams.toString()}`;

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
            console.error("Error fetching repository contributors:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching contributors for repo ${repoId} in ${OrganizationName}: ${error}`
                }]
            };
        }
    }
);

console.log("✅ RepoContributors tool registered successfully.");
