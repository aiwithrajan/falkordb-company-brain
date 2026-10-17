const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const puppeteer = require('../frontend/node_modules/puppeteer-core');

const FFMPEG_BIN = '/Users/apple/Downloads/falkordb/venv/lib/python3.9/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1';
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve(__dirname, '../demo_video');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function getAudioDuration(wavPath) {
  const res = spawnSync(FFMPEG_BIN, ['-i', wavPath], { encoding: 'utf-8' });
  const output = res.stderr || res.stdout || '';
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (match) {
    const hours = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    const seconds = parseFloat(match[3]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 25.0;
}

async function injectVirtualCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-virtual-cursor')) return;
    const c = document.createElement('div');
    c.id = 'demo-virtual-cursor';
    c.style.cssText = `
      position: fixed;
      top: 150px; left: 250px;
      width: 22px; height: 22px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.5) 60%, transparent 100%);
      border: 2px solid #ffffff;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.9), 0 0 30px rgba(245, 158, 11, 0.4);
      z-index: 9999999;
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform 0.12s ease;
    `;
    document.body.appendChild(c);

    window.__cursorX = 250;
    window.__cursorY = 150;

    window.__setCursorPos = (x, y) => {
      window.__cursorX = x;
      window.__cursorY = y;
      c.style.left = `${x}px`;
      c.style.top = `${y}px`;
    };

    window.__pulseCursor = () => {
      c.style.transform = 'translate(-50%, -50%) scale(0.6)';
      c.style.background = 'rgba(239, 68, 68, 0.95)';
      setTimeout(() => {
        c.style.transform = 'translate(-50%, -50%) scale(1)';
        c.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.5) 60%, transparent 100%)';
      }, 220);
    };
  });
}

async function moveCursorToCoords(page, targetX, targetY, durationMs = 450) {
  const start = await page.evaluate(() => ({ x: window.__cursorX || 250, y: window.__cursorY || 150 }));
  const steps = Math.max(10, Math.floor(durationMs / 25));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const curX = start.x + (targetX - start.x) * ease;
    const curY = start.y + (targetY - start.y) * ease;
    await page.evaluate((x, y) => {
      if (window.__setCursorPos) window.__setCursorPos(x, y);
    }, curX, curY);
    await new Promise(r => setTimeout(r, 25));
  }
}

async function moveCursorToElement(page, selectorOrText, durationMs = 450) {
  const coords = await page.evaluate((target) => {
    let el = null;
    if (target.startsWith('#') || target.startsWith('.') || target.includes('[')) {
      el = document.querySelector(target);
    }
    if (!el) {
      const all = Array.from(document.querySelectorAll('button, a, input, textarea, h1, h2, h3, div, span, p'));
      el = all.find(e => e.textContent && e.textContent.includes(target) && e.offsetParent !== null);
    }
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, selectorOrText);

  if (coords) {
    await moveCursorToCoords(page, coords.x, coords.y, durationMs);
  }
}

async function clickElementWithCursor(page, selectorOrText, durationMs = 400) {
  await moveCursorToElement(page, selectorOrText, durationMs);
  await page.evaluate(() => {
    if (window.__pulseCursor) window.__pulseCursor();
  });
  await new Promise(r => setTimeout(r, 120));
  await page.evaluate((target) => {
    let el = null;
    if (target.startsWith('#') || target.startsWith('.') || target.includes('[')) {
      el = document.querySelector(target);
    }
    if (!el) {
      const all = Array.from(document.querySelectorAll('button, a, input, textarea, div, span'));
      el = all.find(e => e.textContent && e.textContent.includes(target) && e.offsetParent !== null);
    }
    if (el) el.click();
  }, selectorOrText);
}

async function smoothScroll(page, deltaY, durationMs = 500) {
  const steps = Math.max(10, Math.floor(durationMs / 25));
  const stepY = deltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((dy) => window.scrollBy(0, dy), stepY);
    await new Promise(r => setTimeout(r, 25));
  }
}

async function typeSmoothly(page, selector, text) {
  await clickElementWithCursor(page, selector, 400);
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.value = '';
      el.focus();
    }
  }, selector);

  for (const char of text) {
    await page.evaluate((sel, c) => {
      const el = document.querySelector(sel);
      if (el) {
        el.value += c;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, selector, char);
    await new Promise(r => setTimeout(r, 40 + Math.random() * 20));
  }
}

const scenes = [
  {
    id: 1,
    title: 'Launching the Company Brain Console',
    narration: 'Welcome to OrgMind, the enterprise company brain powered by FalkorDB. Today, we demonstrate the living system in action. In modern engineering organizations, institutional knowledge is fractured across stale wikis, forgotten Slack threads, and unrecorded architectural changes. Let us enter the Company Brain Console to see how FalkorDB unifies code, dependencies, and decisions in real time.',
    run: async (page, sceneDir, sceneDuration) => {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      await injectVirtualCursor(page);
      await new Promise(r => setTimeout(r, 1200));

      // Move cursor to "Launch Console" in header
      await moveCursorToElement(page, 'LAUNCH CONSOLE', 500);
      await new Promise(r => setTimeout(r, 800));

      // Click to enter console
      await page.evaluate(() => {
        if (window.__setViewMode) window.__setViewMode('console');
      });
      await new Promise(r => setTimeout(r, 1400));
      await injectVirtualCursor(page);

      // Inspect top company summary metrics
      await moveCursorToCoords(page, 400, 160, 600);
      await new Promise(r => setTimeout(r, 800));
      await moveCursorToCoords(page, 700, 160, 600);
      await new Promise(r => setTimeout(r, 1000));
    }
  },
  {
    id: 2,
    title: 'Live Ingestion of Custom Architecture Data',
    narration: 'First, let us demonstrate dynamic enterprise data ingestion. Clicking Ingest Data opens our ingestion wizard. We switch to the JSON Specification tab to ingest Acme FinTech Corporation, complete with custom microservices, mutual TLS architectural mandates, and P0 incident records. We click Ingest JSON into FalkorDB, and the graph immediately merges the new topology and renders the updated service nodes.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);

      // Click Ingest Data in header
      await clickElementWithCursor(page, 'Ingest Data', 500);
      await new Promise(r => setTimeout(r, 1200));

      // Click JSON Specification tab
      await clickElementWithCursor(page, 'JSON Specification', 500);
      await new Promise(r => setTimeout(r, 1400));

      // Click Ingest JSON into FalkorDB
      await clickElementWithCursor(page, 'Ingest JSON into FalkorDB', 600);
      await new Promise(r => setTimeout(r, 2400));

      // Close modal (if not closed automatically)
      await page.evaluate(() => {
        if (window.__closeIngest) window.__closeIngest();
      });
      await new Promise(r => setTimeout(r, 1200));

      // Cursor moves across newly rendered graph canvas
      await moveCursorToCoords(page, 960, 420, 600);
      await new Promise(r => setTimeout(r, 1000));
    }
  },
  {
    id: 3,
    title: 'Interactive Graph Canvas & Deep Node Inspection',
    narration: 'Next, we interact directly with the live FalkorDB graph canvas, powered by GraphBLAS sparse matrix operations. Clicking on the Payments Service opens our deep Node Property Inspector on the right. We can inspect its Tier 1 SLA, P0 criticality, owning engineering team Core Platform, and active dependency links to Identity Service and Checkout Web App. Clicking Identity Service instantly updates the inspector drawer.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);
      await new Promise(r => setTimeout(r, 600));

      // Select Payments Service node via helper hook
      await page.evaluate(() => {
        if (window.__selectNodeById) window.__selectNodeById('svc_payments');
      });
      await new Promise(r => setTimeout(r, 1400));

      // Move cursor to Node Property Inspector on right
      await moveCursorToCoords(page, 1650, 260, 600);
      await new Promise(r => setTimeout(r, 1000));

      // Move down inspector to outgoing relationships
      await moveCursorToCoords(page, 1650, 480, 600);
      await new Promise(r => setTimeout(r, 1200));

      // Select Identity Service node
      await page.evaluate(() => {
        if (window.__selectNodeById) window.__selectNodeById('svc_identity');
      });
      await new Promise(r => setTimeout(r, 1400));
      await moveCursorToCoords(page, 1650, 320, 500);
      await new Promise(r => setTimeout(r, 1200));

      // Close drawer
      await page.evaluate(() => {
        if (window.__closeNodeDetail) window.__closeNodeDetail();
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: 4,
    title: 'Container 1: Step 1 Capability Slider (1, 2, 3)',
    narration: 'Scrolling below the canvas brings us to Container 1: our AI Command Center with an interactive Step 1 Capability Slider. Engineers can toggle seamlessly between Slide 1: Enterprise Architecture and Ownership, Slide 2: P0 Incident War Room, and Slide 3: AI Staff Architect PR Drift Review. Each capability features pre-configured Cypher query templates and customizable natural language prompts.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);

      // Scroll smoothly down to Container 1
      await page.evaluate(() => {
        const el = document.getElementById('investigation-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 1400));

      // Click Slider 1
      await clickElementWithCursor(page, '1: Architecture & Ownership', 500);
      await new Promise(r => setTimeout(r, 1200));

      // Click Slider 2
      await clickElementWithCursor(page, '2: P0 Incident War Room', 500);
      await new Promise(r => setTimeout(r, 1200));

      // Click Slider 3
      await clickElementWithCursor(page, '3: AI Staff Architect PR Drift', 500);
      await new Promise(r => setTimeout(r, 1400));
    }
  },
  {
    id: 5,
    title: 'Container 2: PR Drift Review & Hard Merge Block',
    narration: 'Let us run Capability 3: reviewing Pull Request 318, where a developer attempts to revert Payments authentication to legacy symmetric HMAC keys. We click Execute Investigation. In Container 2, OrgMind AI Staff Architect Guard immediately halts the build. It issues a hard merge block, citing approved ADR-042 and explaining that symmetric keys were permanently deprecated after outage INC-8812. We can copy the ready-to-paste GitHub PR review comment with one click.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);

      // Click Execute Investigation button
      await clickElementWithCursor(page, 'Execute Investigation', 500);
      await new Promise(r => setTimeout(r, 2200));

      // Scroll down into Container 2
      await smoothScroll(page, 420, 700);
      await new Promise(r => setTimeout(r, 1200));

      // Move cursor to Hard Merge Block badge
      await moveCursorToElement(page, 'BLOCKED', 500);
      await new Promise(r => setTimeout(r, 1400));

      // Hover over ADR-042 violation text
      await moveCursorToElement(page, 'ADR-042', 500);
      await new Promise(r => setTimeout(r, 1400));

      // Click Copy PR Review Comment
      await clickElementWithCursor(page, 'PR Review Comment', 500);
      await new Promise(r => setTimeout(r, 1600));
    }
  },
  {
    id: 6,
    title: 'Container 2: Living Institutional Memory & 1-Click Self-Healing',
    narration: 'Scrolling down inside Container 2, notice the Stale Architectural Conflict Alert. FalkorDB detected an explicit contradiction: legacy document RFC-102 asserts AUTH-V1, while ratified ADR-042 mandates AUTH-V2. Rather than letting false documentation persist, OrgMind provides a 1-Click Approve Correction button. Clicking it executes a deterministic Cypher mutation in FalkorDB: marking the stale claim as superseded, creating an auditable SUPERSEDED_BY edge, and healing the company brain.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);

      // Scroll down to conflict alert
      await smoothScroll(page, 360, 700);
      await new Promise(r => setTimeout(r, 1200));

      // Hover over conflict diff
      await moveCursorToElement(page, 'RFC-102', 500);
      await new Promise(r => setTimeout(r, 1000));
      await moveCursorToElement(page, 'ADR-042', 500);
      await new Promise(r => setTimeout(r, 1000));

      // Click Approve Correction button
      await clickElementWithCursor(page, 'Approve Correction', 500);
      await new Promise(r => setTimeout(r, 2000));

      // Scroll slightly to view updated state
      await smoothScroll(page, 140, 500);
      await new Promise(r => setTimeout(r, 1600));
    }
  },
  {
    id: 7,
    title: 'Container 2: P0 Incident Commander & War Room Dispatch',
    narration: 'Now let us switch to Capability 2: P0 Incident Commander. When an authentication cascade strikes payments-svc, FalkorDB traces five hops of dependencies to identify the complete downstream blast radius on Checkout Web App and Billing Service. It automatically correlates with historical outage INC-8812 and generates a pre-formatted Slack War Room Dispatch tagging on-call leads Elena Rostova and Alex Chen for immediate triage.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);

      // Scroll back up to Container 1
      await page.evaluate(() => {
        const el = document.getElementById('investigation-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 1200));

      // Click Slider 2 (Incident War Room)
      await clickElementWithCursor(page, '2: P0 Incident War Room', 500);
      await new Promise(r => setTimeout(r, 1000));

      // Click Execute Investigation
      await clickElementWithCursor(page, 'Execute Investigation', 500);
      await new Promise(r => setTimeout(r, 2000));

      // Scroll down into Container 2
      await smoothScroll(page, 440, 700);
      await new Promise(r => setTimeout(r, 1200));

      // Move cursor across Incident Blast Radius
      await moveCursorToElement(page, 'INC-8812', 500);
      await new Promise(r => setTimeout(r, 1200));

      // Click Copy Slack Dispatch
      await clickElementWithCursor(page, 'Slack Dispatch', 500);
      await new Promise(r => setTimeout(r, 1600));
    }
  },
  {
    id: 8,
    title: 'Container 3: Cypher Audit Trail & Evidence Drawer',
    narration: 'Container 3 guarantees complete technical transparency. It displays the exact multi-hop Cypher traversal query executed against FalkorDB, auditable links to source documents like RFC-102 and ADR-042, and transparent tool execution traces. Clicking View ADR-042 opens our slide-over Evidence Drawer displaying the verified markdown document and historical architectural context.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);

      // Scroll down to Container 3
      await smoothScroll(page, 520, 700);
      await new Promise(r => setTimeout(r, 1200));

      // Hover over Cypher box
      await moveCursorToElement(page, 'Cypher Traversal', 500);
      await new Promise(r => setTimeout(r, 1000));

      // Click View ADR-042 button
      await clickElementWithCursor(page, 'View ADR-042', 500);
      await new Promise(r => setTimeout(r, 1600));

      // Move cursor inside Evidence Drawer
      await moveCursorToCoords(page, 1600, 420, 500);
      await new Promise(r => setTimeout(r, 1400));

      // Close evidence drawer
      await page.evaluate(() => {
        const closeBtn = document.querySelector('button[title="Close"]');
        if (closeBtn) closeBtn.click();
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: 9,
    title: 'Grounded Open-Source AI Copilot Chat',
    narration: 'Next, we open our floating AI Copilot drawer in the bottom-right. The copilot supports open-source models including Meta Llama 3.2, Mistral 7B, and local Ollama instances. When we ask why PR 318 was blocked, the engine queries FalkorDB via Cypher, injects factual graph context, and synthesizes a precise, zero-hallucination reply citing ADR-042 in under ten milliseconds.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);

      // Move cursor to Ask AI Copilot button in bottom-right
      await moveCursorToCoords(page, 1820, 1020, 500);
      await new Promise(r => setTimeout(r, 300));

      // Open AI Chat
      await page.evaluate(() => {
        if (window.__openAIChat) window.__openAIChat();
      });
      await new Promise(r => setTimeout(r, 1400));

      // Move to chat textarea
      await moveCursorToCoords(page, 1650, 1030, 500);
      await new Promise(r => setTimeout(r, 300));

      // Type question smoothly
      await typeSmoothly(page, 'textarea[placeholder*="Ask"]', 'Why was PR #318 blocked by ADR-042?');
      await new Promise(r => setTimeout(r, 500));

      // Click submit or quick prompt
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const qp = btns.find(b => b.textContent && b.textContent.includes('PR #318'));
        if (qp) qp.click();
        else {
          const sendBtn = btns.find(b => b.querySelector('svg'));
          if (sendBtn) sendBtn.click();
        }
      });
      await new Promise(r => setTimeout(r, 2200));

      // Hover over AI response
      await moveCursorToCoords(page, 1650, 750, 500);
      await new Promise(r => setTimeout(r, 1600));

      // Close chat
      await page.evaluate(() => {
        if (window.__closeAIChat) window.__closeAIChat();
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: 10,
    title: 'Technical Documentation & Architecture Conclusion',
    narration: 'Finally, we navigate to the Technical Documentation page. Here, developers can explore the GraphBLAS matrix engine comparison versus traditional Vector RAG, inspect the complete ontology schema and node types, copy production-grade Cypher traversal queries, and review REST API endpoints. OrgMind turns passive company docs into an active, self-healing knowledge graph.',
    run: async (page, sceneDir, sceneDuration) => {
      await injectVirtualCursor(page);

      // Navigate to Docs via hook
      await page.evaluate(() => {
        if (window.__setViewMode) window.__setViewMode('docs');
      });
      await new Promise(r => setTimeout(r, 1400));
      await injectVirtualCursor(page);

      // Click Graph Schema tab
      await clickElementWithCursor(page, 'Graph Schema', 500);
      await new Promise(r => setTimeout(r, 1200));

      // Click Cypher Suite tab
      await clickElementWithCursor(page, 'Cypher Suite', 500);
      await new Promise(r => setTimeout(r, 1200));

      // Click API Gateway tab
      await clickElementWithCursor(page, 'API Gateway', 500);
      await new Promise(r => setTimeout(r, 1200));

      // Scroll smoothly back to header
      await smoothScroll(page, -600, 600);
      await new Promise(r => setTimeout(r, 800));
      await moveCursorToElement(page, 'ORGMIND', 500);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
];

async function main() {
  console.log('🚀 Starting Master Interactive OrgMind Working Demo Video Recording...');
  console.log('🎬 Features: Real-time 30 FPS Screencast, Glowing Amber Virtual Cursor, Live Clicks & Typing\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const sceneClips = [];

  for (const scene of scenes) {
    console.log(`\n🎬 Recording Scene ${scene.id}/${scenes.length}: ${scene.title}...`);
    const sceneDir = path.join(OUT_DIR, `scene_working_${scene.id}`);
    if (fs.existsSync(sceneDir)) {
      fs.rmSync(sceneDir, { recursive: true, force: true });
    }
    fs.mkdirSync(sceneDir, { recursive: true });

    // 1. Synthesize studio AI voiceover
    const txtPath = path.join(sceneDir, 'narration.txt');
    const aiffPath = path.join(sceneDir, 'audio.aiff');
    const wavPath = path.join(sceneDir, 'audio.wav');
    fs.writeFileSync(txtPath, scene.narration, 'utf-8');
    console.log(`   🎤 Synthesizing studio AI narration...`);
    execSync(`say -v Samantha -f "${txtPath}" -o "${aiffPath}"`);
    execSync(`"${FFMPEG_BIN}" -y -i "${aiffPath}" "${wavPath}" 2>/dev/null`);

    const duration = getAudioDuration(wavPath);
    console.log(`   ⏱️ Audio duration: ${duration.toFixed(2)}s`);

    // 2. Start CDP Screencast
    console.log(`   📹 Streaming real-time 30 FPS screencast from Chrome...`);
    const client = await page.target().createCDPSession();
    let frameIndex = 0;

    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      frameIndex++;
      const framePath = path.join(sceneDir, `frame_${String(frameIndex).padStart(5, '0')}.jpg`);
      fs.writeFileSync(framePath, Buffer.from(data, 'base64'));
      await client.send('Page.screencastFrameAck', { sessionId });
    });

    await client.send('Page.startScreencast', { format: 'jpeg', quality: 80, everyNthFrame: 2 });
    const startTime = Date.now();

    // 3. Execute live browser interactions
    try {
      await scene.run(page, sceneDir, duration);
    } catch (err) {
      console.warn(`   ⚠️ Scene ${scene.id} interaction warning:`, err.message);
    }

    // Wait until full narration audio duration has completed
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed < duration) {
      await new Promise(r => setTimeout(r, (duration - elapsed) * 1000));
    }

    await client.send('Page.stopScreencast');
    await client.detach();

    const actualFps = frameIndex / duration;
    console.log(`   📸 Captured ${frameIndex} frames (~${actualFps.toFixed(2)} FPS)`);

    // 4. Encode synchronized video clip
    console.log(`   🎞️ Encoding synchronized video clip...`);
    const sceneMp4 = path.join(OUT_DIR, `scene_working_${scene.id}.mp4`);
    const encCmd = `"${FFMPEG_BIN}" -y -framerate ${actualFps} -i "${sceneDir}/frame_%05d.jpg" -i "${wavPath}" -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${sceneMp4}" 2>/dev/null`;
    execSync(encCmd);

    sceneClips.push(sceneMp4);
    console.log(`   ✅ Scene ${scene.id} created: ${sceneMp4}`);
  }

  await browser.close();

  // 5. Concatenate all scenes into Master Video using robust filter_complex
  console.log('\n🎞️ Concatenating all 10 scenes into master working demo video...');
  const inputs = [];
  const filterParts = [];
  const concatInputs = [];

  for (let i = 0; i < sceneClips.length; i++) {
    inputs.push(`-i "${sceneClips[i]}"`);
    filterParts.push(`[${i}:v]fps=30,setpts=PTS-STARTPTS[v${i}];`);
    filterParts.push(`[${i}:a]asetpts=PTS-STARTPTS[a${i}];`);
    concatInputs.push(`[v${i}][a${i}]`);
  }

  const filterStr = filterParts.join('') + concatInputs.join('') + `concat=n=${sceneClips.length}:v=1:a=1[outv][outa]`;
  const finalVideo = path.join(OUT_DIR, 'orgmind_working_demo.mp4');
  const concatCmd = `"${FFMPEG_BIN}" -y ${inputs.join(' ')} -filter_complex "${filterStr}" -map "[outv]" -map "[outa]" -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac -b:a 192k "${finalVideo}" 2>/dev/null`;
  execSync(concatCmd);

  // Copy to frontend/public for instant streaming in browser
  const publicVideo = path.resolve(__dirname, '../frontend/public/orgmind_working_demo.mp4');
  fs.copyFileSync(finalVideo, publicVideo);

  // Copy to artifact directory
  const artifactVideo = '/Users/apple/.gemini/antigravity/brain/7b3faf02-be32-4ec1-9b5b-b61587652185/orgmind_working_demo.mp4';
  fs.copyFileSync(finalVideo, artifactVideo);

  const totalDur = getAudioDuration(finalVideo);
  const stats = fs.statSync(finalVideo);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n======================================================');
  console.log('🎉 MASTER WORKING DEMO VIDEO COMPLETE!');
  console.log(`📍 File Path: ${finalVideo}`);
  console.log(`⏱️ Total Duration: ${totalDur.toFixed(2)}s (~${(totalDur / 60).toFixed(2)} mins)`);
  console.log(`💾 File Size: ${sizeMB} MB`);
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('❌ Error recording demo video:', err);
  process.exit(1);
});
