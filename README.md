# YouTube MCP Server
[![smithery badge](https://smithery.ai/badge/@sonhyeonho/youtube)](https://smithery.ai/server/@sonhyeonho/youtube)

YouTube Data API를 활용한 Model Context Protocol (MCP) 서버 구현체입니다. AI 언어 모델이 표준화된 인터페이스를 통해 YouTube 콘텐츠와 상호작용할 수 있도록 합니다.

## 주요 기능

### 비디오 정보
* 비디오 상세 정보 조회 (제목, 설명, 길이 등)
* 채널 비디오 목록 조회
* 비디오 통계 조회 (조회수, 좋아요, 댓글)
* YouTube 전체 비디오 검색

### 자막 관리
* 비디오 자막 조회
* 다국어 지원
* 타임스탬프 자막 조회
* 자막 내 검색

### 채널 관리
* 채널 상세 정보 조회
* 채널 통계 조회 (구독자 수, 총 조회수, 비디오 수)
* 채널의 인기 동영상 조회 (최대 500개)
* 채널 내 콘텐츠 검색

### 트렌드 분석
* 국가별 인기 동영상 조회
* 카테고리별 인기 동영상 조회
* 비디오 참여율 분석
* 비디오 성과 비교 분석

## 설치 방법

### Smithery를 통한 자동 설치

[Smithery](https://smithery.ai/server/@sonhyeonho/youtube)를 통해 Claude Desktop용 YouTube MCP Server를 자동으로 설치:

```bash
npx -y @smithery/cli install @sonhyeonho/youtube --client claude
```

### 수동 설치
```bash
# 저장소 클론
git clone https://github.com/sonhyeonho/youtube-mcp-server.git
cd youtube-mcp-server

# 의존성 설치 및 빌드
npm install
```

## 환경 설정
다음 환경 변수를 설정하세요:
* `YOUTUBE_API_KEY`: YouTube Data API 키
* `YOUTUBE_TRANSCRIPT_LANG`: 기본 자막 언어 (선택사항, 기본값: 'ko')

## MCP 클라이언트 설정
Claude Desktop의 설정 파일에 다음 내용을 추가하세요:

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-youtube"],
      "env": {
        "YOUTUBE_API_KEY": "여기에_본인의_API_키를_입력하세요",
        "YOUTUBE_TRANSCRIPT_LANG": "en"
      }
    }
  }
}
```

## YouTube API 설정
1. Google Cloud Console 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. YouTube Data API v3 활성화
4. API 자격 증명 생성 (API 키)
5. 생성된 API 키를 환경 설정에 사용


## 개발

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 빌드
npm run build
```

## 보안 주의사항
- API 키는 항상 안전하게 보관하고 버전 관리 시스템에 커밋하지 마세요.
- 환경 변수나 설정 파일을 통해 API 키를 관리하세요.
- API 키의 사용 제한을 설정하여 무단 사용을 방지하세요.

## 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 LICENSE 파일을 참조하세요. 