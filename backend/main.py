import json
import logging
import os
import sys
import traceback
from datetime import datetime
from typing import Optional

# Ensure backend/ is on Python path so local imports work from any cwd
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from analytics import incrementar_analisis, obtener_estadisticas
from analyzer import analyze_cv, simulate_score, generar_sugerencias, generar_preguntas_entrevista
from text_extractor import extract_text_from_file

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="MatchCV Lite API", version="1.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _error(msg: str, status: int = 400) -> JSONResponse:
    logger.warning("Request error: %s", msg)
    return JSONResponse(content={"exito": False, "error": msg}, status_code=status)


async def _extraer_cv_desde_request(
    file: Optional[UploadFile],
    cv_texto: Optional[str],
) -> tuple[Optional[str], Optional[JSONResponse]]:
    """Returns (cv_text, None) on success, (None, error_response) on failure."""
    try:
        if file and file.filename:
            filename = file.filename or "archivo"
            ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
            if ext not in {"pdf", "docx", "txt"}:
                return None, _error(f"Formato '.{ext}' no soportado. Sube un archivo PDF, DOCX o TXT.")

            try:
                file_bytes = await file.read()
            except Exception as e:
                return None, _error(f"No se pudo leer el archivo subido: {e}", 500)

            if len(file_bytes) == 0:
                return None, _error("El archivo subido está vacío.")
            if len(file_bytes) > MAX_FILE_SIZE:
                return None, _error("El archivo supera el límite de 5 MB.")

            try:
                cv_text = extract_text_from_file(file_bytes, filename)
                return cv_text, None
            except RuntimeError as e:
                return None, _error(str(e), 422)
            except Exception as e:
                logger.error("Unexpected extraction error: %s", traceback.format_exc())
                return None, _error(
                    f"Error inesperado al leer el archivo '{filename}'. "
                    f"Tipo: {type(e).__name__}. Intenta con otro formato o pega el texto directamente.",
                    500,
                )

        elif cv_texto and len(cv_texto.strip()) >= 100:
            return cv_texto.strip(), None

        else:
            if cv_texto and len(cv_texto.strip()) < 100:
                return None, _error(
                    "El texto del CV pegado es demasiado corto (mínimo 100 caracteres). "
                    "Pega el contenido completo de tu hoja de vida."
                )
            return None, _error(
                "Debes subir un archivo CV (PDF/DOCX/TXT) "
                "o pegar el texto de tu hoja de vida (mínimo 100 caracteres)."
            )

    except JSONResponse:
        raise
    except Exception as e:
        logger.error("Unexpected error in CV extraction: %s", traceback.format_exc())
        return None, _error(f"Error inesperado procesando el CV: {type(e).__name__} — {e}", 500)


@app.post("/analizar")
async def analizar(
    oferta_texto: str = Form(...),
    file: Optional[UploadFile] = File(None),
    cv_texto: Optional[str] = Form(None),
    debug: bool = Form(False),
):
    # --- Validate offer ---
    if not oferta_texto or len(oferta_texto.strip()) < 20:
        return _error("La oferta laboral es demasiado corta (mínimo 20 caracteres).")

    # --- Extract CV text ---
    cv_text, err = await _extraer_cv_desde_request(file, cv_texto)
    if err is not None:
        return err

    # --- Run analysis ---
    try:
        resultado = analyze_cv(cv_text, oferta_texto, debug=debug)
        incrementar_analisis()
        return {"exito": True, **resultado}

    except ValueError as e:
        logger.error("ValueError in analyze_cv: %s", e)
        return _error(f"Error de análisis (datos inválidos): {e}", 422)

    except Exception as e:
        logger.error("Unexpected error in analyze_cv: %s", traceback.format_exc())
        return _error(
            f"Error inesperado durante el análisis: {type(e).__name__}. "
            "El equipo ha sido notificado. Inténtalo de nuevo en unos segundos.",
            500,
        )


@app.post("/analizar-multiple")
async def analizar_multiple(
    ofertas: str = Form(...),
    file: Optional[UploadFile] = File(None),
    cv_texto: Optional[str] = Form(None),
    debug: bool = Form(False),
):
    # --- Parse offers ---
    try:
        ofertas_lista = json.loads(ofertas)
        if not isinstance(ofertas_lista, list) or len(ofertas_lista) == 0:
            return _error("El campo 'ofertas' debe ser un array JSON con al menos una oferta.")
    except (json.JSONDecodeError, TypeError):
        return _error("El campo 'ofertas' debe ser un string JSON válido con un array de ofertas.")

    # --- Extract CV text ---
    cv_text, err = await _extraer_cv_desde_request(file, cv_texto)
    if err is not None:
        return err

    # --- Run analyses ---
    resultados = []
    for i, oferta in enumerate(ofertas_lista):
        oferta_str = str(oferta).strip() if oferta else ""
        if len(oferta_str) < 20:
            resultados.append({
                "indice": i,
                "error": "La oferta es demasiado corta (mínimo 20 caracteres).",
            })
        else:
            try:
                res = analyze_cv(cv_text, oferta_str, debug=debug)
                resultados.append({"indice": i, "exito": True, **res})
            except Exception as e:
                logger.error("Error in analizar-multiple offer %d: %s", i, traceback.format_exc())
                resultados.append({
                    "indice": i,
                    "error": f"Error interno: {type(e).__name__} — {e}",
                })

    return {"exito": True, "resultados": resultados}


@app.post("/calibrar")
async def calibrar(
    cv_texto: str = Form(...),
    oferta_texto: str = Form(...),
    adiciones: str = Form(...),
):
    # --- Validate inputs ---
    if not cv_texto or len(cv_texto.strip()) < 100:
        return _error("El texto del CV es demasiado corto (mínimo 100 caracteres).")
    if not oferta_texto or len(oferta_texto.strip()) < 20:
        return _error("La oferta laboral es demasiado corta (mínimo 20 caracteres).")

    try:
        adiciones_lista = json.loads(adiciones)
        if not isinstance(adiciones_lista, list):
            return _error("El campo 'adiciones' debe ser un array JSON.")
        adiciones_lista = [str(a).strip() for a in adiciones_lista if a]
    except (json.JSONDecodeError, TypeError):
        return _error("El campo 'adiciones' debe ser un string JSON válido.")

    # --- Run simulation ---
    try:
        resultado = simulate_score(cv_texto.strip(), oferta_texto.strip(), adiciones_lista)
        return {"exito": True, **resultado}
    except Exception as e:
        logger.error("Error in calibrar: %s", traceback.format_exc())
        return _error(f"Error durante la simulación: {type(e).__name__} — {e}", 500)


@app.post("/sugerir-cv")
async def sugerir_cv(
    oferta_texto: str = Form(...),
    file: Optional[UploadFile] = File(None),
    cv_texto: Optional[str] = Form(None),
):
    # --- Validate offer ---
    if not oferta_texto or len(oferta_texto.strip()) < 20:
        return _error("La oferta laboral es demasiado corta (mínimo 20 caracteres).")

    # --- Extract CV text ---
    cv_text, err = await _extraer_cv_desde_request(file, cv_texto)
    if err is not None:
        return err

    # --- Run analysis and suggestions ---
    try:
        resultado = analyze_cv(cv_text, oferta_texto)
        sugerencias = generar_sugerencias(cv_text, oferta_texto)
        return {"exito": True, **resultado, "sugerencias_modificacion": sugerencias}

    except ValueError as e:
        logger.error("ValueError in sugerir_cv: %s", e)
        return _error(f"Error de análisis (datos inválidos): {e}", 422)

    except Exception as e:
        logger.error("Unexpected error in sugerir_cv: %s", traceback.format_exc())
        return _error(
            f"Error inesperado durante el análisis: {type(e).__name__}. "
            "El equipo ha sido notificado. Inténtalo de nuevo en unos segundos.",
            500,
        )


@app.post("/entrevista")
async def entrevista(
    oferta_texto: str = Form(...),
    file: Optional[UploadFile] = File(None),
    cv_texto: Optional[str] = Form(None),
):
    if not oferta_texto or len(oferta_texto.strip()) < 20:
        return _error("La oferta laboral es demasiado corta.")

    cv_text, err = await _extraer_cv_desde_request(file, cv_texto)
    if err is not None:
        return err

    try:
        preguntas = generar_preguntas_entrevista(cv_text, oferta_texto)
        return {"exito": True, "preguntas": preguntas, "total": len(preguntas)}
    except Exception as e:
        logger.error("Error in entrevista: %s", traceback.format_exc())
        return _error(f"Error generando preguntas: {type(e).__name__} — {e}", 500)


@app.get("/analytics")
async def get_analytics():
    return {"exito": True, **obtener_estadisticas()}


@app.post("/feedback")
async def feedback(data: dict):
    try:
        entry = {"timestamp": datetime.utcnow().isoformat(), **data}
        feedback_path = os.path.join(os.path.dirname(__file__), "feedback.json")
        entries: list = []
        if os.path.exists(feedback_path):
            try:
                with open(feedback_path, "r", encoding="utf-8") as f:
                    entries = json.load(f)
                    if not isinstance(entries, list):
                        entries = []
            except (json.JSONDecodeError, OSError):
                entries = []
        entries.append(entry)
        with open(feedback_path, "w", encoding="utf-8") as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
        return {"mensaje": "Gracias por tu ayuda"}
    except Exception as e:
        logger.warning("Feedback save failed: %s", e)
        return {"mensaje": "Gracias por tu ayuda", "advertencia": str(e)}


@app.get("/health")
async def health():
    return {"status": "ok", "version": app.version}
