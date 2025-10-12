import os
import httpx


class AzureOpenAIService:
    def __init__(self, endpoint: str | None = None, api_key: str | None = None, deployment: str | None = None):
        self.endpoint = endpoint or os.getenv("AZURE_OPENAI_ENDPOINT")
        self.api_key = api_key or os.getenv("AZURE_OPENAI_KEY")
        self.deployment = deployment or "gpt-4o-mini"

    async def generate_sql(self, prompt: str, schema: str | None = None) -> str:
        if not self.endpoint or not self.api_key:
            # Fallback deterministic SQL when not configured
            return "SELECT 1 AS id;"

        system_prompt = (
            "You are a SQL assistant. Generate a single SQL query for PostgreSQL given the user's request. "
            "Only return SQL. Use provided schema when relevant."
        )
        user_content = prompt if not schema else f"Schema:\n{schema}\n\nRequest:\n{prompt}"

        url = f"{self.endpoint}/openai/deployments/{self.deployment}/chat/completions?api-version=2024-06-01"
        headers = {"api-key": self.api_key, "Content-Type": "application/json"}
        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "temperature": 0.1,
            "max_tokens": 400,
        }

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data.get("choices", [{}])[0].get("message", {}).get("content", "SELECT 1")
            return text.strip().strip('`')


