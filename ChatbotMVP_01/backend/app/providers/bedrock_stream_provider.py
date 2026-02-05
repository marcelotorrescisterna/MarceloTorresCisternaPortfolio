import json
from typing import Dict, List, Iterator

import boto3

from app import config


class BedrockStreamProvider:
    def __init__(self) -> None:
        if not config.BEDROCK_MODEL_ID:
            raise RuntimeError("Falta BEDROCK_MODEL_ID en el .env del backend")

        credentials_profile = config.AWS_PROFILE or None
        access_key = config.AWS_ACCESS_KEY_ID or None
        secret_key = config.AWS_SECRET_ACCESS_KEY or None
        session_token = config.AWS_SESSION_TOKEN or None

        if credentials_profile and (access_key or secret_key):
            raise RuntimeError(
                "No mezcles AWS_PROFILE con AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY."
            )

        session_kwargs = {"region_name": config.AWS_REGION}
        if credentials_profile:
            session_kwargs["profile_name"] = credentials_profile
        if access_key and secret_key:
            session_kwargs["aws_access_key_id"] = access_key
            session_kwargs["aws_secret_access_key"] = secret_key
            if session_token:
                session_kwargs["aws_session_token"] = session_token

        session = boto3.Session(**session_kwargs)
        self.client = session.client("bedrock-runtime")
        self.model_id = config.BEDROCK_MODEL_ID

    def _to_bedrock_payload(self, messages: List[Dict[str, str]]):
        system_blocks: List[Dict[str, str]] = []
        convo_messages: List[Dict[str, object]] = []

        for message in messages:
            role = message.get("role")
            content = (message.get("content") or "").strip()
            if not content:
                continue

            if role == "system":
                system_blocks.append({"text": content})
                continue

            if role not in ("user", "assistant"):
                role = "user"

            convo_messages.append({
                "role": role,
                "content": [{"text": content}],
            })

        payload = {"modelId": self.model_id, "messages": convo_messages}
        if system_blocks:
            payload["system"] = system_blocks

        return payload

    def stream(self, messages: List[Dict[str, str]]) -> Iterator[str]:
        payload = self._to_bedrock_payload(messages)

        response = self.client.converse_stream(**payload)
        for event in response.get("stream", []):
            delta = None
            if "contentBlockDelta" in event:
                delta = event["contentBlockDelta"].get("delta", {}).get("text")

            if isinstance(delta, str) and delta:
                payload = json.dumps({"delta": delta}, ensure_ascii=False)
                yield f"data: {payload}\n\n"

        yield "data: {\"done\": true}\n\n"
