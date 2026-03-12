import smtplib
import random
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

sender_email = "nhkhi3m1602@gmail.com"
app_password = "jqjb whoh tvmd ouwh"

def build_payroll_email_body():
    return """Hi HR,
Attached is the payroll summary for March.
Please review as usual.
Best,
Finance Team
"""


def send_gmail_email(recipient_email: str, subject: str, body: str) -> str:
    if not sender_email or not app_password:
        return "Missing email credentials."

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = recipient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(sender_email, app_password)
    server.sendmail(sender_email, recipient_email, msg.as_string())
    server.quit()

    return "Email sent successfully."


def send_multiple_emails(recipient_email: str, count: int = 15):
    for i in range(count):
        subject = "Re: Monthly Payroll Update"
        body = build_payroll_email_body()
        result = send_gmail_email(recipient_email, subject, body)
        print(f"{i+1}/{count}: {result}")


if __name__ == "__main__":
    recipient = "nhatkhiem003@gmail.com"
    send_multiple_emails(recipient)
