import { google, youtube_v3 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';

export interface PlaylistOptions {
  playlistId: string;
  parts?: string[];
}

export interface PlaylistVideosOptions {
  playlistId: string;
  maxResults?: number;
  parts?: string[];
}

export interface SearchPlaylistsOptions {
  query: string;
  maxResults?: number;
  channelId?: string;
}

export class PlaylistManagement {
  private youtube: youtube_v3.Youtube;
  private readonly MAX_RESULTS_PER_PAGE = 50;
  private readonly ABSOLUTE_MAX_RESULTS = 500;

  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
  }

  /**
   * Get details about a specific playlist
   * @param options PlaylistOptions containing playlistId and optional parts
   * @returns Playlist details including metadata
   */
  async getPlaylistDetails({ playlistId, parts = ['snippet', 'contentDetails'] }: PlaylistOptions) {
    try {
      const response = await this.youtube.playlists.list({
        part: parts,
        id: [playlistId]
      });

      if (!response.data.items?.length) {
        throw new Error('Playlist not found.');
      }

      return response.data.items[0];
    } catch (error: any) {
      throw new Error(`Failed to retrieve playlist details: ${error.message}`);
    }
  }

  /**
   * Get videos contained in a playlist
   * @param options PlaylistVideosOptions containing playlistId, maxResults and optional parts
   * @returns List of videos in the playlist with their details
   */
  async getPlaylistVideos({ playlistId, maxResults = 50, parts = ['snippet', 'contentDetails'] }: PlaylistVideosOptions) {
    try {
      const playlistItems: youtube_v3.Schema$PlaylistItem[] = [];
      let nextPageToken: string | undefined = undefined;
      const targetResults = Math.min(maxResults, this.ABSOLUTE_MAX_RESULTS);
      
      while (playlistItems.length < targetResults) {
        const response: GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse> = await this.youtube.playlistItems.list({
          part: parts,
          playlistId: playlistId,
          maxResults: Math.min(this.MAX_RESULTS_PER_PAGE, targetResults - playlistItems.length),
          pageToken: nextPageToken
        });

        if (!response.data.items?.length) {
          break;
        }

        playlistItems.push(...response.data.items);
        nextPageToken = response.data.nextPageToken || undefined;

        if (!nextPageToken) {
          break;
        }
      }

      // Extract video IDs to get additional video details
      const videoIds = playlistItems
        .map(item => item.contentDetails?.videoId)
        .filter((id): id is string => id !== undefined);

      if (videoIds.length > 0) {
        // Get detailed video information in batches
        const videoDetails: youtube_v3.Schema$Video[] = [];
        for (let i = 0; i < videoIds.length; i += this.MAX_RESULTS_PER_PAGE) {
          const batch = videoIds.slice(i, i + this.MAX_RESULTS_PER_PAGE);
          const videosResponse = await this.youtube.videos.list({
            part: ['snippet', 'statistics', 'contentDetails'],
            id: batch
          });

          if (videosResponse.data.items) {
            videoDetails.push(...videosResponse.data.items);
          }
        }

        // Create a map of video IDs to their details
        const videoDetailsMap = videoDetails.reduce((map, video) => {
          if (video.id) {
            map[video.id] = video;
          }
          return map;
        }, {} as Record<string, youtube_v3.Schema$Video>);

        // Combine playlist item info with video details
        return playlistItems.map(item => {
          const videoId = item.contentDetails?.videoId;
          const videoDetail = videoId ? videoDetailsMap[videoId] : undefined;

          return {
            playlistItemId: item.id,
            videoId: videoId,
            title: item.snippet?.title || videoDetail?.snippet?.title,
            description: item.snippet?.description || videoDetail?.snippet?.description,
            publishedAt: item.snippet?.publishedAt,
            channelId: item.snippet?.channelId || videoDetail?.snippet?.channelId,
            channelTitle: item.snippet?.channelTitle || videoDetail?.snippet?.channelTitle,
            position: item.snippet?.position,
            thumbnails: item.snippet?.thumbnails || videoDetail?.snippet?.thumbnails,
            viewCount: videoDetail?.statistics?.viewCount,
            likeCount: videoDetail?.statistics?.likeCount,
            duration: videoDetail?.contentDetails?.duration
          };
        });
      }

      return playlistItems.map(item => ({
        playlistItemId: item.id,
        videoId: item.contentDetails?.videoId,
        title: item.snippet?.title,
        description: item.snippet?.description,
        publishedAt: item.snippet?.publishedAt,
        channelId: item.snippet?.channelId,
        channelTitle: item.snippet?.channelTitle,
        position: item.snippet?.position,
        thumbnails: item.snippet?.thumbnails
      }));
    } catch (error: any) {
      throw new Error(`Failed to retrieve playlist videos: ${error.message}`);
    }
  }

  /**
   * Search for public playlists by keyword
   * @param options SearchPlaylistsOptions containing query, maxResults and optional channelId
   * @returns List of playlists matching the search criteria
   */
  async searchPublicPlaylists({ query, maxResults = 25, channelId }: SearchPlaylistsOptions) {
    try {
      const searchParams: youtube_v3.Params$Resource$Search$List = {
        part: ['snippet'],
        q: query,
        maxResults: maxResults,
        type: ['playlist']
      };

      if (channelId) {
        searchParams.channelId = channelId;
      }

      const response = await this.youtube.search.list(searchParams);

      if (!response.data.items?.length) {
        return [];
      }

      // Extract playlist IDs
      const playlistIds = response.data.items
        .map((item: any) => item.id?.playlistId)
        .filter((id: any): id is string => id !== undefined);

      if (playlistIds.length === 0) {
        return [];
      }

      // Get more detailed playlist information
      const detailedPlaylists: youtube_v3.Schema$Playlist[] = [];
      for (let i = 0; i < playlistIds.length; i += this.MAX_RESULTS_PER_PAGE) {
        const batch = playlistIds.slice(i, i + this.MAX_RESULTS_PER_PAGE);
        const playlistResponse = await this.youtube.playlists.list({
          part: ['snippet', 'contentDetails'],
          id: batch
        });

        if (playlistResponse.data.items) {
          detailedPlaylists.push(...playlistResponse.data.items);
        }
      }

      return detailedPlaylists.map((playlist: any) => ({
        id: playlist.id,
        title: playlist.snippet?.title,
        description: playlist.snippet?.description,
        channelId: playlist.snippet?.channelId,
        channelTitle: playlist.snippet?.channelTitle,
        publishedAt: playlist.snippet?.publishedAt,
        itemCount: playlist.contentDetails?.itemCount,
        thumbnails: playlist.snippet?.thumbnails
      }));
    } catch (error: any) {
      throw new Error(`Failed to search playlists: ${error.message}`);
    }
  }

  /**
   * Get public playlists for a specific channel
   * @param channelId The ID of the channel
   * @param maxResults Maximum number of results to return (default: 25)
   * @returns List of public playlists from the specified channel
   */
  async getChannelPlaylists(channelId: string, maxResults: number = 25) {
    try {
      const response = await this.youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        channelId: channelId,
        maxResults: maxResults
      });

      if (!response.data.items?.length) {
        return [];
      }

      return response.data.items.map((playlist: any) => ({
        id: playlist.id,
        title: playlist.snippet?.title,
        description: playlist.snippet?.description,
        publishedAt: playlist.snippet?.publishedAt,
        itemCount: playlist.contentDetails?.itemCount,
        thumbnails: playlist.snippet?.thumbnails
      }));
    } catch (error: any) {
      throw new Error(`Failed to retrieve channel playlists: ${error.message}`);
    }
  }
}
