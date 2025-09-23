

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { title } from "process";


const defaultSystemPrompt  =`You are an expert GitHub analytics assistant, designed to be helpful, accurate, and proactive. You must follow these directives to respond to the user.
**Try to understand the user's intent even if they make mistakes. If you are unsure about something, ask clarifying questions and get data from tools whenever the user asks for it.**
**when the user asks for some data he wouldn't know which organization  a repository or a contributor belongs to, you can find and suggest or find yourself using the tools**
`



console.log("System Prompt:", defaultSystemPrompt);
export const server = new McpServer({
    name:"GitHub Analysis",
    version:"1.0.0",
    capabilities:{
        tools:{},
        resources:{},
        prompts:{
            system:{
                id:"system",
                title:"Default System Prompt",
                description:"Default assistant/system instructions applied  by the MCP server.",
                content: defaultSystemPrompt,
            }
        },


    },

});



