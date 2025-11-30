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

    async def get_customer_entitlements(self, customer_id: str) -> Dict[str, Any]:
        """
        Get customer's entitlements/products from Autumn.
        Used to verify if a payment actually went through.
        """
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/entitled"
            params = {"customer_id": customer_id}
            
            response = await client.get(
                url=url,
                headers=self.headers,
                params=params
            )
            
            if response.status_code == 200:
                return response.json()
            return None

    async def check_product_purchased(self, customer_id: str, product_id: str) -> bool:
        """
        Check if customer has purchased a specific product.
        Returns True if the product was purchased, False otherwise.
        """
        try:
            async with httpx.AsyncClient() as client:
                # Check customer's products/subscriptions
                url = f"{self.base_url}/customers/{customer_id}"
                
                response = await client.get(
                    url=url,
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    print(f"Failed to get customer: {response.status_code}")
                    return False
                
                data = response.json()
                products = data.get("products", [])
                
                # Check if the product_id is in customer's products
                for product in products:
                    if product.get("id") == product_id:
                        return True
                
                return False
        except Exception as e:
            print(f"Error checking product purchase: {e}")
            return False