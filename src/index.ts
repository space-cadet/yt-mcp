import 'dotenv/config';
import { VideoManagement } from './functions/videos.js';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 환경 변수 검증
if (!process.env.YOUTUBE_API_KEY) {
  console.error('Error: YOUTUBE_API_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// 기본 자막 언어 설정
const defaultTranscriptLang = process.env.YOUTUBE_TRANSCRIPT_LANG || 'ko';

interface VideoDetailsParams {
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
    
    // MCP 서버 생성
    const server = new McpServer({
        name: "YouTube",
        version: "1.0.0"
    });

    // 비디오 상세 정보 조회 도구
    server.tool("getVideoDetails",
        { videoId: z.string() },
        async ({ videoId }: VideoDetailsParams) => {
            try {
                const videoDetails = await videoManager.getVideo({
                    videoId,
                    parts: ["snippet", "statistics", "contentDetails"]
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(videoDetails, null, 2) }]
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

    // 비디오 검색 도구
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

    // 비디오 자막 조회 도구
    server.tool("getTranscript",
        { videoId: z.string() },
        async ({ videoId }: VideoDetailsParams) => {
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

    // 관련 비디오 조회 도구
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

    // 채널 통계 조회 도구
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

    // 채널 인기 비디오 조회 도구
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

    // 비디오 참여율 계산 도구
    server.tool("getVideoEngagementRatio",
        { videoId: z.string() },
        async ({ videoId }: VideoDetailsParams) => {
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

    // 인기 동영상 조회 도구
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

    // 비디오 비교 도구
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

    // stdin/stdout를 통해 메시지 송수신 시작
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('YouTube MCP 서버가 시작되었습니다.');
}

main().catch((err) => {
    console.error('서버 실행 중 오류 발생:', err);
    process.exit(1);
}); 