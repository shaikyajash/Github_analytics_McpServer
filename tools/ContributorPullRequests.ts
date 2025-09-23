import z from "zod";
import { server } from "../src/InitializeMcp.js";

const VALID_ORGS = ["hashiraio", "PossibleWorks"] as const;

server.registerTool(
    "Organization-Contributor-PullRequests",
    {
        title: "Organization Contributor Pull Requests",
        description: "Fetch a paginated list of pull requests created by a specific contributor in a GitHub organization with optional filtering and sorting.",
        inputSchema: {
            OrganizationName: z.enum(VALID_ORGS),
            contributorId: z.number().describe("The unique ID of the contributor. Use Organization-Contributors to fetch contributor IDs first."),
            from: z.string().describe("Start date for filtering pull requests (ISO format)."),
            to: z.string().describe("End date for filtering pull requests (ISO format)."),
            page: z.number().optional().describe("Page number for pagination (default is 1)."),
            limit: z.number().optional().describe("Number of items per page (default is 10)."),
            search: z.string().optional().describe("Search term to filter pull requests by title or repository name."),
            repo: z.string().optional().describe("Filter pull requests by repository name."),
            status: z.enum(["all", "open", "closed", "merged"]).optional(),
            sort_by: z.enum([
                "created_at",
                "closed_at",
                "title",
                "pull_request_number",
                "repo",
                "status",
                "source_branch",
                "target_branch",
                "total_additions",
                "total_deletions",
                "total_changed_files",
                "time_to_merge_in_hours"
            ]).optional(),
            sort_order: z.enum(["asc", "desc"]).optional()
        }
    },
    async (params, extra) => {
        const { OrganizationName, contributorId, from, to, page, limit, search, repo, status, sort_by, sort_order } = params;

        const baseUrl = process.env.BASE_URL;
        const urlParams = new URLSearchParams({ from, to });

        if (page) urlParams.append("page", page.toString());
        if (limit) urlParams.append("limit", limit.toString());
        if (search) urlParams.append("search", search);
        if (repo) urlParams.append("repo", repo);
        if (status) urlParams.append("status", status);
        if (sort_by) urlParams.append("sort_by", sort_by);
        if (sort_order) urlParams.append("sort_order", sort_order);

        const url = `${baseUrl}/org/${OrganizationName}/contributor/${contributorId}/pull_requests?${urlParams.toString()}`;
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
            console.error("Error fetching contributor pull requests:", error);
            return {
                content: [{
                    type: "text",
                    text: `An error occurred while fetching pull requests for contributor ${contributorId} in ${OrganizationName}: ${error}`
                }]
            };
        }
    }
);

console.log("✅ ContributorPullRequests tool registered successfully.");
