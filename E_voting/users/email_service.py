import os
import json
import urllib.request
import urllib.error
import threading
from django.conf import settings
from django.core.mail import send_mail


def send_otp_via_resend(recipient, otp, subject):
    api_key = (os.environ.get('RESEND_API_KEY') or getattr(settings, 'RESEND_API_KEY', '')).strip()
    if not api_key:
        return False, "RESEND_API_KEY is not configured"

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
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP code expires in 2 minutes. Enter this code on the website to verify your account.</p>
        </div>
        ''',
        'text': f'Your TrueVote verification OTP is: {otp}. It expires in 2 minutes.'
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                return True, "Delivered via Resend"
            return False, f"Resend returned HTTP status {resp.status}"
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        try:
            err_json = json.loads(body)
            msg = err_json.get('message') or body
        except Exception:
            msg = body
        return False, f"Resend error ({e.code}): {msg}"
    except Exception as e:
        return False, f"Resend request failed: {str(e)}"


def send_otp_via_brevo(recipient, otp, subject):
    api_key = (os.environ.get('BREVO_API_KEY') or getattr(settings, 'BREVO_API_KEY', '')).strip()
    if not api_key:
        return False, "BREVO_API_KEY is not configured"

    sender_email = (
        os.environ.get('BREVO_FROM_EMAIL')
        or getattr(settings, 'EMAIL_HOST_USER', '')
        or 'nishant.pandey516532@gmail.com'
    )
    sender_name = os.environ.get('BREVO_FROM_NAME', 'TrueVote')
    payload = json.dumps({
        'sender': {'name': sender_name, 'email': sender_email},
        'to': [{'email': recipient}],
        'subject': subject,
        'htmlContent': f'''
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 12px;">TrueVote Verification</div>
            <p style="font-size: 15px; color: #334155; line-height: 1.5;">Your one-time verification code is:</p>
            <div style="margin: 20px 0; padding: 16px; background: #eff6ff; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8;">
                {otp}
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP code expires in 2 minutes. Enter this code on the website to verify your account.</p>
        </div>
        ''',
        'textContent': f'Your TrueVote verification OTP is: {otp}. It expires in 2 minutes.'
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.brevo.com/v3/smtp/email',
        data=payload,
        headers={
            'api-key': api_key,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                return True, "Delivered via Brevo"
            return False, f"Brevo returned HTTP status {resp.status}"
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        try:
            err_json = json.loads(body)
            msg = err_json.get('message') or body
        except Exception:
            msg = body
        return False, f"Brevo error ({e.code}): {msg}"
    except Exception as e:
        return False, f"Brevo request failed: {str(e)}"


def send_otp_via_smtp(recipient, otp, subject):
    if not (settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD):
        return False, "SMTP credentials are not configured"
    try:
        send_mail(
            subject,
            f'Your TrueVote verification OTP is: {otp}\n\nIt expires in 2 minutes. Please enter this code on the website to verify your account.',
            settings.EMAIL_HOST_USER or 'noreply@truevote.app',
            [recipient],
            fail_silently=False
        )
        return True, "Delivered via SMTP"
    except Exception as e:
        return False, f"SMTP error: {str(e)}"


def deliver_otp(recipient_email, otp, subject='TrueVote — Verification OTP'):
    """
    Attempts to deliver OTP email:
    1. Resend HTTPS API (works on Render free tier over port 443)
    2. Brevo HTTPS API (works on Render free tier over port 443)
    3. Django SMTP (works locally or on unblocked hosts)
    Returns (success: bool, status_message: str)
    """
    errors = []

    # 1. SMTP (Google Gmail - Direct delivery to Primary Inbox, times out in 3s if blocked)
    if settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD:
        success, msg = send_otp_via_smtp(recipient_email, otp, subject)
        if success:
            print(f"[TrueVote] ✅ OTP delivered via SMTP to {recipient_email}")
            return True, msg
        errors.append(msg)
        print(f"[TrueVote] ⚠️ SMTP delivery failed to {recipient_email}: {msg}")

    # 2. Brevo HTTPS API (Works on Render port 443)
    if os.environ.get('BREVO_API_KEY') or getattr(settings, 'BREVO_API_KEY', None):
        success, msg = send_otp_via_brevo(recipient_email, otp, subject)
        if success:
            print(f"[TrueVote] ✅ OTP delivered via Brevo API to {recipient_email}")
            return True, msg
        errors.append(msg)
        print(f"[TrueVote] ⚠️ Brevo delivery failed to {recipient_email}: {msg}")

    # 3. Resend HTTPS API (Works on Render port 443)
    if os.environ.get('RESEND_API_KEY') or getattr(settings, 'RESEND_API_KEY', None):
        success, msg = send_otp_via_resend(recipient_email, otp, subject)
        if success:
            print(f"[TrueVote] ✅ OTP delivered via Resend API to {recipient_email}")
            return True, msg
        errors.append(msg)
        print(f"[TrueVote] ⚠️ Resend delivery failed to {recipient_email}: {msg}")

    error_summary = "; ".join(errors) if errors else "No email delivery provider configured"
    print(f"[TrueVote] ❌ Failed to deliver OTP email to {recipient_email}: {error_summary}")
    return False, error_summary


def send_otp_email_async(recipient_email, otp, subject='TrueVote — Verification OTP'):
    threading.Thread(target=deliver_otp, args=(recipient_email, otp, subject), daemon=True).start()
