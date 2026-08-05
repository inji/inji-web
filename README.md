> ❗ **Important!** Before you proceed, you should be aware of OpenID4VCI, OpenID4VP & W3C VC. Please read the following standards before proceeding:
>
> * [W3C VC - Verifiable Credentials Overview](https://www.w3.org/TR/vc-overview/)
> * [OpenID4VC - OpenID for Verifiable Credential Issuance - draft 13](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-ID1.html)
> * [OpenID4VP - OpenID for Verifiable Presentations - draft 23](https://openid.net/specs/openid-4-verifiable-presentations-1_0-ID3.html)
> * [OpenID4VP - OpenID for Verifiable Presentations 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)


### Table of Contents

* [Overview](#overview)
* [Architecture](#architecture)
* [Modularity & Extensibility](#modularity--extensibility)
* [Folder Structure](#folder-structure)
* [Deployment](#deployment)
* [Local Setup](#local-setup)
* [Configuration](#configuration)
* [Running Tests](#running-tests)
* [Databases](#databases)
* [Upcoming Features](#upcoming-features)
* [Documentation](#documentation)
* [Contribution & Community](#contribution--community)


## Overview

Inji Web is an open-source, standards-compliant web-based wallet that allows users to securely download, manage, and share Verifiable Credentials (VCs). It provides an inclusive, easy-to-use platform for individuals to access services and benefits, even without a smartphone.

As a reference implementation, Inji Web is designed for adoption by ecosystem partners, countries, system integrators, and governments—built collaboratively with the community.

### Standards Supported

Inji Web adheres to global interoperability standards, including:

* **OpenID4VCI:** For secure, standardized credential issuance.
* **OpenID4VP:** For sharing credentials with verifiers.
* **W3C VC:** Support for JSON-LD (1.1) and VC Data Model 2.0.
* **IETF SD-JWT:** Support for selective disclosure.
* **Claim-169:** Optimized QR code representation.

### Current Limitations

* **OVP Flow Support:** The Verifiable Presentation (OVP) flow is currently limited to **LDP-VC** (JSON-LD) format. Support for **SD-JWT VC** presentation is currently in the pipeline and not yet available.
* **Passcode Management:** The option to change a passcode after the initial login is currently unavailable.


## Architecture

Inji Web utilizes a **Backend-for-Frontend (BFF)** architecture pattern centered around **Mimoto**. This design decouples the complex logic of credential orchestration from the user interface, ensuring a lightweight and secure frontend experience.

### Key Components:

* **Inji Web (Frontend):** A React-based portal that provides the user interface for credential workflows. It handles "Guest" and "Logged-in" flows via OIDC.
* **Mimoto (BFF):** Acts as the central brain. It handles session management, communicates with **Inji Certify** for issuance, and interfaces with **Inji Verify** for validation.
* **Credential Storage:** Utilizes **PostgreSQL** for persistent storage of credentials for logged-in users and **Datashare** for guest sessions or public credential sharing scenarios.
* **Security Layer:** Integrated with **eSignet** for identity provider (IdP) services and supports **Google OAuth 2.0** for social login.

For a detailed view of Inji web architecture and components, refer to the [Inji Web Architecture Documentation](https://docs.inji.io/inji-wallet/inji-web/technical-overview/architecture).


## Modularity & Extensibility

Inji Web is designed to be highly modular and extensible, allowing it to fit into various digital identity ecosystems beyond just MOSIP.

* **SDK-First Approach:** Many components, such as the VC Renderer, are built as reusable modules that can be embedded into other web applications.
* **Interoperable Design:** By strictly adhering to OpenID4VC protocols, Inji Web can be extended to work with any compliant Issuer or Verifier.
* **Customization:** Supports UI/UX extensibility through Tailwind CSS and localized property files, enabling organizations to rebrand the wallet and adapt it to local requirements easily.


## Folder Structure

* **`helm`**: Contains Helm charts required for deployment on a Kubernetes (K8S) cluster.
* **`inji-web`**: Contains the React source code, test suites, and the Dockerfile for building the frontend image.
* **`docker-compose`**: Contains configurations, environment files, and service definitions for local full-stack execution.


## Deployment

Inji Web supports two modes of deployment to cater to different users with different purposes:

1. **Local Development Setup**
    * Intended for experimentation and user experience. Local Setup can be carried out in two ways:
        * **Local Setup without Docker Compose**
            * Recommended for developers or community contributors who want to perform debugging or gain a deeper understanding of the Inji Web codebase.
            * Refer to [this guide](#2-running-locally-non-docker) to try this mode of setup.
        * **Local Setup with Docker Compose**
            * Recommended for users who want to experience the product from a technical/backend perspective.
            * Refer to [this guide](#running-with-docker-compose-full-stack) to try this mode of setup.
    * This is for developers, community members, and country representatives to explore the application, demonstrate its usage to external stakeholders, or conduct proof-of-concepts (POCs).

2. **Deployment with Kubernetes cluster**
    * Designed for production environments.
    * Enables organizations to host and utilize the product at scale.
    * Refer to the [Deployment Guide](https://docs.inji.io/readme/setup/deploy#deploying-inji-web-wallet) to learn more about this mode of deployment.


## Local Setup

### 1\. Prerequisites & Installations

To run Inji Web, you must have **Node 18** installed.

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install Node 18
nvm install 18
```

### 2\. Running Locally (Non-Docker)

Recommended for frontend developers working on UI changes or deep codebase exploration.

```bash
# Navigate to the frontend directory
cd ./inji-web

# Install dependencies
npm install

# Start the application
npm start
```

The application will be accessible at: **[http://localhost:3004](http://localhost:3004)**.


### 3\. Running with Docker

#### Standalone Container

To build and run the Inji Web frontend as a standalone container, navigate to the project's root directory and execute the following:

```bash
# Navigate to the frontend directory
cd ./inji-web

# Build the docker image
docker build -t <dockerImageName>:<tag> .

# Run the docker image (add environment variables as needed)
docker run -e DEFAULT_LANG=en -it -p 3004:3004 <dockerImageName>:<tag>
```

#### Running with Docker Compose (Full Stack)

This is the recommended method to run Inji Web together with Mimoto, Redis, and Postgres to experience the full technical stack. Navigate to the project's root directory and run:

* **Start Services:**

  ```bash
    cd ./docker-compose
    docker-compose up
  ```

* **Stop Services:**

  ```bash
    cd ./docker-compose
    docker-compose down
  ```

**Accessing the Application:**
Once the Docker Compose services are healthy, the application can be accessed at: **[http://localhost:3004](http://localhost:3004)**

## Configuration

Inji Web connects to the Mimoto service. Configuration details, such as URLs to connect with this service and other environment-specific settings (e.g., `IGNORED_ISSUER_IDS`, `DEFAULT_LANG`) are updated in the `env.config.js` file.

To update configurations on a Linux environment:

1.  Open the file: `nano ./inji-web/public/env.config.js`
2.  Update the `MIMOTO_URL` to point to your running Mimoto service.
3.  Save and Exit: press `ctrl + o`, then `y` to save the changes, followed by `ctrl + x` to exit.


## Running Tests

Inji Web uses snapshot testing for layout consistency and Jest for unit testing.

* **Run all tests:** `npm test`
* **Update Snapshots:** `npm test -- -u`
* **Check Coverage:** `npm test -- --coverage`


## Databases

Inji Web itself is stateless; however, the **Mimoto (BFF)** it connects to requires a **PostgreSQL** database.

* **Persistent Storage:** Stores credentials for logged-in users.
* **Session Store:** Mimoto utilizes **Redis** for managing active sessions and volatile state.

Refer to the [Postgres Configuration Guide](https://github.com/inji/mimoto/blob/master/README.md) for Mimoto to set up the database.


## Upcoming Features

In the upcoming releases, the following [features](https://docs.inji.io/inji-wallet/inji-web/overview/features#features-in-the-pipeline) are planned:

* **Selective Disclosure (SD-JWT):** Ability to share specific attributes from a credential.
* **Revocation Status:** Real-time checking of VC validity.
* **mDoc/mDL Support:** Compatibility with mobile driving license standards.
* **Backup & Restore:** Enhanced persistent storage options for credentials.


## Documentation

* **API Documentation:**
  API endpoints, base URL (`/v1/mimoto`), and mock server details are available via Stoplight: [Mimoto API Documentation](https://mosip.stoplight.io/docs/mimoto).

* **OpenID4VP (presentation) guides:**

    * [OpenID4VP 1.0 / DCQL](docs/OpenID4VPIntegrationGuide.md)
    * [OpenID4VP Draft-23 / Presentation Exchange](docs/OpenID4VPDraft23IntegrationGuide.md)
    * [Mimoto OVP 1.0 API & UI contracts](https://github.com/inji/mimoto/blob/develop/docs/OVP-1.0-Support.md)

* **Product Documentation:**

    * To know more about Inji Web from a functional perspective, refer to the [Overview | Inji Web](https://docs.inji.io/inji-wallet/inji-web/overview).
    * Inji Web is a part of the Inji Stack; for full details, visit [Inji Docs](https://docs.inji.io/).

-----

## Contribution & Community

We welcome contributions from everyone!

* Refer to the [Code Contribution Guide](https://docs.inji.io/readme/contribution/code-contribution) to learn how you can contribute code to this application.
* If you have any questions or run into issues while trying out the application, feel free to post them in the [MOSIP Community](https://community.mosip.io/) — we’ll be happy to help you out.