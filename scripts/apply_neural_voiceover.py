import subprocess
import os
import sys

FFMPEG = "/Users/apple/Downloads/falkordb/venv/lib/python3.9/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1"
EDGE_TTS = "./venv/bin/edge-tts"
VOICE = "en-US-AndrewNeural"
DEMO_DIR = "demo_video"

scenes = [
    (1, 25.02, "Welcome to OrgMind, the enterprise company brain powered by FalkorDB. Today, we demonstrate the living system in action. In modern engineering organizations, institutional knowledge is fractured across stale wikis, forgotten Slack threads, and unrecorded architectural changes. Let us enter the Company Brain Console to see how FalkorDB unifies code, dependencies, and decisions in real time."),
    (2, 26.76, "First, let us demonstrate dynamic enterprise data ingestion. Clicking Ingest Data opens our ingestion wizard. We switch to the JSON Specification tab to ingest Acme FinTech Corporation, complete with custom microservices, mutual TLS architectural mandates, and P0 incident records. We click Ingest JSON into FalkorDB, and the graph immediately merges the new topology and renders the updated service nodes."),
    (3, 25.61, "Next, we interact directly with the live FalkorDB graph canvas, powered by GraphBLAS sparse matrix operations. Clicking on the Payments Service opens our deep Node Property Inspector on the right. We can inspect its Tier 1 SLA, P0 criticality, owning engineering team Core Platform, and active dependency links to Identity Service and Checkout Web App. Clicking Identity Service instantly updates the inspector drawer."),
    (4, 25.31, "Scrolling below the canvas brings us to Container 1: our AI Command Center with an interactive Step 1 Capability Slider. Engineers can toggle seamlessly between Slide 1: Enterprise Architecture and Ownership, Slide 2: P0 Incident War Room, and Slide 3: AI Staff Architect PR Drift Review. Each capability features pre-configured Cypher query templates and customizable natural language prompts."),
    (5, 31.94, "Let us run Capability 3: reviewing Pull Request 318, where a developer attempts to revert Payments authentication to legacy symmetric HMAC keys. We click Execute Investigation. In Container 2, OrgMind AI Staff Architect Guard immediately halts the build. It issues a hard merge block, citing approved ADR-042 and explaining that symmetric keys were permanently deprecated after outage INC-8812. We can copy the ready-to-paste GitHub PR review comment with one click."),
    (6, 34.43, "Scrolling down inside Container 2, notice the Stale Architectural Conflict Alert. FalkorDB detected an explicit contradiction: legacy document RFC-102 asserts AUTH-V1, while ratified ADR-042 mandates AUTH-V2. Rather than letting false documentation persist, OrgMind provides a 1-Click Approve Correction button. Clicking it executes a deterministic Cypher mutation in FalkorDB: marking the stale claim as superseded, creating an auditable SUPERSEDED_BY edge, and healing the company brain."),
    (7, 27.44, "Now let us switch to Capability 2: P0 Incident Commander. When an authentication cascade strikes payments-svc, FalkorDB traces five hops of dependencies to identify the complete downstream blast radius on Checkout Web App and Billing Service. It automatically correlates with historical outage INC-8812 and generates a pre-formatted Slack War Room Dispatch tagging on-call leads Elena Rostova and Alex Chen for immediate triage."),
    (8, 25.80, "Container 3 guarantees complete technical transparency. It displays the exact multi-hop Cypher traversal query executed against FalkorDB, auditable links to source documents like RFC-102 and ADR-042, and transparent tool execution traces. Clicking View ADR-042 opens our slide-over Evidence Drawer displaying the verified markdown document and historical architectural context."),
    (9, 26.80, "Next, we open our floating AI Copilot drawer in the bottom-right. The copilot supports open-source models including Meta Llama 3.2, Mistral 7B, and local Ollama instances. When we ask why PR 318 was blocked, the engine queries FalkorDB via Cypher, injects factual graph context, and synthesizes a precise, zero-hallucination reply citing ADR-042 in under ten milliseconds."),
    (10, 23.19, "Finally, we navigate to the Technical Documentation page. Here, developers can explore the GraphBLAS matrix engine comparison versus traditional Vector RAG, inspect the complete ontology schema and node types, copy production-grade Cypher traversal queries, and review REST API endpoints. OrgMind turns passive company docs into an active, self-healing knowledge graph.")
]

def get_audio_duration(file_path):
    p = subprocess.run([FFMPEG, "-i", file_path], capture_output=True, text=True)
    for line in p.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return float(parts[0])*3600 + float(parts[1])*60 + float(parts[2])
    return 0.0

def main():
    print("🎙️ Starting Neural AI Voiceover Dubbing for OrgMind Demo Video...")
    print(f"🔊 AI Neural Voice Model: {VOICE} (Microsoft Azure Studio Neural)\n")
    
    dubbed_clips = []
    
    for idx, target_dur, text in scenes:
        raw_video = os.path.join(DEMO_DIR, f"scene_working_{idx}.mp4")
        if not os.path.exists(raw_video):
            print(f"❌ Error: {raw_video} does not exist!")
            sys.exit(1)
            
        neural_mp3 = f"/tmp/neural_scene_{idx}.mp3"
        if not os.path.exists(neural_mp3):
            print(f"⚡ Synthesizing Scene {idx} with {VOICE}...")
            subprocess.run([EDGE_TTS, "--voice", VOICE, "--text", text, "--write-media", neural_mp3], check=True)
        else:
            print(f"⚡ Using cached neural audio for Scene {idx}...")
            
        dur = get_audio_duration(neural_mp3)
        print(f"   ⏱️ Video duration: {target_dur:.2f}s | Neural Audio: {dur:.2f}s")
        
        # Audio alignment: atempo if slightly long, apad if slightly short
        speed = dur / target_dur
        dubbed_mp4 = os.path.join(DEMO_DIR, f"scene_dubbed_{idx}.mp4")
        
        if speed > 1.0:
            # Need to slightly speed up audio to fit video
            af = f"atempo={speed:.4f},volume=1.4"
        else:
            # Audio is shorter, pad with silence to match exact video duration
            af = f"volume=1.4,apad=whole_dur={target_dur:.2f}"
            
        cmd = [
            FFMPEG, "-y",
            "-i", raw_video,
            "-i", neural_mp3,
            "-filter_complex", f"[1:a]{af}[outa]",
            "-map", "0:v",
            "-map", "[outa]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-t", f"{target_dur:.2f}",
            dubbed_mp4
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        dubbed_clips.append(dubbed_mp4)
        print(f"   ✅ Dubbed Scene {idx} created: {dubbed_mp4}")

    # Master concatenation using filter_complex
    print("\n🎞️ Concatenating all 10 dubbed scenes into Master Video...")
    inputs = []
    filter_parts = []
    concat_inputs = []

    for i in range(len(dubbed_clips)):
        inputs.extend(["-i", dubbed_clips[i]])
        filter_parts.append(f"[{i}:v]fps=30,setpts=PTS-STARTPTS[v{i}];")
        filter_parts.append(f"[{i}:a]asetpts=PTS-STARTPTS[a{i}];")
        concat_inputs.append(f"[v{i}][a{i}]")

    filter_str = "".join(filter_parts) + "".join(concat_inputs) + f"concat=n={len(dubbed_clips)}:v=1:a=1[outv][outa]"
    final_video = os.path.join(DEMO_DIR, "orgmind_working_demo.mp4")
    
    concat_cmd = [
        FFMPEG, "-y"
    ] + inputs + [
        "-filter_complex", filter_str,
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        final_video
    ]
    subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # Copy to frontend public and brain artifact
    public_video = "frontend/public/orgmind_working_demo.mp4"
    subprocess.run(["cp", final_video, public_video], check=True)
    
    artifact_video = "/Users/apple/.gemini/antigravity/brain/7b3faf02-be32-4ec1-9b5b-b61587652185/orgmind_working_demo.mp4"
    subprocess.run(["cp", final_video, artifact_video], check=True)
    
    final_dur = get_audio_duration(final_video)
    size_mb = os.path.getsize(final_video) / (1024 * 1024)
    
    print("\n======================================================")
    print("🎉 MASTER NEURAL AI VOICEOVER VIDEO COMPLETE!")
    print(f"📍 File Path: {final_video}")
    print(f"⏱️ Total Duration: {final_dur:.2f}s (~{final_dur/60:.2f} mins)")
    print(f"💾 File Size: {size_mb:.2f} MB")
    print(f"🎤 AI Voice Model: {VOICE} (Microsoft Azure Studio Neural)")
    print("======================================================\n")

if __name__ == "__main__":
    main()
