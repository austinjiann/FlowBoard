from supabase import Client, create_client
from utils.env import settings
from typing import Optional, Tuple
from blacksheep import Request


class SupabaseService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY
        )
    
    def get_user_id_from_token(self, token: str) -> Optional[str]:
        """Return the Supabase user id from a JWT access token.
        Uses GoTrue to validate the token and fetch the user.
        Returns None if invalid or user not found.
        """
        if not token:
            return None
        try:
            res = self.supabase.auth.get_user(token)
            # supabase-py v2: res has `.user` with `.id`
            if getattr(res, "user", None) and getattr(res.user, "id", None):
                return res.user.id
            return None
        except Exception:
            return None

    def get_user_id_from_request(self, request: Request) -> Optional[str]:
        """Extract Bearer token from Authorization header and return user id."""
        auth_header = request.get_first_header(b"authorization")
        if not auth_header:
            return None
        try:
            value = auth_header.decode()
            if value.lower().startswith("bearer "):
                token = value[7:].strip()
            else:
                # Not a Bearer token
                return None
            return self.get_user_id_from_token(token)
        except Exception:
            return None

    def do_transaction(self, user_id: str, transaction_type: str, credit_usage: int) -> Tuple[bool, Optional[str]]:
        """
        Logs transaction and deducts credit usage for user.
        Returns (success, error_message) tuple.
        """
        try:
            self.supabase.rpc(
                "sub_user_credits",
                {
                    "p_user_id": user_id,
                    "p_credit_change": credit_usage
                }
            ).execute()

            self.supabase.table("transaction_log").insert({
                "transaction_type": transaction_type,
                "user_id": user_id,
                "credit_usage": credit_usage
            }).execute()
            return (True, None)
        except Exception as e:
            error_msg = str(e)
            print(f"Failed to do transaction: {error_msg}")
            if "insufficient_credits" in error_msg:
                return (False, "insufficient_credits")
            return (False, error_msg)
        
    def get_user_row(self, user_id: str):
        """ fetches user row """
        try:
            return (
                self.supabase
                .table("profiles")    
                .select("*")
                .eq("user_id", user_id) 
                .single()
                .execute()
            )
        except Exception:
            return None

    def get_transaction_log(self, user_id: str):
        """ fetches transaction log for user """
        try:
            return (
                self.supabase
                .table("transaction_log")    
                .select("*")
                .eq("user_id", user_id) 
                .order("created_at", desc=True)
                .execute()
            )
        except Exception:
            return None

    def add_user_credits(self, user_id: str, credits: int):
        """
        Add credits to user account (opposite of sub_user_credits).
        Uses a negative value with the existing subtract function to add credits.
        """
        try:
            self.supabase.rpc(
                "sub_user_credits",
                {
                    "p_user_id": user_id,
                    "p_credit_change": -credits  # Negative to add credits
                }
            ).execute()
            return True
        except Exception as e:
            print(f"Failed to add credits: {e}")
            return False

    def update_user_plan(self, user_id: str, plan: str):
        """
        Update user's billing plan (free or paid).
        """
        try:
            self.supabase.table("profiles").update({
                "billing_type": plan  # Column is billing_type, not plan
            }).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            print(f"Failed to update plan: {e}")
            return False

    def log_credit_purchase(self, user_id: str, credits: int, product_id: str):
        """
        Log a credit purchase transaction.
        """
        try:
            self.supabase.table("transaction_log").insert({
                "transaction_type": "credit_purchase",  # Must be a valid enum value
                "user_id": user_id,
                "credit_usage": -credits,  # Negative because user gained credits
            }).execute()
            return True
        except Exception as e:
            print(f"Failed to log credit purchase: {e}")
            return False
        
