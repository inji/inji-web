package utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.*;
import io.mosip.testrig.apirig.testrunner.BaseTestCase;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.SkipException;

import com.browserstack.local.Local;

import io.cucumber.plugin.event.PickleStepTestStep;
import io.cucumber.plugin.event.TestStep;
import io.mosip.testrig.apirig.utils.ConfigManager;
import io.mosip.testrig.apirig.utils.S3Adapter;
import models.Uin;
import models.Policy;
import utils.testdatamanager.UINManager;
import utils.testdatamanager.PolicyManager;

public class BaseTest {
    private static final Logger logger = LoggerFactory.getLogger(BaseTest.class);
    private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();
    private static final ThreadLocal<JavascriptExecutor> JSE = new ThreadLocal<>();
    private static final ThreadLocal<Integer> STEP_COUNTER = ThreadLocal.withInitial(() -> 1);
    private static final ThreadLocal<Boolean> SCENARIO_FAILED = ThreadLocal.withInitial(() -> false);
    private static final ThreadLocal<Boolean> skipScenario = ThreadLocal.withInitial(() -> false);
    private static final ThreadLocal<String> skipReason = new ThreadLocal<>();
    // Distinct from skipScenario: "Ignored" means the scenario was deliberately
    // bypassed due to a threshold/environment constraint (not a prerequisite failure).
    // S = pre-req skip, I = threshold-based ignore — reported separately in counts.
    private static final ThreadLocal<Boolean> scenarioIgnored = ThreadLocal.withInitial(() -> false);
    // Set to true when @Before throws NoUINAvailableException / NoPolicyAvailableException
    // so afterScenario can skip reporting/counting for this intermediate retry attempt.
    private static final ThreadLocal<Boolean> uinRetryAttempt = ThreadLocal.withInitial(() -> false);
    private static final ThreadLocal<Boolean> policyRetryAttempt = ThreadLocal.withInitial(() -> false);
    private static final AtomicBoolean BROWSERSTACK_LOCAL_STARTED = new AtomicBoolean(false);
    private static final Object BROWSERSTACK_LOCAL_LOCK = new Object();

    // ── Known Issues ──────────────────────────────────────────────────────────────
    public static final AtomicInteger knownIssueCount = new AtomicInteger(0);
    private static final ThreadLocal<Boolean> isKnownIssueScenario = new ThreadLocal<>();
    // ─────────────────────────────────────────────────────────────────────────────

    // Prerequisite dependency: all @oidcLogin scenarios (except @walletCreation itself)
    // wait on this latch. The @walletCreation scenario counts it down when it finishes.
    private static final CountDownLatch WALLET_CREATION_LATCH = new CountDownLatch(1);
    private static volatile boolean walletCreationPassed = false;

    // Gate between "uses 123456" and "resets passcode" groups.
    // The three @preResetPasscode scenarios (Profile, Home, Download card) each
    // count this down once when they finish. @resetPasscodeScenario waits for 0
    // before touching the passcode, so it never races a live 123456 session.
    // Count is hardcoded to match the number of @preResetPasscode scenarios.
    // The @NeedsUIN/@NeedsPolicy scenario may retry; we only count down on a real
    // run (uinRetryAttempt==false) to avoid decrementing on intermediate retries.
    // A 30-minute timeout is the safety net if that scenario is permanently skipped.
    private static final int PRE_RESET_SCENARIO_COUNT = 3;
    private static final CountDownLatch PRE_RESET_LATCH = new CountDownLatch(PRE_RESET_SCENARIO_COUNT);
    // Tracks which scenario IDs have already counted down so retries don't double-decrement.
    private static final java.util.Set<String> preResetCompleted = java.util.concurrent.ConcurrentHashMap.newKeySet();

    // Gate between "resets passcode" and "uses 111111" groups.
    // @resetPasscodeScenario counts this down; @afterResetPasscode scenarios wait on it.
    private static final CountDownLatch RESET_PASSCODE_LATCH = new CountDownLatch(1);
    private static volatile boolean resetPasscodePassed = false;

    // Serialization lock for @afterResetPasscode scenarios.
    // All scenarios in this group enter wrong passcodes against the same wallet.
    // Running them concurrently accumulates attempts across threads, pushing the
    // wallet past maxFailedAttempts and triggering unexpected temporary/permanent
    // locks in scenarios that aren't supposed to hit the lock threshold.
    // A Semaphore(1) ensures only ONE @afterResetPasscode scenario is active at
    // a time so each starts with a clean attempt counter.
    private static final java.util.concurrent.Semaphore AFTER_RESET_SEMAPHORE =
            new java.util.concurrent.Semaphore(1);
    private static final ThreadLocal<Boolean> afterResetSemaphoreHeld =
            ThreadLocal.withInitial(() -> false);

    private static Local browserStackLocal;
    private static int passedCount = 0;
    private static int failedCount = 0;
    private static int totalCount = 0;
    private static int skippedCount = 0;  // S: prerequisite-failure skips
    private static int ignoredCount = 0;  // I: threshold/environment-constraint ignores
    private static HashMap<String, Integer> walletPasscodeSettingsCache;

    private static final String buildIdentifier = "#" + new SimpleDateFormat("dd-MMM-HH:mm").format(new Date());
    private final boolean runOnBrowserStack = isBrowserStackRunEnabled();
    private final String username = getEnvOrProperty("BROWSERSTACK_USERNAME", "browserstack_username");
    private final String accessKey = getEnvOrProperty("BROWSERSTACK_ACCESS_KEY", "browserstack_access_key");
    public final String URL = "https://" + username + ":" + accessKey + "@hub-cloud.browserstack.com/wd/hub";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static final String url = System.getenv("TEST_URL") != null && !System.getenv("TEST_URL").isEmpty()
            ? System.getenv("TEST_URL")
            : InjiWebConfigManager.getproperty("injiWebUi");

    public void setDriver(WebDriver driver) {
        DRIVER.set(driver);
        if (driver instanceof JavascriptExecutor) {
            JSE.set((JavascriptExecutor) driver);
        }
    }

    public static boolean isScenarioSkipped() {
        return skipScenario.get();
    }

    public static String getSkipReason() {
        return skipReason.get();
    }

    public static void markScenarioSkipped(String reason) {
        skipScenario.set(true);
        skipReason.set(reason);
    }

    /**
     * Marks the scenario as IGNORED (threshold/environment constraint).
     * Also sets the skipScenario flag so @BeforeStep skips all steps — the
     * distinction from a regular skip is visible only in the counts and report.
     */
    public static void markScenarioIgnored(String reason) {
        scenarioIgnored.set(true);
        markScenarioSkipped(reason); // re-use step-skipping machinery
    }

    public static boolean isScenarioIgnored() {
        return scenarioIgnored.get();
    }

    public static void clearScenarioState() {
        skipScenario.remove();
        skipReason.remove();
        scenarioIgnored.remove();
    }

    public static void clearExecutionState() {
        STEP_COUNTER.set(0);
        SCENARIO_FAILED.set(false);
    }

    @Before(order = 50)
    public void checkKnownIssue(Scenario scenario) {
        if (!runnerfiles.Runner.knownIssues.containsKey(scenario.getName())) {
            return;
        }
        isKnownIssueScenario.set(true);
        totalCount++;
        ExtentReportManager.initReport();
        ExtentReportManager.createTest(scenario.getName());
        throw new SkipException("[KNOWN ISSUE] " + runnerfiles.Runner.knownIssues.get(scenario.getName()));
    }

    @Before
    public void beforeAll(Scenario scenario) throws MalformedURLException {

        try {
            // ============================
            // 🔹 UIN / POLICY LOGIC
            // ============================

            if (scenario.getSourceTagNames().contains("@NeedsUIN")) {
                Uin uin = UINManager.tryAcquireUIN();
                if (uin == null) {
                    String msg = "...";
                    logger.warn(msg);
                    uinRetryAttempt.set(true);
                    throw new NoUINAvailableException(msg);
                }
            }

            if (scenario.getSourceTagNames().contains("@NeedsPolicy")) {
                Policy policy = PolicyManager.tryAcquirePolicy();
                if (policy == null) {
                    String msg = "...";
                    logger.warn(msg);
                    policyRetryAttempt.set(true);
                    throw new NoPolicyAvailableException(msg);
                }
            }

            // ============================
            // 🔹 REPORT INIT (ONLY REAL RUN)
            // ============================

            totalCount++;
            ExtentReportManager.initReport();
            ExtentReportManager.createTest(scenario.getName());

            if (isScenarioIgnored()) {
                throw new SkipException("IGNORED: " + getSkipReason());
            }

            clearScenarioState();   // flags
            clearExecutionState();  // counters

            // ============================
            // 🔹 DRIVER SETUP
            // ============================
            WebDriver driver;
            if (runOnBrowserStack) {
                startBrowserStackLocal();
                DesiredCapabilities capabilities = new DesiredCapabilities();
                capabilities.setCapability("browserName", "Chrome");
                capabilities.setCapability("browserVersion", "latest");
                capabilities.setCapability("pageLoadStrategy", "eager");

                HashMap<String, Object> browserstackOptions = new HashMap<>();
                browserstackOptions.put("os", "Windows");
                browserstackOptions.put("local", true);
                browserstackOptions.put("resolution", "1920x1080");
                browserstackOptions.put("interactiveDebugging",
                        Boolean.parseBoolean(System.getenv().getOrDefault("BROWSERSTACK_INTERACTIVE_DEBUGGING", "true")));

                browserstackOptions.put("projectName", "InjiWeb UI Suite");
                browserstackOptions.put("buildName", "InjiWeb - " + getEnvName() + " " + buildIdentifier);
                browserstackOptions.put("sessionName", scenario.getName());

                capabilities.setCapability("bstack:options", browserstackOptions);
                driver = new RemoteWebDriver(new URL(URL), capabilities);
            } else {
                ChromeOptions options = new ChromeOptions();
                options.setPageLoadStrategy(org.openqa.selenium.PageLoadStrategy.EAGER);
                if (InjiWebConfigManager.isHeadless()) {
                    options.addArguments("--headless=new");
                    options.addArguments("--disable-gpu");
                    options.addArguments("--no-sandbox");
                    options.addArguments("--disable-dev-shm-usage");

                    options.addArguments("--force-device-scale-factor=1");
                    options.addArguments("--high-dpi-support=1");
                }
                HashMap<String, Object> chromePrefs = new HashMap<>();
                chromePrefs.put("download.default_directory", getLocalDownloadDirectory());
                chromePrefs.put("download.prompt_for_download", false);
                chromePrefs.put("plugins.always_open_pdf_externally", true);
                options.setExperimentalOption("prefs", chromePrefs);
                driver = new ChromeDriver(options);
            }

            DRIVER.set(driver);
            JSE.set((JavascriptExecutor) driver);
            driver.manage().timeouts().implicitlyWait(Duration.ZERO);

            if (!InjiWebConfigManager.isHeadless() || runOnBrowserStack) {
                driver.manage().window().maximize();
            }

            // ============================
            // 🔹 NAVIGATION
            // ============================
            driver.get(url);
        } catch (SkipException | PendingException e) {
            throw e;
        } catch (NoUINAvailableException | NoPolicyAvailableException e) {
            markScenarioFailed();
            throw new RuntimeException(e);
        } catch (Exception e) {

            // ✅ Mark failure globally
            markScenarioFailed();

            // ✅ Ensure report exists before logging
            try {
                ExtentReportManager.initReport();
                ExtentReportManager.createTest(scenario.getName());
            } catch (Exception ignored) {
            }

            // ✅ Log setup failure
            ExtentReportManager.logFailure(
                    "Failure during test setup (Before hook)",
                    "Driver Initialization / Navigation",
                    e
            );

            // ✅ Attach screenshot if possible
            if (DRIVER.get() != null) {
                try {
                    ScreenshotUtil.attachScreenshot(DRIVER.get(), "BeforeFailure");
                } catch (Exception ignored) {
                }
            }

            // ❌ STOP execution immediately
            throw new RuntimeException("Test setup failed", e);
        }
    }

    // order=100: runs before latch waits (500/600), semaphore acquisition (700),
    // and browser creation (10000) so an ignored scenario wastes none of those resources.
    @Before(value = "@skipBasedOnThreshold", order = -100)
    public void skipScenarioBasedOnThreshold(Scenario scenario) {
        try {
            Integer retryBlockedUntil = getWalletPasscodeSettings().get("retryBlockedUntil");

            if (retryBlockedUntil == null) {
                throw new RuntimeException("retryBlockedUntil not found in actuator response");
            }

            String envThreshold = System.getenv("THRESH_TEMP_LOCK");
            int tempLockThreshold = (envThreshold != null && !envThreshold.isEmpty())
                    ? Integer.parseInt(envThreshold)
                    : 1;

            if (retryBlockedUntil > tempLockThreshold) {
                String reason = "Ignored due to threshold breach<br>"
                        + "<b>retryBlockedUntil:</b> " + retryBlockedUntil + " min<br>"
                        + "<b>tempLockThreshold:</b> " + tempLockThreshold + " min<br>"
                        + "<b>Impact:</b> Requires waiting " + retryBlockedUntil + " min which exceeds allowed threshold";
                logger.info("[IGNORED] Scenario '{}': {}", scenario.getName(), reason);
                markScenarioIgnored(reason);
                throw new io.cucumber.java.PendingException("IGNORED: " + reason);
            }
        } catch (Exception e) {
            logger.error("Error checking threshold for scenario '{}'", scenario.getName(), e);

            // ✅ fail fast OR mark ignored
            markScenarioIgnored("Error while evaluating threshold: " + e.getMessage());
        }
    }

    @BeforeStep
    public void stopExecutionIfNeeded() {

        if (Boolean.TRUE.equals(isKnownIssueScenario.get())
                || BaseTest.isScenarioSkipped()
                || BaseTest.isScenarioIgnored()
                || BaseTest.isScenarioFailed()) {

            throw new io.cucumber.java.PendingException("Stopping execution");
        }
    }

    /**
     * Records whether the @prerequisite scenario passed or failed, then releases
     * the latch so all waiting dependent scenarios can proceed (or skip).
     */
    @After("@walletCreation")
    public void recordPrerequisiteResult(Scenario scenario) {
        walletCreationPassed = !scenario.isFailed();
        WALLET_CREATION_LATCH.countDown();
        logger.info("Prerequisite scenario '{}' {} — dependent scenarios will {}",
                scenario.getName(),
                walletCreationPassed ? "PASSED" : "FAILED",
                walletCreationPassed ? "run" : "be skipped");
    }

    /**
     * Counts down PRE_RESET_LATCH once per @preResetPasscode scenario.
     * Skipped when the scenario is a UIN/Policy retry attempt so intermediate
     * retries don't prematurely release the gate.
     */
    @After("@preResetPasscode")
    public void countDownPreResetLatch(Scenario scenario) {
        if (!uinRetryAttempt.get() && !policyRetryAttempt.get()) {
            if (preResetCompleted.add(scenario.getId())) {
                PRE_RESET_LATCH.countDown();
                logger.info("PRE_RESET_LATCH decremented by '{}' — remaining: {}",
                        scenario.getName(), PRE_RESET_LATCH.getCount());
            }
        }
    }

    /**
     * @resetPasscodeScenario must not start until all @preResetPasscode scenarios
     * have finished — they all use passcode 123456 which this scenario will change.
     * Runs at order=600, after the wallet-creation check at order=500.
     */
    @Before(value = "@resetPasscodeScenario", order = 600)
    public void waitForPreResetScenariosToComplete(Scenario scenario) {
        try {
            if (isScenarioIgnored()) {
                return;
            }
            boolean completed = PRE_RESET_LATCH.await(10, TimeUnit.MINUTES);
            if (!completed) {
                logger.warn("PRE_RESET_LATCH timed out after 10 min for '{}' — proceeding anyway",
                        scenario.getName());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Interrupted while waiting for PRE_RESET_LATCH in '{}'", scenario.getName());
        }
    }

    /**
     * Records the result of @resetPasscodeScenario and releases RESET_PASSCODE_LATCH
     * so all @afterResetPasscode scenarios can proceed (or skip on failure).
     */
    @After("@resetPasscodeScenario")
    public void recordResetPasscodeResult(Scenario scenario) {
        resetPasscodePassed = !scenario.isFailed();
        RESET_PASSCODE_LATCH.countDown();
        logger.info("Reset passcode scenario '{}' {} — @afterResetPasscode scenarios will {}",
                scenario.getName(),
                resetPasscodePassed ? "PASSED" : "FAILED",
                resetPasscodePassed ? "run" : "be skipped");
    }

    /**
     * Dependent scenarios wait here until the @walletCreation scenario finishes.
     * If the prerequisite failed (or never ran within the timeout), this scenario
     * is marked as skipped so no browser steps are wasted.
     */
    @Before(value = "@oidcLogin and not @walletCreation", order = 500)
    public void checkPrerequisiteScenarioPassed(Scenario scenario) {
        try {
            boolean completed = WALLET_CREATION_LATCH.await(10, TimeUnit.MINUTES);
            if (!completed) {
                String reason = "Prerequisite scenario did not complete within the 10-minute timeout";
                logger.warn("{} — skipping: {}", reason, scenario.getName());
                markScenarioSkipped(reason);
                throw new SkipException(reason);
            }
            if (isScenarioIgnored()) {
                return;
            }
            if (!walletCreationPassed) {
                String reason = "Prerequisite scenario 'User first time login with OIDC using various passcode attempts' failed";
                logger.warn("{} — skipping: {}", reason, scenario.getName());
                markScenarioSkipped(reason);
                throw new SkipException(reason);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            String reason = "Interrupted while waiting for prerequisite scenario";
            logger.warn("{} — skipping: {}", reason, scenario.getName());
            markScenarioSkipped(reason);
            throw new SkipException(reason);
        }
    }

    /**
     * All @afterResetPasscode scenarios (verify reset attempts + skipBasedOnThreshold
     * lock flows) use passcode 111111 and must not start until @resetPasscodeScenario
     * has finished changing the passcode from 123456 to 111111.
     * Runs at order=600, after the wallet-creation check at order=500.
     */
    @Before(value = "@afterResetPasscode", order = 600)
    public void checkResetPasscodeScenarioPassed(Scenario scenario) {
        try {
            boolean completed = RESET_PASSCODE_LATCH.await(10, TimeUnit.MINUTES);
            if (!completed) {
                String reason = "Reset passcode scenario did not complete within the 10-minute timeout";
                logger.warn("{} — skipping: {}", reason, scenario.getName());
                markScenarioSkipped(reason);
                throw new SkipException(reason);
            }
            if (isScenarioIgnored()) {
                return;
            }
            if (!resetPasscodePassed) {
                String reason = "Prerequisite scenario 'User Reset passcode and verify login with new passcode' failed";
                logger.warn("{} — skipping: {}", reason, scenario.getName());
                markScenarioSkipped(reason);
                throw new SkipException(reason);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            String reason = "Interrupted while waiting for reset passcode scenario";
            logger.warn("{} — skipping: {}", reason, scenario.getName());
            markScenarioSkipped(reason);
            throw new SkipException(reason);
        }
    }

    /**
     * Serializes @afterResetPasscode execution so that only ONE scenario in this
     * group runs at a time. Without this, parallel threads each entering wrong
     * passcodes accumulate beyond maxFailedAttempts and trigger unexpected locks.
     * Runs at order=700 — after the reset-passcode latch check (order=600).
     * Not reached when the earlier @Before throws SkipException, so the semaphore
     * is never acquired in that case and the @After release is a safe no-op.
     */
    @Before(value = "@afterResetPasscode", order = 700)
    public void acquireAfterResetPasscodeSemaphore(Scenario scenario) {
        try {
            logger.info("'{}' waiting for after-reset serialization semaphore...", scenario.getName());
            AFTER_RESET_SEMAPHORE.acquire();
            afterResetSemaphoreHeld.set(true);
            logger.info("'{}' acquired after-reset serialization semaphore", scenario.getName());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            String reason = "Interrupted while waiting for after-reset semaphore";
            markScenarioSkipped(reason);
            throw new SkipException(reason);
        }
    }

    /**
     * Releases the after-reset semaphore so the next @afterResetPasscode scenario
     * can begin. order=9000 ensures this fires AFTER afterScenario() (order 10000
     * for @After = runs first), so the browser is fully closed before the next
     * scenario acquires the semaphore and opens its own browser.
     */
    @After(value = "@afterResetPasscode", order = 9000)
    public void releaseAfterResetPasscodeSemaphore(Scenario scenario) {
        if (afterResetSemaphoreHeld.get()) {
            AFTER_RESET_SEMAPHORE.release();
            afterResetSemaphoreHeld.set(false);
            logger.info("'{}' released after-reset serialization semaphore", scenario.getName());
        }
    }

    @After
    public void afterScenario(Scenario scenario) {
        // Intermediate retry attempt: @Before threw NoUINAvailableException /
        // NoPolicyAvailableException before any report or browser was set up.
        // Clean up thread state and exit — the retry analyzer re-queues the scenario;
        // no counting or reporting for this transient attempt.
        if (uinRetryAttempt.get()) {
            uinRetryAttempt.remove();
            UINManager.releaseCurrentThreadUIN(); // no-op: nothing was acquired
            clearScenarioState();
            return;
        }
        if (policyRetryAttempt.get()) {
            policyRetryAttempt.remove();
            PolicyManager.releaseCurrentThreadPolicy(); // no-op: nothing was acquired
            clearScenarioState();
            return;
        }

        try {
            if (Boolean.TRUE.equals(isKnownIssueScenario.get())) {
                // KI bucket: scenario skipped because a known bug is tracked for it.
                // Report node was already created in @Before(order=50); just log result.
                knownIssueCount.incrementAndGet();
                String bugId  = runnerfiles.Runner.knownIssues.get(scenario.getName());
                String bugUrl = "https://mosip.atlassian.net/browse/" + bugId;
                ExtentReportManager.logKnownIssue(bugId, bugUrl);
            } else if (isScenarioIgnored()) {
                // I bucket: threshold/environment constraint — not a failure or pre-req issue.
                ignoredCount++;

                ExtentReportManager.logIgnoredScenario(getSkipReason());
            } else if (isScenarioSkipped()) {
                // S bucket: prerequisite scenario failed or timed out.
                skippedCount++;
                ExtentReportManager.getTest().skip(
                        "[SKIPPED] " + scenario.getName() + " — " + getSkipReason());
            } else if (scenario.isFailed() || SCENARIO_FAILED.get()) {
                failedCount++;

                if (DRIVER.get() != null) {
                    try {
                        ScreenshotUtil.attachScreenshot(DRIVER.get(), "Failure");
                    } catch (Exception ignored) {
                    }
                }
                ExtentReportManager.getTest().fail("Scenario Failed: " + scenario.getName());
            } else {
                passedCount++;
                ExtentReportManager.getTest().pass("Scenario Passed: " + scenario.getName());
            }
        } finally {
            WebDriver driver = DRIVER.get();
            if (driver != null) {
                try {
                    markBrowserStackSessionStatus(scenario);
                    attachBrowserStackVideoLink(scenario);
                    driver.quit();
                    logger.info("WebDriver quit after scenario: {}", scenario.getName());
                } catch (Exception e) {
                    logger.error("Error while quitting WebDriver after scenario: {}", scenario.getName(), e);
                } finally {
                    DRIVER.remove();
                    JSE.remove();
                    ScreenshotUtil.clearFailureScreenshotFlag();
                }
            }
            ExtentReportManager.flushReport();
            UINManager.releaseCurrentThreadUIN();
            PolicyManager.releaseCurrentThreadPolicy();
            clearScenarioState();
            STEP_COUNTER.remove();
            SCENARIO_FAILED.remove();
            isKnownIssueScenario.remove();
        }
    }

    @AfterAll
    public static void afterAll() {
        utils.HttpUtils.cleanupWallets();
        ExtentReportManager.flushReport();
        stopBrowserStackLocal();
        pushReportsToS3();
    }

    public WebDriver getDriver() {
        return DRIVER.get();
    }

    public JavascriptExecutor getJse() {
        return JSE.get();
    }

    private void startBrowserStackLocal() {
        if (BROWSERSTACK_LOCAL_STARTED.get()) {
            return;
        }

        synchronized (BROWSERSTACK_LOCAL_LOCK) {
            if (BROWSERSTACK_LOCAL_STARTED.get()) {
                return;
            }

            HashMap<String, String> bsLocalArgs = new HashMap<>();
            bsLocalArgs.put("key", accessKey);
            try {
                browserStackLocal = new Local();
                browserStackLocal.start(bsLocalArgs);
                BROWSERSTACK_LOCAL_STARTED.set(true);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to start BrowserStack Local", e);
            }
        }
    }

    private static void stopBrowserStackLocal() {
        synchronized (BROWSERSTACK_LOCAL_LOCK) {
            if (!BROWSERSTACK_LOCAL_STARTED.get() || browserStackLocal == null) {
                return;
            }
            try {
                browserStackLocal.stop();
            } catch (Exception e) {
                logger.warn("Failed to stop BrowserStack Local cleanly", e);
            } finally {
                browserStackLocal = null;
                BROWSERSTACK_LOCAL_STARTED.set(false);
            }
        }
    }

    public static void pushReportsToS3() {
        String originalFileName = ExtentReportManager.getCurrentReportFileName();
        File originalReportFile = new File(System.getProperty("user.dir") + "/test-output/" + originalFileName);
        String nameWithoutExt = originalFileName.replace(".html", "");
        String newFileName = nameWithoutExt + "-T-" + totalCount + "-P-" + passedCount + "-F-" + failedCount + "-S-"
                + skippedCount + "-I-" + ignoredCount + "-KI-" + knownIssueCount.get() + ".html";
        File newReportFile = new File(System.getProperty("user.dir") + "/test-output/" + newFileName);

		logger.info("Attempting to rename report file...");
		logger.info("Original: {}", originalReportFile.getAbsolutePath());
		logger.info("Target: {}", newReportFile.getAbsolutePath());

        if (originalReportFile.renameTo(newReportFile)) {
			logger.info("Report renamed to: {}", newFileName);
        } else {
			logger.info("Failed to rename the report file.");
        }

        if (ConfigManager.getPushReportsToS3().equalsIgnoreCase("yes")) {
            S3Adapter s3Adapter = new S3Adapter();
            boolean isStoreSuccess = false;
            try {
                isStoreSuccess = s3Adapter.putObject(ConfigManager.getS3Account(), "", null, null, newFileName,
                        newReportFile);
				logger.info("isStoreSuccess:: {}", isStoreSuccess);
            } catch (Exception e) {
				logger.info("Error occurred while pushing the object: {}", e.getLocalizedMessage());
				logger.info(e.getMessage());
            }
        }
    }

    public static String[] fetchIssuerTexts() {
        String issuerSearchText = System.getenv("issuerSearchText");
        String issuerSearchTextforSunbird = System.getenv("issuerSearchTextforSunbird");

        if (issuerSearchText == null || issuerSearchTextforSunbird == null) {
            if (issuerSearchText == null) {
                issuerSearchText = InjiWebConfigManager.getproperty("issuerSearchText");
            }
            if (issuerSearchTextforSunbird == null) {
                issuerSearchTextforSunbird = InjiWebConfigManager.getproperty("issuerSearchTextforSunbird");
            }
        }

        return new String[]{issuerSearchText, issuerSearchTextforSunbird};
    }

    public static HashMap<String, Integer> getWalletPasscodeSettings() throws Exception {
        if (walletPasscodeSettingsCache == null) {
            HashMap<String, String> keyMap = new HashMap<>();
            keyMap.put("wallet.passcode.retryBlockedUntil", "retryBlockedUntil");
            keyMap.put("wallet.passcode.maxFailedAttemptsAllowedPerCycle", "maxFailedAttempts");
            keyMap.put("wallet.passcode.maxLockCyclesAllowed", "maxLockCycles");

            walletPasscodeSettingsCache = InjiWebUtil.getActuatorValues(keyMap);
        }
        return walletPasscodeSettingsCache;
    }

    private String getEnvOrProperty(String envKey, String propertyKey) {
        String envValue = System.getenv(envKey);
        if (envValue != null && !envValue.trim().isEmpty()) {
            return envValue.trim();
        }
        return InjiWebConfigManager.getproperty(propertyKey);
    }

    public static boolean isBrowserStackRunEnabled() {
        String envValue = System.getenv("RUN_ON_BROWSERSTACK");
        if (envValue != null && !envValue.trim().isEmpty()) {
            return Boolean.parseBoolean(envValue.trim());
        }

        String propertyValue = InjiWebConfigManager.getproperty("runOnBrowserStack");
        if (propertyValue == null || propertyValue.trim().isEmpty()) {
            return true;
        }
        return Boolean.parseBoolean(propertyValue.trim());
    }

    private String getLocalDownloadDirectory() {
        File localDownloadDir = new File(System.getProperty("user.dir"), "downloads");
        if (!localDownloadDir.exists()) {
            localDownloadDir.mkdirs();
        }
        return localDownloadDir.getAbsolutePath();
    }

    public static ThreadLocal<Integer> getStepCounter() {
        return STEP_COUNTER;
    }

    public static void markScenarioFailed() {
        SCENARIO_FAILED.set(true);
    }

    public static boolean isScenarioFailed() {
        return SCENARIO_FAILED.get();
    }

    public static boolean isKnownIssueScenario() {
        return Boolean.TRUE.equals(isKnownIssueScenario.get());
    }

    private void markBrowserStackSessionStatus(Scenario scenario) {
        if (!runOnBrowserStack || getDriver() == null) {
            return;
        }

        try {
            String status = scenario.isFailed() ? "failed" : "passed";
            String reason = scenario.isFailed()
                    ? "Scenario failed: " + scenario.getName()
                    : "Scenario passed: " + scenario.getName();
            String executorCommand = String.format(
                    "browserstack_executor: {\"action\": \"setSessionStatus\", \"arguments\": {\"status\":\"%s\", \"reason\": \"%s\"}}",
                    status,
                    escapeForJson(reason)
            );
            ((JavascriptExecutor) getDriver()).executeScript(executorCommand);
            logger.info("BrowserStack session marked as {} for scenario: {}", status, scenario.getName());
        } catch (Exception e) {
            logger.error("Unable to update BrowserStack session status for scenario: {}", scenario.getName(), e);
        }
    }

    private void attachBrowserStackVideoLink(Scenario scenario) {
        WebDriver currentDriver = getDriver();
        if (!runOnBrowserStack || currentDriver == null || ExtentReportManager.getTest() == null) {
            return;
        }

        try {
            String script = "browserstack_executor: {\"action\": \"getSessionDetails\"}";
            String sessionDetailsJson = (String) ((JavascriptExecutor) currentDriver).executeScript(script);
            if (sessionDetailsJson == null || sessionDetailsJson.trim().isEmpty()) {
                return;
            }

            JsonNode sessionDetails = OBJECT_MAPPER.readTree(sessionDetailsJson);
            String link = firstNonBlank(
                    getJsonText(sessionDetails, "video_url"),
                    getJsonText(sessionDetails, "videoUrl"),
                    getJsonText(sessionDetails, "public_url"),
                    getJsonText(sessionDetails, "publicUrl"),
                    getJsonText(sessionDetails, "dashboard_url"),
                    getJsonText(sessionDetails, "dashboardUrl"),
                    getJsonText(sessionDetails, "session_url"),
                    getJsonText(sessionDetails, "sessionUrl"));

            if (link != null) {
                ExtentReportManager.getTest().info(
                        "<a href='" + escapeHtmlAttribute(link) + "' target='_blank'>Click here for BrowserStack video/session</a>");
                logger.info("Attached BrowserStack video/session link for failed scenario: {}", scenario.getName());
                return;
            }

            String hashedId = firstNonBlank(getJsonText(sessionDetails, "hashed_id"), getJsonText(sessionDetails, "hashedId"));
            if (hashedId != null) {
                ExtentReportManager.getTest().info("BrowserStack session id: " + hashedId);
            }
        } catch (Exception e) {
            logger.warn("Unable to fetch BrowserStack session details for scenario: {}", scenario.getName(), e);
        }
    }

    private String getJsonText(JsonNode node, String fieldName) {
        JsonNode value = node.get(fieldName);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText();
        return text == null || text.trim().isEmpty() ? null : text;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value;
            }
        }
        return null;
    }

    private String escapeHtmlAttribute(String value) {
        return value.replace("&", "&amp;").replace("'", "&#39;").replace("\"", "&quot;");
    }

    private String escapeForJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    public static String getEnvName() {
        String configuredBaseUrl = InjiWebConfigManager.getproperty("injiWebUi");
        logger.info("--- ApplnURI --- {}", BaseTestCase.ApplnURI);
        logger.info("--- InjiWebURI --- {}", configuredBaseUrl);

        String host = URI.create(configuredBaseUrl).getHost();

        if (host == null || host.isEmpty()) {
            throw new RuntimeException("Invalid URL: unable to extract host from " + configuredBaseUrl);
        }

        String[] parts = host.split("\\.");

        String envName = "";
        if (parts.length >= 3) {
            envName = parts[1];  // e.g., api.dev.example.com → "dev"
        }

        return envName;
    }
}
