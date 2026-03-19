def create_video_prompt(
    custom_prompt: str, global_context: str, annotation_description: str
) -> str:
    return f"""
    context: {global_context}
    Generate a realistic video based on the following input: {custom_prompt}
    Here are the animation annotations detected in the source image: {annotation_description}
    The image will have annotations describing how the scene should look. the annotations guide the movement and visual style, YOU MUST REMOVE THEM IN THE final video.
    The video should be photorealistic, grounded in real-world physics, and use natural lighting and textures. Avoid cartoon, anime, or illustrated styles. Aim for a cinematic, live-action look with realistic motion and detail. If request is difficult, perform a HARD cut.
    """
