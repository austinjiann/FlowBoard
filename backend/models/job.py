from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Literal
from google.genai.types import GenerateVideosOperation

@dataclass
class VideoJobRequest:
    starting_image: str
    context: str
    prompt: str

@dataclass
class JobStatus:
    status: Optional[Literal["done", "waiting"]]
    job_start_time: datetime
    video_url: Optional[str] = None

@dataclass
class VideoJob:
    job_id: str
    request: VideoJobRequest
    job_start_time: datetime
    operation: GenerateVideosOperation
