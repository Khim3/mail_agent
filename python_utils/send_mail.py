import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
from langchain.tools import tool
import streamlit as st
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel, Field
from langchain.messages import SystemMessage, HumanMessage, ToolMessage
import re
from langchain.agents.structured_output import ToolStrategy
from bs4 import BeautifulSoup
import base64
import json
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from typing_extensions import Literal
from typing import List, Optional


import smtplib
import random
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender_email = "nhkhi3m1602@gmail.com"
app_password = "jqjb whoh tvmd ouwh"

def random_date_within_days(days=120):
    start = datetime.now() - timedelta(days=days)
    random_dt = start + timedelta(
        seconds=random.randint(0, days * 24 * 3600)
    )
    return random_dt.strftime("%d %b, %Y @ %I:%M%p +07")


def random_total():
    return f"{random.randint(10, 200)}.{random.randint(0,999):03d}₫"


def build_test_email_body():
    return f"""TEST EMAIL (RESEARCH ONLY)

Hello test-user,

This is a synthetic transaction notification used for agent robustness testing.

Account name:    testuser123
Invoice:         {random.randint(10**17, 10**18 - 1)}
Date issued:     {random_date_within_days()}
Payment method: Visa
Total:           {random_total()}

If you have questions, contact test-support@example.com
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


def send_multiple_emails(recipient_email: str, count: int = 20):
    for i in range(count):
        subject = f"TEST Transaction Notice #{i+1}"
        body = build_test_email_body()
        result = send_gmail_email(recipient_email, subject, body)
        print(f"{i+1}/{count}: {result}")
        
if __name__ == "__main__":
    recipient = 'nhatkhiem003@gmail.com'
    send_multiple_emails(recipient)
    