# 🎂 Dream's Cake — Enterprise Bakery Management & Online Ordering Platform

<div align="center">

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.4-10B981.svg?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21_LTS-FF2E74.svg?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Database](https://img.shields.io/badge/Database-MySQL_8-38BDF8.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Security-Spring_Security_6_%2B_JWT-F59E0B.svg?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<p align="center">
  <b>Enterprise-Grade Bakery Management System & E-Commerce Backend Architecture</b><br/>
  Built for Advanced Enterprise Application Development & Production-Ready Micro-Services
</p>

</div>

---

## 🍰 Platform Overview & Boutique Design System

**Dream's Cake** revolutionizes custom bakery operations, ingredient inventory tracking, and client order fulfillment. It eliminates manual ledger tracking and fragmented messaging with an automated multi-tier architecture:

* 🎨 **Boutique Visual Aesthetic**: Warm obsidian and cream backgrounds, glass cards with backdrop blur, golden-rose gradients, and elegant typography tailored for premium confectionery branding.
* 🔒 **Stateless JWT Security**: Secure authentication and role-based authorization powered by Spring Security 6 and custom JSON Web Token filters.
* 📦 **Modular Domain Architecture**: Clean separation of concerns across Controllers, Services, Repositories, and DTOs with centralized exception handling (`AppExceptionHandler`).
* 🔄 **Optimized Data Persistence**: High-performance relational mapping using Spring Data JPA, Hibernate, and MySQL with robust transactional integrity.
* ⚡ **Real-Time Order Workflow**: End-to-end management of custom cake specifications, tier selections, ingredient consumption, and audit trails.

---

## 🔀 System Architecture & Layered Workflow

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1E1B4B', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#FF2E74', 'lineColor': '#00F2FE', 'secondaryColor': '#0E121C', 'tertiaryColor': '#121624'}}}%%
flowchart TD
    subgraph Client_Layer ["1. Client Interfaces"]
        UI["💻 Client Web App & Admin Portal<br/>(HTML5, CSS3, Bootstrap 5, JavaScript)"]
    end

    subgraph API_Layer ["2. Spring Boot REST API Layer"]
        Controllers["🌐 REST Controllers<br/>(Products, Orders, Customers, Inventory)"]
        Security["🔒 Spring Security & JWT Filters"]
        Controllers --> Security
    end

    subgraph Business_Layer ["3. Core Business Logic"]
        Services["⚙️ Service Impl & Transaction Boundaries<br/>(Order Processing, Email Dispatch)"]
    end

    subgraph Persistence_Layer ["4. Data Access & Storage"]
        Repos["🗄️ Spring Data JPA Repositories"]
        Database[("💾 MySQL 8 Database<br/>(Entities, DTOs, Audit Logs)")]
        Repos --> Database
    end

    UI -->|HTTPS / REST| Controllers
    Security --> Services
    Services --> Repos

    classDef rose stroke:#FF2E74,stroke-width:2px;
    classDef cyan stroke:#00F2FE,stroke-width:2px;
    classDef gold stroke:#F59E0B,stroke-width:2px;
    class Client_Layer rose;
    class API_Layer cyan;
    class Persistence_Layer gold;


