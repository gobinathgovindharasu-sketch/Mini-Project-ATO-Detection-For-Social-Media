"""
Synthetic Dataset Generator — produces 1000 login records for training.
70% normal (label=0) and 30% takeover (label=1) sessions.
"""

import os
import random
import numpy as np
import pandas as pd
from faker import Faker

fake = Faker()
random.seed(42)
np.random.seed(42)

PLATFORMS = ["twitter", "instagram", "facebook", "linkedin", "tiktok"]
NORMAL_DEVICES = ["desktop", "mobile", "tablet"]
SUSPICIOUS_DEVICES = ["bot", "unknown", "gaming_console", "smart_tv"]
ALL_DEVICES = NORMAL_DEVICES + SUSPICIOUS_DEVICES

NUM_RECORDS = 1000
NORMAL_RATIO = 0.70

records = []

for i in range(NUM_RECORDS):
    is_takeover = random.random() > NORMAL_RATIO

    if not is_takeover:
        # Normal behavior
        login_hour = random.choice(range(7, 23))  # Daytime hours
        device_type = random.choice(NORMAL_DEVICES)
        latitude = round(random.uniform(25, 50), 4)   # Typical US/EU range
        longitude = round(random.uniform(-120, 30), 4)
        ip = fake.ipv4_public()
        location = fake.city() + ", " + fake.country_code()
    else:
        # Takeover behavior — anomalous patterns
        login_hour = random.choice([0, 1, 2, 3, 4, 23])  # Odd hours
        device_type = random.choice(SUSPICIOUS_DEVICES + ["mobile"])
        latitude = round(random.uniform(-80, 80), 4)    # Extreme locations
        longitude = round(random.uniform(-180, 180), 4)
        ip = fake.ipv4_public()
        location = fake.city() + ", " + fake.country_code()

    # Cyclic encoding of hour
    hour_sin = round(np.sin(2 * np.pi * login_hour / 24), 4)
    hour_cos = round(np.cos(2 * np.pi * login_hour / 24), 4)

    # Device encoding
    device_map = {
        "desktop": 0, "mobile": 1, "tablet": 2, "unknown": 3,
        "bot": 4, "smart_tv": 5, "gaming_console": 6,
    }
    device_encoded = device_map.get(device_type, 3)

    # IP hash
    parts = ip.split(".")
    ip_hash = round(
        sum(int(p) * (256 ** (3 - i)) for i, p in enumerate(parts)) / (256**4), 6
    )

    records.append({
        "login_hour": login_hour,
        "device_encoded": device_encoded,
        "latitude": latitude,
        "longitude": longitude,
        "ip_hash": ip_hash,
        "hour_sin": hour_sin,
        "hour_cos": hour_cos,
        "device_type": device_type,
        "ip": ip,
        "location": location,
        "platform": random.choice(PLATFORMS),
        "is_takeover": int(is_takeover),
    })

df = pd.DataFrame(records)
os.makedirs("data", exist_ok=True)
df.to_csv("data/synthetic_dataset.csv", index=False)

print(f"Generated {len(df)} records")
print(f"Normal: {len(df[df['is_takeover']==0])}, Takeover: {len(df[df['is_takeover']==1])}")
print(f"Saved to data/synthetic_dataset.csv")
