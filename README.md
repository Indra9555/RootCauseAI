Yes — this is a good addition, and your current README is already detailed enough. I would not rewrite the whole README. We should add a clearly visible Quick Start section near the top and keep the detailed setup later.

One important correction: your current Docker setup runs PostgreSQL, while FastAPI and React are started separately. So the Quick Start should reflect the project as it actually works rather than falsely claiming everything starts with one Docker command.

1. Add this to the Table of Contents

Put this after Overview:

- [Quick Start](#quick-start)

So the beginning becomes:

# Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Problem Statement](#problem-statement)
- [Motivation](#motivation)
- [Objectives](#objectives)
...
2. Add this section after # Overview
# Quick Start

Want to run RootCauseAI locally without reading the entire documentation?

Follow the steps below.

## Prerequisites

Make sure the following tools are installed:

- Git
- Python 3.12+
- Node.js
- npm
- Docker Desktop
- WSL 2

Verify the installations:

```powershell
git --version
python --version
node --version
npm --version
docker --version
docker compose version
1. Clone the Repository

Clone the project from GitHub:

git clone https://github.com/Indra9555/RootCauseAI.git

Move into the project directory:

cd RootCauseAI
2. Start PostgreSQL

Make sure Docker Desktop is running.

Start the PostgreSQL infrastructure:

docker compose up -d

Verify that the container is running:

docker ps

PostgreSQL should be available on:

localhost:5432
3. Setup the Backend

Open a terminal in the project directory and run:

cd backend

Create a Python virtual environment:

python -m venv venv

Activate the virtual environment:

.\venv\Scripts\Activate.ps1

Install the required Python packages:

pip install -r requirements.txt
4. Start the Backend

From the backend directory:

uvicorn main:app --reload

The FastAPI backend will start at:

http://127.0.0.1:8000

API documentation is available at:

http://127.0.0.1:8000/docs

You can verify that the backend is working by opening:

http://127.0.0.1:8000/api/health

Expected response:

{
  "status": "healthy",
  "service": "RootCauseAI Backend"
}
5. Setup the Frontend

Open a new terminal.

Navigate to the frontend:

cd RootCauseAI\frontend

Install the frontend dependencies:

npm install

Start the Vite development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

Open this address in your browser.

6. Run RootCauseAI

Once all three components are running:

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

You should now be able to:

View the RootCauseAI dashboard.
Submit telemetry.
View logs.
Analyze failures.
Detect anomalies.
View active incidents.
Inspect service health.
Explore dependencies.
Inspect RCA candidates.
View incident timelines.
Investigate affected services.
Quick Terminal Setup

For convenience, RootCauseAI requires three running processes.

Terminal 1 — Database
docker compose up -d
Terminal 2 — Backend
cd RootCauseAI\backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
Terminal 3 — Frontend
cd RootCauseAI\frontend
npm install
npm run dev

Then open:

http://localhost:5173
Troubleshooting
Docker is not running

Make sure Docker Desktop is open and running.

Check:

docker ps
Python virtual environment cannot be activated

Try:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then:

.\venv\Scripts\Activate.ps1
Backend cannot connect to PostgreSQL

Make sure the PostgreSQL container is running:

docker ps

Then check:

docker compose ps

If necessary, restart the database:

docker compose restart
Frontend cannot connect to the backend

Make sure FastAPI is running:

http://127.0.0.1:8000/api/health

If the health endpoint works, restart the frontend development server.

Port already in use

RootCauseAI normally uses:

Frontend:   5173
Backend:    8000
PostgreSQL: 5432

If one of these ports is already occupied, stop the process using the port or configure the corresponding service to use another port.

First Run Checklist

Before opening the dashboard, confirm:

[ ] Git installed
[ ] Python installed
[ ] Node.js installed
[ ] npm installed
[ ] Docker Desktop running
[ ] WSL 2 available
[ ] PostgreSQL container running
[ ] Backend running
[ ] Frontend running
[ ] http://127.0.0.1:8000/api/health working
[ ] http://localhost:5173 accessible

Once these checks pass, RootCauseAI is ready for local use.


---

## 3. One more improvement I strongly recommend

Your current README says:

```markdown
# Installation

and then later has:

# Running the Project

That's fine for detailed documentation, but after adding Quick Start you'll have some duplicated commands.

That's actually okay because they serve different purposes:

Quick Start

"I just cloned this. How do I get it running?"

Installation / Running the Project

"I need detailed setup and troubleshooting information."

That's how I'd structure a professional GitHub README.

And eventually we can make it even easier

Right now:

Clone
 ↓
Install Python
 ↓
Install Node
 ↓
Install Docker
 ↓
Create venv
 ↓
pip install
 ↓
docker compose
 ↓
uvicorn
 ↓
npm install
 ↓
npm run dev

The next deployment/DevOps upgrade could turn this into:

git clone
    ↓
docker compose up
    ↓
RootCauseAI running

by containerizing the FastAPI + React + PostgreSQL stack together.

I would not do that yet, though. First we should make sure your current requirements.txt, docker-compose.yml, environment configuration, and frontend API configuration are clone-safe. That's what determines whether your friend can genuinely clone the repo and run it without your machine-specific settings.

give full readme 

Absolutely. Here is the complete GitHub-ready README.md, combining your current README with the Quick Start section and keeping the project description aligned with what RootCauseAI actually implements.

# RootCauseAI

### AI-Powered Software Failure Root-Cause Analysis & Incident Intelligence Platform

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

The goal is not simply to display errors, but to transform raw telemetry into **structured and explainable failure intelligence**.

---

# Table of Contents

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
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Example Investigation](#example-investigation)
- [Design Principles](#design-principles)
- [Current Implementation Status](#current-implementation-status)
- [Future Enhancements](#future-enhancements)
- [Roadmap](#roadmap)
- [Academic Relevance](#academic-relevance)
- [Project Demonstration](#project-demonstration)
- [Conclusion](#conclusion)

---

# Overview

RootCauseAI is designed around one central question:

> **When a software system starts failing, what is the most probable root cause and what evidence supports that conclusion?**

A traditional monitoring system may show:

```text
payment-service     ERROR
order-service       ERROR
user-service        ERROR
postgres            ERROR

However, simply selecting the service with the largest number of errors can lead to incorrect conclusions.

A service may generate many errors because it is affected by another failure, rather than being the original source of the problem.

RootCauseAI therefore analyzes multiple signals before ranking root-cause candidates.

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
Quick Start

Want to run RootCauseAI locally without reading the entire documentation?

Follow the steps below.

Prerequisites

Make sure the following tools are installed:

Git
Python 3.12+
Node.js
npm
Docker Desktop
WSL 2

Verify the installations:

git --version
python --version
node --version
npm --version
docker --version
docker compose version
1. Clone the Repository

Clone the project from GitHub:

git clone https://github.com/Indra9555/RootCauseAI.git

Move into the project directory:

cd RootCauseAI
2. Start PostgreSQL

Make sure Docker Desktop is running.

Start the PostgreSQL infrastructure:

docker compose up -d

Verify that the container is running:

docker ps

PostgreSQL should be available on:

localhost:5432
3. Setup the Backend

Open a terminal in the project directory:

cd backend

Create a Python virtual environment:

python -m venv venv

Activate the virtual environment:

.\venv\Scripts\Activate.ps1

Install the backend dependencies:

pip install -r requirements.txt
4. Start the Backend

From the backend directory:

uvicorn main:app --reload

The FastAPI backend will start at:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/api/health

Expected response:

{
  "status": "healthy",
  "service": "RootCauseAI Backend"
}
5. Setup the Frontend

Open a new terminal.

Navigate to the frontend:

cd RootCauseAI\frontend

Install frontend dependencies:

npm install

Start the Vite development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

Open this address in a browser.

6. Run RootCauseAI

Once the database, backend, and frontend are running:

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

You can now:

View the dashboard
Submit telemetry
View logs
Analyze failures
Detect anomalies
View incidents
Inspect service health
Explore dependencies
Inspect RCA candidates
View incident timelines
Investigate affected services
Quick Terminal Setup

RootCauseAI currently uses three running processes.

Terminal 1 — Database
docker compose up -d
Terminal 2 — Backend
cd RootCauseAI\backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
Terminal 3 — Frontend
cd RootCauseAI\frontend
npm install
npm run dev

Then open:

http://localhost:5173
Problem Statement

Modern software systems frequently contain:

Multiple backend services
Databases
APIs
Message queues
External dependencies
Infrastructure components
Inter-service communication

When one component fails, the failure can propagate through dependent services.

For example:

                 PostgreSQL
                /          \
               ▼            ▼
        user-service   payment-service
                              │
                              ▼
                        order-service

If PostgreSQL experiences a problem, the dependent services may begin producing errors.

The resulting telemetry could look like:

postgres            ERROR
payment-service     ERROR
user-service        ERROR
order-service       ERROR

The challenge is determining:

Which failure is primary?
Which failures are secondary?
Which services are affected?
Did unusual behavior occur?
Which services failed first?
Are the failures correlated?
What dependency relationships exist?

RootCauseAI attempts to organize these questions into a single investigation workflow.

Motivation

Large volumes of logs do not automatically provide useful diagnostic information.

An engineer may need to manually determine:

Which service started failing first?
Which failures occurred during the same period?
Which services depend on each other?
Is a service behaving unusually?
Which failures are likely symptoms?
Is there already an active incident?
Which service has the strongest evidence for being the root cause?

RootCauseAI reduces this manual investigation by combining several analytical components.

The platform focuses on evidence-based investigation rather than a single error-count metric.

Objectives

The main objectives of RootCauseAI are:

Collect software telemetry through REST APIs.
Store telemetry persistently in PostgreSQL.
Analyze application failure patterns.
Identify frequently failing services.
Detect unusual service behavior.
Analyze the temporal order of failures.
Identify correlations between service failures.
Model service dependency relationships.
Automatically create and update incidents.
Rank probable root-cause candidates.
Provide RCA evidence and explanations.
Monitor service health.
Visualize service dependencies.
Analyze incident impact.
Connect incidents with affected services.
Provide service-level investigation tools.
Keep the dashboard continuously updated.
Core Concept

RootCauseAI separates several concepts that are often mixed together during manual troubleshooting.

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

Each stage has a separate purpose.

Pattern Detection

Answers:

What failures are occurring?

Anomaly Detection

Answers:

Is the current behavior unusual compared with the service's recent history?

Temporal Analysis

Answers:

Which service appears to have failed earlier?

Correlation Analysis

Answers:

Which failures appear related?

Dependency Analysis

Answers:

Which services depend on which other services?

Incident Management

Answers:

Which failures belong to an incident?

Root Cause Analysis

Answers:

Which service currently has the strongest combined evidence for being the probable root cause?

Key Features
1. Telemetry Ingestion

RootCauseAI provides a REST API for receiving application telemetry.

A telemetry event contains:

Service
Log Level
Message
Timestamp

Example:

{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z"
}

The event is stored in PostgreSQL for further analysis.

2. Failure Classification

Incoming telemetry is classified according to its log level.

Currently important failure levels include:

ERROR
CRITICAL

The severity contributes to the failure evidence used during root-cause analysis.

ERROR
   ↓
Failure evidence

CRITICAL
   ↓
Higher failure evidence
3. Failure Pattern Detection

The pattern detection engine aggregates failures by service.

It tracks values such as:

Error Count
Critical Count
Total Failures

Example:

payment-service

Errors:          10
Critical:         3
Total failures:  13

This information contributes to the RCA candidate score.

4. Log Intelligence

Log Intelligence provides a descriptive view of failure behavior.

It analyzes:

Service failure frequency
Repeated failure messages
Failure concentration
Investigation signals

Example:

Most failing service:
payment-service

Most frequent failure:
Database connection timeout

Log Intelligence answers:

What failure patterns are visible in the telemetry?

It does not independently determine the root cause.

5. Temporal Failure Analysis

RootCauseAI analyzes the order in which failures occur.

Example:

16:05:00  postgres           ERROR
16:05:06  payment-service    ERROR
16:05:12  order-service      ERROR

This provides temporal evidence for RCA.

Conceptually:

postgres
   │
   ▼
payment-service
   │
   ▼
order-service

Temporal ordering is treated as evidence and not absolute proof of causality.

6. Failure Correlation

The correlation engine identifies failures occurring in related time periods and groups related service activity.

Example:

Service A
   │
   ├── Failure
   │
   ▼
Service B
   │
   ├── Failure
   │
   ▼
Service C

Correlation helps answer:

Which service failures appear to be related?

This is different from dependency analysis.

Correlation is based on observed failure behavior, while dependency analysis is based on known service relationships.

7. Behavioral Anomaly Detection

RootCauseAI contains a dedicated behavioral anomaly detection engine.

Instead of only asking:

How many failures occurred?

it asks:

Is this amount of failure activity unusual
for this service compared with its recent history?

The current detector uses time windows.

Current configuration:

Window size:              5 minutes
Historical baseline:      5 windows

Anomaly threshold:        2× baseline
High anomaly threshold:   4× baseline
Critical threshold:       6× baseline

Example:

Service:
payment-service

Historical baseline:
0.2 failures/window

Current window:
1 failure

Deviation:
5× baseline

Anomaly Score:
67

Severity:
HIGH

The resulting interpretation is:

payment-service is behaving unusually.

Importantly:

ANOMALY ≠ ROOT CAUSE

An anomalous service may be a symptom of another service failure.

8. Anomaly and Incident Context

Anomaly results can be enriched with active incident information.

Example:

payment-service
      │
      ▼
HIGH ANOMALY
      │
      ▼
Active Incident
      │
      ▼
postgres identified as current RCA

This allows RootCauseAI to distinguish between:

Anomalous Service

A service whose behavior is unusual.

Affected Service Anomaly

An anomalous service that is also affected by an active incident.

Root-Cause Anomaly

An anomalous service that is also the current RCA candidate.

This prevents the system from assuming that every anomaly represents the root cause.

9. Automatic Incident Management

RootCauseAI manages software incidents automatically from observed failure activity.

An incident contains information such as:

Incident ID
Title
Status
Severity
Started At
Ended At
Root Cause
Confidence
RCA Score
Failure Count
Affected Services
Evidence
Recommendations
Explanation
Created At

The incident service handles incident creation and updates as additional telemetry arrives.

10. Incident Lifecycle

The incident lifecycle can be represented as:

Failure detected
      │
      ▼
Incident created
      │
      ▼
Incident updated
      │
      ▼
Additional events
      │
      ▼
RCA recalculated
      │
      ▼
Incident resolved

The implementation also considers the triggering log when evaluating incident context so that unrelated future telemetry does not incorrectly contaminate an earlier incident.

11. Incident Events

Individual events associated with an incident are stored separately.

Each event can contain:

Event ID
Incident ID
Event Type
Service
Message
Timestamp
Created At

This makes it possible to reconstruct the observed sequence of an incident.

12. Incident Timeline

The frontend contains a dedicated incident timeline.

The timeline displays:

Incident sequence
Event count
Relative timing
First failure
Latest event
Event classification
Root-cause indication
Incident duration
Timeline summary

Example:

Incident Started
       │
       ├── +0s   postgres ERROR
       │
       ├── +6s   user-service ERROR
       │
       ├── +12s  payment-service ERROR
       │
       └── +19s  order-service ERROR

The timeline represents the observed event sequence.

It does not independently claim that one event caused another.

13. Root Cause Analysis Engine

The RCA engine is one of the central components of RootCauseAI.

It does not simply select the service with the highest error count.

Instead, it combines multiple signals.

Failure Evidence
       +
Temporal Evidence
       +
Correlation Evidence
       +
Dependency Evidence
       +
Dependency Bonus
       ↓
Combined RCA Score
       ↓
Candidate Ranking
       ↓
Probable Root Cause
14. RCA Candidate Scoring

Every analyzed service can become a root-cause candidate.

The candidate detector calculates multiple scores:

Failure Score
Temporal Score
Correlation Score
Dependency Score
Dependency Bonus

The combined score is then used to rank candidates.

Example:

Rank   Service              RCA Score
──────────────────────────────────────
1      order-service             76
2      inventory-service         44
3      payment-service           44
4      user-service              38
5      auth-service              36

The highest-ranked candidate becomes the current probable root cause.

15. RCA Confidence

The RCA result can contain a confidence classification.

Example:

Probable Root Cause:
order-service

RCA Score:
76

Confidence:
HIGH

Confidence provides additional context around the RCA result.

16. RCA Evidence Chain

RootCauseAI provides an evidence-oriented representation of the RCA result.

Instead of showing only:

Root Cause: postgres

the system can show the contributing evidence.

Conceptually:

             ROOT CAUSE
                 │
              postgres
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
     Failure   Temporal  Dependency
     Evidence  Evidence  Evidence
        │        │        │
        └────────┼────────┘
                 ▼
             RCA Score

This makes the RCA result easier to inspect and explain.

17. Dependency Graph

RootCauseAI maintains a service dependency graph.

The monitored dependency relationships can be discovered from dependency-aware telemetry and represented in the system.

Example:

payment-service
       │
       ▼
    postgres

and:

user-service
       │
       ▼
    postgres

The dependency graph supports:

Dependency scoring
Service relationships
Impact analysis
RCA path inspection
Interactive visualization

Only known relationships are represented.

The system does not invent relationships simply to make the graph appear more complete.

18. Dependency Impact Analysis

The dependency graph provides interactive impact analysis.

When a service is selected, RootCauseAI can determine:

Direct dependents
Indirect affected services
Impact radius
Active incident impact
Impact level

Example:

                 postgres
                /        \
               ▼          ▼
        user-service   payment-service

Selecting postgres can reveal:

Impact radius:       2
Direct dependents:   2
Active impact:       1

The exact values depend on current telemetry and incident state.

19. RCA Path Inspector

The dependency graph also contains an RCA Path Inspector.

It checks whether a selected service is connected to the current root-cause candidate through the monitored dependency graph.

Possible states include:

PRIMARY ROOT CAUSE

RCA PATH CONNECTED

NO DEPENDENCY PATH

RCA UNAVAILABLE

This distinction is important because:

A dependency path can support an RCA hypothesis, but a dependency relationship alone does not prove causality.

20. Service Health Monitoring

RootCauseAI provides service-level health information.

Services can currently be classified as:

HEALTHY
DEGRADED
CRITICAL

The service health system uses available telemetry and analysis information to summarize service condition.

The dashboard can show:

Monitored Services
Healthy Services
Degraded Services
Critical Services
Failure Counts
RCA Scores
Incident State
21. Service Inspector

The Service Inspector provides a detailed investigation view for an individual service.

It combines existing backend analysis information.

The inspector can display:

Service Health
Failure Statistics
RCA Score
Dependency Score
Recent Logs
Failure Patterns
Correlations
Related Incidents
Dependencies
Dependents
RCA Breakdown
Investigation Guidance

The inspector also provides navigation to related incidents.

22. Incident ↔ Service Correlation

RootCauseAI provides two-way navigation between incidents and services.

From an incident:

Incident
   │
   ▼
Affected Service
   │
   ▼
Service Inspector

From a service:

Service
   │
   ▼
Related Incident
   │
   ▼
Incident Investigation

This allows an engineer to move between incident-level and service-level investigation.

23. Incident Command Center

The Dashboard contains an Incident Command Center.

It acts as an operational starting point for investigating active incidents.

It summarizes:

Active Incidents
Severity
Status
Root Cause
Affected Services
Investigation Actions

The command center allows engineers to quickly open an incident or inspect an affected service.

24. Service Health Overview

The Dashboard also contains a Service Health Overview.

It summarizes:

Healthy
Degraded
Critical
Monitored Services

Higher-risk services can be highlighted using failure and RCA information.

Services can be opened directly in the Service Inspector.

25. Incident Impact Map

The Incident Impact Map provides an incident-centric view of service impact.

Conceptually:

                 Incident
                    │
                    ▼
               Root Cause
                    │
                    ▼
             Affected Services

It provides information about:

Incident
Root cause
Affected services
Service failure counts
Service impact
Overall incident impact

The Incident Impact Map and Dependency Graph serve different purposes.

Incident Impact Map

Focuses on:

Incident → Impact
Dependency Graph

Focuses on:

Service → Dependency → Service
26. Real-Time Dashboard Updates

The frontend periodically refreshes backend data.

The current polling interval is:

5 seconds

Background updates can refresh:

Analysis
Logs
Log Intelligence
Incidents
Service Health
Anomalies
Selected Incident Details

Silent polling is used to avoid unnecessary loading-spinner flickering during background updates.

System Architecture

The overall system architecture is:

┌───────────────────────────────────────────────┐
│              Applications / Services          │
└───────────────────────┬───────────────────────┘
                        │
                        │ Telemetry
                        ▼
┌───────────────────────────────────────────────┐
│                 FastAPI API                   │
│                                               │
│ Telemetry │ Incidents │ Dependencies          │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                  PostgreSQL                   │
│                                               │
│ Logs │ Incidents │ Incident Events            │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                Analysis Layer                 │
│                                               │
│ Pattern Detection                             │
│ Log Intelligence                              │
│ Anomaly Detection                             │
│ Temporal Analysis                             │
│ Correlation Analysis                          │
│ Dependency Analysis                           │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              Root Cause Analysis              │
│                                               │
│ Candidate Scoring                             │
│ Candidate Ranking                             │
│ Evidence Generation                           │
│ RCA Explanation                               │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                 React Frontend                │
│                                               │
│ Dashboard                                     │
│ Services                                      │
│ Incidents                                     │
│ Logs                                          │
│ Analysis                                      │
│ Incident Details                              │
└───────────────────────────────────────────────┘
Failure Analysis Pipeline

The complete processing workflow is:

1. Telemetry arrives
          ↓
2. Telemetry is validated
          ↓
3. Log is stored in PostgreSQL
          ↓
4. Log severity is classified
          ↓
5. Failure patterns are calculated
          ↓
6. Log intelligence is generated
          ↓
7. Behavioral anomalies are detected
          ↓
8. Incident state is evaluated
          ↓
9. Temporal failure ordering is analyzed
          ↓
10. Related failures are correlated
          ↓
11. Service dependencies are evaluated
          ↓
12. RCA candidates are scored
          ↓
13. Candidates are ranked
          ↓
14. Probable root cause is selected
          ↓
15. Evidence and explanation are generated
          ↓
16. Dashboard displays investigation information
Root Cause Analysis

RootCauseAI's RCA process is based on combining multiple signals.

Failure Evidence

Measures the observed failure activity of a service.

Error Count
Critical Count
Total Failures
Temporal Evidence

Considers the relative ordering of service failures.

Earlier failure activity can contribute evidence during RCA.

Correlation Evidence

Considers whether a service's failures occur alongside failures in other services.

Dependency Evidence

Considers downstream failure relationships within the monitored dependency graph.

For example:

postgres
   ↑
payment-service

means:

payment-service depends on postgres

and therefore PostgreSQL can have downstream impact.

Combined Evidence

The RCA engine combines these signals into a candidate score.

Failure
  +
Temporal
  +
Correlation
  +
Dependency
  +
Bonus
  =
RCA Candidate Score

The candidates are then ranked.

Anomaly Detection

The current anomaly detector works using fixed time windows.

Processing
Historical Logs
      │
      ▼
Time Windows
      │
      ▼
Historical Baseline
      │
      ▼
Current Window
      │
      ▼
Deviation Ratio
      │
      ▼
Anomaly Classification

The detector currently distinguishes:

NORMAL
MEDIUM
HIGH
CRITICAL

based on the deviation ratio.

Example:

Baseline = 0.2

Current = 1

Ratio = 1 / 0.2
      = 5×

Classification = HIGH

The anomaly engine is intentionally separate from the RCA engine.

Incident Management

The incident system connects telemetry with persistent operational context.

Telemetry
    │
    ▼
Failure Activity
    │
    ▼
Incident Detection
    │
    ▼
Incident Creation / Update
    │
    ▼
RCA Analysis
    │
    ▼
Incident Context

This allows the dashboard to show not only individual failures but also the incident they belong to.

Dependency Analysis

Dependency analysis provides structural information about the monitored system.

Example relationships include:

payment-service → postgres

user-service → postgres

These relationships are used by:

RCA scoring
Dependency visualization
Impact analysis
RCA path inspection

When dependency-aware telemetry is available, observed service relationships can also be incorporated into the dependency model.

Service Health

Service health summarizes the current condition of monitored services.

The system uses available failure, incident, and RCA information to classify services into health states.

Healthy
   │
   ├── Normal activity
   │
Degraded
   │
   ├── Increased failure activity
   │
Critical
   │
   └── Significant active failure/incident impact

The health information is available in the Dashboard and Service Inspector.

Frontend Dashboard

The frontend provides a centralized investigation environment.

Major areas include:

Dashboard
Services
Incidents
Logs
Analysis
Incident Details

The Dashboard combines:

Incident Command Center
Service Health Overview
RCA Evidence Chain
Incident Impact Map
Anomaly & Early Warning
Root Cause information
Failure analysis
Service risk information
Database Architecture

RootCauseAI currently uses PostgreSQL.

The major database entities are:

logs
incidents
incident_events
Logs

Stores telemetry events.

Main fields:

id
service
level
message
timestamp
Incidents

Stores persistent incident information.

Main fields:

id
incident_id
title
status
severity
started_at
ended_at
root_cause
confidence
rca_score
failure_count
affected_services
evidence
recommendations
explanation
created_at
Incident Events

Stores events belonging to incidents.

Main fields:

id
incident_id
event_type
service
message
timestamp
created_at
Backend Architecture

The backend follows a modular structure.

API Layer
     ↓
Incident / Service Layer
     ↓
Analysis Layer
     ↓
Database Layer
API Layer

Responsible for:

Telemetry ingestion
Telemetry retrieval
Analysis endpoints
Incident endpoints
Dependency endpoints
Anomaly endpoints
Analysis Layer

Responsible for:

Failure patterns
Log intelligence
Anomaly detection
Temporal analysis
Correlation
Dependency analysis
Candidate scoring
RCA explanation
Incident Layer

Responsible for:

Incident creation
Incident updates
Incident lifecycle
Incident event storage
Database Layer

Responsible for:

PostgreSQL connection
SQLAlchemy models
Persistent data access
API Reference

Local backend URL:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/docs
Health Check
GET /api/health

Example:

{
  "status": "healthy",
  "service": "RootCauseAI Backend"
}
Store Telemetry
POST /api/telemetry/logs

Example:

{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z"
}

If dependency-aware telemetry is enabled, the event can additionally include a target service:

{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z",
  "target_service": "postgres"
}
Get Logs
GET /api/telemetry/logs
Get Log Intelligence
GET /api/telemetry/intelligence
Get RCA Analysis
GET /api/telemetry/analysis

The endpoint provides information including:

Patterns
Temporal Analysis
Correlations
Dependency Scores
Candidates
Evidence
Root Cause Explanation
Get Anomaly Information
GET /api/telemetry/anomalies

Example:

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
Get Incidents
GET /api/incidents
Get Incident Details
GET /api/incidents/{incident_id}
Get Incident Analysis
GET /api/incidents/{incident_id}/analysis
Get Incident Events
GET /api/incidents/{incident_id}/events
Get Dependency Map
GET /api/dependencies
Project Structure
RootCauseAI/
│
├── backend/
│   │
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
│   │   │
│   │   ├── incidents/
│   │   │   └── routes.py
│   │   │
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
│   │
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       │
│       ├── DependencyGraph.jsx
│       ├── DependencyGraph.css
│       │
│       ├── IncidentCommandCenter.jsx
│       ├── IncidentCommandCenter.css
│       │
│       ├── IncidentImpactMap.jsx
│       ├── IncidentImpactMap.css
│       │
│       ├── IncidentTimeline.jsx
│       ├── IncidentTimeline.css
│       │
│       ├── RcaEvidenceChain.jsx
│       │
│       ├── ServiceHealthOverview.jsx
│       ├── ServiceHealthOverview.css
│       │
│       ├── ServiceDrilldown.css
│       ├── AnomalyEarlyWarning.jsx
│       └── AnomalyEarlyWarning.css
│
├── README.md
└── ...

The structure may evolve as the project continues to develop.

Technology Stack
Frontend
Technology	Purpose
React	User interface
Vite	Development and build tooling
JavaScript	Frontend application logic
Axios	REST API communication
CSS	Interface styling
SVG	Dependency graph visualization
Backend
Technology	Purpose
Python	Backend programming
FastAPI	REST API framework
Uvicorn	ASGI server
SQLAlchemy	ORM and database access
Pydantic	Request/data validation
Database
Technology	Purpose
PostgreSQL	Persistent telemetry and incident storage
Infrastructure
Technology	Purpose
Docker	Containerization
Docker Compose	Local infrastructure management
WSL 2	Linux environment support
Git	Version control
GitHub	Repository hosting
Development Environment

The project is designed to run locally on a development machine.

Typical environment:

Operating System:
Windows

Backend:
Python 3.12+

Frontend:
Node.js + npm

Database:
PostgreSQL

Infrastructure:
Docker + WSL 2

Editor:
Visual Studio Code

The editor can be replaced with any IDE or code editor that supports the project technologies.

Prerequisites

Before running RootCauseAI, install:

Python 3.12+
Node.js
npm
Git
Docker Desktop
Docker Compose
WSL 2
Installation
1. Clone the Repository
git clone https://github.com/Indra9555/RootCauseAI.git

Navigate into the project:

cd RootCauseAI
Backend Setup

Navigate to the backend:

cd backend

Create a virtual environment:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt
Database Setup

Make sure Docker Desktop is running.

Start the database infrastructure:

docker compose up -d

Check running containers:

docker ps

The PostgreSQL container should be running before starting the backend.

Start Backend

From:

RootCauseAI/backend

activate the environment:

.\venv\Scripts\Activate.ps1

Start FastAPI:

uvicorn main:app --reload

The backend will be available at:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs
Start Frontend

Open another terminal.

Navigate to:

cd RootCauseAI\frontend

Install dependencies:

npm install

Start Vite:

npm run dev

The frontend will be available at:

http://localhost:5173
Testing
Health Check

Run:

Invoke-RestMethod http://127.0.0.1:8000/api/health

Expected result:

status   service
------   -------
healthy  RootCauseAI Backend
Test Telemetry

Example:

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
Test RCA
Invoke-RestMethod `
  http://127.0.0.1:8000/api/telemetry/analysis |
  ConvertTo-Json -Depth 10
Test Anomaly Detection
Invoke-RestMethod `
  http://127.0.0.1:8000/api/telemetry/anomalies |
  ConvertTo-Json -Depth 10

Example:

{
  "status": "ok",
  "window_minutes": 5,
  "baseline_windows": 5,
  "anomaly_count": 1
}
Test Dependency Analysis
Invoke-RestMethod `
  http://127.0.0.1:8000/api/dependencies |
  ConvertTo-Json -Depth 10
Troubleshooting
Docker Is Not Running

Make sure Docker Desktop is open and running.

Check:

docker ps
Python Virtual Environment Cannot Be Activated

Try:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then:

.\venv\Scripts\Activate.ps1
Backend Cannot Connect to PostgreSQL

Make sure the PostgreSQL container is running:

docker ps

Then:

docker compose ps

If necessary, restart the database:

docker compose restart
Frontend Cannot Connect to Backend

Make sure FastAPI is running:

http://127.0.0.1:8000/api/health

If the health endpoint works, restart the frontend development server.

Port Already in Use

RootCauseAI normally uses:

Frontend:    5173
Backend:     8000
PostgreSQL:  5432

If one of these ports is already occupied, stop the process using the port or configure the corresponding service to use another port.

Example Investigation

Consider a distributed system:

                 postgres
                /        \
               ▼          ▼
        user-service   payment-service
                            │
                            ▼
                       order-service

Suppose the following events are observed:

16:05:00  postgres           ERROR
16:05:06  payment-service    ERROR
16:05:12  order-service      ERROR

RootCauseAI processes the telemetry through multiple stages.

Step 1 — Telemetry Storage

The events are stored in PostgreSQL.

Telemetry
    │
    ▼
PostgreSQL
Step 2 — Failure Pattern Detection

The system calculates service-level failure activity.

postgres
payment-service
order-service
Step 3 — Anomaly Detection

The system compares recent failure activity with historical service behavior.

Historical baseline
        │
        ▼
Current activity
        │
        ▼
Deviation
        │
        ▼
Anomaly classification
Step 4 — Temporal Analysis

The system examines failure ordering.

postgres
   ↓
payment-service
   ↓
order-service
Step 5 — Correlation

The system analyzes whether the failures are occurring within related failure activity.

Step 6 — Dependency Analysis

Known or observed dependencies are evaluated.

payment-service → postgres
Step 7 — Candidate Scoring

Multiple evidence sources contribute to candidate ranking.

Failure Evidence
        +
Temporal Evidence
        +
Correlation Evidence
        +
Dependency Evidence
        ↓
RCA Score
Step 8 — Candidate Ranking

The services are ranked according to their combined evidence.

The exact ranking depends on the telemetry currently stored in the database.

Step 9 — Investigation

The dashboard provides:

Root Cause
Evidence
Affected Services
Service Health
Dependency Context
Incident Timeline
Anomaly Information

The engineer can then move from the incident to affected services and back to related incidents.

Design Principles
1. Evidence Over Assumptions

RootCauseAI attempts to provide evidence behind RCA decisions rather than presenting unsupported conclusions.

2. Anomaly Does Not Equal Root Cause

A service can behave unusually because it is affected by another failure.

Therefore:

Anomaly ≠ Root Cause
3. Dependency Does Not Prove Causality

A dependency relationship indicates a possible propagation path.

It does not automatically prove that the upstream service caused the downstream failure.

4. Multiple Signals

RCA should not depend on a single metric.

The system therefore considers multiple signals:

Failure
Temporal
Correlation
Dependency
Incident Context
5. Explainability

A useful RCA system should answer:

Why was this service selected?

rather than simply:

Which service was selected?
6. Modularity

Each analytical capability is implemented as a separate module where possible.

Examples:

Anomaly Detection
Pattern Detection
Temporal Analysis
Correlation
Dependency Analysis
RCA

This allows individual components to be tested and improved independently.

7. No Artificial Dependencies

The dependency graph should represent known or observed relationships.

Unknown relationships are not invented simply to make the visualization appear more complete.

Current Implementation Status
Telemetry
 Telemetry ingestion API
 Request validation
 PostgreSQL persistence
 Telemetry retrieval
 Dependency-aware telemetry support
Failure Analysis
 Log classification
 Failure pattern detection
 Log intelligence
 Temporal analysis
 Cross-service correlation
Anomaly Detection
 Time-window based detection
 Historical baseline calculation
 Deviation ratio
 Anomaly scoring
 Severity classification
 Incident context
 Frontend integration
Root Cause Analysis
 Candidate scoring
 Failure scoring
 Temporal scoring
 Correlation scoring
 Dependency scoring
 Candidate ranking
 Root-cause selection
 RCA confidence
 Evidence chain
 RCA explanation
Incident Management
 Automatic incident creation
 Incident updates
 Incident lifecycle
 Incident events
 Incident timeline
 Incident analysis
Service Analysis
 Service health
 Service Inspector
 Dependency graph
 Dependency impact analysis
 RCA Path Inspector
 Incident ↔ Service correlation
 Service → Incident navigation
Dashboard
 Dashboard
 Incident Command Center
 Service Health Overview
 RCA Evidence Chain
 Incident Impact Map
 Anomaly & Early Warning
 Logs page
 Services page
 Incidents page
 Analysis page
 Incident Details page
 Real-time polling
Future Enhancements
1. Anomaly History

The current anomaly detector focuses on recent behavior.

Future versions can maintain anomaly history.

Example:

Window 1 → NORMAL
Window 2 → NORMAL
Window 3 → MEDIUM
Window 4 → HIGH
Window 5 → HIGH

This could enable detection of:

NEW ANOMALY
PERSISTENT ANOMALY
WORSENING
IMPROVING
RAPID ESCALATION
2. AI Investigation Recommendations

A future AI layer can consume structured analysis results and generate investigation recommendations.

Example:

Probable Root Cause:
postgres

Recommended investigation:

1. Check database connectivity.
2. Inspect database error logs.
3. Check connection pool usage.
4. Review timeout events.
5. Inspect affected service connections.

The AI layer should ideally consume structured evidence from the deterministic analysis pipeline rather than blindly processing raw telemetry.

3. Real-Time Metrics

Future versions can incorporate additional telemetry such as:

CPU utilization
Memory utilization
Request rate
Response latency
Error rate
Database performance
Resource utilization

This would allow RCA to reason across multiple signals rather than primarily logs.

4. Distributed Tracing

Future versions can support distributed tracing to better understand request flow across services.

Example:

Client
  ↓
API Gateway
  ↓
Order Service
  ↓
Payment Service
  ↓
Database

Trace information could strengthen dependency and failure-propagation analysis.

5. Automatic Dependency Discovery

The dependency graph can be extended to continuously discover service relationships from observed telemetry.

Instead of relying only on predefined relationships:

payment-service → postgres

the platform could learn relationships from service communication:

Observed communication
        ↓
Relationship evidence
        ↓
Dependency confidence
        ↓
Dynamic topology
6. Failure Scenario Simulator

A telemetry simulator could generate controlled software failure scenarios.

Example:

Scenario:
Database Failure

Services:
postgres
payment-service
user-service
order-service

The simulator could allow demonstration of the complete RootCauseAI pipeline in real time.

7. Historical Incident Analytics

Future analytics could include:

Incidents over time
Failure trends
Root-cause frequency
Service reliability
Severity distribution
Incident duration
Mean Time To Detection
Mean Time To Recovery
8. Reliability Metrics

Potential future metrics include:

Availability
Error Rate
Failure Rate
MTTD
MTTR
Service Reliability
Incident Frequency
9. Automated Testing

The project can be extended with automated tests for:

RCA scoring
Anomaly detection
Dependency analysis
Incident lifecycle
API endpoints
Frontend workflows
10. Production Deployment

Future production improvements include:

Dockerized frontend
Dockerized backend
PostgreSQL deployment
Environment-based configuration
Database migrations
CI/CD
Production logging
Monitoring
Cloud deployment
Roadmap

The planned evolution of RootCauseAI is:

Phase 1
Telemetry & Persistence
        ↓
Phase 2
Failure Analysis
        ↓
Phase 3
Incident Management
        ↓
Phase 4
Root Cause Analysis
        ↓
Phase 5
Dependency & Impact Analysis
        ↓
Phase 6
Behavioral Anomaly Detection
        ↓
Phase 7
Dependency-Aware Telemetry
        ↓
Phase 8
Multi-Signal Metrics
        ↓
Phase 9
AI Investigation Recommendations
        ↓
Phase 10
Distributed Tracing
        ↓
Phase 11
Failure Simulation
        ↓
Phase 12
Historical Analytics
        ↓
Phase 13
Reliability Engineering
        ↓
Phase 14
Production Deployment
Why RootCauseAI?

RootCauseAI is not intended to be just another log dashboard.

A basic log dashboard answers:

"What errors occurred?"

RootCauseAI attempts to provide a complete investigation workflow:

What happened?
      ↓
What is failing?
      ↓
Is the behavior unusual?
      ↓
Which failures are related?
      ↓
Which service failed earlier?
      ↓
How are services connected?
      ↓
Which services are affected?
      ↓
What is the probable root cause?
      ↓
Why was it selected?
      ↓
What should the engineer investigate?

This investigation-oriented architecture is the central idea behind the project.

Academic Relevance

RootCauseAI combines concepts from multiple Computer Science domains.

Software Engineering
Modular architecture
REST API development
Service-oriented design
Failure analysis
Component separation
Database Systems
PostgreSQL
Relational data storage
Database modeling
ORM-based persistence
Query-based analysis
Artificial Intelligence
Behavioral anomaly detection
Candidate ranking
Evidence-based analysis
Future AI-assisted investigation
Distributed Systems
Service dependencies
Failure propagation
Cross-service correlation
Distributed incident analysis
Data Analysis
Aggregation
Time-window analysis
Baseline calculation
Deviation measurement
Candidate scoring
DevOps / SRE
Observability
Incident management
Service health
Failure investigation
Reliability analysis
Project Demonstration

A typical project demonstration can follow this workflow:

1. Start PostgreSQL
          ↓
2. Start FastAPI backend
          ↓
3. Start React frontend
          ↓
4. Send telemetry
          ↓
5. Logs appear in the system
          ↓
6. Failure patterns are calculated
          ↓
7. Anomaly detection runs
          ↓
8. Incident is created/updated
          ↓
9. Temporal analysis runs
          ↓
10. Failures are correlated
          ↓
11. Dependencies are evaluated
          ↓
12. RCA candidates are ranked
          ↓
13. Root cause is displayed
          ↓
14. Evidence is displayed
          ↓
15. Affected services are inspected
          ↓
16. Incident timeline is reviewed

This demonstrates RootCauseAI as an integrated platform rather than a collection of unrelated features.

Project Information
Property	Details
Project Name	RootCauseAI
Project Type	Full-Stack Software Engineering Project
Category	Software Observability / Root-Cause Analysis / Reliability Engineering
Architecture	Full-Stack Web Application
Frontend	React + Vite
Backend	FastAPI + Python
Database	PostgreSQL
ORM	SQLAlchemy
Infrastructure	Docker + WSL 2
Version Control	Git + GitHub
Development Status	Active Development
Conclusion

RootCauseAI is a full-stack software failure investigation platform designed to make distributed-system troubleshooting more structured and explainable.

The platform combines:

Telemetry
    ↓
Failure Analysis
    ↓
Anomaly Detection
    ↓
Incident Management
    ↓
Temporal Analysis
    ↓
Correlation
    ↓
Dependency Analysis
    ↓
Root Cause Analysis
    ↓
Evidence
    ↓
Investigation Dashboard

The central principle of the project is:

The service producing the most errors is not necessarily the service that caused the failure.

By combining multiple sources of evidence, RootCauseAI attempts to identify probable root causes while also showing the surrounding incident, service, dependency, and anomaly context.

The long-term goal is to evolve RootCauseAI into a more complete intelligent observability platform capable of detecting abnormal behavior, analyzing failure propagation, explaining probable root causes, recommending investigation actions, and supporting engineers throughout the incident lifecycle.

Built With
React
Vite
JavaScript
Axios
CSS
Python
FastAPI
Uvicorn
SQLAlchemy
Pydantic
PostgreSQL
Docker
Docker Compose
WSL 2
Git
GitHub
Status

Active Development

RootCauseAI is continuously being extended with additional failure-analysis, observability, visualization, intelligence, and reliability capabilities.


### One thing I intentionally changed

I updated the README so it **doesn't pretend the project is already a fully autonomous production monitoring system**. It describes the current system honestly and puts metrics, tracing, AI recommendations, automatic dependency discovery, etc. under future/current evolution where appropriate.

Also, I included the **Quick Start** near the top so someone who clones your GitHub repo doesn't have to read the entire README just to figure out how to launch it.
Pasted markdown(20260913-142505).md
File
use this full content to make readme 

Yes. I used the full README content from the file you provided, cleaned the accidental empty Markdown code blocks, and removed the extra ChatGPT commentary at the end while keeping the actual project content intact.

Ready-to-use README.md

Download the complete README.md

You can directly replace your repository's existing:

RootCauseAI/
└── README.md

with this file and commit/push it to GitHub.

It includes the full sections such as Quick Start, Architecture, RCA, Anomaly Detection, Incident Management, Dependency Analysis, Service Inspector, Incident Timeline, API Reference, Project Structure, Technology Stack, Testing, Future Enhancements, Roadmap, Academic Relevance, and Project Demonstration.

README.md
Document

README.md
RootCauseAI
AI-Powered Software Failure Root-Cause Analysis & Incident Intelligence Platform

RootCauseAI is a full-stack software observability and failure-analysis platform designed to help developers, DevOps engineers, and SRE teams understand what failed, when it failed, how failures are related, which services are affected, and which service is the most probable root cause.

Modern applications are often composed of multiple interconnected services. When one service or infrastructure component fails, it can generate a chain of secondary failures across the system. This makes manual root-cause investigation difficult and time-consuming.

RootCauseAI addresses this problem by combining:

Telemetry ingestion
Failure pattern detection
Log intelligence
Behavioral anomaly detection
Temporal failure analysis
Cross-service correlation
Dependency analysis
Automatic incident management
Root-cause candidate scoring
RCA evidence generation
Service health monitoring
Incident impact visualization
Interactive service investigation
Real-time dashboard updates

The goal is not simply to display errors, but to transform raw telemetry into structured and explainable failure intelligence.

Table of Contents
Overview
Quick Start
Problem Statement
Motivation
Objectives
Core Concept
Key Features
System Architecture
Failure Analysis Pipeline
Root Cause Analysis
Anomaly Detection
Incident Management
Dependency Analysis
Service Health
Frontend Dashboard
Backend Architecture
Database Architecture
API Reference
Project Structure
Technology Stack
Development Environment
Prerequisites
Installation
Running the Project
Testing
Example Investigation
Design Principles
Current Implementation Status
Future Enhancements
Roadmap
Academic Relevance
Project Demonstration
Conclusion
Overview

RootCauseAI is designed around one central question:

When a software system starts failing, what is the most probable root cause and what evidence supports that conclusion?

A traditional monitoring system may show:

payment-service     ERROR
order-service       ERROR
user-service        ERROR
postgres            ERROR

However, simply selecting the service with the largest number of errors can lead to incorrect conclusions.

A service may generate many errors because it is affected by another failure, rather than being the original source of the problem.

RootCauseAI therefore analyzes multiple signals before ranking root-cause candidates.

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
Quick Start

Want to run RootCauseAI locally without reading the entire documentation?

Follow the steps below.

Prerequisites

Make sure the following tools are installed:

Git
Python 3.12+
Node.js
npm
Docker Desktop
WSL 2

Verify the installations:

git --version
python --version
node --version
npm --version
docker --version
docker compose version
1. Clone the Repository

Clone the project from GitHub:

git clone https://github.com/Indra9555/RootCauseAI.git

Move into the project directory:

cd RootCauseAI
2. Start PostgreSQL

Make sure Docker Desktop is running.

Start the PostgreSQL infrastructure:

docker compose up -d

Verify that the container is running:

docker ps

PostgreSQL should be available on:

localhost:5432
3. Setup the Backend

Open a terminal in the project directory:

cd backend

Create a Python virtual environment:

python -m venv venv

Activate the virtual environment:

.\venv\Scripts\Activate.ps1

Install the backend dependencies:

pip install -r requirements.txt
4. Start the Backend

From the backend directory:

uvicorn main:app --reload

The FastAPI backend will start at:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/api/health

Expected response:

{
  "status": "healthy",
  "service": "RootCauseAI Backend"
}
5. Setup the Frontend

Open a new terminal.

Navigate to the frontend:

cd RootCauseAI\frontend

Install frontend dependencies:

npm install

Start the Vite development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

Open this address in a browser.

6. Run RootCauseAI

Once the database, backend, and frontend are running:

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

You can now:

View the dashboard
Submit telemetry
View logs
Analyze failures
Detect anomalies
View incidents
Inspect service health
Explore dependencies
Inspect RCA candidates
View incident timelines
Investigate affected services
Quick Terminal Setup

RootCauseAI currently uses three running processes.

Terminal 1 — Database
docker compose up -d
Terminal 2 — Backend
cd RootCauseAI\backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
Terminal 3 — Frontend
cd RootCauseAI\frontend
npm install
npm run dev

Then open:

http://localhost:5173
Problem Statement

Modern software systems frequently contain:

Multiple backend services
Databases
APIs
Message queues
External dependencies
Infrastructure components
Inter-service communication

When one component fails, the failure can propagate through dependent services.

For example:

                 PostgreSQL
                /          \
               ▼            ▼
        user-service   payment-service
                              │
                              ▼
                        order-service

If PostgreSQL experiences a problem, the dependent services may begin producing errors.

The resulting telemetry could look like:

postgres            ERROR
payment-service     ERROR
user-service        ERROR
order-service       ERROR

The challenge is determining:

Which failure is primary?
Which failures are secondary?
Which services are affected?
Did unusual behavior occur?
Which services failed first?
Are the failures correlated?
What dependency relationships exist?

RootCauseAI attempts to organize these questions into a single investigation workflow.

Motivation

Large volumes of logs do not automatically provide useful diagnostic information.

An engineer may need to manually determine:

Which service started failing first?
Which failures occurred during the same period?
Which services depend on each other?
Is a service behaving unusually?
Which failures are likely symptoms?
Is there already an active incident?
Which service has the strongest evidence for being the root cause?

RootCauseAI reduces this manual investigation by combining several analytical components.

The platform focuses on evidence-based investigation rather than a single error-count metric.

Objectives

The main objectives of RootCauseAI are:

Collect software telemetry through REST APIs.
Store telemetry persistently in PostgreSQL.
Analyze application failure patterns.
Identify frequently failing services.
Detect unusual service behavior.
Analyze the temporal order of failures.
Identify correlations between service failures.
Model service dependency relationships.
Automatically create and update incidents.
Rank probable root-cause candidates.
Provide RCA evidence and explanations.
Monitor service health.
Visualize service dependencies.
Analyze incident impact.
Connect incidents with affected services.
Provide service-level investigation tools.
Keep the dashboard continuously updated.
Core Concept

RootCauseAI separates several concepts that are often mixed together during manual troubleshooting.

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

Each stage has a separate purpose.

Pattern Detection

Answers:

What failures are occurring?

Anomaly Detection

Answers:

Is the current behavior unusual compared with the service's recent history?

Temporal Analysis

Answers:

Which service appears to have failed earlier?

Correlation Analysis

Answers:

Which failures appear related?

Dependency Analysis

Answers:

Which services depend on which other services?

Incident Management

Answers:

Which failures belong to an incident?

Root Cause Analysis

Answers:

Which service currently has the strongest combined evidence for being the probable root cause?

Key Features
1. Telemetry Ingestion

RootCauseAI provides a REST API for receiving application telemetry.

A telemetry event contains:

Service
Log Level
Message
Timestamp

Example:

{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z"
}

The event is stored in PostgreSQL for further analysis.

2. Failure Classification

Incoming telemetry is classified according to its log level.

Currently important failure levels include:

ERROR
CRITICAL

The severity contributes to the failure evidence used during root-cause analysis.

ERROR
   ↓
Failure evidence

CRITICAL
   ↓
Higher failure evidence
3. Failure Pattern Detection

The pattern detection engine aggregates failures by service.

It tracks values such as:

Error Count
Critical Count
Total Failures

Example:

payment-service

Errors:          10
Critical:         3
Total failures:  13

This information contributes to the RCA candidate score.

4. Log Intelligence

Log Intelligence provides a descriptive view of failure behavior.

It analyzes:

Service failure frequency
Repeated failure messages
Failure concentration
Investigation signals

Example:

Most failing service:
payment-service

Most frequent failure:
Database connection timeout

Log Intelligence answers:

What failure patterns are visible in the telemetry?

It does not independently determine the root cause.

5. Temporal Failure Analysis

RootCauseAI analyzes the order in which failures occur.

Example:

16:05:00  postgres           ERROR
16:05:06  payment-service    ERROR
16:05:12  order-service      ERROR

This provides temporal evidence for RCA.

Conceptually:

postgres
   │
   ▼
payment-service
   │
   ▼
order-service

Temporal ordering is treated as evidence and not absolute proof of causality.

6. Failure Correlation

The correlation engine identifies failures occurring in related time periods and groups related service activity.

Example:

Service A
   │
   ├── Failure
   │
   ▼
Service B
   │
   ├── Failure
   │
   ▼
Service C

Correlation helps answer:

Which service failures appear to be related?

This is different from dependency analysis.

Correlation is based on observed failure behavior, while dependency analysis is based on known service relationships.

7. Behavioral Anomaly Detection

RootCauseAI contains a dedicated behavioral anomaly detection engine.

Instead of only asking:

How many failures occurred?

it asks:

Is this amount of failure activity unusual
for this service compared with its recent history?

The current detector uses time windows.

Current configuration:

Window size:              5 minutes
Historical baseline:      5 windows

Anomaly threshold:        2× baseline
High anomaly threshold:   4× baseline
Critical threshold:       6× baseline

Example:

Service:
payment-service

Historical baseline:
0.2 failures/window

Current window:
1 failure

Deviation:
5× baseline

Anomaly Score:
67

Severity:
HIGH

The resulting interpretation is:

payment-service is behaving unusually.

Importantly:

ANOMALY ≠ ROOT CAUSE

An anomalous service may be a symptom of another service failure.

8. Anomaly and Incident Context

Anomaly results can be enriched with active incident information.

Example:

payment-service
      │
      ▼
HIGH ANOMALY
      │
      ▼
Active Incident
      │
      ▼
postgres identified as current RCA

This allows RootCauseAI to distinguish between:

Anomalous Service

A service whose behavior is unusual.

Affected Service Anomaly

An anomalous service that is also affected by an active incident.

Root-Cause Anomaly

An anomalous service that is also the current RCA candidate.

This prevents the system from assuming that every anomaly represents the root cause.

9. Automatic Incident Management

RootCauseAI manages software incidents automatically from observed failure activity.

An incident contains information such as:

Incident ID
Title
Status
Severity
Started At
Ended At
Root Cause
Confidence
RCA Score
Failure Count
Affected Services
Evidence
Recommendations
Explanation
Created At

The incident service handles incident creation and updates as additional telemetry arrives.

10. Incident Lifecycle

The incident lifecycle can be represented as:

Failure detected
      │
      ▼
Incident created
      │
      ▼
Incident updated
      │
      ▼
Additional events
      │
      ▼
RCA recalculated
      │
      ▼
Incident resolved

The implementation also considers the triggering log when evaluating incident context so that unrelated future telemetry does not incorrectly contaminate an earlier incident.

11. Incident Events

Individual events associated with an incident are stored separately.

Each event can contain:

Event ID
Incident ID
Event Type
Service
Message
Timestamp
Created At

This makes it possible to reconstruct the observed sequence of an incident.

12. Incident Timeline

The frontend contains a dedicated incident timeline.

The timeline displays:

Incident sequence
Event count
Relative timing
First failure
Latest event
Event classification
Root-cause indication
Incident duration
Timeline summary

Example:

Incident Started
       │
       ├── +0s   postgres ERROR
       │
       ├── +6s   user-service ERROR
       │
       ├── +12s  payment-service ERROR
       │
       └── +19s  order-service ERROR

The timeline represents the observed event sequence.

It does not independently claim that one event caused another.

13. Root Cause Analysis Engine

The RCA engine is one of the central components of RootCauseAI.

It does not simply select the service with the highest error count.

Instead, it combines multiple signals.

Failure Evidence
       +
Temporal Evidence
       +
Correlation Evidence
       +
Dependency Evidence
       +
Dependency Bonus
       ↓
Combined RCA Score
       ↓
Candidate Ranking
       ↓
Probable Root Cause
14. RCA Candidate Scoring

Every analyzed service can become a root-cause candidate.

The candidate detector calculates multiple scores:

Failure Score
Temporal Score
Correlation Score
Dependency Score
Dependency Bonus

The combined score is then used to rank candidates.

Example:

Rank   Service              RCA Score
──────────────────────────────────────
1      order-service             76
2      inventory-service         44
3      payment-service           44
4      user-service              38
5      auth-service              36

The highest-ranked candidate becomes the current probable root cause.

15. RCA Confidence

The RCA result can contain a confidence classification.

Example:

Probable Root Cause:
order-service

RCA Score:
76

Confidence:
HIGH

Confidence provides additional context around the RCA result.

16. RCA Evidence Chain

RootCauseAI provides an evidence-oriented representation of the RCA result.

Instead of showing only:

Root Cause: postgres

the system can show the contributing evidence.

Conceptually:

             ROOT CAUSE
                 │
              postgres
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
     Failure   Temporal  Dependency
     Evidence  Evidence  Evidence
        │        │        │
        └────────┼────────┘
                 ▼
             RCA Score

This makes the RCA result easier to inspect and explain.

17. Dependency Graph

RootCauseAI maintains a service dependency graph.

The monitored dependency relationships can be discovered from dependency-aware telemetry and represented in the system.

Example:

payment-service
       │
       ▼
    postgres

and:

user-service
       │
       ▼
    postgres

The dependency graph supports:

Dependency scoring
Service relationships
Impact analysis
RCA path inspection
Interactive visualization

Only known relationships are represented.

The system does not invent relationships simply to make the graph appear more complete.

18. Dependency Impact Analysis

The dependency graph provides interactive impact analysis.

When a service is selected, RootCauseAI can determine:

Direct dependents
Indirect affected services
Impact radius
Active incident impact
Impact level

Example:

                 postgres
                /        \
               ▼          ▼
        user-service   payment-service

Selecting postgres can reveal:

Impact radius:       2
Direct dependents:   2
Active impact:       1

The exact values depend on current telemetry and incident state.

19. RCA Path Inspector

The dependency graph also contains an RCA Path Inspector.

It checks whether a selected service is connected to the current root-cause candidate through the monitored dependency graph.

Possible states include:

PRIMARY ROOT CAUSE

RCA PATH CONNECTED

NO DEPENDENCY PATH

RCA UNAVAILABLE

This distinction is important because:

A dependency path can support an RCA hypothesis, but a dependency relationship alone does not prove causality.

20. Service Health Monitoring

RootCauseAI provides service-level health information.

Services can currently be classified as:

HEALTHY
DEGRADED
CRITICAL

The service health system uses available telemetry and analysis information to summarize service condition.

The dashboard can show:

Monitored Services
Healthy Services
Degraded Services
Critical Services
Failure Counts
RCA Scores
Incident State
21. Service Inspector

The Service Inspector provides a detailed investigation view for an individual service.

It combines existing backend analysis information.

The inspector can display:

Service Health
Failure Statistics
RCA Score
Dependency Score
Recent Logs
Failure Patterns
Correlations
Related Incidents
Dependencies
Dependents
RCA Breakdown
Investigation Guidance

The inspector also provides navigation to related incidents.

22. Incident ↔ Service Correlation

RootCauseAI provides two-way navigation between incidents and services.

From an incident:

Incident
   │
   ▼
Affected Service
   │
   ▼
Service Inspector

From a service:

Service
   │
   ▼
Related Incident
   │
   ▼
Incident Investigation

This allows an engineer to move between incident-level and service-level investigation.

23. Incident Command Center

The Dashboard contains an Incident Command Center.

It acts as an operational starting point for investigating active incidents.

It summarizes:

Active Incidents
Severity
Status
Root Cause
Affected Services
Investigation Actions

The command center allows engineers to quickly open an incident or inspect an affected service.

24. Service Health Overview

The Dashboard also contains a Service Health Overview.

It summarizes:

Healthy
Degraded
Critical
Monitored Services

Higher-risk services can be highlighted using failure and RCA information.

Services can be opened directly in the Service Inspector.

25. Incident Impact Map

The Incident Impact Map provides an incident-centric view of service impact.

Conceptually:

                 Incident
                    │
                    ▼
               Root Cause
                    │
                    ▼
             Affected Services

It provides information about:

Incident
Root cause
Affected services
Service failure counts
Service impact
Overall incident impact

The Incident Impact Map and Dependency Graph serve different purposes.

Incident Impact Map

Focuses on:

Incident → Impact
Dependency Graph

Focuses on:

Service → Dependency → Service
26. Real-Time Dashboard Updates

The frontend periodically refreshes backend data.

The current polling interval is:

5 seconds

Background updates can refresh:

Analysis
Logs
Log Intelligence
Incidents
Service Health
Anomalies
Selected Incident Details

Silent polling is used to avoid unnecessary loading-spinner flickering during background updates.

System Architecture

The overall system architecture is:

┌───────────────────────────────────────────────┐
│              Applications / Services          │
└───────────────────────┬───────────────────────┘
                        │
                        │ Telemetry
                        ▼
┌───────────────────────────────────────────────┐
│                 FastAPI API                   │
│                                               │
│ Telemetry │ Incidents │ Dependencies          │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                  PostgreSQL                   │
│                                               │
│ Logs │ Incidents │ Incident Events            │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                Analysis Layer                 │
│                                               │
│ Pattern Detection                             │
│ Log Intelligence                              │
│ Anomaly Detection                             │
│ Temporal Analysis                             │
│ Correlation Analysis                          │
│ Dependency Analysis                           │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              Root Cause Analysis              │
│                                               │
│ Candidate Scoring                             │
│ Candidate Ranking                             │
│ Evidence Generation                           │
│ RCA Explanation                               │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                 React Frontend                │
│                                               │
│ Dashboard                                     │
│ Services                                      │
│ Incidents                                     │
│ Logs                                          │
│ Analysis                                      │
│ Incident Details                              │
└───────────────────────────────────────────────┘
Failure Analysis Pipeline

The complete processing workflow is:

1. Telemetry arrives
          ↓
2. Telemetry is validated
          ↓
3. Log is stored in PostgreSQL
          ↓
4. Log severity is classified
          ↓
5. Failure patterns are calculated
          ↓
6. Log intelligence is generated
          ↓
7. Behavioral anomalies are detected
          ↓
8. Incident state is evaluated
          ↓
9. Temporal failure ordering is analyzed
          ↓
10. Related failures are correlated
          ↓
11. Service dependencies are evaluated
          ↓
12. RCA candidates are scored
          ↓
13. Candidates are ranked
          ↓
14. Probable root cause is selected
          ↓
15. Evidence and explanation are generated
          ↓
16. Dashboard displays investigation information
Root Cause Analysis

RootCauseAI's RCA process is based on combining multiple signals.

Failure Evidence

Measures the observed failure activity of a service.

Error Count
Critical Count
Total Failures
Temporal Evidence

Considers the relative ordering of service failures.

Earlier failure activity can contribute evidence during RCA.

Correlation Evidence

Considers whether a service's failures occur alongside failures in other services.

Dependency Evidence

Considers downstream failure relationships within the monitored dependency graph.

For example:

postgres
   ↑
payment-service

means:

payment-service depends on postgres

and therefore PostgreSQL can have downstream impact.

Combined Evidence

The RCA engine combines these signals into a candidate score.

Failure
  +
Temporal
  +
Correlation
  +
Dependency
  +
Bonus
  =
RCA Candidate Score

The candidates are then ranked.

Anomaly Detection

The current anomaly detector works using fixed time windows.

Processing
Historical Logs
      │
      ▼
Time Windows
      │
      ▼
Historical Baseline
      │
      ▼
Current Window
      │
      ▼
Deviation Ratio
      │
      ▼
Anomaly Classification

The detector currently distinguishes:

NORMAL
MEDIUM
HIGH
CRITICAL

based on the deviation ratio.

Example:

Baseline = 0.2

Current = 1

Ratio = 1 / 0.2
      = 5×

Classification = HIGH

The anomaly engine is intentionally separate from the RCA engine.

Incident Management

The incident system connects telemetry with persistent operational context.

Telemetry
    │
    ▼
Failure Activity
    │
    ▼
Incident Detection
    │
    ▼
Incident Creation / Update
    │
    ▼
RCA Analysis
    │
    ▼
Incident Context

This allows the dashboard to show not only individual failures but also the incident they belong to.

Dependency Analysis

Dependency analysis provides structural information about the monitored system.

Example relationships include:

payment-service → postgres

user-service → postgres

These relationships are used by:

RCA scoring
Dependency visualization
Impact analysis
RCA path inspection

When dependency-aware telemetry is available, observed service relationships can also be incorporated into the dependency model.

Service Health

Service health summarizes the current condition of monitored services.

The system uses available failure, incident, and RCA information to classify services into health states.

Healthy
   │
   ├── Normal activity
   │
Degraded
   │
   ├── Increased failure activity
   │
Critical
   │
   └── Significant active failure/incident impact

The health information is available in the Dashboard and Service Inspector.

Frontend Dashboard

The frontend provides a centralized investigation environment.

Major areas include:

Dashboard
Services
Incidents
Logs
Analysis
Incident Details

The Dashboard combines:

Incident Command Center
Service Health Overview
RCA Evidence Chain
Incident Impact Map
Anomaly & Early Warning
Root Cause information
Failure analysis
Service risk information
Database Architecture

RootCauseAI currently uses PostgreSQL.

The major database entities are:

logs
incidents
incident_events
Logs

Stores telemetry events.

Main fields:

id
service
level
message
timestamp
Incidents

Stores persistent incident information.

Main fields:

id
incident_id
title
status
severity
started_at
ended_at
root_cause
confidence
rca_score
failure_count
affected_services
evidence
recommendations
explanation
created_at
Incident Events

Stores events belonging to incidents.

Main fields:

id
incident_id
event_type
service
message
timestamp
created_at
Backend Architecture

The backend follows a modular structure.

API Layer
     ↓
Incident / Service Layer
     ↓
Analysis Layer
     ↓
Database Layer
API Layer

Responsible for:

Telemetry ingestion
Telemetry retrieval
Analysis endpoints
Incident endpoints
Dependency endpoints
Anomaly endpoints
Analysis Layer

Responsible for:

Failure patterns
Log intelligence
Anomaly detection
Temporal analysis
Correlation
Dependency analysis
Candidate scoring
RCA explanation
Incident Layer

Responsible for:

Incident creation
Incident updates
Incident lifecycle
Incident event storage
Database Layer

Responsible for:

PostgreSQL connection
SQLAlchemy models
Persistent data access
API Reference

Local backend URL:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/docs
Health Check
GET /api/health

Example:

{
  "status": "healthy",
  "service": "RootCauseAI Backend"
}
Store Telemetry
POST /api/telemetry/logs

Example:

{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z"
}

If dependency-aware telemetry is enabled, the event can additionally include a target service:

{
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout",
  "timestamp": "2026-09-11T16:05:00Z",
  "target_service": "postgres"
}
Get Logs
GET /api/telemetry/logs
Get Log Intelligence
GET /api/telemetry/intelligence
Get RCA Analysis
GET /api/telemetry/analysis

The endpoint provides information including:

Patterns
Temporal Analysis
Correlations
Dependency Scores
Candidates
Evidence
Root Cause Explanation
Get Anomaly Information
GET /api/telemetry/anomalies

Example:

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
Get Incidents
GET /api/incidents
Get Incident Details
GET /api/incidents/{incident_id}
Get Incident Analysis
GET /api/incidents/{incident_id}/analysis
Get Incident Events
GET /api/incidents/{incident_id}/events
Get Dependency Map
GET /api/dependencies
Project Structure
RootCauseAI/
│
├── backend/
│   │
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
│   │   │
│   │   ├── incidents/
│   │   │   └── routes.py
│   │   │
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
│   │
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       │
│       ├── DependencyGraph.jsx
│       ├── DependencyGraph.css
│       │
│       ├── IncidentCommandCenter.jsx
│       ├── IncidentCommandCenter.css
│       │
│       ├── IncidentImpactMap.jsx
│       ├── IncidentImpactMap.css
│       │
│       ├── IncidentTimeline.jsx
│       ├── IncidentTimeline.css
│       │
│       ├── RcaEvidenceChain.jsx
│       │
│       ├── ServiceHealthOverview.jsx
│       ├── ServiceHealthOverview.css
│       │
│       ├── ServiceDrilldown.css
│       ├── AnomalyEarlyWarning.jsx
│       └── AnomalyEarlyWarning.css
│
├── README.md
└── ...

The structure may evolve as the project continues to develop.

Technology Stack
Frontend
TechnologyPurpose	

React	User interface
Vite	Development and build tooling
JavaScript	Frontend application logic
Axios	REST API communication
CSS	Interface styling
SVG	Dependency graph visualization
Backend
TechnologyPurpose	

Python	Backend programming
FastAPI	REST API framework
Uvicorn	ASGI server
SQLAlchemy	ORM and database access
Pydantic	Request/data validation
Database
TechnologyPurpose	

PostgreSQL	Persistent telemetry and incident storage
Infrastructure
TechnologyPurpose	

Docker	Containerization
Docker Compose	Local infrastructure management
WSL 2	Linux environment support
Git	Version control
GitHub	Repository hosting
Development Environment

The project is designed to run locally on a development machine.

Typical environment:

Operating System:
Windows

Backend:
Python 3.12+

Frontend:
Node.js + npm

Database:
PostgreSQL

Infrastructure:
Docker + WSL 2

Editor:
Visual Studio Code

The editor can be replaced with any IDE or code editor that supports the project technologies.

Prerequisites

Before running RootCauseAI, install:

Python 3.12+
Node.js
npm
Git
Docker Desktop
Docker Compose
WSL 2
Installation
1. Clone the Repository
git clone https://github.com/Indra9555/RootCauseAI.git

Navigate into the project:

cd RootCauseAI
Backend Setup

Navigate to the backend:

cd backend

Create a virtual environment:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt
Database Setup

Make sure Docker Desktop is running.

Start the database infrastructure:

docker compose up -d

Check running containers:

docker ps

The PostgreSQL container should be running before starting the backend.

Start Backend

From:

RootCauseAI/backend

activate the environment:

.\venv\Scripts\Activate.ps1

Start FastAPI:

uvicorn main:app --reload

The backend will be available at:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs
Start Frontend

Open another terminal.

Navigate to:

cd RootCauseAI\frontend

Install dependencies:

npm install

Start Vite:

npm run dev

The frontend will be available at:

http://localhost:5173
Testing
Health Check

Run:

Invoke-RestMethod http://127.0.0.1:8000/api/health

Expected result:

status   service
------   -------
healthy  RootCauseAI Backend
Test Telemetry

Example:

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
Test RCA
Invoke-RestMethod `
  http://127.0.0.1:8000/api/telemetry/analysis |
  ConvertTo-Json -Depth 10
Test Anomaly Detection
Invoke-RestMethod `
  http://127.0.0.1:8000/api/telemetry/anomalies |
  ConvertTo-Json -Depth 10

Example:

{
  "status": "ok",
  "window_minutes": 5,
  "baseline_windows": 5,
  "anomaly_count": 1
}
Test Dependency Analysis
Invoke-RestMethod `
  http://127.0.0.1:8000/api/dependencies |
  ConvertTo-Json -Depth 10
Troubleshooting
Docker Is Not Running

Make sure Docker Desktop is open and running.

Check:

docker ps
Python Virtual Environment Cannot Be Activated

Try:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then:

.\venv\Scripts\Activate.ps1
Backend Cannot Connect to PostgreSQL

Make sure the PostgreSQL container is running:

docker ps

Then:

docker compose ps

If necessary, restart the database:

docker compose restart
Frontend Cannot Connect to Backend

Make sure FastAPI is running:

http://127.0.0.1:8000/api/health

If the health endpoint works, restart the frontend development server.

Port Already in Use

RootCauseAI normally uses:

Frontend:    5173
Backend:     8000
PostgreSQL:  5432

If one of these ports is already occupied, stop the process using the port or configure the corresponding service to use another port.

Example Investigation

Consider a distributed system:

                 postgres
                /        \
               ▼          ▼
        user-service   payment-service
                            │
                            ▼
                       order-service

Suppose the following events are observed:

16:05:00  postgres           ERROR
16:05:06  payment-service    ERROR
16:05:12  order-service      ERROR

RootCauseAI processes the telemetry through multiple stages.

Step 1 — Telemetry Storage

The events are stored in PostgreSQL.

Telemetry
    │
    ▼
PostgreSQL
Step 2 — Failure Pattern Detection

The system calculates service-level failure activity.

postgres
payment-service
order-service
Step 3 — Anomaly Detection

The system compares recent failure activity with historical service behavior.

Historical baseline
        │
        ▼
Current activity
        │
        ▼
Deviation
        │
        ▼
Anomaly classification
Step 4 — Temporal Analysis

The system examines failure ordering.

postgres
   ↓
payment-service
   ↓
order-service
Step 5 — Correlation

The system analyzes whether the failures are occurring within related failure activity.

Step 6 — Dependency Analysis

Known or observed dependencies are evaluated.

payment-service → postgres
Step 7 — Candidate Scoring

Multiple evidence sources contribute to candidate ranking.

Failure Evidence
        +
Temporal Evidence
        +
Correlation Evidence
        +
Dependency Evidence
        ↓
RCA Score
Step 8 — Candidate Ranking

The services are ranked according to their combined evidence.

The exact ranking depends on the telemetry currently stored in the database.

Step 9 — Investigation

The dashboard provides:

Root Cause
Evidence
Affected Services
Service Health
Dependency Context
Incident Timeline
Anomaly Information

The engineer can then move from the incident to affected services and back to related incidents.

Design Principles
1. Evidence Over Assumptions

RootCauseAI attempts to provide evidence behind RCA decisions rather than presenting unsupported conclusions.

2. Anomaly Does Not Equal Root Cause

A service can behave unusually because it is affected by another failure.

Therefore:

Anomaly ≠ Root Cause
3. Dependency Does Not Prove Causality

A dependency relationship indicates a possible propagation path.

It does not automatically prove that the upstream service caused the downstream failure.

4. Multiple Signals

RCA should not depend on a single metric.

The system therefore considers multiple signals:

Failure
Temporal
Correlation
Dependency
Incident Context
5. Explainability

A useful RCA system should answer:

Why was this service selected?

rather than simply:

Which service was selected?
6. Modularity

Each analytical capability is implemented as a separate module where possible.

Examples:

Anomaly Detection
Pattern Detection
Temporal Analysis
Correlation
Dependency Analysis
RCA

This allows individual components to be tested and improved independently.

7. No Artificial Dependencies

The dependency graph should represent known or observed relationships.

Unknown relationships are not invented simply to make the visualization appear more complete.

Current Implementation Status
Telemetry
Telemetry ingestion API
Request validation
PostgreSQL persistence
Telemetry retrieval
Dependency-aware telemetry support
Failure Analysis
Log classification
Failure pattern detection
Log intelligence
Temporal analysis
Cross-service correlation
Anomaly Detection
Time-window based detection
Historical baseline calculation
Deviation ratio
Anomaly scoring
Severity classification
Incident context
Frontend integration
Root Cause Analysis
Candidate scoring
Failure scoring
Temporal scoring
Correlation scoring
Dependency scoring
Candidate ranking
Root-cause selection
RCA confidence
Evidence chain
RCA explanation
Incident Management
Automatic incident creation
Incident updates
Incident lifecycle
Incident events
Incident timeline
Incident analysis
Service Analysis
Service health
Service Inspector
Dependency graph
Dependency impact analysis
RCA Path Inspector
Incident ↔ Service correlation
Service → Incident navigation
Dashboard
Dashboard
Incident Command Center
Service Health Overview
RCA Evidence Chain
Incident Impact Map
Anomaly & Early Warning
Logs page
Services page
Incidents page
Analysis page
Incident Details page
Real-time polling
Future Enhancements
1. Anomaly History

The current anomaly detector focuses on recent behavior.

Future versions can maintain anomaly history.

Example:

Window 1 → NORMAL
Window 2 → NORMAL
Window 3 → MEDIUM
Window 4 → HIGH
Window 5 → HIGH

This could enable detection of:

NEW ANOMALY
PERSISTENT ANOMALY
WORSENING
IMPROVING
RAPID ESCALATION
2. AI Investigation Recommendations

A future AI layer can consume structured analysis results and generate investigation recommendations.

Example:

Probable Root Cause:
postgres

Recommended investigation:

1. Check database connectivity.
2. Inspect database error logs.
3. Check connection pool usage.
4. Review timeout events.
5. Inspect affected service connections.

The AI layer should ideally consume structured evidence from the deterministic analysis pipeline rather than blindly processing raw telemetry.

3. Real-Time Metrics

Future versions can incorporate additional telemetry such as:

CPU utilization
Memory utilization
Request rate
Response latency
Error rate
Database performance
Resource utilization

This would allow RCA to reason across multiple signals rather than primarily logs.

4. Distributed Tracing

Future versions can support distributed tracing to better understand request flow across services.

Example:

Client
  ↓
API Gateway
  ↓
Order Service
  ↓
Payment Service
  ↓
Database

Trace information could strengthen dependency and failure-propagation analysis.

5. Automatic Dependency Discovery

The dependency graph can be extended to continuously discover service relationships from observed telemetry.

Instead of relying only on predefined relationships:

payment-service → postgres

the platform could learn relationships from service communication:

Observed communication
        ↓
Relationship evidence
        ↓
Dependency confidence
        ↓
Dynamic topology
6. Failure Scenario Simulator

A telemetry simulator could generate controlled software failure scenarios.

Example:

Scenario:
Database Failure

Services:
postgres
payment-service
user-service
order-service

The simulator could allow demonstration of the complete RootCauseAI pipeline in real time.

7. Historical Incident Analytics

Future analytics could include:

Incidents over time
Failure trends
Root-cause frequency
Service reliability
Severity distribution
Incident duration
Mean Time To Detection
Mean Time To Recovery
8. Reliability Metrics

Potential future metrics include:

Availability
Error Rate
Failure Rate
MTTD
MTTR
Service Reliability
Incident Frequency
9. Automated Testing

The project can be extended with automated tests for:

RCA scoring
Anomaly detection
Dependency analysis
Incident lifecycle
API endpoints
Frontend workflows
10. Production Deployment

Future production improvements include:

Dockerized frontend
Dockerized backend
PostgreSQL deployment
Environment-based configuration
Database migrations
CI/CD
Production logging
Monitoring
Cloud deployment
Roadmap

The planned evolution of RootCauseAI is:

Phase 1
Telemetry & Persistence
        ↓
Phase 2
Failure Analysis
        ↓
Phase 3
Incident Management
        ↓
Phase 4
Root Cause Analysis
        ↓
Phase 5
Dependency & Impact Analysis
        ↓
Phase 6
Behavioral Anomaly Detection
        ↓
Phase 7
Dependency-Aware Telemetry
        ↓
Phase 8
Multi-Signal Metrics
        ↓
Phase 9
AI Investigation Recommendations
        ↓
Phase 10
Distributed Tracing
        ↓
Phase 11
Failure Simulation
        ↓
Phase 12
Historical Analytics
        ↓
Phase 13
Reliability Engineering
        ↓
Phase 14
Production Deployment
Why RootCauseAI?

RootCauseAI is not intended to be just another log dashboard.

A basic log dashboard answers:

"What errors occurred?"

RootCauseAI attempts to provide a complete investigation workflow:

What happened?
      ↓
What is failing?
      ↓
Is the behavior unusual?
      ↓
Which failures are related?
      ↓
Which service failed earlier?
      ↓
How are services connected?
      ↓
Which services are affected?
      ↓
What is the probable root cause?
      ↓
Why was it selected?
      ↓
What should the engineer investigate?

This investigation-oriented architecture is the central idea behind the project.

Academic Relevance

RootCauseAI combines concepts from multiple Computer Science domains.

Software Engineering
Modular architecture
REST API development
Service-oriented design
Failure analysis
Component separation
Database Systems
PostgreSQL
Relational data storage
Database modeling
ORM-based persistence
Query-based analysis
Artificial Intelligence
Behavioral anomaly detection
Candidate ranking
Evidence-based analysis
Future AI-assisted investigation
Distributed Systems
Service dependencies
Failure propagation
Cross-service correlation
Distributed incident analysis
Data Analysis
Aggregation
Time-window analysis
Baseline calculation
Deviation measurement
Candidate scoring
DevOps / SRE
Observability
Incident management
Service health
Failure investigation
Reliability analysis
Project Demonstration

A typical project demonstration can follow this workflow:

1. Start PostgreSQL
          ↓
2. Start FastAPI backend
          ↓
3. Start React frontend
          ↓
4. Send telemetry
          ↓
5. Logs appear in the system
          ↓
6. Failure patterns are calculated
          ↓
7. Anomaly detection runs
          ↓
8. Incident is created/updated
          ↓
9. Temporal analysis runs
          ↓
10. Failures are correlated
          ↓
11. Dependencies are evaluated
          ↓
12. RCA candidates are ranked
          ↓
13. Root cause is displayed
          ↓
14. Evidence is displayed
          ↓
15. Affected services are inspected
          ↓
16. Incident timeline is reviewed

This demonstrates RootCauseAI as an integrated platform rather than a collection of unrelated features.

Project Information
PropertyDetails	

Project Name	RootCauseAI
Project Type	Full-Stack Software Engineering Project
Category	Software Observability / Root-Cause Analysis / Reliability Engineering
Architecture	Full-Stack Web Application
Frontend	React + Vite
Backend	FastAPI + Python
Database	PostgreSQL
ORM	SQLAlchemy
Infrastructure	Docker + WSL 2
Version Control	Git + GitHub
Development Status	Active Development
Conclusion

RootCauseAI is a full-stack software failure investigation platform designed to make distributed-system troubleshooting more structured and explainable.

The platform combines:

Telemetry
    ↓
Failure Analysis
    ↓
Anomaly Detection
    ↓
Incident Management
    ↓
Temporal Analysis
    ↓
Correlation
    ↓
Dependency Analysis
    ↓
Root Cause Analysis
    ↓
Evidence
    ↓
Investigation Dashboard

The central principle of the project is:

The service producing the most errors is not necessarily the service that caused the failure.

By combining multiple sources of evidence, RootCauseAI attempts to identify probable root causes while also showing the surrounding incident, service, dependency, and anomaly context.

The long-term goal is to evolve RootCauseAI into a more complete intelligent observability platform capable of detecting abnormal behavior, analyzing failure propagation, explaining probable root causes, recommending investigation actions, and supporting engineers throughout the incident lifecycle.

Built With
React
Vite
JavaScript
Axios
CSS
Python
FastAPI
Uvicorn
SQLAlchemy
Pydantic
PostgreSQL
Docker
Docker Compose
WSL 2
Git
GitHub
Status

Active Development

RootCauseAI is continuously being extended with additional failure-analysis, observability, visualization, intelligence, and reliability capabilities.


