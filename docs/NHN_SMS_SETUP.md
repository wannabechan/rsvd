# NHN Cloud SMS 설정 (연락처 인증)

프로필 **연락처 인증**은 [NHN Cloud Notification > SMS](https://docs.nhncloud.com/ko/Notification/SMS/ko/Overview/) v3.0 API로 6자리 코드를 보냅니다.

관리자 이메일로 NHN Cloud에 가입된 상태를 전제로 합니다.

## 1) NHN Cloud 콘솔

1. [NHN Cloud Console](https://console.nhncloud.com/) 로그인
2. 사용할 조직/프로젝트 선택
3. **Notification > SMS** 상품 활성화
4. **발신 번호** 등록·승인 (국내 발신번호 사전 등록 필요)
5. SMS 앱에서 아래 값 확인:
   - **AppKey**
   - **SecretKey** (`X-Secret-Key`)
   - 승인된 **발신 번호** (숫자만, 예: `0212345678` 또는 등록한 번호)

API 참고: [SMS API v3.0 가이드](https://docs.nhncloud.com/ko/Notification/SMS/ko/api-guide/)

## 2) Vercel 환경변수

| Key | Value |
| --- | --- |
| `NHN_SMS_APP_KEY` | SMS AppKey |
| `NHN_SMS_SECRET_KEY` | SMS SecretKey |
| `NHN_SMS_SEND_NO` | 등록된 발신 번호 (하이픈 없이) |

Production / Preview / Development에 모두 넣고 **재배포**합니다.

로컬:

```bash
vercel env pull .env.local
```

또는 `.env.local`에 위 세 키를 직접 추가합니다.

## 3) 동작

- `POST /api/profile/phone/request-code` — NHN으로 SMS 발송 + OTP 쿠키
- `POST /api/profile/phone/verify` — 코드 검증 후 Redis 프로필에 연락처 저장
- 본문 예: `애정하는 단골 예약 rsvd. 연락처 인증번호 123456`
- 세 키가 **모두** 있을 때만 실발송. 없으면 서버 로그 + 응답 `debugCode`(개발 폴백)

## 4) 점검

1. Vercel env 저장 후 재배포
2. 프로필 → 연락처 → **인증** → 번호 입력 → **코드 받기**
3. 휴대폰 문자 수신 후 6자리 입력 → **확인**
4. 실패 시 Vercel Function 로그에 `NHN SMS failed: …` 메시지 확인  
   (미등록 발신번호, SecretKey 오타, 잔액/한도 등이 흔한 원인)
