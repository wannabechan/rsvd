# Vercel 인증 저장소 (Upstash Redis)

웹에서 **비밀번호 설정/로그인**이 기기·브라우저와 무관하게 동작하려면  
Vercel 프로젝트에 **Upstash Redis**를 연결해야 합니다.

로그인 코드(OTP) 발송은 기존 Gmail 설정을 그대로 씁니다. → [GMAIL_API_SETUP.md](./GMAIL_API_SETUP.md)

## 1) Upstash for Redis 연결

1. Vercel 대시보드 → 프로젝트 `rsvd` → **Storage** (또는 Marketplace)
2. **Upstash for Redis** 생성 후 이 프로젝트에 **Link**
3. Production / Preview / Development 환경에 env 자동 주입 확인

연결되면 보통 아래 키가 생깁니다 (둘 중 한 쌍이면 충분):

| Key | 비고 |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash 직접 연결 시 |
| `UPSTASH_REDIS_REST_TOKEN` | |
| `KV_REST_API_URL` | Vercel Marketplace 주입 시 (호환) |
| `KV_REST_API_TOKEN` | |

로컬 개발:

```bash
vercel link --project rsvd --yes
vercel env pull .env.local
```

## 2) 이미 필요한 인증 관련 env (점검)

| Key | 용도 |
| --- | --- |
| `AUTH_SECRET` | OTP 쿠키 서명 |
| `GMAIL_REFRESH_TOKEN` / `GMAIL_SENDER` / `GOOGLE_CLIENT_*` | 로그인 코드 메일 |
| `NHN_SMS_APP_KEY` / `NHN_SMS_SECRET_KEY` / `NHN_SMS_SEND_NO` | 연락처 SMS 인증 ([NHN_SMS_SETUP.md](./NHN_SMS_SETUP.md)) |
| `NEXT_PUBLIC_APP_URL` | OAuth·앱 URL |
| `ADMIN_EMAIL` | 이 이메일로 로그인하면 `role: admin` (최고 등급) |
| Redis URL + Token | 비밀번호·프로필·매장/사용자 카탈로그 저장 |

카탈로그 시드(`rsvd:catalog:seeded:v2`): 매장 7곳 + sample 사용자 15명 + 랜덤 단골 연결. 최초 읽기 시 자동 기록.

## 3) API

| Method | Path | 역할 |
| --- | --- | --- |
| `POST` | `/api/auth/request-code` | 로그인 코드 발송 |
| `POST` | `/api/auth/verify-code` | 코드 로그인 |
| `POST` | `/api/auth/password-status` | 해당 이메일에 비밀번호 설정 여부 |
| `POST` | `/api/auth/setup-password` | OTP 검증 후 비밀번호 해시 저장 |
| `POST` | `/api/auth/login-password` | 서버에서 비밀번호 검증 후 로그인 |
| `GET` | `/api/profile?e=` | 닉네임·아바타 메타 |
| `POST` | `/api/profile` | 닉네임 저장 |
| `POST` | `/api/profile/phone/request-code` | 연락처 SMS 인증 코드 발송 |
| `POST` | `/api/profile/phone/verify` | 연락처 코드 검증·저장 |
| `GET` | `/api/profile/avatar?e=` | 저장된 WebP 아바타 |
| `POST` | `/api/profile/avatar` | WebP 아바타 업로드 (FormData) |

비밀번호는 Redis에 **scrypt 해시**로만 저장됩니다. 평문 저장 없음.  
닉네임·아바타(WebP)도 같은 Redis에 저장됩니다. 기본 닉네임은 이메일 `@` 앞 부분입니다.

브라우저 `localStorage`에는 **세션(현재 로그인 사용자)** 만 남습니다.  
비밀번호 설정 여부는 더 이상 로컬에 두지 않습니다.

## 4) CLI로 설치 시도

```bash
vercel link --project rsvd --yes
vercel integration add upstash
# → Upstash for Redis 선택 → 현재 프로젝트에 Link → Y
vercel env pull .env.local
```

프롬프트가 막히면 대시보드 Storage에서 같은 작업을 하면 됩니다.
