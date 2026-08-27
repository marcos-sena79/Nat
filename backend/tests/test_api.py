import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to Body Piercing Platform API"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "password": "password123",
            "phone": "+5511999999999"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"

def test_login():
    # First register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "name": "Login User",
            "password": "password123"
        }
    )
    
    # Then login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_products():
    response = client.get("/api/v1/catalog/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_services():
    response = client.get("/api/v1/scheduling/services")
    assert response.status_code == 200
    assert isinstance(response.json(), list)