# Kassan

![License](https://img.shields.io/badge/license-MIT-blue.svg)

A complete self-scanning system optimized for **Zebra MC18 Android scanners**, featuring a web management interface, dedicated scanner app, and real-time communication backend. Built to streamline retail checkout workflows using Zebra's hardware capabilities with their DataWedge API.

---

## Overview

A trio of interconnected components:

- **Next.js WebApp**: User authentication, scanner management, and checkout system dashboard.
- **Capacitor/React Android App**: Runs directly on Zebra MC18 scanners (Android 5.1.1, API 22 or greater) for barcode scanning.
- **Express.js WebSocket Server**: Facilitates real-time communication between scanners and the web interface.

---

## Project Architecture

- **Web App**: Located in `/`, handles checkout and got a UI for administrators to add items, users and more.
- **Android App**: Resides in `/capacitor`, optimized for Zebra's hardware triggers and scanning capabilities.
- **WebSocket Server**: In `/adapter`, manages persistent connections between devices.

---

## Key Features

- **Zebra MC18 Integration**
  - Direct hardware trigger mapping
  - Barcode scanner optimization
  - Battery/network status monitoring
- **Real-Time Sync**
  - Instant scan updates via WebSocket
  - Live inventory tracking
- **Management Portal**
  - Multi-user authentication
  - Session analytics
  - Remote scanner configuration

---

## Requirements

- **Hardware**: Zebra MC18 (Android 5.1.1)
- **Development**:
  - Node.js 18+
  - Android Studio (for APK builds)
  - Zebra OEM Config utility
- **Production**:
  - Persistent WebSocket server
  - HTTPS-enabled web host

---

## Setup Guide

### Installation

1. Clone the repository
2. Install dependencies for all three components separately
3. Configure environment variables for both webapp and WebSocket server

### Configuration

- **WebSocket Server**: Set port and allowed origins via environment variables.
- **Android App**: Configure server endpoint in Capacitor settings (requires cleartext HTTP enablement).
- **WebApp**: Specify WebSocket connection URL and authentication secrets.

---

## Operational Flow

1. **Authentication**: Users log in via the Next.js web portal.
2. **Device Pairing**: Scanners connect to the WebSocket server on startup.
3. **Scanning**: MC18 hardware triggers initiate barcode capture.
4. **Checkout**: Web interface aggregates scanned items for payment processing.
5. **Monitoring**: Real-time dashboard shows active scanners and transactions.

---

## Compliance Notes

- Requires Zebra's StageNow for enterprise deployments
- Optimized for API 22 (Android 5.1 compatibility)
- Uses Zebra's EMDK for hardware control

---

## Contribution

Submit issues for feature requests or bugs. For major changes, open a discussion first to align with project direction.

---

## License

MIT Licensed. Not affiliated with Zebra Technologies.

*Zebra and MC18 are registered trademarks of Zebra Technologies Corp.*
