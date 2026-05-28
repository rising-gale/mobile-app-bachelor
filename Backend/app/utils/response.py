from typing import Any, Dict


def success(data: Any = None, message: str | None = None) -> Dict:
    payload = {"success": True}
    if message is not None:
        payload["message"] = message
    payload["data"] = data
    return payload


def failure(message: str, code: int = 400) -> Dict:
    return {"success": False, "error": message, "code": code}
