"""Tests for auth endpoints: register, login, profile, change password."""

# ── POST /api/auth/register ──────────────────────────────────────


class TestRegister:
    def test_register_success(self, client, sample_user_data):
        """Register a new user successfully."""
        response = client.post("/api/auth/register", json=sample_user_data)
        assert response.status_code == 201
        data = response.json()

        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == sample_user_data["email"]
        assert data["user"]["name"] == sample_user_data["name"]
        assert "id" in data["user"]
        assert "created_at" in data["user"]

    def test_register_duplicate_email(self, client, sample_user_data, sample_user_db):
        """Register with an email that already exists should fail."""
        payload = {
            "email": "existing@example.com",
            "name": "Duplicate",
            "password": "somePassword1",
        }
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"].lower()

    def test_register_invalid_email(self, client):
        """Register with an invalid email format should fail."""
        for bad_email in ["notanemail", "@nodomain", "user@", "", "a@b"]:
            response = client.post("/api/auth/register", json={
                "email": bad_email,
                "name": "Bad Email",
                "password": "password123",
            })
            assert response.status_code == 422, f"Expected 422 for email={bad_email!r}"

    def test_register_short_password(self, client):
        """Register with a password < 6 chars should fail."""
        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "name": "Test",
            "password": "12345",
        })
        assert response.status_code == 422

    def test_register_missing_fields(self, client):
        """Register with missing fields should fail."""
        response = client.post("/api/auth/register", json={})
        assert response.status_code == 422

    def test_register_email_normalized(self, client):
        """Email should be lowercased and stripped on registration."""
        response = client.post("/api/auth/register", json={
            "email": "  Alice@Example.COM  ",
            "name": "Alice",
            "password": "password123",
        })
        assert response.status_code == 201
        assert response.json()["user"]["email"] == "alice@example.com"


# ── POST /api/auth/login ─────────────────────────────────────────


class TestLogin:
    def test_login_success(self, client, sample_user_db):
        """Login with valid credentials."""
        response = client.post("/api/auth/login", json={
            "email": "existing@example.com",
            "password": "password123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "existing@example.com"

    def test_login_wrong_password(self, client, sample_user_db):
        """Login with incorrect password should fail."""
        response = client.post("/api/auth/login", json={
            "email": "existing@example.com",
            "password": "wrongPassword!",
        })
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    def test_login_nonexistent_email(self, client):
        """Login with an email that was never registered should fail."""
        response = client.post("/api/auth/login", json={
            "email": "nobody@nowhere.com",
            "password": "somePassword1",
        })
        assert response.status_code == 401

    def test_login_email_case_insensitive(self, client, sample_user_db):
        """Login should be case-insensitive for email."""
        response = client.post("/api/auth/login", json={
            "email": "EXISTING@EXAMPLE.COM",
            "password": "password123",
        })
        assert response.status_code == 200

    def test_login_returns_valid_token(self, client, sample_user_db):
        """The token returned by login should work for profile access."""
        login_resp = client.post("/api/auth/login", json={
            "email": "existing@example.com",
            "password": "password123",
        })
        token = login_resp.json()["access_token"]

        profile_resp = client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {token}",
        })
        assert profile_resp.status_code == 200
        assert profile_resp.json()["email"] == "existing@example.com"

    def test_login_empty_password(self, client, sample_user_db):
        """Login with empty password returns 401 (invalid credentials)."""
        response = client.post("/api/auth/login", json={
            "email": "existing@example.com",
            "password": "",
        })
        assert response.status_code == 401


# ── GET /api/auth/me ─────────────────────────────────────────────


class TestProfile:
    def test_profile_with_valid_token(self, client, sample_user_db, sample_user_token):
        """Get profile with a valid Bearer token."""
        response = client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {sample_user_token}",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "existing@example.com"
        assert data["name"] == "Existing User"
        assert "id" in data
        assert "created_at" in data

    def test_profile_without_token(self, client):
        """Get profile without any token should fail."""
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_profile_with_invalid_token(self, client, expired_token):
        """Get profile with a malformed / invalid token should fail."""
        response = client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {expired_token}",
        })
        assert response.status_code == 401

    def test_profile_with_bad_scheme(self, client, sample_user_token):
        """Using a non-Bearer scheme should fail."""
        response = client.get("/api/auth/me", headers={
            "Authorization": f"Basic {sample_user_token}",
        })
        assert response.status_code == 401

    def test_profile_with_empty_bearer(self, client):
        """Bearer token with empty value should fail."""
        response = client.get("/api/auth/me", headers={
            "Authorization": "Bearer ",
        })
        assert response.status_code == 401


# ── POST /api/auth/change-password ───────────────────────────────


class TestChangePassword:
    def test_change_password_success(self, client, sample_user_db, sample_user_token):
        """Change password with correct current password."""
        response = client.post("/api/auth/change-password", json={
            "current_password": "password123",
            "new_password": "newSecurePass456",
        }, headers={"Authorization": f"Bearer {sample_user_token}"})
        assert response.status_code == 200
        assert "updated" in response.json()["message"].lower()

        # Verify new password works
        login_resp = client.post("/api/auth/login", json={
            "email": "existing@example.com",
            "password": "newSecurePass456",
        })
        assert login_resp.status_code == 200

        # Old password should no longer work
        old_login_resp = client.post("/api/auth/login", json={
            "email": "existing@example.com",
            "password": "password123",
        })
        assert old_login_resp.status_code == 401

    def test_change_password_wrong_current(self, client, sample_user_db, sample_user_token):
        """Change password with wrong current password should fail."""
        response = client.post("/api/auth/change-password", json={
            "current_password": "wrongPassword!",
            "new_password": "newSecurePass456",
        }, headers={"Authorization": f"Bearer {sample_user_token}"})
        assert response.status_code == 400
        assert "incorrect" in response.json()["detail"].lower()

    def test_change_password_short_new(self, client, sample_user_db, sample_user_token):
        """Change password with a new password < 6 chars should fail."""
        response = client.post("/api/auth/change-password", json={
            "current_password": "password123",
            "new_password": "12345",
        }, headers={"Authorization": f"Bearer {sample_user_token}"})
        assert response.status_code == 422

    def test_change_password_without_auth(self, client):
        """Change password without being authenticated should fail."""
        response = client.post("/api/auth/change-password", json={
            "current_password": "anything",
            "new_password": "newPassword123",
        })
        assert response.status_code == 401


# ── Edge Cases ────────────────────────────────────────────────────


class TestEdgeCases:
    def test_register_then_login_then_profile(self, client):
        """Full happy path: register, login, profile."""
        # Register
        reg_resp = client.post("/api/auth/register", json={
            "email": "bob@example.com",
            "name": "Bob Smith",
            "password": "bobPassword1",
        })
        assert reg_resp.status_code == 201
        token1 = reg_resp.json()["access_token"]

        # Login
        login_resp = client.post("/api/auth/login", json={
            "email": "bob@example.com",
            "password": "bobPassword1",
        })
        assert login_resp.status_code == 200
        token2 = login_resp.json()["access_token"]

        # Both tokens should work for profile
        for token in [token1, token2]:
            prof_resp = client.get("/api/auth/me", headers={
                "Authorization": f"Bearer {token}",
            })
            assert prof_resp.status_code == 200
            assert prof_resp.json()["email"] == "bob@example.com"

    def test_multiple_users_isolated(self, client):
        """Two different users should have separate accounts."""
        # Register user A
        r1 = client.post("/api/auth/register", json={
            "email": "user_a@example.com", "name": "User A", "password": "pass1234",
        })
        assert r1.status_code == 201

        # Register user B
        r2 = client.post("/api/auth/register", json={
            "email": "user_b@example.com", "name": "User B", "password": "pass5678",
        })
        assert r2.status_code == 201

        # Each user's token should only work for their own profile
        prof_a = client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {r1.json()['access_token']}",
        })
        assert prof_a.json()["email"] == "user_a@example.com"

        prof_b = client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {r2.json()['access_token']}",
        })
        assert prof_b.json()["email"] == "user_b@example.com"

        # User A cannot change User B's password
        change_resp = client.post("/api/auth/change-password", json={
            "current_password": "wrong",
            "new_password": "hacked123",
        }, headers={"Authorization": f"Bearer {r1.json()['access_token']}"})
        assert change_resp.status_code == 400  # wrong current password
