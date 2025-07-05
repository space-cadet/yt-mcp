#!/usr/bin/env python3
"""
YouTube transcript fetcher script for yt-mcp
Called as subprocess from Node.js application
"""

import json
import sys
import argparse
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled, 
    NoTranscriptFound, 
    VideoUnavailable,
    TranslationLanguageNotAvailable
)

def get_transcript(video_id, languages=['en']):
    """Get transcript for a video and return as JSON"""
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
        
        # Transform to match expected format
        result = []
        for item in transcript:
            result.append({
                'text': item['text'],
                'start': item['start'],
                'duration': item['duration']
            })
        
        return {
            'success': True,
            'transcript': result
        }
        
    except TranscriptsDisabled:
        return {
            'success': False,
            'error': 'Transcripts are disabled for this video',
            'transcript': []
        }
    except NoTranscriptFound:
        return {
            'success': False,
            'error': f'No transcript found in language(s): {languages}',
            'transcript': []
        }
    except VideoUnavailable:
        return {
            'success': False,
            'error': 'Video is unavailable or private',
            'transcript': []
        }
    except TranslationLanguageNotAvailable:
        return {
            'success': False,
            'error': f'Translation to language(s) {languages} not available',
            'transcript': []
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error: {str(e)}',
            'transcript': []
        }

def main():
    parser = argparse.ArgumentParser(description='Fetch YouTube transcript')
    parser.add_argument('video_id', help='YouTube video ID')
    parser.add_argument('--lang', default='en', help='Language code (default: en)')
    
    args = parser.parse_args()
    
    # Parse language parameter - can be comma-separated for fallback languages
    languages = [lang.strip() for lang in args.lang.split(',')]
    
    result = get_transcript(args.video_id, languages)
    
    # Output JSON to stdout for Node.js to parse
    print(json.dumps(result))

if __name__ == '__main__':
    main()
