#!/usr/bin/env python3
"""
Simple test script using youtube-transcript-api to retrieve YouTube transcripts
"""

import json
import sys
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled, 
    NoTranscriptFound, 
    VideoUnavailable,
    TranslationLanguageNotAvailable
)

def test_transcript(video_id, languages=['en']):
    """Test transcript retrieval for a single video"""
    print(f"\n🧪 Testing video: {video_id}")
    print(f"📹 URL: https://www.youtube.com/watch?v={video_id}")
    
    try:
        # Try to get transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
        
        if transcript:
            print(f"✅ Success! Found transcript with {len(transcript)} segments")
            print(f"🔤 First few segments:")
            for i, segment in enumerate(transcript[:3]):
                print(f"   {i+1}. [{segment['start']:.1f}s] {segment['text'][:50]}...")
            return True
        else:
            print("❌ No transcript found")
            return False
            
    except TranscriptsDisabled:
        print("❌ Transcripts are disabled for this video")
        return False
    except NoTranscriptFound:
        print("❌ No transcript found in requested language(s)")
        # Try to list available transcripts
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            print("📋 Available transcripts:")
            for transcript in transcript_list:
                print(f"   - {transcript.language} ({transcript.language_code}) - Generated: {transcript.is_generated}")
        except Exception as e:
            print(f"   Could not list available transcripts: {e}")
        return False
    except VideoUnavailable:
        print("❌ Video is unavailable")
        return False
    except TranslationLanguageNotAvailable:
        print("❌ Translation to requested language not available")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Test multiple videos to check transcript availability"""
    
    print("🚀 Testing YouTube Transcript API")
    print("=" * 50)
    
    # Test videos
    test_videos = [
        ("fqirLhXLoXM", "Hopf algebra lecture"),
        ("yG2b4QIQ6Qg", "Harvard CMSA - Pavel Etingof"),
        ("dQw4w9WgXcQ", "Rick Roll (popular video)"),
        ("jNQXAC9IVRw", "Me at the zoo (first YouTube video)"),
        ("9bZkp7q19f0", "PSY - Gangnam Style"),
        ("ScMzIvxBSi4", "TED Talk - The power of vulnerability")
    ]
    
    successful_tests = 0
    total_tests = len(test_videos)
    
    for video_id, description in test_videos:
        print(f"\n📝 {description}")
        if test_transcript(video_id):
            successful_tests += 1
    
    print(f"\n📊 Results: {successful_tests}/{total_tests} videos had accessible transcripts")
    
    if successful_tests == 0:
        print("\n⚠️  No transcripts were accessible. This could indicate:")
        print("   - Regional restrictions")
        print("   - YouTube API changes")
        print("   - Network/proxy issues")
        print("   - All test videos have transcripts disabled")

if __name__ == "__main__":
    main()
