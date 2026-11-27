# Gmail API 발송 설정 (RSVD)

로컬 없이 **배포된 웹(Vercel)** 에서 한 번만 동의받는 흐름입니다.

## 1) Cloud Console (`rsvd` 새 프로젝트)

1. Gmail API 사용 설정
2. OAuth 동의 화면: Workspace 발신이면 **내부**
3. OAuth 클라이언트(웹) 생성
4. 승인된 리디렉션 URI에 **배포 주소** 추가:
   - `https://<배포도메인>/api/auth/google/callback`  
   - 예: `https://rsvd.vercel.app/api/auth/google/callback`

## 2) Vercel 환경변수

| Key | Value |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | OAuth 클라이언트 시크릿 |
| `NEXT_PUBLIC_APP_URL` | `https://<배포도메인>` (끝 `/` 없이) |
| `ALLOW_GMAIL_OAUTH_SETUP` | `true` (토큰 받을 때만, 끝나면 삭제/false) |

저장 후 재배포.

## 3) 웹에서 refresh token 발급 (한 번)

1. 브라우저에서 열기:  
   `https://<배포도메인>/api/auth/google/start`
2. **메일 발송에 쓸 Google 계정**으로 로그인·동의
3. 결과 페이지에 나온 `GMAIL_REFRESH_TOKEN` 복사
4. Vercel에 추가:
   - `GMAIL_REFRESH_TOKEN=...`
   - `GMAIL_SENDER=동의한계정@reservemembers.com`
5. **`ALLOW_GMAIL_OAUTH_SETUP` 을 `false`로 바꾸거나 삭제** 후 재배포  
   (토큰 발급 URL을 열어두면 안 됨)

## 4) 이후

로그인 코드 발송 API가 refresh token으로 access token을 갱신해 Gmail API로 메일을 보냅니다.

## (선택) 로컬 스크립트

로컬에서 할 때만:

- 리디렉션 URI: `http://localhost:3333/oauth2callback`
- `npm run gmail:token`
