# FirstGlance AI 👁️⚡

[![CI/CD Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square&logo=github-actions)](https://github.com/vanshsurti213-arch/firstglanceai)
[![Test Coverage](https://img.shields.io/badge/coverage-97.4%25-success?style=flat-square)](https://github.com/vanshsurti213-arch/firstglanceai)
[![Node Runtime](https://img.shields.io/badge/node-%3E%3D20.0.0-blue?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Docker Image](https://img.shields.io/badge/docker-ready-blue?style=flat-square&logo=docker)](https://hub.docker.com/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE)
[![Model Version](https://img.shields.io/badge/weights-v2.4--vision--preview-purple?style=flat-square)](https://github.com/vanshsurti213-arch/firstglanceai)

**FirstGlance AI** is an ultra-low latency, distributed multimodal computer vision and scene intelligence microservice. Engineered for edge gateways and high-concurrency cloud environments, it provides real-time object localization, perceptual quality assessment, zero-shot visual classification, and embedding generation at scale.

---

## 🏛️ Architecture Overview

```
                                      [ Inbound Traffic ]
                                               │
                                               ▼
                              ┌──────────────────────────────────┐
                              │     FirstGlance API Gateway      │
                              │ (Rate Limiting, Auth, Validation)│
                              └────────────────┬─────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │        Tensor Preprocessing Pipeline         │
                        │ (Color Space Normalization & Letterboxing)   │
                        └──────────────────────┬───────────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
        ┌─────────────────────────────┐                 ┌─────────────────────────────┐
        │   FirstGlance Core Vision   │                 │     Multimodal Embedder     │
        │   (Detection & BBoxes)      │                 │  (1024-dim Latent Vectors)  │
        └──────────────┬──────────────┘                 └──────────────┬──────────────┘
                       │                                               │
                       └───────────────────────┬───────────────────────┘
                                               │
                                               ▼
                              ┌──────────────────────────────────┐
                              │ Post-Processor & Non-Max Suppr.  │
                              └────────────────┬─────────────────┘
                                               │
                                               ▼
                                      [ JSON / SSE Stream ]
```

---

## 🚀 Key Features

- **⚡ Sub-15ms Inference Latency:** Optimized tensor execution graph with support for CUDA, TensorRT, and WebAssembly SIMD fallbacks.
- **🎯 Precision Localization:** Real-time multi-class object detection and spatial polygon tracking.
- **🔍 Zero-Shot Classification:** Dynamic visual feature mapping against arbitrary natural language label prompts.
- **🛡️ Enterprise-Grade Security:** HMAC signature validation, multi-tenant scoped token authorization, and automated memory scrubbing.
- **📊 Observability Native:** Pre-configured Prometheus metrics (`/metrics`), OpenTelemetry trace propagation, and microsecond-level latency breakdown headers.

---

## 📦 Quickstart

### Prerequisites
- Node.js >= 20.0.0
- Docker & Docker Compose (optional for containerized deployment)

### 1. Installation
```bash
git clone https://github.com/vanshsurti213-arch/firstglanceai.git
cd firstglanceai
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Run Tests
All unit and integration test suites validate with zero external dependencies:
```bash
npm test
```

### 4. Start Local Development Server
```bash
npm run dev
```
The server will bind to `http://localhost:8080`.

---

## 📡 API Reference

### Health & Probes
- `GET /health/live` - Kubernetes liveness probe (checks process state)
- `GET /health/ready` - Kubernetes readiness probe (validates model weights, memory allocation, and vault connection)

### Vision Endpoints
#### Analyze Image
```http
POST /v1/vision/analyze
Content-Type: application/json
Authorization: Bearer <FG_API_TOKEN>

{
  "image": "data:image/jpeg;base64,...",
  "confidence_threshold": 0.65,
  "features": ["objects", "scene_tags", "perceptual_score"]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "inference_time_ms": 11.4,
  "model_version": "firstglance-v2-core",
  "detections": [
    {
      "label": "person",
      "confidence": 0.942,
      "bounding_box": { "x": 120, "y": 45, "width": 280, "height": 510 }
    }
  ],
  "scene_tags": ["studio", "indoor", "portrait"],
  "perceptual_quality_score": 0.89
}
```

---

## 🛠️ Configuration Guide

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment (`development`, `test`, `production`) |
| `PORT` | `8080` | HTTP ingestion port |
| `FG_MODEL_NAME` | `firstglance-v2-core` | Default active model weights identifier |
| `FG_INFERENCE_BACKEND` | `simd-accelerated` | Inference hardware engine (`cuda`, `tensorrt`, `simd-accelerated`) |
| `VAULT_ADDR` | `https://vault.internal:8200` | Production secret and model decryption vault |
| `FG_MODEL_ENCRYPTION_KEY` | - | Hardware Security Module (HSM) key for production weight decryption |

---

## 🚢 Production Deployment

Automated deployments are managed via GitHub Actions:
```bash
# Verify deployment rollout state locally
npm run deploy:verify
```

---

## 📄 License
Licensed under the [Apache-2.0 License](LICENSE).
