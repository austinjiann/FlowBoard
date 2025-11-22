from datetime import datetime
from typing import Dict
from models.job import JobStatus, VideoJobRequest, VideoJob
from services.vertex_service import VertexService
import uuid

class JobService:
    def __init__(self, vertex_service: VertexService):
        self.vertex_service = vertex_service
        self.jobs: Dict[str, VideoJob] = {}

    async def create_video_job(self, request: VideoJobRequest) -> str:
        operation = await self.vertex_service.generate_video_content(request.prompt)
        job_id = str(uuid.uuid4())  # TODO: change to actual job ID from operation
        
        # Initialize job status
        self.jobs[job_id] = VideoJob(
            job_id=job_id,
            operation=operation,
            request=request,
            job_start_time=datetime.now()
        )
        
        return job_id

    async def get_video_job_status(self, job_id: str) -> JobStatus:
        if job_id not in self.jobs:
            return None

        result = await self.vertex_service.get_video_status(self.jobs[job_id].operation)
        return JobStatus(
            status=result.status,
            job_start_time=self.jobs[job_id].job_start_time,
            video_url=result.video_url
        )
