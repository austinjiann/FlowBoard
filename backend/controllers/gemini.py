# ADDED: updated to use `google-genai` package (new Gemini SDK)
from blacksheep import json, FromFiles
from blacksheep.server.controllers import APIController, post

from google.genai import Client
from google.genai.types import Content, Part

import tempfile
import os
import json as pyjson

client = Client(api_key=os.getenv("GEMINI_API_KEY"))


class GeminiController(APIController):

    @post("/extract-context")
    async def extract_context(self, files: FromFiles):
        if not files.value:
            return json({"error": "No file provided"}, status=400)

        video_file = files.value[0]

        # ADDED: save short video to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(video_file.data)
            tmp_path = tmp.name

        prompt = (
            "Extract structured scene information from this video.\n"
            "Return ONLY JSON in exactly this shape:\n"
            "{\n"
            '  "entities": [\n'
            '    { "id": "id-1", "description": "...", "appearance": "..." }\n'
            "  ],\n"
            '  "environment": "...",\n'
            '  "style": "..."\n'
            "}"
        )

        try:
            # ADDED: Gemini 1.5 Flash example using google-genai
            res = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[
                    Content(
                        parts=[
                            Part.from_text(prompt),
                            Part.from_file(tmp_path, mime_type="video/mp4")
                        ]
                    )
                ]
            )

            raw = res.text

            try:
                parsed = pyjson.loads(raw)
            except Exception:
                return json({"error": "Failed to parse JSON", "raw": raw}, status=500)

            return json(parsed)

        finally:
            os.remove(tmp_path)
