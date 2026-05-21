import json

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app

CV_EJEMPLO = (
    "Analista de datos con experiencia en Python, SQL y Power BI. "
    "Automatización de reportes financieros. Construcción de dashboards para KPIs."
)
OFERTA_EJEMPLO = (
    "Buscamos analista de datos con Python, SQL, Power BI y Docker "
    "para automatización de procesos ETL y construcción de dashboards."
)


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_analizar_valido(client):
    response = await client.post(
        "/analizar",
        data={"cv_texto": CV_EJEMPLO, "oferta_texto": OFERTA_EJEMPLO},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["exito"] is True
    assert "encaje_global" in data
    assert "nivel" in data
    assert "aporta" in data
    assert "brechas" in data
    assert "recomendaciones" in data
    assert "desglose" in data


@pytest.mark.asyncio
async def test_analizar_oferta_corta_retorna_400(client):
    response = await client.post(
        "/analizar",
        data={"cv_texto": CV_EJEMPLO, "oferta_texto": "Corta"},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["exito"] is False


@pytest.mark.asyncio
async def test_analizar_sin_cv_retorna_400(client):
    response = await client.post(
        "/analizar",
        data={"oferta_texto": OFERTA_EJEMPLO},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["exito"] is False


@pytest.mark.asyncio
async def test_calibrar_retorna_200(client):
    response = await client.post(
        "/calibrar",
        data={
            "cv_texto": CV_EJEMPLO,
            "oferta_texto": OFERTA_EJEMPLO,
            "adiciones": json.dumps(["docker"]),
        },
    )
    assert response.status_code == 200
    data = response.json()
    for key in ("actual", "proyectado", "diferencia"):
        assert key in data, f"Falta clave '{key}' en respuesta de /calibrar"


@pytest.mark.asyncio
async def test_sugerir_cv_retorna_200(client):
    response = await client.post(
        "/sugerir-cv",
        data={"cv_texto": CV_EJEMPLO, "oferta_texto": OFERTA_EJEMPLO},
    )
    assert response.status_code == 200
    data = response.json()
    assert "sugerencias_modificacion" in data


@pytest.mark.asyncio
async def test_analizar_multiple_con_dos_ofertas(client):
    oferta2 = "Buscamos ingeniero de datos con Python, Spark y AWS."
    response = await client.post(
        "/analizar-multiple",
        data={
            "cv_texto": CV_EJEMPLO,
            "ofertas": json.dumps([OFERTA_EJEMPLO, oferta2]),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["exito"] is True
    assert isinstance(data["resultados"], list)
    assert len(data["resultados"]) == 2


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
