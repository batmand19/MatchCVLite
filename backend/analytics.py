import json
import os
from datetime import date
from typing import Optional

_ANALYTICS_PATH = os.path.join(os.path.dirname(__file__), "analytics.json")


def _load() -> dict:
    if not os.path.exists(_ANALYTICS_PATH):
        return {"total_analisis": 0, "por_dia": {}}
    try:
        with open(_ANALYTICS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict):
                return {"total_analisis": 0, "por_dia": {}}
            data.setdefault("total_analisis", 0)
            data.setdefault("por_dia", {})
            return data
    except (json.JSONDecodeError, OSError):
        return {"total_analisis": 0, "por_dia": {}}


def _save(data: dict):
    try:
        with open(_ANALYTICS_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except OSError:
        pass


def incrementar_analisis():
    data = _load()
    data["total_analisis"] = data.get("total_analisis", 0) + 1
    today = str(date.today())
    dia = data.setdefault("por_dia", {})
    dia[today] = dia.get(today, 0) + 1
    _save(data)


def obtener_estadisticas() -> dict:
    data = _load()
    today = str(date.today())
    return {
        "total_analisis": data.get("total_analisis", 0),
        "hoy": data.get("por_dia", {}).get(today, 0),
        "dias_activo": len(data.get("por_dia", {})),
    }
