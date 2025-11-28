from blacksheep import Application, json, Request
from services.storage_service import StorageService
from services.vertex_service import VertexService
from services.job_service import JobService
from services.autumn_service import AutumnService
from rodi import Container

services = Container()

storage_service = StorageService()
vertex_service = VertexService()
job_service = JobService(vertex_service)
autumn_service = AutumnService()

services.add_instance(storage_service, StorageService)
services.add_instance(vertex_service, VertexService)
services.add_instance(job_service, JobService)
services.add_instance(autumn_service, AutumnService)

app = Application(services=services)

# TODO: REMOVE IN PRODUCTION, FOR DEV ONLY
app.use_cors(
    allow_methods="*",
    allow_origins="*",
    allow_headers="*",
)

# Autumn checkout route
@app.router.post("/api/autumn/checkout")
async def autumn_checkout(request: Request):
    try:
        body = await request.json()
        print(f"Checkout request body: {body}")  # Debug log
        
        product_id = body.get("product_id", "")
        customer_id = "demo-user"
        
        result = await autumn_service.proxy_request(
            path="checkout",
            method="POST",
            customer_id=customer_id,
            customer_data={"name": "", "email": ""},
            body={"product_id": product_id}
        )
        print(f"Autumn response: {result}")  # Debug log
        return json(result["data"], status=result["status"])
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full error to terminal
        return json({"error": str(e)}, status=500)

# random test routes
@app.router.get("/")
def hello_world():
    return "Hello World"

@app.router.get("/test")
async def test_route():
    return await vertex_service.test_service()

