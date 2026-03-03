from dataclasses import dataclass


@dataclass(frozen=True)
class AuthUser:
    user_id: str
    email: str
    roles: tuple[str, ...]


# Mocked auth context. Replace with JWT/session implementation later.
def get_current_user() -> AuthUser:
    return AuthUser(user_id="dev.user", email="dev.user@example.com", roles=("admin",))
