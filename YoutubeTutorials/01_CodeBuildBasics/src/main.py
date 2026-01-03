import os
import json
from datetime import datetime, timezone
from pathlib import Path

def main():
    app_name = os.getenv("APP_NAME", "codebuild-basics")
    app_env = os.getenv("APP_ENV", "dev")
    build_id = os.getenv("CODEBUILD_BUILD_ID", "local")
    source_version = os.getenv("CODEBUILD_RESOLVED_SOURCE_VERSION", "local")

    now = datetime.now(timezone.utc).isoformat()

    print("=== CodeBuild Basics Demo ===")
    print(f"APP_NAME: {app_name}")
    print(f"APP_ENV:  {app_env}")
    print(f"BUILD_ID: {build_id}")
    print(f"SOURCE:   {source_version}")
    print(f"UTC_NOW:  {now}")

    dist = Path("dist")
    dist.mkdir(parents=True, exist_ok=True)

    # output.txt
    output_txt = dist / "output.txt"
    output_txt.write_text(
        "\n".join([
            "CodeBuild demo output",
            f"app_name={app_name}",
            f"app_env={app_env}",
            f"build_id={build_id}",
            f"source_version={source_version}",
            f"utc_now={now}",
        ]) + "\n",
        encoding="utf-8"
    )

    # metadata.json
    metadata = {
        "app_name": app_name,
        "app_env": app_env,
        "build_id": build_id,
        "source_version": source_version,
        "utc_now": now,
    }
    (dist / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print("Generated files:")
    print(f"- {output_txt}")
    print(f"- {dist / 'metadata.json'}")

if __name__ == "__main__":
    main()
