# SonoCode - Evaluator Service

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B6?style=for-the-badge&logo=zod&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-D83A3A?style=for-the-badge)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

This microservice is the asynchronous background worker responsible for the secure, sandboxed execution of user-submitted code. It acts as a consumer in a producer-consumer pattern, pulling submission jobs from a Redis queue and running them in isolated Docker containers.

---

## Core Responsibilities

-   **Asynchronous Job Consumption:** Listens to the `submission-queue` using BullMQ for new jobs to process.
-   **Dynamic Container Management:** Programmatically creates, runs, and destroys ephemeral Docker containers for each submission using the Docker Engine API.
-   **Code Execution & Validation:** Compiles and executes the user's code against predefined test cases inside the container, capturing the output and handling various outcomes (e.g., pass, fail, error).
-   **Result Publishing:** Publishes the final evaluation result to an `evaluation-queue` for the `Submission Service` to consume.

---

## ⚙️ Workflow Logic

As a background worker, this service doesn't expose a public API. Instead, it follows an internal, event-driven workflow:

1.  A BullMQ worker process continuously listens for jobs on the **submission queue**.
2.  When a job is received, the service writes the source code from the job payload to a temporary local file.
3.  Using **`dockerode`**, it dynamically creates a new Docker container from a language-appropriate image (e.g., `gcc` for C++).
4.  It applies strict **resource constraints** (CPU, memory, PID limits) to the container.
5.  The directory containing the source code is mounted into the container.
6.  The service executes the necessary compilation and run commands inside the container.
7.  It streams and captures the `stdout` and `stderr` to validate the output against the expected test case results.
8.  After evaluation, the container is stopped and removed to ensure a clean, stateless environment for the next job.
9.  The final result (e.g., "Accepted," "Wrong Answer," "Time Limit Exceeded") is published to the **evaluation queue**.

---

## 💡 System Design Pointers

-   **Security by Isolation:** The use of Docker is the primary security mechanism of the entire platform. By treating every submission as untrusted code and locking it within a container with restricted permissions and resources, the system is protected by design.
-   **Asynchronicity for High-Latency Tasks:** Code compilation and execution can be slow. By designing this process to be fully asynchronous, the system can handle a large volume of submissions without degrading the performance of the user-facing APIs.
-   **Fault Tolerance:** The use of a persistent job queue like BullMQ means that if this worker service crashes or is restarted, no submissions are lost. Once the service is back online, it will resume processing jobs from the queue where it left off.

---

## ✨ Advanced Backend Concepts Implemented

-   **Dynamic Containerization for Sandboxing:** The core of this service is its use of `dockerode` to create ephemeral Docker containers on-the-fly for each job. This is a powerful sandboxing technique that provides a **secure, isolated, and consistent environment** for running untrusted user code, preventing any potential harm to the host system.
-   **Resource Management and Constraint Enforcement:** The service programmatically applies resource limits to each container. This is a critical feature that solves two problems: it enforces problem-specific constraints (e.g., Time Limit Exceeded, Memory Limit Exceeded) and protects the host system from resource exhaustion attacks like **fork bombs** by limiting the number of processes a container can spawn.
-   **Stateless, Scalable Worker Architecture:** The worker is designed to be completely stateless. All the necessary information to process a submission is contained within the job payload. This architecture allows the service to be **horizontally scaled** effortlessly. To increase submission throughput, you simply run more instances of this service; the BullMQ will distribute jobs among them automatically.
-   **Producer-Consumer Pattern:** This service is a classic implementation of a **consumer** in a distributed system. It decouples the resource-intensive task of code evaluation from the user-facing `Submission Service` (the producer), ensuring the main API remains responsive and resilient.
-   **Type Safety and Data Validation (TypeScript & Zod):** The use of **TypeScript** provides compile-time type checking, enhancing code robustness and maintainability. **Zod** is strategically used for runtime schema validation of incoming job payloads from the queue, ensuring that the worker always operates on well-formed and valid data, preventing unexpected errors during evaluation.
