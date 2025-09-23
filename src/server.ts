import express from "express";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import { server } from "./InitializeMcp.js";


import dotenv from "dotenv";
dotenv.config();








// import "../tools/CreateUser.js"; // Import the tool to register it with the server
// import "../tools/Calculator.js"; // Import the tool to register it with the server
import "../tools/DateTime.js"
import "../tools/OrgStats.js"; // Import the tool to register it with the server  



import "../tools/OrgRepos.js"
import "../tools/OrgContributors.js"
import "../tools/OrgTeams.js"
import "../tools/RepoStats.js"
import "../tools/RepoBranchInfo.js"
import "../tools/RepoPullRequests.js"
import "../tools/RepoContributors.js"
import "../tools/ContributorStatus.js"
import "../tools/ContributorPullRequests.js"
import "../tools/TeamStats.js"
import "../tools/TeamRepos.js"
import "../tools/TeamContributors.js"





async function main() {
  const app = express();
  app.use(cors()); //

  // app.use(express.json()); // parse JSON body

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });


  // All MCP requests go through this endpoint

  app.post("/mcp", (req, res) => {
    transport.handleRequest(req, res, req.body);
  });

  app.get("/", (req, res) => {
    res.send("Server is running");
  });




  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000/mcp");
  });


  await server.connect(transport);
}



main();


