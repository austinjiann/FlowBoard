import httpx
from typing import Optional, Dict, Any
from utils.env import settings

class AutumnService:
    def __init__(self):
        self.api_key = settings.AUTUMN_SECRET_KEY
        self.base_url = "https://api.useautumn.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def proxy_request(
        self, 
        path: str, 
        method: str, 
        customer_id: str, 
        customer_data: Dict[str, str],
        body: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Proxy request to Autumn API (equivalent to autumnHandler)"""
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/{path}"
            
            # Add customer_id to query params for GET, or body for POST/PUT
            params = {}
            json_data = body or {}
            
            if method == "GET":
                params["customer_id"] = customer_id
            else:
                json_data["customer_id"] = customer_id
                json_data["customer_data"] = customer_data

            response = await client.request(
                method=method,
                url=url,
                headers=self.headers,
                params=params if method == "GET" else None,
                json=json_data if method != "GET" else None
            )
            
            response.raise_for_status()
            return {
                "data": response.json(),
                "status": response.status_code
            }

    # ... keep your existing methods (checkout, check, track, etc.) ...