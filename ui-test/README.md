# Inji Web Automation — Web Automation Framework using Selenium with Cucumber

## Overview

**Inji-Web-Test Automation** is a robust and comprehensive web automation framework built using **Selenium** and **Cucumber**.
It's specifically designed to automate testing scenarios for the Inji web application, covering both positive and negative test cases.
The framework's modular structure and efficient execution capabilities ensure thorough testing of the application's functionality.

---

## Pre-requisites

Ensure the following software is installed on the machine from where the automation tests will be executed:

- JDK 21
- Maven 3.6.0 or higher
- Google Client ID and Secret for OIDC login with Gmail
- Gmail Refresh Token

Set the environment variables as follows:

```bash
export INJIWEB_GOOGLE_REFRESH_TOKEN=<<refresh_token>>
export INJIWEB_GOOGLE_CLIENT_ID=<<google_client_id>>
export INJIWEB_GOOGLE_CLIENT_SECRET=<<client_secret>>
export TEST_URL=<<url>>
```

---

## Configuration

Update Configuration Files as per Environment
Update the below configuration files by replacing the environment-specific values with the target environment details.

```
Example(for dev environment):

update src\main\resources\config\injiweb.properties
apiEnvUser=api-internal.dev
apiInternalEndPoint=https://api-internal.dev.mosip.net
injiverify=https://injiverify.dev.mosip.net/
injiweb=https://injiweb.dev.mosip.net/issuers
InsuranceUrl=https://registry.dev.mosip.net/api/v1/Insurance
actuatorMimotoEndpoint=/v1/mimoto/actuator/dev
eSignetbaseurl=https://esignet-mosipid.dev.mosip.net
Note:- all are config properties has to be updated by replacing the 'dev' with actual env name/url

update src\test\resources\config.properties
issuerSearchText=National Identity Department
issuerSearchTextforSunbird=StayProtected Insurance

Note :- update as per the env ex. if it needs to select the for dev use it as 'National Identity Department (dev)'
```
---


## Refresh Token Generation Steps

1. Open the following URL in your browser (replace placeholders with actual values):

```
https://accounts.google.com/o/oauth2/auth?client_id=<<client_id>>&redirect_uri=<<redirect_uri>>&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent
```

2. Provide the **username** and **password** when the API prompts for authentication.

3. After login, you'll be redirected to a URL with a `code` parameter. Example:

```
4%2F0AUJR-x7uK8cRZhqIOZkC1lxt0nWuNvRK3IFVEHmnX5y5y-RPFvSK9-lq9IZbvpRbyfftDA
```

4. Replace `%2F` with `/`:

```
4/0AUJR-x7uK8cRZhqIOZkC1lxt0nWuNvRK3IFVEHmnX5y5y-RPFvSK9-lq9IZbvpRbyfftDA
```

5. Execute the following `curl` command to get the refresh token:

```bash
curl --location 'https://oauth2.googleapis.com/token'   --header 'Content-Type: application/x-www-form-urlencoded'   --data-urlencode 'code=<<code>>'   --data-urlencode 'client_id=<<client_id>>'   --data-urlencode 'client_secret=<<client_secret>>'   --data-urlencode 'redirect_uri=<<redirect_uri>>'
```

---

## BrowserStack Integration

1. Sign up for BrowserStack and get your `username` and `accessKey` from the home page.
2. Update the `browserstack.yml` file with your credentials or export the details as environment variables.

```bash
export BROWSERSTACK_ACCESS_KEY=<<accessKey>>
export BROWSERSTACK_USERNAME=<<username>>
```


3. Choose a device and platform from the list:
   [https://www.browserstack.com/list-of-browsers-and-platforms/automate](https://www.browserstack.com/list-of-browsers-and-platforms/automate)
4. Open a terminal and navigate to the project root:

```bash
cd ../inji-web-test
```

5. Build the project:

```bash
mvn clean package
```

6. Execute the test suite using the following command. Update the JAR version and environment details as required.

```bash
java -Denv.user=api-internal.released -Denv.endpoint=https://api-internal.released.mosip.net -Denv.testLevel=smokeAndRegression -jar target/uitest-injiweb-0.15.0-SNAPSHOT.jar
```

---

## Reports

Test reports will be generated under:

```
ui-test/test-output/
```

---
