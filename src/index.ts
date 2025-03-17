#!/usr/bin/env node

import 'dotenv/config';
import { VideoManagement } from './functions/videos.js';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Environment variable validation
if (!process.env.YOUTUBE_API_KEY) {
  console.error('Error: YOUTUBE_API_KEY environment variable is not set.');
  process.exit(1);
}

// Default caption language setting
const defaultTranscriptLang = process.env.YOUTUBE_TRANSCRIPT_LANG || 'en';

interface VideoDetailsParams {
    videoIds: string[];
}

interface SingleVideoParams {
    videoId: string;
}

interface SearchParams {
    query: string;
    maxResults?: number;
}

interface RelatedVideosParams {
    videoId: string;
    maxResults?: number;
}

interface ChannelParams {
    channelId: string;
    maxResults?: number;
}

interface TrendingParams {
    regionCode?: string;
    categoryId?: string;
    maxResults?: number;
}

interface CompareVideosParams {
    videoIds: string[];
}

async function main() {
    const videoManager = new VideoManagement();
    
    // Create MCP server
    const server = new McpServer({
        name: "YouTube",
        version: "1.0.0"
    });

    // Video details retrieval tool
    server.tool("getVideoDetails",
        { videoIds: z.array(z.string()) },
        async ({ videoIds }: VideoDetailsParams) => {
            try {
                const videoDetailsPromises = videoIds.map(videoId => 
                    videoManager.getVideo({
                        videoId,
                        parts: ["snippet", "statistics", "contentDetails"]
                    })
                );
                
                const videoDetailsList = await Promise.all(videoDetailsPromises);
                
                return {
                    content: [{ type: "text", text: JSON.stringify(videoDetailsList, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message,
                            details: error.response?.data
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Video search tool
    server.tool("searchVideos",
        { 
            query: z.string(),
            maxResults: z.number().optional()
        },
        async ({ query, maxResults }: SearchParams) => {
            try {
                const searchResults = await videoManager.searchVideos({
                    query,
                    maxResults
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(searchResults, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message,
                            details: error.response?.data
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Video transcript retrieval tool
    server.tool("getTranscript",
        { videoId: z.string() },
        async ({ videoId }: SingleVideoParams) => {
            try {
                const transcript = await videoManager.getTranscript(videoId);
                return {
                    content: [{ type: "text", text: JSON.stringify(transcript, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Related videos retrieval tool
    server.tool("getRelatedVideos",
        { 
            videoId: z.string(),
            maxResults: z.number().optional()
        },
        async ({ videoId, maxResults }: RelatedVideosParams) => {
            try {
                const relatedVideos = await videoManager.getRelatedVideos(videoId, maxResults);
                return {
                    content: [{ type: "text", text: JSON.stringify(relatedVideos, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message,
                            details: error.response?.data
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Channel statistics retrieval tool
    server.tool("getChannelStatistics",
        { channelId: z.string() },
        async ({ channelId }: ChannelParams) => {
            try {
                const statistics = await videoManager.getChannelStatistics(channelId);
                return {
                    content: [{ type: "text", text: JSON.stringify(statistics, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message,
                            details: error.response?.data
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Channel top videos retrieval tool
    server.tool("getChannelTopVideos",
        { 
            channelId: z.string(),
            maxResults: z.number().optional()
        },
        async ({ channelId, maxResults }: ChannelParams) => {
            try {
                const topVideos = await videoManager.getChannelTopVideos({ channelId, maxResults });
                return {
                    content: [{ type: "text", text: JSON.stringify(topVideos, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message,
                            details: error.response?.data
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Video engagement ratio calculation tool
    server.tool("getVideoEngagementRatio",
        { videoId: z.string() },
        async ({ videoId }: SingleVideoParams) => {
            try {
                const engagementRatio = await videoManager.getVideoEngagementRatio(videoId);
                return {
                    content: [{ type: "text", text: JSON.stringify(engagementRatio, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message,
                            details: error.response?.data
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Trending videos retrieval tool
    server.tool("getTrendingVideos",
        { 
            regionCode: z.string().optional(),
            categoryId: z.string().optional(),
            maxResults: z.number().optional()
        },
        async ({ regionCode, categoryId, maxResults }: TrendingParams) => {
            try {
                const trendingVideos = await videoManager.getTrendingVideos({ regionCode, categoryId, maxResults });
                return {
                    content: [{ type: "text", text: JSON.stringify(trendingVideos, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message,
                            details: error.response?.data
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Video comparison tool
    server.tool("compareVideos",
        { videoIds: z.array(z.string()) },
        async ({ videoIds }: CompareVideosParams) => {
            try {
                const comparison = await videoManager.compareVideos({ videoIds });
                return {
                    content: [{ type: "text", text: JSON.stringify(comparison, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify({
                            error: error.message,
                            details: error.response?.data
                        }, null, 2) 
                    }]
                };
            }
        }
    );

    // Start message exchange through stdin/stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('YouTube MCP server has started.');
}

main().catch((err) => {
    console.error('Error occurred during server execution:', err);
    process.exit(1);
}); 