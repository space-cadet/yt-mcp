import { google, youtube_v3 } from 'googleapis';
import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export interface VideoOptions {
  videoId: string;
  parts?: string[];
}

export interface SearchOptions {
  query: string;
  maxResults?: number;
}

export interface ChannelOptions {
  channelId: string;
  maxResults?: number;
}

export interface TrendingOptions {
  regionCode?: string;
  categoryId?: string;
  maxResults?: number;
}

export interface CompareVideosOptions {
  videoIds: string[];
}

export class VideoManagement {
  private youtube: youtube_v3.Youtube;
  private readonly MAX_RESULTS_PER_PAGE = 50;
  private readonly ABSOLUTE_MAX_RESULTS = 500;

  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
  }

  async getVideo({ videoId, parts = ['snippet'] }: VideoOptions) {
    try {
      const response = await this.youtube.videos.list({
        part: parts,
        id: [videoId]
      });

      if (!response.data.items?.length) {
        throw new Error('Video not found.');
      }

      return response.data.items[0];
    } catch (error: any) {
      throw new Error(`Failed to retrieve video information: ${error.message}`);
    }
  }

  async searchVideos({ query, maxResults = 10 }: SearchOptions) {
    try {
      const results: youtube_v3.Schema$SearchResult[] = [];
      let nextPageToken: string | undefined = undefined;
      const targetResults = Math.min(maxResults, this.ABSOLUTE_MAX_RESULTS);
      
      while (results.length < targetResults) {
        const response: youtube_v3.Schema$SearchListResponse = (await this.youtube.search.list({
          part: ['snippet'],
          q: query,
          maxResults: Math.min(this.MAX_RESULTS_PER_PAGE, targetResults - results.length),
          type: ['video'],
          pageToken: nextPageToken
        })).data;

        if (!response.items?.length) {
          break;
        }

        results.push(...response.items);
        nextPageToken = response.nextPageToken || undefined;

        if (!nextPageToken) {
          break;
        }
      }

      return results.slice(0, targetResults);
    } catch (error: any) {
      throw new Error(`Failed to search videos: ${error.message}`);
    }
  }

  async getTranscript(videoId: string, lang?: string) {
    // Validate video ID
    if (!videoId || typeof videoId !== 'string') {
      throw new Error('Invalid video ID provided');
    }

    // Set default language or use provided one
    const language = lang || process.env.YOUTUBE_TRANSCRIPT_LANG || 'en';
    
    return new Promise((resolve, reject) => {
      // Path to Python script - ES module compatible
      const currentFile = fileURLToPath(import.meta.url);
      const currentDir = dirname(currentFile);
      const scriptPath = path.join(currentDir, '../../scripts/fetch_transcript.py');
      
      // Use PYTHON_PATH environment variable if specified, otherwise fallback to python3
      const pythonExecutable = process.env.PYTHON_PATH || 'python3';
      
      // Spawn Python process
      const pythonProcess = spawn(pythonExecutable, [scriptPath, videoId, '--lang', language], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script failed with code ${code}`);
          console.error(`stderr: ${stderr}`);
          resolve([]); // Return empty array on error for better UX
          return;
        }
        
        try {
          const result = JSON.parse(stdout.trim());
          
          if (result.success) {
            resolve(result.transcript);
          } else {
            // Log the error but return empty array for better UX
            console.warn(`Transcript fetch warning for ${videoId}: ${result.error}`);
            resolve([]);
          }
        } catch (parseError) {
          console.error(`Failed to parse Python script output: ${parseError}`);
          console.error(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
          resolve([]);
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.error(`Failed to start Python process: ${error.message}`);
        resolve([]); // Return empty array on error
      });
    });
  }

  async getRelatedVideos(videoId: string, maxResults: number = 10) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        type: ['video'],
        maxResults,
        relatedToVideoId: videoId
      } as youtube_v3.Params$Resource$Search$List);

      return response.data.items || [];
    } catch (error: any) {
      throw new Error(`Failed to retrieve related videos: ${error.message}`);
    }
  }

  async getChannelStatistics(channelId: string) {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics'],
        id: [channelId]
      });

      if (!response.data.items?.length) {
        throw new Error('Channel not found.');
      }

      const channel = response.data.items[0];
      return {
        title: channel.snippet?.title,
        subscriberCount: channel.statistics?.subscriberCount,
        viewCount: channel.statistics?.viewCount,
        videoCount: channel.statistics?.videoCount
      };
    } catch (error: any) {
      throw new Error(`Failed to retrieve channel statistics: ${error.message}`);
    }
  }

  async getChannelTopVideos({ channelId, maxResults = 10 }: ChannelOptions) {
    try {
      const searchResults: youtube_v3.Schema$SearchResult[] = [];
      let nextPageToken: string | undefined = undefined;
      const targetResults = Math.min(maxResults, this.ABSOLUTE_MAX_RESULTS);

      while (searchResults.length < targetResults) {
        const searchResponse: youtube_v3.Schema$SearchListResponse = (await this.youtube.search.list({
          part: ['id'],
          channelId: channelId,
          maxResults: Math.min(this.MAX_RESULTS_PER_PAGE, targetResults - searchResults.length),
          order: 'viewCount',
          type: ['video'],
          pageToken: nextPageToken
        })).data;

        if (!searchResponse.items?.length) {
          break;
        }

        searchResults.push(...searchResponse.items);
        nextPageToken = searchResponse.nextPageToken || undefined;

        if (!nextPageToken) {
          break;
        }
      }

      if (!searchResults.length) {
        throw new Error('No videos found.');
      }

      const videoIds = searchResults
        .map(item => item.id?.videoId)
        .filter((id): id is string => id !== undefined);

      // Retrieve video details in batches of 50
      const videoDetails: youtube_v3.Schema$Video[] = [];
      for (let i = 0; i < videoIds.length; i += this.MAX_RESULTS_PER_PAGE) {
        const batch = videoIds.slice(i, i + this.MAX_RESULTS_PER_PAGE);
        const videosResponse = await this.youtube.videos.list({
          part: ['snippet', 'statistics'],
          id: batch
        });

        if (videosResponse.data.items) {
          videoDetails.push(...videosResponse.data.items);
        }
      }

      return videoDetails.slice(0, targetResults).map(video => ({
        id: video.id,
        title: video.snippet?.title,
        publishedAt: video.snippet?.publishedAt,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount,
        commentCount: video.statistics?.commentCount
      }));
    } catch (error: any) {
      throw new Error(`Failed to retrieve channel's top videos: ${error.message}`);
    }
  }

  async getVideoEngagementRatio(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['statistics'],
        id: [videoId]
      });

      if (!response.data.items?.length) {
        throw new Error('Video not found.');
      }

      const stats = response.data.items[0].statistics;
      const viewCount = parseInt(stats?.viewCount || '0');
      const likeCount = parseInt(stats?.likeCount || '0');
      const commentCount = parseInt(stats?.commentCount || '0');

      const engagementRatio = viewCount > 0
        ? ((likeCount + commentCount) / viewCount * 100).toFixed(2)
        : '0';

      return {
        viewCount,
        likeCount,
        commentCount,
        engagementRatio: `${engagementRatio}%`
      };
    } catch (error: any) {
      throw new Error(`Failed to calculate video engagement ratio: ${error.message}`);
    }
  }

  async getTrendingVideos({ regionCode = 'US', categoryId, maxResults = 10 }: TrendingOptions) {
    try {
      const params: youtube_v3.Params$Resource$Videos$List = {
        part: ['snippet', 'statistics'],
        chart: 'mostPopular',
        regionCode: regionCode,
        maxResults: maxResults
      };

      if (categoryId) {
        params.videoCategoryId = categoryId;
      }

      const response = await this.youtube.videos.list(params);

      return response.data.items?.map(video => ({
        id: video.id,
        title: video.snippet?.title,
        channelTitle: video.snippet?.channelTitle,
        publishedAt: video.snippet?.publishedAt,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount
      })) || [];
    } catch (error: any) {
      throw new Error(`Failed to retrieve trending videos: ${error.message}`);
    }
  }

  async compareVideos({ videoIds }: CompareVideosOptions) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: videoIds
      });

      if (!response.data.items?.length) {
        throw new Error('No videos found.');
      }

      return response.data.items.map(video => ({
        id: video.id,
        title: video.snippet?.title,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount,
        commentCount: video.statistics?.commentCount,
        publishedAt: video.snippet?.publishedAt
      }));
    } catch (error: any) {
      throw new Error(`Failed to compare videos: ${error.message}`);
    }
  }
} 