# Inji Web UI Test Automation

## Overview

**Inji Web UI Test** is a web automation framework built with **Selenium**, **Cucumber**, and **TestNG**.
It covers positive and negative test scenarios for the Inji Web application, supports parallel execution, BrowserStack integration, and generates Extent HTML reports.

---

## Prerequisites

Install the following on the machine where tests will run:

| Requirement | Version |
|---|---|
| JDK | 21 |
| Maven | 3.6.0 or higher |
| Google Chrome | Latest stable |
| ChromeDriver | Matching Chrome version (auto-managed) |

---

## Project Structure

```text
ui-test/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── base/           # BasePage — core Selenium helpers
│   │   │   ├── pages/          # Page Object classes
│   │   │   ├── stepdefinitions/# Cucumber step definitions
│   │   │   ├── runnerfiles/    # TestNG Runner
│   │   │   └── utils/          # BaseTest, config, reporting, listeners
│   │   └── resources/
│   │       ├── config/
│   │       │   └── injiweb.properties   # All config properties
│   │       └── Known_Issues.txt         # Known bug skip list
│   └── test/
│       └── resources/
│           └── featurefiles/   # Cucumber feature files
├── testNgXmlFiles/
│   ├── MasterTestSuite.xml
│   └── TestNg.xml
└── test-output/                # Generated HTML reports (after run)
```

---

## Configuration

All configuration lives in **`src/main/resources/config/injiweb.properties`**.
Update this file before running. Placeholders use `<VALUE>` notation; inline comments show allowed values or examples.

```properties
# ── Environment URLs ─────────────────────────────────────────────────────────

# Base URL of the Inji Web UI under test.
injiWebUi=<https://injiweb.<env>.mosip.net/>             # e.g. https://injiweb.dev.mosip.net/

# Internal API endpoint for MOSIP backend calls.
apiInternalEndPoint=<https://api-internal.<env>.mosip.net>

# Mimoto actuator endpoint (used to fetch runtime config).
actuatorMimotoEndpoint=/v1/mimoto/actuator/env           # usually unchanged

# Insurance registry URL.
InsuranceUrl=<https://registry.<env>.mosip.net/api/v1/Insurance>

# ── Keycloak ─────────────────────────────────────────────────────────────────

keycloak-external-url=<https://iam.<env>.mosip.net>

# ── PostgreSQL ───────────────────────────────────────────────────────────────

audit_url=<jdbc:postgresql://<db-host>:5432/mosip_audit>
partner_url=<jdbc:postgresql://<db-host>:5432/mosip_ida>
db-server=<db-host>                                      # e.g. released.mosip.net

# ── Passwords / Secrets ──────────────────────────────────────────────────────

keycloak_Password=<keycloak-admin-password>
audit_password=<postgres-audit-db-password>
partner_password=<postgres-partner-db-password>
postgres-password=<postgres-root-password>

mosip_partner_client_secret=<partner-client-secret>
mosip_pms_client_secret=<pms-client-secret>
mosip_resident_client_secret=<resident-client-secret>
mosip_idrepo_client_secret=<idrepo-client-secret>
mosip_reg_client_secret=<reg-client-secret>
mosip_admin_client_secret=<admin-client-secret>
mosip_hotlist_client_secret=<hotlist-client-secret>
mosip_regproc_client_secret=<regproc-client-secret>
mpartner_default_mobile_secret=<mpartner-mobile-secret>
mosip_testrig_client_secret=<testrig-client-secret>
AuthClientSecret=<auth-client-secret>

# ── Google OIDC (for Gmail login scenarios) ───────────────────────────────────

INJIWEB_GOOGLE_CLIENT_ID=<google-oauth-client-id>
INJIWEB_GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
INJIWEB_GOOGLE_REFRESH_TOKEN=<google-oauth-refresh-token>  # see "Refresh Token" section below

# ── BrowserStack ─────────────────────────────────────────────────────────────

browserstack_username=<browserstack-username>
browserstack_access_key=<browserstack-access-key>

# ── Execution Mode ───────────────────────────────────────────────────────────

# Run on BrowserStack cloud or local ChromeDriver.
runOnBrowserStack=<true|false>                           # true = BrowserStack, false = local

# Run Chrome in headless mode. Recommended true for parallel runs (prevents
# window focus stealing that closes dropdowns between threads).
headless=<true|false>                                    # true = headless, false = visible browser

# ── Thread Count ─────────────────────────────────────────────────────────────

# Used when runOnBrowserStack=true. BrowserStack plan limits apply (max 5).
browserStackRunThreadCount=<1-5>                         # e.g. 5

# Used when runOnBrowserStack=false.
localRunThreadCount=<1-10>                               # e.g. 5

# ── Wait Times ───────────────────────────────────────────────────────────────

# Default explicit wait for UI elements (seconds).
waitTime=<seconds>                                       # e.g. 30

# Short wait for negative / quick presence checks (seconds).
shortWaitTime=<seconds>                                  # e.g. 3

# Wait after each OTP click before retrying (seconds).
otpVerificationPageWaitTime=<seconds>                    # e.g. 5

# ── Issuer Search Text ───────────────────────────────────────────────────────

# Exact display name of the MOSIP issuer in the UI (env-specific).
issuerSearchText=<issuer-display-name>                   # e.g. "National Identity Department"

# Exact display name of the Sunbird issuer in the UI.
issuerSearchTextforSunbird=<sunbird-issuer-display-name> # e.g. "StayProtected Insurance"

# ── Misc ─────────────────────────────────────────────────────────────────────

# Notification channel used for mock OTP delivery.
mockNotificationChannel=<email|phone|email,phone>        # e.g. email,phone

# Enable/disable verbose debug logging.
enableDebug=<yes|no>                                     # yes = verbose, no = standard

# XSS protection header check.
xssProtectionCheck=<yes|no>                              # usually no

# MOSIP component base URLs (semicolon-separated key=host pairs). Leave blank to use defaults.
mosip_components_base_urls=<key=host;key=host;...>
# e.g. auditmanager=api-internal.dev.mosip.net;idrepository=api-internal.dev.mosip.net

# Module name pattern for filtering actuator output. Leave blank for all modules.
moduleNamePattern=<regex>                                # e.g. (mimoto|resident)
```

> **Tip:** All secrets can also be supplied as environment variables — they override `injiweb.properties` values.
> See the [Environment Variables](#environment-variables) section.

---

## Environment Variables

These variables override the corresponding `injiweb.properties` values when set:

| Variable | Overrides property | Example |
|---|---|---|
| `TEST_URL` | `injiWebUi` | `https://injiweb.dev.mosip.net/` |
| `RUN_ON_BROWSERSTACK` | `runOnBrowserStack` | `true` / `false` |
| `BROWSERSTACK_USERNAME` | `browserstack_username` | `myuser_abc123` |
| `BROWSERSTACK_ACCESS_KEY` | `browserstack_access_key` | `abc123XYZ` |
| `INJIWEB_GOOGLE_CLIENT_ID` | `INJIWEB_GOOGLE_CLIENT_ID` | `1234...apps.googleusercontent.com` |
| `INJIWEB_GOOGLE_CLIENT_SECRET` | `INJIWEB_GOOGLE_CLIENT_SECRET` | `GOCSPX-...` |
| `INJIWEB_GOOGLE_REFRESH_TOKEN` | `INJIWEB_GOOGLE_REFRESH_TOKEN` | `1//0g...` |
| `issuerSearchText` | `issuerSearchText` | `National Identity Department` |
| `issuerSearchTextforSunbird` | `issuerSearchTextforSunbird` | `StayProtected Insurance` |

---

## Known Issues

Scenarios matching an entry in `src/main/resources/Known_Issues.txt` are automatically **skipped** (not failed) and reported as **KNOWN_ISSUE** in the HTML report.

Format — one entry per line:

```text
BUGID------Exact Scenario Name
```

Example:

```text
INJIWEB-1234------Verify the Credential Details Page for mosip in configured langauge
```

Lines starting with `#` are treated as comments.

---

## Running Tests

### Build

```bash
cd ui-test
mvn clean package -DskipTests
```

### Run via JAR (recommended for CI)

```bash
java -jar target/uitest-injiweb-0.15.0-SNAPSHOT.jar
```

Override properties at runtime:

```bash
TEST_URL=https://injiweb.dev.mosip.net/ \
java -Dcucumber.filter.tags="@smoke" \
     -jar target/uitest-injiweb-0.18.0-SNAPSHOT.jar
```

Run a specific feature file or line:

```bash
java -Dcucumber.features="src/test/resources/featurefiles/downloadMosipCredentials.feature:31" \
     -jar target/uitest-injiweb-0.15.0-SNAPSHOT.jar
```

---

### Run in Eclipse

1. **Import project** — `File > Import > Existing Maven Projects` → select the `ui-test` folder → Finish.
2. **Install plugins** — Install **TestNG for Eclipse** from the Eclipse Marketplace (`Help > Eclipse Marketplace > search "TestNG"`).
3. **Update `injiweb.properties`** with your environment values.
4. **Run via TestNG XML**:
   - Right-click `testNgXmlFiles/MasterTestSuite.xml` → `Run As > TestNG Suite`.
5. **Run via Runner class**:
   - Right-click `src/main/java/runnerfiles/Runner.java` → `Run As > Java Application`.
6. **Run a single scenario by tag**:
   - Open `Run Configurations` → `VM Arguments` → add `-Dcucumber.filter.tags="@YourTag"`.

---

### Run in IntelliJ IDEA

1. **Open project** — `File > Open` → select the `ui-test` folder. IntelliJ detects the Maven project automatically.
2. **Install plugin** — Ensure **Cucumber for Java** and **Gherkin** plugins are enabled (`Settings > Plugins`).
3. **Update `injiweb.properties`** with your environment values.
4. **Run via TestNG XML**:
   - Right-click `testNgXmlFiles/MasterTestSuite.xml` → `Run`.
5. **Run via Runner class**:
   - Right-click `src/main/java/runnerfiles/Runner.java` → `Run 'Runner.main()'`.
6. **Run a single scenario by tag**:
   - Open `Run/Debug Configurations` → `Runner` → `VM options` → add `-Dcucumber.filter.tags="@YourTag"`.
7. **Run a feature file directly**:
   - Open any `.feature` file → click the green arrow next to a scenario → `Run Scenario`.

---

### Run in VS Code

1. **Open folder** — `File > Open Folder` → select the `ui-test` folder.
2. **Install extensions**:
   - **Extension Pack for Java** (Microsoft)
   - **Cucumber (Gherkin) Full Support** (Alexander Krechik)
   - **Test Runner for Java** (Microsoft)
3. **Update `injiweb.properties`** with your environment values.
4. **Run via Maven**:
   - Open the **Maven** side panel → `uitest-injiweb > Plugins > exec` → or use the terminal:
   ```bash
   mvn clean package -DskipTests
   java -jar target/uitest-injiweb-0.18.0-SNAPSHOT.jar
   ```
5. **Run with a tag filter** (terminal):
   ```bash
   java -Dcucumber.filter.tags="@smoke" -jar target/uitest-injiweb-0.18.0-SNAPSHOT.jar
   ```
6. **Run a single feature file** (terminal):
   ```bash
   java -Dcucumber.features="src/test/resources/featurefiles/downloadMosipCredentials.feature" \
        -jar target/uitest-injiweb-0.18.0-SNAPSHOT.jar
   ```

---

## Refresh Token Generation (Google OIDC)

Required for test scenarios that log in via Gmail.

1. Open this URL in a browser (replace placeholders):

```text
https://accounts.google.com/o/oauth2/auth?client_id=<CLIENT_ID>&redirect_uri=<REDIRECT_URI>&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent
```

2. Log in with the test Gmail account.

3. Copy the `code` parameter from the redirect URL. Replace `%2F` with `/`.

4. Exchange the code for a refresh token:

```bash
curl --location 'https://oauth2.googleapis.com/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'code=<AUTH_CODE>' \
  --data-urlencode 'client_id=<CLIENT_ID>' \
  --data-urlencode 'client_secret=<CLIENT_SECRET>' \
  --data-urlencode 'redirect_uri=<REDIRECT_URI>' \
  --data-urlencode 'grant_type=authorization_code'
```

5. Copy `refresh_token` from the response and set it in `injiweb.properties` or as the `INJIWEB_GOOGLE_REFRESH_TOKEN` environment variable.

---

## BrowserStack Integration

1. Sign up at [browserstack.com](https://www.browserstack.com) and get your `Username` and `Access Key` from the dashboard.
2. Set credentials via environment variables (preferred) or in `injiweb.properties`:
   ```properties
   browserstack_username=<your-username>
   browserstack_access_key=<your-access-key>
   ```
3. Set `runOnBrowserStack=true` in `injiweb.properties`.
4. Control parallel thread count with `browserStackRunThreadCount` (max 5 for most plans).
5. Run:
   ```bash
   java -jar target/uitest-injiweb-0.18.0-SNAPSHOT.jar
   ```

---

## Reports

HTML reports are generated in:

```text
ui-test/test-output/
```

Report filename format:

```text
InjiWebUi-<env-domain>-<yyyy-MM-dd-HH-mm>-T-<total>-P-<passed>-F-<failed>-S-<skipped>-I-<ignored>-KI-<known-issues>.html
```

| Suffix | Meaning |
|---|---|
| `T` | Total scenarios |
| `P` | Passed |
| `F` | Failed |
| `S` | Skipped (prerequisite failure) |
| `I` | Ignored (threshold / environment constraint) |
| `KI` | Known Issue (skipped due to tracked bug) |

---