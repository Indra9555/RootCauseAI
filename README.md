# RootCauseAI

> AI-powered software failure analysis and incident intelligence platform for detecting abnormal behavior, correlating failures, analyzing service dependencies, and identifying probable root causes.

RootCauseAI is a software observability and root-cause analysis platform designed to help developers and DevOps teams understand **why software systems fail**.

The platform collects application telemetry, analyzes failure patterns, detects behavioral anomalies, correlates related service failures, analyzes service dependencies, automatically manages incidents, and ranks probable root causes using an evidence-based scoring system.

The goal is to transform raw application failures into a structured investigation workflow.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [How RootCauseAI Works](#how-rootcauseai-works)
- [System Architecture](#system-architecture)
- [Root Cause Analysis Pipeline](#root-cause-analysis-pipeline)
- [Anomaly Detection](#anomaly-detection)
- [Incident Management](#incident-management)
- [Dependency Analysis](#dependency-analysis)
- [Service Health](#service-health)
- [Dashboard](#dashboard)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Backend API](#backend-api)
- [Database](#database)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Example Workflow](#example-workflow)
- [Current Project Status](#current-project-status)
- [Future Enhancements](#future-enhancements)
- [Academic Project](#academic-project)

---

# Overview

Modern software systems often consist of multiple services that communicate with each other.

When a failure occurs, developers may receive hundreds of error logs from different services. Finding the original cause manually can be difficult because the service producing the most errors is not necessarily the service that caused the failure.

RootCauseAI addresses this problem by combining multiple analysis techniques:

- Failure pattern detection
- Temporal failure analysis
- Failure correlation
- Dependency analysis
- Behavioral anomaly detection
- Incident detection and lifecycle management
- Root-cause candidate scoring
- Evidence-based explanations
- Service health analysis

Instead of simply displaying logs, RootCauseAI attempts to answer:

> **"What is probably causing this incident, and what evidence supports that conclusion?"**

---

# Problem Statement

In distributed software systems, a single underlying failure can generate errors across multiple services.

For example:

```text
PostgreSQL
    ↓
User Service
    ↓
Payment Service
    ↓
Order Service
