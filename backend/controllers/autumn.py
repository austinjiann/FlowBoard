from blacksheep import json, Request
from blacksheep.server.controllers import APIController, get, post, put, delete
from services.autumn_service import AutumnService
from services.supabase_service import SupabaseService
from utils.env import settings
import json as pyjson

# Map product IDs to credit amounts
PRODUCT_CREDITS = {
    "starter-pack": 500,
    "pro-pack": 2000,
}

class Autumn(APIController):
    def __init__(self, autumn_service: AutumnService, supabase_service: SupabaseService):
        self.autumn_service = autumn_service
        self.supabase_service = supabase_service

    async def _get_customer_id(self, request: Request) -> str:
        """Extract customer_id from request (auth header, session, etc.)"""
        # Try to get user_id from the middleware-attached scope
        user_id = request.scope.get("user_id")
        if user_id:
            return user_id
        
        # Fallback to header or query param
        customer_id = request.headers.get("X-Customer-ID") or request.query.get("customer_id")
        if customer_id:
            return customer_id
        
        return None

    @post("/webhook")
    async def autumn_webhook(self, request: Request):
        """
        Handle Autumn payment webhooks.
        Called by Autumn when a payment succeeds.
        """
        try:
            body = await request.json()
            print(f"Autumn webhook received: {body}")
            
            # Extract relevant data from webhook payload
            customer_id = body.get("customer_id")
            product_id = body.get("product_id")
            event_type = body.get("type") or body.get("event")
            
            # Only process successful payment events
            if event_type not in ["checkout.completed", "payment.succeeded", "invoice.paid"]:
                print(f"Ignoring webhook event type: {event_type}")
                return json({"status": "ignored"}, status=200)
            
            if not customer_id or not product_id:
                print(f"Missing customer_id or product_id in webhook")
                return json({"error": "Missing required fields"}, status=400)
            
            # Get credit amount for this product
            credits = PRODUCT_CREDITS.get(product_id, 0)
            if credits == 0:
                print(f"Unknown product_id: {product_id}")
                return json({"error": "Unknown product"}, status=400)
            
            # Update user's credits
            self.supabase_service.add_user_credits(customer_id, credits)
            
            # Update user's plan to paid
            self.supabase_service.update_user_plan(customer_id, "paid")
            
            # Log the transaction
            self.supabase_service.log_credit_purchase(customer_id, credits, product_id)
            
            print(f"Successfully processed payment for user {customer_id}: +{credits} credits")
            return json({"status": "success"}, status=200)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return json({"error": str(e)}, status=500)

    @post("/checkout")
    async def autumn_checkout(self, request: Request):
        try:
            body = await request.json()
            print(f"Checkout request body: {body}")
            
            product_id = body.get("product_id", "")
            
            # Get authenticated user ID from middleware
            customer_id = request.scope.get("user_id")
            if not customer_id:
                return json({"error": "Unauthorized"}, status=401)
            
            # Build success URL to redirect after payment (include product_id)
            success_url = f"{settings.FRONTEND_URL}/pricing?success=true&product={product_id}"
            
            result = await self.autumn_service.proxy_request(
                path="checkout",
                method="POST",
                customer_id=customer_id,
                customer_data={"name": "", "email": ""},
                body={
                    "product_id": product_id,
                    "success_url": success_url
                }
            )
            print(f"Autumn response: {result}")
            return json(result["data"], status=result["status"])
        except Exception as e:
            import traceback
            traceback.print_exc()
            return json({"error": str(e)}, status=500)

    @get("/sync-credits")
    async def sync_credits(self, request: Request):
        """
        Sync credits to Supabase after successful payment redirect.
        VERIFIES purchase with Autumn API before adding credits.
        """
        try:
            # Get authenticated user ID
            user_id = request.scope.get("user_id")
            if not user_id:
                return json({"error": "Unauthorized"}, status=401)
            
            # Get product_id from query params
            product_id = request.query.get("product")
            if not product_id:
                return json({"error": "Missing product parameter"}, status=400)
            
            # Blacksheep returns query params as list - get first element
            if isinstance(product_id, list):
                product_id = product_id[0]
            
            # Handle bytes if needed
            if isinstance(product_id, bytes):
                product_id = product_id.decode()
            
            print(f"Sync credits: user={user_id}, product={product_id}")
            
            # Look up credits for this product
            credits = PRODUCT_CREDITS.get(product_id, 0)
            print(f"Credits for {product_id}: {credits}")
            
            if credits == 0:
                return json({"error": f"Unknown product: {product_id}"}, status=400)
            
            # SECURITY: Verify the purchase with Autumn before adding credits
            product_verified = await self.autumn_service.check_product_purchased(user_id, product_id)
            print(f"Product verification for {product_id}: {product_verified}")
            
            if not product_verified:
                return json({
                    "error": "Payment not verified. Please complete checkout.",
                    "verified": False
                }, status=402)
            
            # Add credits to Supabase
            self.supabase_service.add_user_credits(user_id, credits)
            
            # Update user's plan to paid
            self.supabase_service.update_user_plan(user_id, "paid")
            
            # Log the transaction
            self.supabase_service.log_credit_purchase(user_id, credits, product_id)
            
            # Get updated balance
            user_row = self.supabase_service.get_user_row(user_id)
            new_balance = user_row.data.get("credits", 0) if user_row and user_row.data else 0
            
            print(f"Successfully added {credits} credits for user {user_id}. New balance: {new_balance}")
            
            return json({
                "success": True,
                "credits_added": credits,
                "new_balance": new_balance
            }, status=200)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return json({"error": str(e)}, status=500)
            
    @get("*")
    async def handle_get(self, request: Request):
        """Handle GET requests to /api/autumn/*"""
        return await self._handle_request(request, method="GET")

    @post("*")
    async def handle_post(self, request: Request):
        """Handle POST requests to /api/autumn/*"""
        return await self._handle_request(request, method="POST")

    @put("*")
    async def handle_put(self, request: Request):
        """Handle PUT requests to /api/autumn/*"""
        return await self._handle_request(request, method="PUT")

    @delete("*")
    async def handle_delete(self, request: Request):
        """Handle DELETE requests to /api/autumn/*"""
        return await self._handle_request(request, method="DELETE")

    async def _handle_request(self, request: Request, method: str):
        """Proxy request to Autumn API"""
        try:
            # Get customer_id from auth
            customer_id = await self._get_customer_id(request)
            
            # Parse request body if present
            body = None
            if method in ["POST", "PUT", "PATCH"]:
                try:
                    body = await request.json()
                except:
                    body = None

            # Extract the path after /api/autumn/
            # e.g., /api/autumn/checkout -> checkout
            path = request.url.path.replace("/api/autumn/", "").strip("/")
            
            # Get customer data (you can enhance this with actual user data)
            customer_data = {
                "name": "",  # Get from your user database
                "email": ""  # Get from your user database
            }

            # Forward to Autumn API
            result = await self.autumn_service.proxy_request(
                path=path,
                method=method,
                customer_id=customer_id,
                customer_data=customer_data,
                body=body
            )

            return json(result["data"], status=result["status"])

        except Exception as e:
            return json({"error": str(e)}, status=500)