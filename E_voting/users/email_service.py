import os
import json
import urllib.request
from django.conf import settings
from django.core.mail import send_mail
import threading


def send_otp_via_resend(recipient, otp, subject):
    api_key = (os.environ.get('RESEND_API_KEY') or getattr(settings, 'RESEND_API_KEY', '')).strip()
    if not api_key:
        return False

    from_email = os.environ.get('RESEND_FROM_EMAIL', 'TrueVote <onboarding@resend.dev>')
    payload = json.dumps({
        'from': from_email,
        'to': [recipient],
        'subject': subject,
        'html': f'''
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 12px;">TrueVote Verification</div>
            <p style="font-size: 15px; color: #334155; line-height: 1.5;">Your one-time verification code is:</p>
            <div style="margin: 20px 0; padding: 16px; background: #eff6ff; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8;">
                {otp}
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP code expires in 2 minutes. If you did not request this, please ignore this email.</p>
        </div>
        '''
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'TrueVote/1.0',
        }
    )
    with urllib.request.urlopen(req, timeout=8) as resp:
        return resp.status in (200, 201)


def send_otp_via_brevo(recipient, otp, subject):
    api_key = (os.environ.get('BREVO_API_KEY') or getattr(settings, 'BREVO_API_KEY', '')).strip()
    if not api_key:
        return False

    sender_email = (
        os.environ.get('BREVO_FROM_EMAIL')
        or getattr(settings, 'EMAIL_HOST_USER', '')
        or 'noreply@truevote.app'
    )
    payload = json.dumps({
        'sender': {'name': 'TrueVote', 'email': sender_email},
        'to': [{'email': recipient}],
        'subject': subject,
        'htmlContent': f'''
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 12px;">TrueVote Verification</div>
            <p style="font-size: 15px; color: #334155; line-height: 1.5;">Your one-time verification code is:</p>
            <div style="margin: 20px 0; padding: 16px; background: #eff6ff; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8;">
                {otp}
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP code expires in 2 minutes. If you did not request this, please ignore this email.</p>
        </div>
        '''
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.brevo.com/v3/smtp/email',
        data=payload,
        headers={
            'api-key': api_key,
            'Content-Type': 'application/json',
            'User-Agent': 'TrueVote/1.0',
        }
    )
    with urllib.request.urlopen(req, timeout=8) as resp:
        return resp.status in (200, 201)


def send_otp_via_smtp(recipient, otp, subject):
    if not (settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD):
        return False
    send_mail(
        subject,
        f'Your OTP is {otp}. It expires in 2 minutes.',
        settings.EMAIL_HOST_USER or 'noreply@truevote.app',
        [recipient],
        fail_silently=False
    )
    return True


def deliver_otp(recipient_email, otp, subject='TrueVote — Verification OTP'):
    """
    Attempts to deliver OTP email:
    1. Resend HTTPS API (works on Render free tier over port 443)
    2. Brevo HTTPS API (works on Render free tier over port 443)
    3. Django SMTP (works locally or unblocked hosts)
    """
    # 1. Resend API
    if os.environ.get('RESEND_API_KEY') or getattr(settings, 'RESEND_API_KEY', None):
        try:
            if send_otp_via_resend(recipient_email, otp, subject):
                print(f"[TrueVote] ✅ OTP delivered via Resend API to {recipient_email}")
                return True
        except Exception as e:
            print(f"[TrueVote] ⚠️ Resend API delivery failed: {e}")

    # 2. Brevo API
    if os.environ.get('BREVO_API_KEY') or getattr(settings, 'BREVO_API_KEY', None):
        try:
            if send_otp_via_brevo(recipient_email, otp, subject):
                print(f"[TrueVote] ✅ OTP delivered via Brevo API to {recipient_email}")
                return True
        except Exception as e:
            print(f"[TrueVote] ⚠️ Brevo API delivery failed: {e}")

    # 3. SMTP
    if settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD:
        try:
            if send_otp_via_smtp(recipient_email, otp, subject):
                print(f"[TrueVote] ✅ OTP delivered via SMTP to {recipient_email}")
                return True
        except Exception as e:
            print(f"[TrueVote] ⚠️ SMTP delivery failed to {recipient_email}: {e}")

    print(f"==================================================")
    print(f"  🔐 FALLBACK OTP FOR {recipient_email}: {otp}")
    print(f"==================================================")
    return False


def send_otp_email_async(recipient_email, otp, subject='TrueVote — Verification OTP'):
    threading.Thread(target=deliver_otp, args=(recipient_email, otp, subject), daemon=True).start()


def should_provide_dev_otp():
    """
    Determines whether the generated OTP should be included in the API response.
    Returns True by default on Render / demo deployments so voters are never locked out
    by cloud SMTP firewall restrictions.
    Can be explicitly disabled in production by setting ALLOW_DEV_OTP=False in Render env.
    """
    allow = os.environ.get('ALLOW_DEV_OTP', 'True').lower() in ('true', '1', 't')
    if allow:
        return True
    if settings.DEBUG:
        return True
    return False
