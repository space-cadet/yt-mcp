import { google, youtube_v3 } from 'googleapis';
import { getSubtitles } from 'youtube-captions-scraper';

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
        throw new Error('비디오를 찾을 수 없습니다.');
      }

      return response.data.items[0];
    } catch (error: any) {
      throw new Error(`비디오 정보 조회 실패: ${error.message}`);
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
      throw new Error(`비디오 검색 실패: ${error.message}`);
    }
  }

  async getTranscript(videoId: string) {
    try {
      const transcript = await getSubtitles({
        videoID: videoId,
        lang: 'ko'
      });
      return transcript;
    } catch (error: any) {
      throw new Error(`자막 조회 실패: ${error.message}`);
    }
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
      throw new Error(`관련 비디오 조회 실패: ${error.message}`);
    }
  }

  async getChannelStatistics(channelId: string) {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics'],
        id: [channelId]
      });

      if (!response.data.items?.length) {
        throw new Error('채널을 찾을 수 없습니다.');
      }

      const channel = response.data.items[0];
      return {
        title: channel.snippet?.title,
        subscriberCount: channel.statistics?.subscriberCount,
        viewCount: channel.statistics?.viewCount,
        videoCount: channel.statistics?.videoCount
      };
    } catch (error: any) {
      throw new Error(`채널 통계 조회 실패: ${error.message}`);
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
        throw new Error('비디오를 찾을 수 없습니다.');
      }

      const videoIds = searchResults
        .map(item => item.id?.videoId)
        .filter((id): id is string => id !== undefined);

      // 비디오 상세 정보를 50개씩 나누어 조회
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
      throw new Error(`채널 인기 비디오 조회 실패: ${error.message}`);
    }
  }

  async getVideoEngagementRatio(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['statistics'],
        id: [videoId]
      });

      if (!response.data.items?.length) {
        throw new Error('비디오를 찾을 수 없습니다.');
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
      throw new Error(`비디오 참여율 계산 실패: ${error.message}`);
    }
  }

  async getTrendingVideos({ regionCode = 'KR', categoryId, maxResults = 10 }: TrendingOptions) {
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
      throw new Error(`인기 동영상 조회 실패: ${error.message}`);
    }
  }

  async compareVideos({ videoIds }: CompareVideosOptions) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: videoIds
      });

      if (!response.data.items?.length) {
        throw new Error('비디오를 찾을 수 없습니다.');
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
      throw new Error(`비디오 비교 실패: ${error.message}`);
    }
  }
} 