# Shared booking QR validation

One React screen and shared PHP validation logic serve both dashboards.
Hosts POST directly to /api/reserva-validacao.php with {codigo,contexto:"host"}.
Admin callers retain /api/admin/validar-reserva.php with {codigo}.
The shared file runs HTTP handling only when requested directly; including it
from the admin wrapper or login only loads its functions.

## Deploy

Back up the working admin PHP endpoint. Upload:
- server/api/reserva-validacao.php -> api/reserva-validacao.php
- server/api/reserva-jwt.php -> api/reserva-jwt.php
- server/api/admin/validar-reserva.php -> api/admin/validar-reserva.php

Keep the existing config.php, auth_admin.php, admin_access_tokens and
reserva_validacoes UNIQUE(categoria,reserva_id). No database migration is needed.
The same duplicate protection applies across host and admin validations.

Existing admin callers send {codigo}; host callers send {codigo,contexto:host}.
Admin context requires the existing server admin role check. Host context
accepts the existing HS256 login JWT (signature, expiry, user ID and email
verified server-side) or a valid token from the existing token store and limits all
queries to listings owned by its authenticated user_id. Request user IDs or
roles are never accepted. Unknown and other-host codes both return 404 without
details. Ownership is rechecked in the locking transaction before any write.

## Integrated login (auth_google.php)

The supplied authentication file is now integrated locally. Upload together:

- server/api/auth_google.php -> api/auth_google.php (the URL used by React)
- server/api/auth-secrets.local.php -> api/auth-secrets.local.php
- server/api/reserva-validacao.php -> api/reserva-validacao.php
- server/api/reserva-jwt.php -> api/reserva-jwt.php
- server/api/admin/validar-reserva.php -> api/admin/validar-reserva.php

Back up the existing server files first. The private auth-secrets.local.php was
populated from the supplied PHP, preserving its JWT signing key and SMTP
settings. It is ignored by Git; keep it private and upload only as PHP.
Database access reuses existing api/config.php ($conn or $pdo).
Keep existing mail/PHPMailer files and enable PHP cURL for Google verification.

Successful password login and both Google account branches now return
validation_token, issued with the verified database user ID using the same
admin_access_tokens table (8-hour expiry, SHA-256 hash only in the database).
The JWT remains unchanged for the rest of the application. Registration obtains
this credential through a password login after account creation; a submitted
registration user_id alone never issues a validation token.

Google login sends access_token from Google OAuth. The server retrieves the
verified profile directly from Google's HTTPS userinfo endpoint, checks its
HTTP status and verified email, and ignores client-supplied profile fields.
Deploy the updated React application together with auth_google.php; older
Google clients without access_token will be rejected.

Existing valid JWT sessions can now validate without a new login. Upload
reserva-jwt.php and the private auth-secrets.local.php with the SAME JWT key
used by the deployed login. The server verifies HS256, expiry, optional nbf/iat,
and matches the signed ID/email against usuarios before ownership queries.
Admin requests retain their existing admin role check and opaque-token flow.
If the separate 8-hour credential expires, the frontend retries AUTH_REQUIRED
once with the existing session JWT. Business failures are never retried.
A missing signing configuration returns HOST_AUTH_UNAVAILABLE; an invalid or
expired JWT returns AUTH_REQUIRED. No unsigned identity fallback is accepted.
Run `php tests/reservaJwt.test.php` in a PHP environment for the JWT checks.

## Ownership schema

alojamentos.proprietario_id via reservas_alojamento.alojamento_id;
carros.usuario_id via reservas_carro.carro_id;
experiencias.usuario_id via reservas_experiencia.experiencia_id.
Verify those column names against production before rollout.

## Rules retained

Confirmed status, payment=pago, no internal block, Cape Verde booking dates,
one validation per booking. Validation never marks payment or concludes a stay.

## Staging checks

For each category, test an owner and another host, nonexistent code, no token,
forged/expired token, host using admin context, valid admin, unpaid/cancelled/
future booking, repeat across both dashboards and concurrent validations.
Other-host attempts must never return booking details or create audit rows.
PHP/MySQL integration is not executable locally. Verify login, token issuance
and owner-only validation on the server after uploading the files above.
