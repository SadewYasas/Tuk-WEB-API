

# **Comprehensive Coursework Guide: NB6007CEM Web API Development**

**Program:** BSc (Hons) Computing (Coventry University) @ NIBM

**Module:** NB6007CEM \- Web API Development

**Assessment Weight:** 100% (Individual)

**Lecturer/Setter:** Niranga Dharmaratna

## **1\. Project Overview & Business Case**

You are tasked with building the backend architecture for a **Real-Time Three-Wheeler (Tuk-Tuk) Tracking & Movement Logging System** for the Sri Lanka Police.

The system will collect GPS-based location pings from registered tuk-tuks to provide:

* **Live View:** The last-known real-time location of the vehicles.  
* **Historical Movement Logs:** Time-window tracking capabilities.  
* **Filtering:** Province-wise and district-wise filtering for operational use by police stations.

### **Target Audience for the API**

The API must securely serve three types of clients:

1. **Central Administrators:** Police Headquarters and Provincial control.  
2. **Law Enforcement Users:** Authorized users at regional Police stations.  
3. **Tuk-Tuk Operators / Tracking Devices:** Secure clients sending location updates.

⚠️ **CRITICAL CONSTRAINT:** You are **NOT** required to develop any client applications (no web UI, no mobile app, no hardware firmware). You are only building the API. You will use CLI tools (like Postman, curl, or simple scripts) to demonstrate functionality.

## **2\. Technical Requirements**

### **Technology Stack**

* **Language/Environment:** Node.js / ES6+  
* **Architecture:** RESTful Web API

### **Core API Features (Targeting High Marks)**

To achieve Level 5 in the rubric, your API must include:

* **Strict REST Compliance:** Proper use of resources, collections, HTTP methods (GET, POST, PUT, DELETE, etc.), and response codes.  
* **Advanced Querying:** Implement filtering, sorting, and conditional GET requests.  
* **Headers:** Full utilization of appropriate request and response headers.  
* **Authentication & Security:** Secure access control for the different user roles (Admin, Station, Device).  
* **Error Handling:** Meaningful feedback and correct status codes for invalid requests.

### **Architecture & Code Quality**

* **Modularity:** Clean, well-organized code utilizing proper language constructs.  
* **Clean Code:** Fully annotated/documented code with **zero** linting errors or warnings.  
* **Robustness:** Optimized architecture covering scalability, reliability, security, metrics, and monitoring.

## **3\. Simulation Data Requirements**

Because you won't have real moving tuk-tuks, you must generate synthetic data for your demonstration (in JSON or CSV format).

Your simulated master data must include:

* **Regions:** All 9 provinces and 25 districts of Sri Lanka.  
* **Stations:** At least 20 police stations mapped logically to these districts (fictional or realistic names).  
* **Vehicles:** At least 200 registered tuk-tuks.  
* **Movement Data:** A continuous stream of periodic location pings generating a **minimum of 1 week of location history** prior to your demo date. Include realistic movement patterns.

## **4\. Deliverables**

### **A. The Project Report**

A formal, comprehensive document detailing the development lifecycle.

* **Length:** Approximately 3,000 words (Minimum 2,700 words to be eligible for the Viva). Excludes code, references, and headings.  
* **Format:** Do NOT include code snippets in the report.  
* **Required Sections:**  
  1. **Business Requirements Analysis:** Scope, features, and system objectives.  
  2. **Design & Architecture:** Thought processes, standards followed, and justification for your technical decisions.  
  3. **Limitations & Scaling:** Future concerns and potential optimizations.  
  4. **Appendix (MANDATORY):**  
     * URL of the deployed API.  
     * URL of the API Specification (Swagger).  
     * URLs of GitHub Repositories.  
     * URLs of any AI aides or generated code prompts used.

### **B. The Codebase (GitHub)**

* **Version Control:**
