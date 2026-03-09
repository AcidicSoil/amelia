"""Tests for on-demand review endpoint."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from amelia.server.dependencies import get_orchestrator
from amelia.server.routes.workflows import configure_exception_handlers, router


class TestRequestReviewEndpoint:

    @pytest.fixture
    def mock_orchestrator(self) -> MagicMock:
        orch = MagicMock()
        orch.request_review = AsyncMock(return_value=None)
        return orch

    @pytest.fixture
    def client(self, mock_orchestrator: MagicMock) -> TestClient:
        app = FastAPI()
        app.include_router(router, prefix="/api")
        app.dependency_overrides[get_orchestrator] = lambda: mock_orchestrator
        configure_exception_handlers(app)
        return TestClient(app)

    def test_request_review_only(
        self, client: TestClient, mock_orchestrator: MagicMock
    ) -> None:
        response = client.post(
            "/api/workflows/550e8400-e29b-41d4-a716-446655440000/review",
            json={"mode": "review_only"},
        )
        assert response.status_code == 202
        mock_orchestrator.request_review.assert_called_once()

    def test_request_review_with_types(
        self, client: TestClient, mock_orchestrator: MagicMock
    ) -> None:
        response = client.post(
            "/api/workflows/550e8400-e29b-41d4-a716-446655440000/review",
            json={"mode": "review_only", "review_types": ["general", "security"]},
        )
        assert response.status_code == 202

    def test_request_review_fix(
        self, client: TestClient, mock_orchestrator: MagicMock
    ) -> None:
        response = client.post(
            "/api/workflows/550e8400-e29b-41d4-a716-446655440000/review",
            json={"mode": "review_fix"},
        )
        assert response.status_code == 202
