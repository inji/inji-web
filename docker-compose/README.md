## Overview

This is the docker-compose setup to run 

- **mimoto-service** which act as BFF for Inji mobile and backend for Inji web.
- **inji-web** for frontend

This is not for production use.

## Navigate to inji-web folder and Build the inji-web image locally.

> docker build -t inji-web:local .

## What is in the docker-compose folder?

1. certs folder holds the p12 file which is being created as part of OIDC client onboarding.
2. "config" folder holds the mimoto system properties file, issuer configuration, verifier configuration and credential template.
3. "docker-compose.yml" file with mimoto setup.

## How to run this setup?
1. **Configuring Cache Providers:**

   By default, Mimoto uses Caffeine, a fast in-memory cache. This works well if you're running just one instance of Mimoto.

   But if you're running multiple Mimoto instances (like in Docker Swarm, Kubernetes, or a load-balanced setup), each instance has its own separate cache with Caffeine — they don’t talk to each other.

   In that case, switching to a shared cache like Redis is important. Redis lets all Mimoto instances share the same cached data, which helps keep things consistent and improves performance in distributed setups.

   For detailed setup instructions (including running Redis with Docker CLI and updating configuration), see the [Cache Providers Setup Guide](#cache-providers-setup-guide) section.

2. **Configuring Postgres Database:**
   1. **Ensure Postgres Service is Available and Connected**
      - **Using Local Postgres Installation:** If you have Postgres installed locally, you can follow the steps in [Mimoto `README.md`](https://github.com/mosip/mimoto/blob/develop/README.md)
      
      - **Using Docker Compose:** If you don't have postgres setup in your local you can run Postgres along with Mimoto by using the `postgres` service in [docker-compose.yml](docker-compose.yml).

      - **Or, run Postgres using Docker while starting Mimoto through your IDE:**
         * Use the following Docker command to start the Postgres service and expose it on the default port 5432. Make sure this port is accessible from your local machine.
            ```bash
                docker pull postgres:latest  # Pull the Postgres image if not already available
                docker run -d --name postgres \
                -e POSTGRES_USER=postgres \
                -e POSTGRES_PASSWORD=postgres \
                -e POSTGRES_DB=inji_mimoto \
                -p 5432:5432 \
                postgres:latest
            ```
         
   2. **Check data in postgres by using the following commands**
      ```bash
      docker exec -it postgres psql -U postgres -d inji_mimoto # connect to container
      
      \dt mimoto.* # to see all tables in mimoto schema
      
      SELECT * FROM mimoto.<table_name>; # to see data in a table
      ```
   
3. Refer to the [How to create Google Client Credentials](#how-to-create-google-client-credentials) section to create
   Google client credentials and replace the below placeholders of Mimoto service in the `docker-compose.yml` file with the generated credentials:
   ```yaml
       environment:
         - GOOGLE_OAUTH_CLIENT_ID=<your-client-id>
         - GOOGLE_OAUTH_CLIENT_SECRET=<your-client-secret>
   ```
   

4. Add identity providers as issuers in the `mimoto-issuers-config.json` file of [docker-compose config folder](config/mimoto-issuers-config.json). For each provider, create a corresponding object with its issuer-specific configuration. Refer to the [Issuers Configuration](#mimoto-issuers-configuration) section for details on how to structure this file and understand each field's purpose and what values need to be updated.

5. Add or update the verifiers clientId, redirect and response Uris in `mimoto-trusted-verifiers.json` file of [docker-compose config folder](config/mimoto-trusted-verifiers.json) for Verifiable credential Online Sharing.

6. In the root directory, create a certs folder and generate an OIDC client. Add the onboard client’s key to the oidckeystore.p12 file and place this file inside the certs folder.
   Refer to the [official documentation](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/customization-overview/credential_providers) for guidance on how to create the **oidckeystore.p12** file and add the OIDC client key to it.
   * The **oidckeystore.p12** file stores keys and certificates, each identified by an alias (e.g., mpartner-default-mimoto-insurance-oidc). Mimoto uses this alias to find the correct entry and access the corresponding private key during the authentication flow.
   * Update the **client_alias** field in the [mimoto-issuers-config.json](config/mimoto-issuers-config.json) file with this alias so that Mimoto can load the correct key from the keystore.
   * Also, update the **client_id** field in the same file with the client_id used during the onboarding process.
   * Set the `oidc_p12_password` environment variable in the Mimoto service configuration inside docker-compose.yml to match the password used for the **oidckeystore.p12** file.
   * Mimoto also uses this same keystore file (oidckeystore.p12) to store keys generated at service startup, which are essential for performing encryption and decryption operations through the KeyManager service.

7. To configure any Mobile Wallet specific configurations refer to the [Inji Mobile Wallet Configuration](#inji-mobile-wallet-configuration) section.

8. Choose your setup for starting the services:
   - **Starting all services via Docker Compose (including Inji Web):**
     Run the following command
   ```bash
      docker-compose up (# To run in foreground)
      # or 
      docker-compose up -d (# To run in detached mode or background)
   ```
   - **Running Inji Web in IDE and other services like `mimoto` via Docker Compose:**
     - Use the [Mimoto `docker-compose.yml`](https://github.com/mosip/mimoto/blob/develop/docker-compose/docker-compose.yml) file to start Mimoto and the required services, and refer to its [README](https://github.com/mosip/mimoto/blob/develop/docker-compose/README.md) for setup instructions.

9. To stop all the services, navigate to docker-compose folder and run the following command
   ```bash
   docker-compose down
   ```

10. To stop a specific service (e.g., inji-web) and remove its container and image, run the following commands
   ```bash
   docker-compose stop <service_name> # To stop a specific service container
   docker-compose rm <service_name> # To remove a specific service container
   docker rmi <image_name:tag> # To remove a specific service image
   ```

11. **Removing the Docker Volume:**
    - To remove the persistent data for a specific service within an application, you can delete its individual Docker volume. This is necessary in situations where you need to start fresh or when data has become corrupted.
    - For example, if you update the oidckeystore.p12 file, the mimoto service might fail to start. This happens because the new .p12 file may not contain the keys that are stored in the database's key alias table. Since these keys are used in the encryption and decryption flow, their absence prevents the service from functioning correctly. To fix this, you must remove the postgres-data volume to clear the old, encrypted data, which allows the service to start correctly with a new dataset.

    - Use the following command to remove the volume:
    ```Bash
    docker volume rm <volume_name> # E.g., docker volume rm docker-compose_postgres-data
    ```

12. Access Apis as
   * http://localhost:8099/v1/mimoto/allProperties
   * http://localhost:8099/v1/mimoto/issuers
   * http://localhost:8099/v1/mimoto/issuers/Mock
   * http://localhost:8099/v1/mimoto/issuers/Mock/well-known-proxy

## How to create Google Client Credentials

To enable Google OAuth2.0 authentication, follow these steps:

1. **Go to the Google Cloud Console**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/).

2. **Create a New Project**:
   - If you don’t already have a project, create a new one by clicking on the project dropdown and selecting "New Project".

3. **Enable the OAuth Consent Screen**:
   - Navigate to "APIs & Services" > "OAuth consent screen".
   - Select "External" for the user type and configure the required fields (e.g., app name, support email, etc.).
   - Save the changes.
4. **Create OAuth 2.0 Credentials**:
   - Navigate to "APIs & Services" > "Credentials".
   - Click "Create Credentials" > "OAuth 2.0 Client IDs".
   - Select "Web application" as the application type.

5. **Configure Authorized JavaScript Origins**:
   Depending on your environment, use the following values:

   - **Local or Docker**:
     ```
     http://localhost:8099
     ```
   - **Deployed domain (e.g., collab.mosip.net)**:
     ```
     https://collab.mosip.net

6. **Configure Authorized Redirect URIs**:
   - **Local or Docker**:
     ```
     http://localhost:8099/v1/mimoto/oauth2/callback/google
     ```
   - **Deployed domain (e.g., collab.mosip.net)**:
     ```
     https://collab.mosip.net/v1/mimoto/oauth2/callback/google
     ```

7. **Save and Retrieve Client Credentials**:
   - After saving, you will receive a `Client ID` and `Client Secret`.

## 📄Mimoto Issuers Configuration

The mimoto-issuers-config.json file defines the list of Credential Issuers that support Verifiable Credential issuance using the OpenID4VCI protocol. Mimoto uses it to load Issuer metadata configuration like logo, client details and endpoints needed for initiating and completing credential issuance.

### 🧩Structure and example

```json
{
  "issuers": [
    {
      "issuer_id": "Mock",
      "protocol": "OpenId4VCI",
      "display": [
        {
          "name": "Mock Identity",
          "logo": {
            "url": "https://inji.github.io/inji-config/logos/mosipid-logo.png",
            "alt_text": "mosip-logo"
          },
          "title": "Mock Identity",
          "description": "Download Mock Identity Credential",
          "language": "en"
        }
      ],
      "client_id": "wallet-demo",
      "wellknown_endpoint": "https://injicertify-mock.collab.mosip.net/v1/certify/issuance/.well-known/openid-credential-issuer",
      "redirect_uri": "io.mosip.residentapp.inji://oauthredirect",
      "authorization_audience": "https://esignet-mock.collab.mosip.net/v1/esignet/oauth/v2/token",
      "token_endpoint": "https://localhost:8099/v1/mimoto/get-token/Mock",
      "proxy_token_endpoint": "https://esignet-mock.collab.mosip.net/v1/esignet/oauth/v2/token",
      "client_alias": "wallet-demo-client",
      "qr_code_type": "OnlineSharing",
      "enabled": "true",
      "credential_issuer": "Mock",
      "credential_issuer_host": "https://injicertify-mock.collab.mosip.net"
    }
  ]
}
```

### Issuer configuration field Descriptions

| Field                    | Description                                                                                                                                                                      | Value                                                                                                                                                                                                                                         | Required  |
| ------------------------ |----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `issuer_id`              | Unique identifier for the Issuer                                                                                                                                                 | Use your own Issuer's name, e.g., `"HealthInsuranceIssuer"`                                                                                                                                                                                   | Mandatory |
| `credential_issuer`      | Logical name (usually the same as `issuer_id`)                                                                                                                                   | Same as above or a recognizable alias                                                                                                                                                                                                         | Mandatory |
| `display[]`              | A list of display configurations, one per supported language. Each object includes localized fields like `name`, `logo.url`, `logo.alt_text`, `language`, `title`, `description` | Provide user-facing display metadata such as Issuer name, logo, and descriptions. You can customize existing entries or add new ones for each supported language                                                                              | Mandatory |
| `protocol`               | Protocol used; must be `"OpenId4VCI"`                                                                                                                                            | Do not change unless the protocol evolves                                                                                                                                                                                                     | Mandatory |
| `client_id`              | OAuth client ID registered with the Issuer during onboarding                                                                                                                     | Replace with the client ID provided when onboarding Issuer with the Issuer’s authorization server                                                                                                                                             | Mandatory |
| `client_alias`           | Internal alias for the Issuer (e.g., used to fetch secure credentials of Issuer from keystore file `oidckeystore.p12`)                                                           | Set this to the alias value provided while inserting an entry for the Issuer into oidckeystore.p12 file during Issuer onboarding                                                                                                              | Mandatory |
| `wellknown_endpoint`     | URL to the Issuer's `.well-known/openid-credential-issuer` endpoint as per OpenID4VCI spec                                                                                       | Replace with your Issuer’s actual metadata endpoint to discover important configuration details about the Credential Issuer                                                                                                                   | Mandatory |
| `redirect_uri`           | OAuth2 redirect URI of your app where users are sent after authentication; must match one registered with the Issuer's authorization server                                      | Replace with one of the URI's that were registered during Issuer onboarding on the authorization server                                                                                                                                       | Mandatory |
| `authorization_audience` | Audience value for token requests                                                                                                                                                | Usually the base URL of the Issuer’s token service                                                                                                                                                                                            | Mandatory |
| `token_endpoint`         | Internal proxy token endpoint provided by Mimoto to forward requests to the real Auth server and it should be HTTPS URL                                                          | Use an internal/exposed domain or an ngrok URL if testing locally with the Inji mobile wallet                                                                                                                                                 | Mandatory |
| `proxy_token_endpoint`   | Actual token endpoint of the Authorization server                                                                                                                                | Replace with the Auth server's token endpoint URL                                                                                                                                                                                             | Mandatory |
| `qr_code_type`           | Type of QR code: `"OnlineSharing"` or `"EmbeddedVC"`                                                                                                                             | Use `"OnlineSharing"` to embed the OpenID4VP authorization request in a Verifiable Credential PDF QR code for verifiers to verify it. Use `"EmbeddedVC"` to embed the entire Verifiable Credential in the QR code (typically for offline use) | Optional  |
| `credential_issuer_host` | Host/domain of the credential Issuer                                                                                                                                             | Replace with your Issuer's domain                                                                                                                                                                                                             | Mandatory |
| `enabled`                | Enables or disables this Issuer configuration                                                                                                                                    | Set to `"false"` to disable or hide this Issuer                                                                                                                                                                                               | Mandatory |

### ✅ How to Add a New Issuer

1. Add a new Issuer object in the mimoto-issuers-config.json file using the structure, field descriptions, and example provided above.
2. Ensure:
   - All the configured endpoints for the Issuer and its Authorization server are reachable and functional.
   - `redirect_uri` matches one of the URIs registered with the Issuer’s Authorization server during Issuer onboarding.
   - `client_id` matches the one provided during Issuer onboarding with the Issuer's Authorization server.
   - `client_alias` for each Issuer is correctly configured and available in the oidckeystore.p12 file.
3. For step-by-step guidance on how to add a new Issuer and generate the oidckeystore.p12 file, refer to the [Customization Overview](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/customization-overview/credential_providers) documentation.

4. For sample UINs, refer to the [Customization Overview - Credential Providers](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/customization-overview/credential_providers#use-mock-data-from-collab-sandbox-env) documentation.

## Inji Mobile Wallet Configuration
To bind an Android or iOS wallet using the e-signet service via Mimoto, ensure the following property is updated in application-local.properties (if running Mimoto using IDE) or mimoto-default.properties (if running Mimoto using docker compose) to point to the appropriate e-signet instance running in your target environment
```properties
    mosip.esignet.host=<Host url of e-signet service> (E.g. https://esignet.env.mosip.net)
```

## Cache Providers Setup Guide

To use Redis (or any other cache provider), the service must be **running** and **accessible to Mimoto**. Both services (cache provider and Mimoto) must be on the same Docker network.  
This can be done by adding them to a shared network in your `docker-compose.yml` file, or by using the following commands if they are running separately.

**Example: Using Redis as Cache Provider**

1. **Ensure Redis Service is Available and Connected:**

    - **Using Docker Compose:** You can run Redis alongside Mimoto by adding the below lines in docker-compose.yml. Docker Compose ensures both services run on the same network automatically.
        1. Add the Redis service under the services section:
            ```yaml
             redis:
               image: redis:alpine
               container_name: 'redis'
               ports:
                 - "6379:6379"
               volumes:
                 - redis-data:/data
             ```
        2. Make Redis a dependency for the Mimoto service:
            ```yaml
             mimoto-service:
               depends_on:
                 - redis
            ```
        3. Add Redis data volume in the volumes section:
            ```yaml
             volumes:
               redis-data:
            ```

   - **Or, run Redis using Docker while starting Mimoto through your IDE (using the Mimoto repository):**
      - Use the following Docker command to start the Redis service and expose it on the default port 6379. Make sure this port is accessible from your local machine.
        ```bash
        docker pull redis:alpine # Pull the Redis image if not already available
        docker run -d --name redis -p 6379:6379 redis:alpine  # Start a Redis container named 'redis' and expose it on port 6379
        ```
      - Start Mimoto normally, following the instructions provided in the readme file of [Mimoto repository](https://github.com/mosip/mimoto/blob/develop/README.md).

2. **Update the following properties** in [mimoto-default.properties](config/mimoto-default.properties):
    ```properties
    spring.session.store-type=redis   # Store HTTP sessions in Redis
    spring.cache.type=redis           # Store application data in Redis
    ```

3. **Add and update the required Redis configurations** in [mimoto-default.properties](config/mimoto-default.properties),
   similar to those in the [application-default.properties](https://github.com/mosip/mimoto/blob/develop/src/main/resources/application-default.properties) file of the Mimoto repository.
   Look for properties starting with:
   - `spring.data.redis.*`
   - `spring.session.redis.*`

4. **Check the cached data of the redis by running the following command:**
    ```bash
    docker exec -it redis redis-cli
   ```

Note:
- Replace mosipbox.public.url, mosip.api.public.url with your public accessible domain. For dev or local env [ngrok](https://ngrok.com/docs/getting-started/) is recommended.
