# 🚍 BantayBiyahe: An IoT-Enabled Onboard Diagnostic and Fleet Management System for Modern Public Utility Jeepney

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react)
![Raspberry Pi](https://img.shields.io/badge/Raspberry_Pi-5-C51A4A?style=for-the-badge\&logo=raspberrypi)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge\&logo=supabase)
![SQLite](https://img.shields.io/badge/SQLite-Local_Cache-003B57?style=for-the-badge\&logo=sqlite)
![IoT](https://img.shields.io/badge/IoT-Fleet_Management-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Capstone_Project-success?style=for-the-badge)

### IoT-Enabled Diagnostic and Fleet Management System for Modern Public Utility Jeepneys

Real-time vehicle diagnostics, fleet monitoring, route tracking, maintenance scheduling, and telemetry analytics powered by Raspberry Pi, OBD-II, GPS, and Supabase.

</div>

---

## 📖 Overview

**BantayBiyahe** is an IoT-enabled diagnostic and fleet management platform designed to improve the safety, maintenance, and operational efficiency of Modern Public Utility Jeepneys (MPUJs).

The system collects vehicle telemetry through an OBD-II scanner and GPS module, processes the data using a Raspberry Pi edge device, and synchronizes information to a cloud backend for real-time monitoring and analytics. Dispatchers and technicians can access fleet information through a web-based dashboard.

---

## ✨ Key Features

### 🚗 Real-Time Vehicle Diagnostics

Monitor critical vehicle telemetry including:

* Engine RPM
* Vehicle Speed
* Battery Voltage
* Engine Coolant Temperature
* Fuel Consumption
* Check Engine (MIL) Status

### 📍 GPS Fleet Tracking

* Real-time vehicle location
* Route monitoring
* Distance computation
* Mileage tracking
* Forward and return route validation

### 🔧 Preventive Maintenance Monitoring

Automated maintenance reminders for:

* Oil Change
* Tire Rotation
* Brake Inspection

### 🚨 Intelligent Alerts

Generate alerts when telemetry exceeds predefined thresholds.

### 📊 Fleet Dashboard

Role-based dashboards for:

* Drivers
* Dispatchers
* Service Technicians

---

## 🏗️ System Architecture

```text
Vehicle Sensors
     │
     ├── OBD-II Scanner (BLE)
     ├── GPS Module (USB)
     │
     ▼
Raspberry Pi 5
     │
     ├── Local Processing
     ├── SQLite Cache
     └── Dashboard Display
     │
     ▼
Supabase Backend
     │
     ├── PostgreSQL Database
     ├── Authentication
     ├── Realtime Updates
     └── REST API
     │
     ▼
React Web Dashboard
     │
     ├── Dispatcher Portal
     ├── Technician Portal
     └── Fleet Monitoring
```

---

## ⚙️ Technology Stack

### Hardware

* Raspberry Pi 5
* Veepeak OBD-II Dongle
* VK-162 USB GPS Dongle
* Touchscreen Display

### Frontend

* React 18
* Vite
* Tailwind CSS
* React Router v6
* Lucide React

### Backend & Cloud

* Supabase
* PostgreSQL
* Supabase Realtime
* REST API

### Local Storage

* SQLite

### Communication

* Bluetooth Low Energy (BLE)
* USB
* Wi-Fi

The architecture follows a four-layer IoT design consisting of Sensing, Network, Data Processing, and Application layers.

---

## 📊 Vehicle Telemetry Monitoring

The system continuously evaluates vehicle health using OBD-II telemetry.

| Component       | Parameter           |
| --------------- | ------------------- |
| Battery         | Voltage             |
| Engine          | RPM                 |
| Speed           | Vehicle Speed       |
| Cooling System  | Coolant Temperature |
| Fuel Efficiency | Fuel Rate / km/L    |
| Diagnostics     | Check Engine (MIL)  |

These metrics are classified into Pass, Warning, and Fail states to support proactive maintenance and fault detection.

---

## 📍 Mileage & Route Validation

BantayBiyahe implements the **Haversine Formula** to calculate distances between GPS coordinates.

Capabilities include:

* Route distance calculation
* Forward and return route validation
* Mileage computation
* Route deviation detection
* Distance analytics

This allows the system to accurately monitor vehicle travel and operational consistency.

---

## ⛽ Fuel Consumption Analytics

The platform supports two fuel consumption calculation methods:

### Method A — Direct Fuel Rate

Uses:

* Vehicle Speed (PID 0D)
* Fuel Rate (PID 5E)

### Method B — MAF-Based Estimation

Uses:

* Vehicle Speed (PID 0D)
* Mass Air Flow (PID 10)

This dual-mode approach improves compatibility across different MPUJ models.

---

## 🔧 Preventive Maintenance Module

Maintenance reminders are generated based on mileage thresholds.

| Maintenance Activity | Threshold |
| -------------------- | --------- |
| Oil Change           | 5,000 km  |
| Tire Rotation        | 10,000 km |
| Brake Inspection     | 15,000 km |

The system automatically notifies dispatchers and technicians when service intervals are reached.

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/your-username/bantaybiyahe.git
cd bantaybiyahe
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Run Development Server

```bash
npm run dev
```

---

## 📸 Screenshots

Add screenshots of:

* Driver Dashboard
* Dispatcher Dashboard
* Fleet Monitoring Map
* Telemetry Alerts
* Maintenance Tracker
* Onboard Raspberry Pi Interface

---

## 🎓 Academic Context

This project was developed as a Computer Engineering capstone project focused on applying Internet of Things (IoT), fleet management, cloud computing, and real-time vehicle diagnostics to improve transportation safety and operational efficiency.

---

## 👩‍💻 Authors

**Leila Arowen A. Dumindin**
BS Computer Engineering
Pamantasan ng Lungsod ng Maynila

---

<div align="center">

### 🚍 Smarter Fleet Monitoring. Safer Public Transportation.

Built with Raspberry Pi, React, Supabase, and IoT technologies.

⭐ Star this repository if you find the project interesting.

</div>
