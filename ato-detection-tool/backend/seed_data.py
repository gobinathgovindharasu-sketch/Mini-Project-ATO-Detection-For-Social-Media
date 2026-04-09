"""
Database seeder — creates demo users, accounts, and simulates sessions.
Run after tables are created and model is trained.
"""

import os
import sys
import random
import numpy as np
from datetime import datetime, timezone, timedelta

# Ensure the app modules are importable
sys.path.insert(0, os.path.dirname(__file__))

from faker import Faker
from app.core.database import engine, SessionLocal, Base
from app.core.security import hash_password
from app.core.encryption import encrypt_password
from app.models.user import User
from app.models.monitored_account import MonitoredAccount
from app.models.login_session import LoginSession
from app.models.alert import Alert
from app.services.ml_service import ml_service

fake = Faker()
random.seed(123)
np.random.seed(123)

PLATFORMS = ["twitter", "instagram", "facebook", "linkedin", "tiktok"]
NORMAL_DEVICES = ["desktop", "mobile", "tablet"]
SUSPICIOUS_DEVICES = ["bot", "unknown", "gaming_console"]

CITIES = [
    ("New York", 40.7128, -74.0060),
    ("London", 51.5074, -0.1278),
    ("Tokyo", 35.6762, 139.6503),
    ("Sydney", -33.8688, 151.2093),
    ("Mumbai", 19.0760, 72.8777),
    ("São Paulo", -23.5505, -46.6333),
    ("Berlin", 52.5200, 13.4050),
    ("Dubai", 25.2048, 55.2708),
    ("Singapore", 1.3521, 103.8198),
    ("Moscow", 55.7558, 37.6173),
    ("Lagos", 6.5244, 3.3792),
    ("Seoul", 37.5665, 126.9780),
    ("Mexico City", 19.4326, -99.1332),
    ("Cairo", 30.0444, 31.2357),
    ("Toronto", 43.6532, -79.3832),
    ("Reykjavik", 64.1466, -21.9426),
    ("Cape Town", -33.9249, 18.4241),
    ("Buenos Aires", -34.6037, -58.3816),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    # Create users
    admin = User(
        email="admin@ato-detect.io",
        hashed_password=hash_password("admin123"),
        role="admin",
    )
    demo_user = User(
        email="demo@ato-detect.io",
        hashed_password=hash_password("demo123"),
        role="user",
    )
    db.add_all([admin, demo_user])
    db.commit()
    db.refresh(admin)
    db.refresh(demo_user)
    print(f"Created users: admin (id={admin.id}), demo (id={demo_user.id})")

    # Create monitored accounts
    accounts = []
    for user in [admin, demo_user]:
        for _ in range(3):
            platform = random.choice(PLATFORMS)
            acct = MonitoredAccount(
                user_id=user.id,
                platform=platform,
                username=fake.user_name(),
                encrypted_password=encrypt_password(fake.password()),
            )
            db.add(acct)
            accounts.append(acct)
    db.commit()
    for a in accounts:
        db.refresh(a)
    print(f"Created {len(accounts)} monitored accounts")

    # Simulate login sessions
    session_count = 0
    alert_count = 0
    for account in accounts:
        num_sessions = random.randint(50, 100)
        for _ in range(num_sessions):
            is_suspicious = random.random() > 0.72
            city_name, lat, lon = random.choice(CITIES)

            if is_suspicious:
                login_hour = random.choice([0, 1, 2, 3, 4, 23])
                device = random.choice(SUSPICIOUS_DEVICES)
                # Offset location for impossible travel
                lat += random.uniform(-30, 30)
                lon += random.uniform(-50, 50)
            else:
                login_hour = random.randint(7, 22)
                device = random.choice(NORMAL_DEVICES)

            ip = fake.ipv4_public()
            location = f"{city_name}, {fake.country_code()}"

            risk_score, is_takeover, xai_reason = ml_service.predict(
                login_hour=login_hour,
                device_type=device,
                latitude=lat,
                longitude=lon,
                ip=ip,
            )

            ts = datetime.now(timezone.utc) - timedelta(
                hours=random.randint(0, 720)
            )

            session = LoginSession(
                monitored_account_id=account.id,
                ip=ip,
                location=location,
                latitude=round(lat, 4),
                longitude=round(lon, 4),
                login_hour=login_hour,
                device_type=device,
                risk_score=risk_score,
                is_takeover=is_takeover,
                xai_reason=xai_reason,
                timestamp=ts,
            )
            db.add(session)
            db.flush()
            session_count += 1

            # Create alert for high-risk
            if risk_score >= 0.8:
                alert = Alert(
                    login_session_id=session.id,
                    risk_score=risk_score,
                    message=f"HIGH RISK on {account.platform}/@{account.username}: {xai_reason}",
                    webhook_sent=False,
                )
                db.add(alert)
                alert_count += 1

    db.commit()
    print(f"Created {session_count} login sessions, {alert_count} alerts")
    db.close()


if __name__ == "__main__":
    seed()
