from blacksheep import json, Request
from blacksheep.server.controllers import APIController, post, get

from services.supabase_service import SupabaseService

class UserRowController(APIController):
    
    def __init__(self, supabase_service: SupabaseService):
        self.supabase_service = supabase_service

    @post("/user-row")
    async def get_user_row(self, request: Request):
        try:
            user_id = request.scope.get("user_id") or self.supabase_service.get_user_id_from_request(request)
            if not user_id:
                return json({"error": "Unauthorized"}, status=401)
            
            try:
                body = await request.json()
            except Exception:
                body = {}

            table = body.get("table")
            if not table:
                return json({"error": "Missing 'table' in request body"}, status=400)

            res = self.supabase_service.get_user_row(user_id=user_id, table=table)
            row = None
            if res is None:
                row = None
            elif isinstance(res, dict):
                # common supabase-py shape: {'data': ..., 'error': ...}
                row = res.get("data") if "data" in res else res
            else:
                # attempt attribute access as a fallback
                row = getattr(res, "data", None) or getattr(res, "value", None) or res

            if not row:
                return json({"error": "Row not found"}, status=404)

            return json({"row": row})
        
        except Exception as e:
            print(f"ERROR in get_user_row: {e}")
            import traceback
            traceback.print_exc()
            return json({"error": str(e)}, status=500)
    
    # TEST
    @get("/test")
    async def test(self, request: Request):
        print("hfhewuihefwuifhewiuhefiuiwehiuewf")