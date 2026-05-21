import pytest
from backend.analyzer import (
    filtrar_oferta,
    normalizar_terminos,
    herramientas_en_oferta,
    h_display,
    analyze_cv,
)

CV_EJEMPLO = (
    "Analista de datos con experiencia en Python, SQL y Power BI. "
    "Automatización de reportes financieros. Construcción de dashboards para KPIs."
)
OFERTA_EJEMPLO = (
    "Buscamos analista de datos con Python, SQL, Power BI y Docker "
    "para automatización de procesos ETL y construcción de dashboards."
)


class TestFiltrarOferta:
    def test_removes_saludos_signoff(self):
        texto = "Buscamos analista con SQL. Saludos, Equipo de selección."
        assert filtrar_oferta(texto) == "Buscamos analista con SQL."

    def test_removes_atentamente_signoff(self):
        texto = "Ofrecemos estabilidad laboral. Atentamente, RH."
        assert filtrar_oferta(texto) == "Ofrecemos estabilidad laboral."

    def test_removes_bloques_irrelevantes(self):
        texto = (
            "Requisitos:\n- Python\n- SQL\n\n"
            "Acerca del empleo: ofrecemos...\n"
            "Nuestro equipo de talento humano te contactará pronto.\n"
            "Confidencial."
        )
        result = filtrar_oferta(texto)
        assert "Acerca del empleo" not in result
        assert "Nuestro equipo de talento humano" not in result
        assert "Confidencial" not in result
        assert "Requisitos:" in result
        assert "Python" in result

    def test_retorna_vacio_si_entrada_vacia(self):
        assert filtrar_oferta("") == ""
        assert filtrar_oferta(None) is None

    def test_texto_sin_boilerplate_se_mantiene(self):
        texto = "Buscamos analista con Python y SQL para análisis de datos."
        assert filtrar_oferta(texto) == texto


class TestNormalizarTerminos:
    def test_power_bi_to_powerbi(self):
        assert normalizar_terminos("Power BI") == "powerbi"

    def test_sql_unifies(self):
        for variante in ["SQL", "sql", "bases de datos", "consultas sql"]:
            result = normalizar_terminos(f"{variante} experiencia")
            assert "sql" in result

    def test_excel_unifies(self):
        assert normalizar_terminos("hojas de cálculo") == "excel"
        assert normalizar_terminos("hoja de calculo") == "excel"

    def test_dashboard_unifies(self):
        for variante in ["dashboard", "panel de control", "tablero"]:
            assert "dashboard" in normalizar_terminos(variante)

    def test_kpi_unifies(self):
        assert "kpi" in normalizar_terminos("indicadores")
        assert "kpi" in normalizar_terminos("metricas")

    def test_analisis_datos_unifies(self):
        result = normalizar_terminos("data analysis")
        assert "analisis_datos" in result or "analisis" in result

    def test_mantiene_texto_que_no_coincide(self):
        texto = "esto no tiene sinonimos que reemplazar"
        assert normalizar_terminos(texto) == texto

    def test_elimina_tildes(self):
        assert normalizar_terminos("análisis") == "analisis"
        assert normalizar_terminos("programación") == "programacion"


class TestHerramientasEnOferta:
    def test_detecta_herramientas_presentes(self):
        texto = normalizar_terminos("Python, SQL y Power BI")
        texto_clean = __import__("backend.analyzer", fromlist=["_normalizar"])._normalizar(texto)
        herramientas = herramientas_en_oferta(texto_clean)
        assert "python" in herramientas
        assert "sql" in herramientas
        assert "powerbi" in herramientas

    def test_no_incluye_herramientas_ausentes(self):
        texto = "ventas en finanzas"
        herramientas = herramientas_en_oferta(texto)
        assert herramientas == []

    def test_agrega_sas_si_aparece(self):
        texto = "experiencia en sas y python"
        herramientas = herramientas_en_oferta(texto)
        assert "sas" in herramientas

    def test_no_agrega_sas_si_no_aparece(self):
        texto = "experiencia en python y sql"
        herramientas = herramientas_en_oferta(texto)
        assert "sas" not in herramientas


class TestHDisplay:
    def test_known_mapping_powerbi(self):
        assert h_display("powerbi") == "Power BI"

    def test_known_mapping_dashboard(self):
        assert h_display("dashboard") == "Dashboard"

    def test_known_mapping_kpi(self):
        assert h_display("kpi") == "KPI / Indicadores"

    def test_short_token_uppercase(self):
        assert h_display("sql") == "SQL"
        assert h_display("r") == "R"

    def test_long_token_title(self):
        assert h_display("docker") == "Docker"
        assert h_display("python") == "Python"


class TestAnalyzeCV:
    def test_retorna_todas_las_claves_esperadas(self):
        result = analyze_cv(CV_EJEMPLO, OFERTA_EJEMPLO)
        expected_keys = {
            "encaje_global",
            "nivel",
            "aporta",
            "brechas",
            "recomendaciones",
            "frase_final",
            "contexto_ats",
            "palabras_clave_oferta",
            "desglose",
        }
        assert expected_keys.issubset(result.keys())

    def test_cv_corto_retorna_texto_insuficiente(self):
        result = analyze_cv("CV corto", OFERTA_EJEMPLO)
        assert result["nivel"] == "Texto insuficiente"
        assert result["encaje_global"] == 0.0

    def test_oferta_corta_retorna_texto_insuficiente(self):
        result = analyze_cv(CV_EJEMPLO, "Oferta corta")
        assert result["nivel"] == "Texto insuficiente"

    def test_ambos_cortos_retorna_texto_insuficiente(self):
        result = analyze_cv("Corto", "Corto")
        assert result["nivel"] == "Texto insuficiente"

    def test_empty_cv_retorna_texto_insuficiente(self):
        result = analyze_cv("", OFERTA_EJEMPLO)
        assert result["nivel"] == "Texto insuficiente"

    def test_empty_oferta_retorna_texto_insuficiente(self):
        result = analyze_cv(CV_EJEMPLO, "")
        assert result["nivel"] == "Texto insuficiente"

    def test_analisis_con_ejemplos(self):
        result = analyze_cv(CV_EJEMPLO, OFERTA_EJEMPLO)
        assert isinstance(result["encaje_global"], float)
        assert 0.0 <= result["encaje_global"] <= 100.0
        assert isinstance(result["aporta"], list)
        assert isinstance(result["brechas"], list)
        assert isinstance(result["recomendaciones"], list)
        assert isinstance(result["contexto_ats"], list)
        assert isinstance(result["palabras_clave_oferta"], list)
        assert isinstance(result["desglose"], dict)

    def test_desglose_tiene_claves_correctas(self):
        result = analyze_cv(CV_EJEMPLO, OFERTA_EJEMPLO)
        desglose = result["desglose"]
        for key in ("herramientas", "funcional", "perfil", "claridad"):
            assert key in desglose
            assert isinstance(desglose[key], (int, float))

    def test_encaje_no_es_negativo(self):
        result = analyze_cv(CV_EJEMPLO, OFERTA_EJEMPLO)
        assert result["encaje_global"] >= 0.0

    def test_nivel_es_string_valido(self):
        result = analyze_cv(CV_EJEMPLO, OFERTA_EJEMPLO)
        assert result["nivel"] in ("Buen encaje", "Encaje medio", "Encaje bajo")

    def test_errores_internos_no_lanzan_excepcion(self):
        result = analyze_cv(None, None)
        assert isinstance(result, dict)
        assert "encaje_global" in result


def test_simulate_score_no_disponible():
    assert not hasattr(__import__("backend.analyzer"), "simulate_score")
