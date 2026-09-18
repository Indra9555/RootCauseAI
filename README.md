# RootCauseAI
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**AI-Powered Software Failure Root-Cause Analysis & Incident Intelligence Platform**

RootCauseAI is a full-stack software observability and failure-analysis platform designed to help developers, DevOps engineers, and SRE teams understand **what failed, when it failed, how failures are related, which services are affected, and which service is the most probable root cause**.

Modern applications are often composed of multiple interconnected services. When one service or infrastructure component fails, it can generate a chain of secondary failures across the system. This makes manual root-cause investigation difficult and time-consuming.

RootCauseAI addresses this problem by combining:

- Telemetry ingestion
- Failure pattern detection
- Log intelligence
- Behavioral anomaly detection
- Temporal failure analysis
- Cross-service correlation
- Dependency analysis
- Automatic incident management
- Root-cause candidate scoring
- RCA evidence generation
- Service health monitoring
- Incident impact visualization
- Interactive service investigation
- Real-time dashboard updates

> The goal is not simply to display errors, but to transform raw telemetry into **structured and explainable failure intelligence**.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Problem Statement](#problem-statement)
- [Motivation](#motivation)
- [Objectives](#objectives)
- [Core Concept](#core-concept)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Failure Analysis Pipeline](#failure-analysis-pipeline)
- [Root Cause Analysis](#root-cause-analysis)
- [Anomaly Detection](#anomaly-detection)
- [Incident Management](#incident-management)
- [Dependency Analysis](#dependency-analysis)
- [Service Health](#service-health)
- [Frontend Dashboard](#frontend-dashboard)
- [Backend Architecture](#backend-architecture)
- [Database Architecture](#database-architecture)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development Environment](#development-environment)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Example Investigation](#example-investigation)
- [Design Principles](#design-principles)
- [Current Implementation Status](#current-implementation-status)
- [Future Enhancements](#future-enhancements)
- [Roadmap](#roadmap)
- [Why RootCauseAI?](#why-rootcauseai)
- [Academic Relevance](#academic-relevance)
- [Project Demonstration](#project-demonstration)
- [Project Information](#project-information)
- [Conclusion](#conclusion)

---

## Overview

RootCauseAI is designed around one central question:

> **When a software system starts failing, what is the most probable root cause and what evidence supports that conclusion?**

A traditional monitoring system may show:

```text
payment-service     ERROR
order-service       ERROR
user-service        ERROR
postgres            ERROR
```

However, simply selecting the service with the largest number of errors can lead to incorrect conclusions. A service may generate many errors because it is *affected by* another failure, rather than being the original source of the problem.

RootCauseAI therefore analyzes multiple signals before ranking root-cause candidates.

```
                 Raw Telemetry
                       │
                       ▼
              Failure Analysis
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Patterns       Anomalies      Incidents
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              Temporal Analysis
                       │
                       ▼
             Correlation Analysis
                       │
                       ▼
             Dependency Analysis
                       │
                       ▼
             RCA Candidate Scoring
                       │
                       ▼
              Candidate Ranking
                       │
                       ▼
             Probable Root Cause
                       │
                       ▼
            Evidence & Explanation
                       │
                       ▼
              Investigation UI
```

---

## Quick Start

Want to run RootCauseAI locally without reading the entire documentation? Follow the steps below.

### Prerequisites

Make sure the following tools are installed, then verify:

```bash
git --version
python --version
node --version
npm --version
docker --version
docker compose version
```

| Tool | Required |
|---|---|
| Git | ✔ |
| Python | 3.12+ |
| Node.js + npm | ✔ |
| Docker Desktop | ✔ |
| WSL 2 | ✔ |

### 1. Clone the Repository

```bash
git clone https://github.com/Indra9555/RootCauseAI.git
cd RootCauseAI
```

### 2. Start PostgreSQL

Make sure Docker Desktop is running, then:

```bash
docker compose up -d
docker ps
```

PostgreSQL should be available on `localhost:5432`.

### 3. Setup & Start the Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

| Endpoint | URL |
|---|---|
| Backend | http://127.0.0.1:8000 |
| Swagger Docs | http://127.0.0.1:8000/docs |
| Health Check | http://127.0.0.1:8000/api/health |

Expected health response:

```json
{
  "status": "healthy",
  "service": "RootCauseAI Backend"
}
```

### 4. Setup & Start the Frontend

```bash
cd RootCauseAI\frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`.

### 5. Run RootCauseAI

```
┌─────────────────────────────────────────┐
│              RootCauseAI                │
│                                         │
│  React + Vite                           │
│       │                                 │
│       ▼                                 │
│  FastAPI Backend                        │
│       │                                 │
│       ▼                                 │
│  PostgreSQL                             │
│       │                                 │
│       └── Docker                        │
└─────────────────────────────────────────┘
```

Once running, you can:

- View the dashboard
- Submit telemetry
- View logs
- Analyze failures
- Detect anomalies
- View incidents
- Inspect service health
- Explore dependencies
- Inspect RCA candidates
- View incident timelines
- Investigate affected services

### Quick Terminal Setup

RootCauseAI currently uses three running processes.

**Terminal 1 — Database**
```bash
docker compose up -d
```

**Terminal 2 — Backend**
```bash
cd RootCauseAI\backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

**Terminal 3 — Frontend**
```bash
cd RootCauseAI\frontend
npm install
npm run dev
```

Then open: `http://localhost:5173`

---

## Problem Statement

Modern software systems frequently contain multiple backend services, databases, APIs, message queues, external dependencies, infrastructure components, and inter-service communication. When one component fails, the failure can propagate through dependent services.

For example:

```
                 PostgreSQL
                /          \
               ▼            ▼
        user-service   payment-service
                              │
                              ▼
                        order-service
```

If PostgreSQL experiences a problem, the dependent services may begin producing errors:

```text
postgres            ERROR
payment-service     ERROR
user-service        ERROR
order-service       ERROR
```

The challenge is determining:

- Which failure is primary?
- Which failures are secondary?
- Which services are affected?
- Did unusual behavior occur?
- Which services failed first?
- Are the failures correlated?
- What dependency relationships exist?

RootCauseAI organizes these questions into a single investigation workflow.

---

## Motivation

Large volumes of logs do not automatically provide useful diagnostic information. An engineer may need to manually determine which service started failing first, which failures occurred in the same period, which services depend on each other, whether a service is behaving unusually, which failures are likely symptoms, whether an incident is already active, and which service has the strongest evidence of being the root cause.

RootCauseAI reduces this manual investigation by combining several analytical components, focusing on **evidence-based investigation** rather than a single error-count metric.

---

## Objectives

- Collect software telemetry through REST APIs
- Store telemetry persistently in PostgreSQL
- Analyze application failure patterns
- Identify frequently failing services
- Detect unusual service behavior
- Analyze the temporal order of failures
- Identify correlations between service failures
- Model service dependency relationships
- Automatically create and update incidents
- Rank probable root-cause candidates
- Provide RCA evidence and explanations
- Monitor service health
- Visualize service dependencies
- Analyze incident impact
- Connect incidents with affected services
- Provide service-level investigation tools
- Keep the dashboard continuously updated

---

## Core Concept

RootCauseAI separates several concepts that are often mixed together during manual troubleshooting:

```
                  Software Failure
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   Failure Pattern    Anomaly          Incident
      Detection       Detection        Detection
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                  Failure Analysis
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     Temporal       Correlation       Dependency
     Analysis        Analysis          Analysis
        └────────────────┼────────────────┘
                         ▼
                Candidate Scoring
                         │
                         ▼
                 Candidate Ranking
                         │
                         ▼
                Probable Root Cause
                         │
                         ▼
                  Evidence Chain
```

| Stage | Answers |
|---|---|
| Pattern Detection | What failures are occurring? |
| Anomaly Detection | Is the current behavior unusual compared with the service's recent history? |
| Temporal Analysis | Which service appears to have failed earlier? |
| Correlation Analysis | Which failures appear related? |
| Dependency Analysis | Which services depend on which other services? |
| Incident Management | Which failures belong to an incident? |
| Root Cause Analysis | Which service currently has the strongest combined evidence for being the probable root cause? |

---

## Key Features

### 🔹 Telemetry & Classification

**Telemetry Ingestion** — REST API for receiving application telemetry. A telemetry event contains a service, log level, message, and timestamp:

```json
{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z"
}
```

**Failure Classification** — Incoming telemetry is classified by log level (`ERROR`, `CRITICAL`), contributing to failure evidence used during RCA. `CRITICAL` events contribute higher failure evidence than `ERROR` events.

**Failure Pattern Detection** — Aggregates failures by service, tracking Error Count, Critical Count, and Total Failures:

```text
payment-service
Errors:          10
Critical:         3
Total failures:  13
```

**Log Intelligence** — A descriptive view of failure behavior: service failure frequency, repeated failure messages, failure concentration, and investigation signals. It answers *what failure patterns are visible*, but does not independently determine the root cause.

### 🔹 Time & Relationship Analysis

**Temporal Failure Analysis** — Analyzes the order in which failures occur:

```text
16:05:00  postgres           ERROR
16:05:06  payment-service    ERROR
16:05:12  order-service      ERROR
```

Temporal ordering is treated as **evidence**, not absolute proof of causality.

**Failure Correlation** — Identifies failures occurring in related time periods and groups related service activity. This differs from dependency analysis: correlation is based on *observed behavior*, dependency analysis on *known relationships*.

### 🔹 Behavioral Anomaly Detection

Instead of asking "how many failures occurred," RootCauseAI asks: *is this amount of failure activity unusual for this service compared with its recent history?*

**Current configuration:**

| Parameter | Value |
|---|---|
| Window size | 5 minutes |
| Historical baseline | 5 windows |
| Anomaly threshold | 2× baseline |
| High anomaly threshold | 4× baseline |
| Critical threshold | 6× baseline |

Example:

```text
Service:              payment-service
Historical baseline:  0.2 failures/window
Current window:       1 failure
Deviation:            5× baseline
Anomaly Score:        67
Severity:             HIGH
```

> **ANOMALY ≠ ROOT CAUSE** — an anomalous service may simply be a symptom of another service's failure.

**Anomaly & Incident Context** — Anomaly results are enriched with active incident information, distinguishing between:

- **Anomalous Service** — a service whose behavior is unusual
- **Affected Service Anomaly** — an anomalous service also affected by an active incident
- **Root-Cause Anomaly** — an anomalous service that is also the current RCA candidate

### 🔹 Incident Management

**Automatic Incident Management** — Incidents are managed automatically from observed failure activity, containing: ID, Title, Status, Severity, Started/Ended At, Root Cause, Confidence, RCA Score, Failure Count, Affected Services, Evidence, Recommendations, Explanation, Created At.

**Incident Lifecycle:**

```
Failure detected → Incident created → Incident updated
→ Additional events → RCA recalculated → Incident resolved
```

**Incident Events** — Individual events tied to an incident (Event ID, Type, Service, Message, Timestamp), allowing reconstruction of the observed sequence.

**Incident Timeline** — A dedicated frontend view showing sequence, event count, relative timing, first failure, latest event, classification, root-cause indication, duration, and summary:

```text
Incident Started
       ├── +0s   postgres ERROR
       ├── +6s   user-service ERROR
       ├── +12s  payment-service ERROR
       └── +19s  order-service ERROR
```

### 🔹 Root Cause Analysis Engine

The RCA engine does **not** simply select the service with the highest error count — it combines multiple signals:

```
Failure Evidence + Temporal Evidence + Correlation Evidence
+ Dependency Evidence + Dependency Bonus
= Combined RCA Score → Candidate Ranking → Probable Root Cause
```

**RCA Candidate Scoring example:**

| Rank | Service | RCA Score |
|---|---|---|
| 1 | order-service | 76 |
| 2 | inventory-service | 44 |
| 3 | payment-service | 44 |
| 4 | user-service | 38 |
| 5 | auth-service | 36 |

**RCA Confidence** — e.g. Probable Root Cause: `order-service`, RCA Score: `76`, Confidence: `HIGH`.

**RCA Evidence Chain** — instead of showing only `Root Cause: postgres`, the system exposes the contributing evidence (Failure, Temporal, Dependency) that produced the RCA Score.

### 🔹 Dependency Graph & Impact

**Dependency Graph** — maintains known service dependency relationships (e.g. `payment-service → postgres`), supporting scoring, visualization, impact analysis, and RCA path inspection. Only known relationships are represented — nothing is invented.

**Dependency Impact Analysis** — determines direct dependents, indirect affected services, impact radius, and active incident impact when a service is selected.

**RCA Path Inspector** — checks whether a selected service connects to the current root-cause candidate through the dependency graph, with states:

- `PRIMARY ROOT CAUSE`
- `RCA PATH CONNECTED`
- `NO DEPENDENCY PATH`
- `RCA UNAVAILABLE`

> A dependency path can support an RCA hypothesis, but a dependency relationship alone does not prove causality.

### 🔹 Service Health & Inspection

**Service Health Monitoring** — classifies services as `HEALTHY`, `DEGRADED`, or `CRITICAL` using failure, incident, and RCA information.

**Service Inspector** — a detailed investigation view combining Service Health, Failure Statistics, RCA Score, Dependency Score, Recent Logs, Failure Patterns, Correlations, Related Incidents, Dependencies/Dependents, RCA Breakdown, and Investigation Guidance.

**Incident ↔ Service Correlation** — two-way navigation:

```
Incident → Affected Service → Service Inspector
Service  → Related Incident  → Incident Investigation
```

### 🔹 Dashboard Components

- **Incident Command Center** — operational starting point summarizing active incidents, severity, status, root cause, affected services, and investigation actions.
- **Service Health Overview** — summarizes Healthy/Degraded/Critical services, highlighting higher-risk services.
- **Incident Impact Map** — an incident-centric view (`Incident → Impact`), distinct from the Dependency Graph (`Service → Dependency → Service`).
- **Real-Time Dashboard Updates** — polls the backend every **5 seconds**, silently refreshing Analysis, Logs, Log Intelligence, Incidents, Service Health, Anomalies, and Selected Incident Details without loading-spinner flicker.

---

## System Architecture

```
┌───────────────────────────────────────────────┐
│              Applications / Services          │
└───────────────────────┬───────────────────────┘
                        │ Telemetry
                        ▼
┌───────────────────────────────────────────────┐
│                 FastAPI API                   │
│ Telemetry │ Incidents │ Dependencies          │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│                  PostgreSQL                   │
│ Logs │ Incidents │ Incident Events            │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│                Analysis Layer                 │
│ Pattern Detection │ Log Intelligence          │
│ Anomaly Detection │ Temporal Analysis         │
│ Correlation Analysis │ Dependency Analysis    │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│              Root Cause Analysis              │
│ Candidate Scoring │ Candidate Ranking         │
│ Evidence Generation │ RCA Explanation         │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│                 React Frontend                │
│ Dashboard │ Services │ Incidents │ Logs        │
│ Analysis │ Incident Details                    │
└───────────────────────────────────────────────┘
```

---

## Failure Analysis Pipeline

```
1. Telemetry arrives
2. Telemetry is validated
3. Log is stored in PostgreSQL
4. Log severity is classified
5. Failure patterns are calculated
6. Log intelligence is generated
7. Behavioral anomalies are detected
8. Incident state is evaluated
9. Temporal failure ordering is analyzed
10. Related failures are correlated
11. Service dependencies are evaluated
12. RCA candidates are scored
13. Candidates are ranked
14. Probable root cause is selected
15. Evidence and explanation are generated
16. Dashboard displays investigation information
```

---

## Root Cause Analysis

RootCauseAI's RCA process combines multiple signals:

| Signal | Description |
|---|---|
| **Failure Evidence** | Observed failure activity (Error Count, Critical Count, Total Failures) |
| **Temporal Evidence** | Relative ordering of service failures — earlier activity contributes evidence |
| **Correlation Evidence** | Whether a service's failures occur alongside failures in other services |
| **Dependency Evidence** | Downstream failure relationships in the monitored dependency graph |

For example, `payment-service` depends on `postgres`, so PostgreSQL can have downstream impact.

```
Failure + Temporal + Correlation + Dependency + Bonus = RCA Candidate Score
```

Candidates are then ranked to select the probable root cause.

---

## Anomaly Detection

The anomaly detector works using fixed time windows:

```
Historical Logs → Time Windows → Historical Baseline
→ Current Window → Deviation Ratio → Anomaly Classification
```

Classifications: `NORMAL`, `MEDIUM`, `HIGH`, `CRITICAL`.

Example:

```text
Baseline = 0.2
Current  = 1
Ratio    = 1 / 0.2 = 5×
Classification = HIGH
```

The anomaly engine is intentionally kept separate from the RCA engine.

---

## Incident Management

```
Telemetry → Failure Activity → Incident Detection
→ Incident Creation / Update → RCA Analysis → Incident Context
```

This allows the dashboard to show not only individual failures but the incident they belong to.

---

## Dependency Analysis

Dependency analysis provides structural information about the monitored system, e.g.:

```
payment-service → postgres
user-service    → postgres
```

These relationships are used by RCA scoring, dependency visualization, impact analysis, and RCA path inspection. When dependency-aware telemetry is available, observed relationships can also be incorporated into the model.

---

## Service Health

```
Healthy   → Normal activity
Degraded  → Increased failure activity
Critical  → Significant active failure/incident impact
```

Available in the Dashboard and Service Inspector.

---

## Frontend Dashboard

Major areas: **Dashboard, Services, Incidents, Logs, Analysis, Incident Details.**

The Dashboard combines the Incident Command Center, Service Health Overview, RCA Evidence Chain, Incident Impact Map, Anomaly & Early Warning, Root Cause information, Failure analysis, and Service risk information.

---

## Backend Architecture

```
API Layer → Incident / Service Layer → Analysis Layer → Database Layer
```

| Layer | Responsible for |
|---|---|
| **API Layer** | Telemetry ingestion/retrieval, analysis, incident, dependency, and anomaly endpoints |
| **Analysis Layer** | Failure patterns, log intelligence, anomaly detection, temporal analysis, correlation, dependency analysis, candidate scoring, RCA explanation |
| **Incident Layer** | Incident creation, updates, lifecycle, event storage |
| **Database Layer** | PostgreSQL connection, SQLAlchemy models, persistent data access |

---

## Database Architecture

RootCauseAI currently uses **PostgreSQL** with three major entities: `logs`, `incidents`, `incident_events`.

**Logs** — `id, service, level, message, timestamp`

**Incidents** — `id, incident_id, title, status, severity, started_at, ended_at, root_cause, confidence, rca_score, failure_count, affected_services, evidence, recommendations, explanation, created_at`

**Incident Events** — `id, incident_id, event_type, service, message, timestamp, created_at`

---

## API Reference

Local backend URL: `http://127.0.0.1:8000` · Swagger docs: `http://127.0.0.1:8000/docs`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check |
| POST | `/api/telemetry/logs` | Ingest a telemetry log |
| GET | `/api/telemetry/logs` | Retrieve logs |
| GET | `/api/telemetry/intelligence` | Get log intelligence |
| GET | `/api/telemetry/analysis` | Get RCA analysis (patterns, temporal analysis, correlations, dependency scores, candidates, evidence, explanation) |
| GET | `/api/telemetry/anomalies` | Get anomaly information |
| GET | `/api/incidents` | List incidents |
| GET | `/api/incidents/{incident_id}` | Get incident details |
| GET | `/api/incidents/{incident_id}/analysis` | Get incident analysis |
| GET | `/api/incidents/{incident_id}/events` | Get incident events |
| GET | `/api/dependencies` | Get dependency map |

**Health Check example:**

```json
{
  "status": "healthy",
  "service": "RootCauseAI Backend"
}
```

**Store Telemetry example:**

```json
{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z"
}
```

With dependency-aware telemetry enabled, a `target_service` can be included:

```json
{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z",
  "target_service": "postgres"
}
```

**Anomaly Information example:**

```json
{
  "status": "ok",
  "window_minutes": 5,
  "baseline_windows": 5,
  "anomaly_count": 1,
  "anomalies": [
    {
      "service": "payment-service",
      "baseline_failures": 0.2,
      "current_failures": 1,
      "deviation_ratio": 5.0,
      "anomaly_score": 67,
      "severity": "HIGH",
      "is_anomaly": true
    }
  ]
}
```

---

## Project Structure

```text
RootCauseAI/
│
├── backend/
│   ├── analysis/
│   │   ├── anomaly_detector.py
│   │   ├── candidate_detector.py
│   │   ├── dependency_graph.py
│   │   ├── log_analysis_service.py
│   │   ├── log_classifier.py
│   │   ├── message_correlator.py
│   │   ├── pattern_detector.py
│   │   ├── root_cause_explainer.py
│   │   ├── service_health.py
│   │   └── temporal_detector.py
│   │
│   ├── api/
│   │   ├── routes/
│   │   │   └── telemetry.py
│   │   ├── incidents/
│   │   │   └── routes.py
│   │   └── dependencies/
│   │       └── routes.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   └── models.py
│   │
│   ├── incidents/
│   │   └── incident_service.py
│   │
│   ├── schemas/
│   │   └── telemetry.py
│   │
│   ├── detector/
│   │   └── incident_detector.py
│   │
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── DependencyGraph.jsx
│       ├── DependencyGraph.css
│       ├── IncidentCommandCenter.jsx
│       ├── IncidentCommandCenter.css
│       ├── IncidentImpactMap.jsx
│       ├── IncidentImpactMap.css
│       ├── IncidentTimeline.jsx
│       ├── IncidentTimeline.css
│       ├── RcaEvidenceChain.jsx
│       ├── ServiceHealthOverview.jsx
│       ├── ServiceHealthOverview.css
│       ├── ServiceDrilldown.css
│       ├── AnomalyEarlyWarning.jsx
│       └── AnomalyEarlyWarning.css
│
├── README.md
└── ...
```

> The structure may evolve as the project continues to develop.

---

## Technology Stack

**Frontend**

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development and build tooling |
| JavaScript | Frontend application logic |
| Axios | REST API communication |
| CSS | Interface styling |
| SVG | Dependency graph visualization |

**Backend**

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| SQLAlchemy | ORM and database access |
| Pydantic | Request/data validation |

**Database**

| Technology | Purpose |
|---|---|
| PostgreSQL | Persistent telemetry and incident storage |

**Infrastructure**

| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Local infrastructure management |
| WSL 2 | Linux environment support |
| Git | Version control |
| GitHub | Repository hosting |

---

## Development Environment

| Component | Detail |
|---|---|
| Operating System | Windows |
| Backend | Python 3.12+ |
| Frontend | Node.js + npm |
| Database | PostgreSQL |
| Infrastructure | Docker + WSL 2 |
| Editor | Visual Studio Code (or any compatible IDE) |

---

## Prerequisites

- Python 3.12+
- Node.js
- npm
- Git
- Docker Desktop
- Docker Compose
- WSL 2

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Indra9555/RootCauseAI.git
cd RootCauseAI
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Database Setup

```bash
docker compose up -d
docker ps
```

> The PostgreSQL container should be running before starting the backend.

### 4. Start Backend

```bash
cd RootCauseAI/backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

- Backend: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

### 5. Start Frontend

```bash
cd RootCauseAI\frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## Testing

**Health Check**

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

```text
status   service
------   -------
healthy  RootCauseAI Backend
```

**Test Telemetry**

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri http://127.0.0.1:8000/api/telemetry/logs `
  -ContentType "application/json" `
  -Body '{
    "service":"payment-service",
    "level":"ERROR",
    "message":"Database connection timeout",
    "timestamp":"2026-09-11T16:05:00Z"
  }'
```

**Test RCA**

```powershell
Invoke-RestMethod `
  http://127.0.0.1:8000/api/telemetry/analysis |
  ConvertTo-Json -Depth 10
```

**Test Anomaly Detection**

```powershell
Invoke-RestMethod `
  http://127.0.0.1:8000/api/telemetry/anomalies |
  ConvertTo-Json -Depth 10
```

```json
{
  "status": "ok",
  "window_minutes": 5,
  "baseline_windows": 5,
  "anomaly_count": 1
}
```

**Test Dependency Analysis**

```powershell
Invoke-RestMethod `
  http://127.0.0.1:8000/api/dependencies |
  ConvertTo-Json -Depth 10
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| **Docker is not running** | Make sure Docker Desktop is open. Check with `docker ps`. |
| **Virtual environment won't activate** | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, then `.\venv\Scripts\Activate.ps1` |
| **Backend can't connect to PostgreSQL** | Confirm container is running (`docker ps`, `docker compose ps`); restart with `docker compose restart` if needed |
| **Frontend can't connect to backend** | Verify `http://127.0.0.1:8000/api/health` works, then restart the frontend dev server |
| **Port already in use** | Default ports: Frontend `5173`, Backend `8000`, PostgreSQL `5432`. Stop the conflicting process or reconfigure the port. |

---

## Example Investigation

Consider a distributed system:

```
                 postgres
                /        \
               ▼          ▼
        user-service   payment-service
                            │
                            ▼
                       order-service
```

Suppose the following events are observed:

```text
16:05:00  postgres           ERROR
16:05:06  payment-service    ERROR
16:05:12  order-service      ERROR
```

RootCauseAI processes the telemetry through the following stages:

1. **Telemetry Storage** — events are stored in PostgreSQL
2. **Failure Pattern Detection** — service-level failure activity is calculated
3. **Anomaly Detection** — recent activity is compared against historical baselines
4. **Temporal Analysis** — failure ordering is examined
5. **Correlation** — related failure activity is analyzed
6. **Dependency Analysis** — known/observed dependencies are evaluated (`payment-service → postgres`)
7. **Candidate Scoring** — Failure + Temporal + Correlation + Dependency Evidence → RCA Score
8. **Candidate Ranking** — services ranked by combined evidence
9. **Investigation** — the dashboard surfaces Root Cause, Evidence, Affected Services, Service Health, Dependency Context, Incident Timeline, and Anomaly Information

The engineer can then move from the incident to affected services and back to related incidents.

---

## Design Principles

1. **Evidence Over Assumptions** — RCA decisions are backed by evidence rather than unsupported conclusions.
2. **Anomaly Does Not Equal Root Cause** — a service can behave unusually because it's affected by another failure (`Anomaly ≠ Root Cause`).
3. **Dependency Does Not Prove Causality** — a dependency indicates a possible propagation path, not proof.
4. **Multiple Signals** — RCA considers Failure, Temporal, Correlation, Dependency, and Incident Context together.
5. **Explainability** — the system aims to answer *why* a service was selected, not just *which* one.
6. **Modularity** — each analytical capability (Anomaly Detection, Pattern Detection, Temporal Analysis, Correlation, Dependency Analysis, RCA) is a separate, independently testable module.
7. **No Artificial Dependencies** — the dependency graph represents only known or observed relationships.

---

## Current Implementation Status

**Telemetry**
- [x] Telemetry ingestion API
- [x] Request validation
- [x] PostgreSQL persistence
- [x] Telemetry retrieval
- [x] Dependency-aware telemetry support

**Failure Analysis**
- [x] Log classification
- [x] Failure pattern detection
- [x] Log intelligence
- [x] Temporal analysis
- [x] Cross-service correlation

**Anomaly Detection**
- [x] Time-window based detection
- [x] Historical baseline calculation
- [x] Deviation ratio
- [x] Anomaly scoring
- [x] Severity classification
- [x] Incident context
- [x] Frontend integration

**Root Cause Analysis**
- [x] Candidate scoring
- [x] Failure scoring
- [x] Temporal scoring
- [x] Correlation scoring
- [x] Dependency scoring
- [x] Candidate ranking
- [x] Root-cause selection
- [x] RCA confidence
- [x] Evidence chain
- [x] RCA explanation

**Incident Management**
- [x] Automatic incident creation
- [x] Incident updates
- [x] Incident lifecycle
- [x] Incident events
- [x] Incident timeline
- [x] Incident analysis

**Service Analysis**
- [x] Service health
- [x] Service Inspector
- [x] Dependency graph
- [x] Dependency impact analysis
- [x] RCA Path Inspector
- [x] Incident ↔ Service correlation
- [x] Service → Incident navigation

**Dashboard**
- [x] Dashboard
- [x] Incident Command Center
- [x] Service Health Overview
- [x] RCA Evidence Chain
- [x] Incident Impact Map
- [x] Anomaly & Early Warning
- [x] Logs page
- [x] Services page
- [x] Incidents page
- [x] Analysis page
- [x] Incident Details page
- [x] Real-time polling

---

## Future Enhancements

1. **Anomaly History** — track anomaly state over time (`NORMAL → MEDIUM → HIGH`) to detect `NEW ANOMALY`, `PERSISTENT ANOMALY`, `WORSENING`, `IMPROVING`, and `RAPID ESCALATION` patterns.
2. **AI Investigation Recommendations** — a future AI layer consuming structured evidence to generate investigation steps (e.g. check DB connectivity, inspect error logs, review connection pool usage).
3. **Real-Time Metrics** — incorporate CPU, memory, request rate, response latency, error rate, and database performance signals.
4. **Distributed Tracing** — trace request flow (`Client → API Gateway → Order Service → Payment Service → Database`) to strengthen dependency and propagation analysis.
5. **Automatic Dependency Discovery** — learn relationships from observed service communication rather than relying only on predefined links.
6. **Failure Scenario Simulator** — generate controlled failure scenarios (e.g. a simulated database failure) to demonstrate the full pipeline.
7. **Historical Incident Analytics** — incident trends, root-cause frequency, severity distribution, MTTD, MTTR.
8. **Reliability Metrics** — availability, error rate, failure rate, service reliability, incident frequency.
9. **Automated Testing** — test coverage for RCA scoring, anomaly detection, dependency analysis, incident lifecycle, and API/frontend workflows.
10. **Production Deployment** — Dockerized frontend/backend, environment-based configuration, DB migrations, CI/CD, monitoring, cloud deployment.

---

## Roadmap

```
Phase 1  — Telemetry & Persistence
Phase 2  — Failure Analysis
Phase 3  — Incident Management
Phase 4  — Root Cause Analysis
Phase 5  — Dependency & Impact Analysis
Phase 6  — Behavioral Anomaly Detection
Phase 7  — Dependency-Aware Telemetry
Phase 8  — Multi-Signal Metrics
Phase 9  — AI Investigation Recommendations
Phase 10 — Distributed Tracing
Phase 11 — Failure Simulation
Phase 12 — Historical Analytics
Phase 13 — Reliability Engineering
Phase 14 — Production Deployment
```

---

## Why RootCauseAI?

RootCauseAI is not intended to be just another log dashboard. A basic log dashboard answers *"What errors occurred?"* RootCauseAI attempts to provide a complete investigation workflow:

```
What happened? → What is failing? → Is the behavior unusual?
→ Which failures are related? → Which service failed earlier?
→ How are services connected? → Which services are affected?
→ What is the probable root cause? → Why was it selected?
→ What should the engineer investigate?
```

This investigation-oriented architecture is the central idea behind the project.

---

## Academic Relevance

RootCauseAI combines concepts from multiple Computer Science domains:

| Domain | Concepts Applied |
|---|---|
| **Software Engineering** | Modular architecture, REST API development, service-oriented design, failure analysis, component separation |
| **Database Systems** | PostgreSQL, relational data storage, database modeling, ORM-based persistence, query-based analysis |
| **Artificial Intelligence** | Behavioral anomaly detection, candidate ranking, evidence-based analysis, future AI-assisted investigation |
| **Distributed Systems** | Service dependencies, failure propagation, cross-service correlation, distributed incident analysis |
| **Data Analysis** | Aggregation, time-window analysis, baseline calculation, deviation measurement, candidate scoring |
| **DevOps / SRE** | Observability, incident management, service health, failure investigation, reliability analysis |

---

## Project Demonstration

A typical project demonstration follows this workflow:

1. Start PostgreSQL
2. Start FastAPI backend
3. Start React frontend
4. Send telemetry
5. Logs appear in the system
6. Failure patterns are calculated
7. Anomaly detection runs
8. Incident is created/updated
9. Temporal analysis runs
10. Failures are correlated
11. Dependencies are evaluated
12. RCA candidates are ranked
13. Root cause is displayed
14. Evidence is displayed
15. Affected services are inspected
16. Incident timeline is reviewed

This demonstrates RootCauseAI as an integrated platform rather than a collection of unrelated features.

---

## Project Information

| Property | Details |
|---|---|
| **Project Name** | RootCauseAI |
| **Project Type** | Full-Stack Software Engineering Project |
| **Category** | Software Observability / Root-Cause Analysis / Reliability Engineering |
| **Architecture** | Full-Stack Web Application |
| **Frontend** | React + Vite |
| **Backend** | FastAPI + Python |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy |
| **Infrastructure** | Docker + WSL 2 |
| **Version Control** | Git + GitHub |
| **Development Status** | Active Development |

---

## Conclusion

RootCauseAI is a full-stack software failure investigation platform designed to make distributed-system troubleshooting more structured and explainable. The platform combines:

```
Telemetry → Failure Analysis → Anomaly Detection → Incident Management
→ Temporal Analysis → Correlation → Dependency Analysis → Root Cause Analysis
→ Evidence → Investigation Dashboard
```

The central principle of the project is:

> **The service producing the most errors is not necessarily the service that caused the failure.**

By combining multiple sources of evidence, RootCauseAI identifies probable root causes while showing the surrounding incident, service, dependency, and anomaly context. The long-term goal is to evolve RootCauseAI into a more complete intelligent observability platform capable of detecting abnormal behavior, analyzing failure propagation, explaining probable root causes, recommending investigation actions, and supporting engineers throughout the incident lifecycle.

### Built With

React · Vite · JavaScript · Axios · CSS · Python · FastAPI · Uvicorn · SQLAlchemy · Pydantic · PostgreSQL · Docker · Docker Compose · WSL 2 · Git · GitHub

### Status

**🟢 Active Development** — RootCauseAI is continuously being extended with additional failure-analysis, observability, visualization, intelligence, and reliability capabilities.
