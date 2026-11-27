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

## 4) 로그인 코드 실발송에 필요한 환경변수

| Key | Value |
| --- | --- |
| `GMAIL_REFRESH_TOKEN` | 동의로 받은 refresh token |
| `GMAIL_SENDER` | 동의한 발송 Google 계정 |
| `AUTH_SECRET` | OTP 서명용 임의 문자열 (길수록 좋음) |

`AUTH_SECRET`이 없으면 `GOOGLE_CLIENT_SECRET`을 대신 사용합니다.

로그인 코드 API:
- `POST /api/auth/request-code` — Gmail로 6자리 발송
- `POST /api/auth/verify-code` — 코드 검증 후 로그인
- `POST /api/auth/setup-password` — 최초 비밀번호 설정 시 코드 검증 + Redis 저장

비밀번호 로그인·저장소(Upstash Redis) 연결은 [VERCEL_AUTH_STORE.md](./VERCEL_AUTH_STORE.md) 참고.

## (선택) 로컬 스크립트

로컬에서 할 때만:

- 리디렉션 URI: `http://localhost:3333/oauth2callback`
- `npm run gmail:token`
