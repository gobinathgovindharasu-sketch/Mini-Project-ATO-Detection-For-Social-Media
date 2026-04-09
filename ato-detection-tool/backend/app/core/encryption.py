"""
Fernet symmetric encryption for social-media account passwords.
Passwords are NEVER stored in plain text.
"""

from cryptography.fernet import Fernet
from app.core.config import get_settings

settings = get_settings()


def _get_fernet() -> Fernet:
    return Fernet(settings.FERNET_KEY.encode())


def encrypt_password(plain_password: str) -> str:
    """Encrypt a plain-text password and return the cipher-text string."""
    return _get_fernet().encrypt(plain_password.encode()).decode()


def decrypt_password(encrypted_password: str) -> str:
    """Decrypt a cipher-text password back to plain text (admin only)."""
    return _get_fernet().decrypt(encrypted_password.encode()).decode()
