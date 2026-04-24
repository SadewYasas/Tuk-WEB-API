# Real-Time Three-Wheeler (Tuk-Tuk) Tracking & Movement Logging System  
### RESTful API for Law Enforcement – Sri Lanka

---

## 📌 1. Business Case

Sri Lanka Police, together with relevant law enforcement agencies, will develop a centralized real-time tracking platform for three-wheelers (tuk-tuks) to support operational visibility and investigations.

The system will collect GPS-based location pings from registered three-wheelers and provide:

- Last-known real-time location (live view)
- Historical movement logs (time-window tracking)
- Province- and district-wise filtering for police stations

A dedicated RESTful API will be deployed to manage:

- Vehicles
- Driver/device identities
- Administrative boundaries (province/district)
- Secure access for authorized users

---

## 🎯 2. Objective

Design and deploy a RESTful Web API for Sri Lanka Police to:

- Enable real-time tracking of tuk-tuks
- Store and retrieve movement history
- Support law enforcement operations

---

## 👥 3. Stakeholders

The API should address the needs of:

- Central administrators (Head Office / Provincial Control)
- Police stations and authorized law enforcement users
- Tuk-tuk operators / tracking devices

---

## ⚙️ 4. Scope

### Included:
- REST API development
- Data modeling
- Authentication & authorization
- Simulation of location data

### Not Included:
- Mobile applications
- Web UI
- Hardware/device firmware

---

## 🧩 5. System Features

### 🚗 Vehicle Tracking
- Real-time location updates
- Last known location retrieval

### 📜 Movement Logging
- Historical tracking with timestamps
- Time-based queries

### 🗺️ Filtering
- Province-based filtering
- District-based filtering

### 🔐 Security
- Role-based access control
- Secure API endpoints

---

## 🏗️ 6. API Design

### Base URL