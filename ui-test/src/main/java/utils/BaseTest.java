package utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.SkipException;

import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.cucumber.adapter.ExtentCucumberAdapter;
import com.browserstack.local.Local;

import io.cucumber.java.After;
import io.cucumber.java.AfterAll;
import io.cucumber.java.AfterStep;
import io.cucumber.java.Before;
import io.cucumber.java.BeforeStep;
import io.cucumber.java.Scenario;
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

	private final boolean runOnBrowserStack = isBrowserStackRunEnabled();
	private final String username = getEnvOrProperty("BROWSERSTACK_USERNAME", "browserstack_username");
	private final String accessKey = getEnvOrProperty("BROWSERSTACK_ACCESS_KEY", "browserstack_access_key");
	public final String URL = "https://" + username + ":" + accessKey + "@hub-cloud.browserstack.com/wd/hub";

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

	public static void clearSkip() {
		skipScenario.set(false);
		skipReason.remove();
		scenarioIgnored.set(false);
	}

	@Before
	public void beforeAll(Scenario scenario) throws MalformedURLException {
		clearSkip();

		// @NeedsUIN: try to acquire a UIN before spinning up a browser.
		// If none is free, throw NoUINAvailableException immediately — the thread is
		// released for other work and UINRetryAnalyzer will re-queue this scenario
		// as soon as any UIN is returned to the pool.
		if (scenario.getSourceTagNames().contains("@NeedsUIN")) {
			Uin uin = UINManager.tryAcquireUIN();
			if (uin == null) {
				String msg = "No UIN available – re-queued for retry once a UIN is released: "
						+ scenario.getName();
				logger.warn(msg);
				uinRetryAttempt.set(true);
				throw new NoUINAvailableException(msg);
			}
		}

		// @NeedsPolicy: same non-blocking pattern as @NeedsUIN.
		if (scenario.getSourceTagNames().contains("@NeedsPolicy")) {
			Policy policy = PolicyManager.tryAcquirePolicy();
			if (policy == null) {
				String msg = "No Policy available – re-queued for retry once a Policy is released: "
						+ scenario.getName();
				logger.warn(msg);
				policyRetryAttempt.set(true);
				throw new NoPolicyAvailableException(msg);
			}
		}

		totalCount++;
		ExtentReportManager.initReport();
		ExtentReportManager.createTest(scenario.getName());
		ExtentReportManager.logStep("Scenario Started: " + scenario.getName());

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
			browserstackOptions.put("interactiveDebugging",
					Boolean.parseBoolean(System.getenv().getOrDefault("BROWSERSTACK_INTERACTIVE_DEBUGGING", "false")));
			capabilities.setCapability("bstack:options", browserstackOptions);
			driver = new RemoteWebDriver(new URL(URL), capabilities);
		} else {
			ChromeOptions options = new ChromeOptions();
			options.setPageLoadStrategy(org.openqa.selenium.PageLoadStrategy.EAGER);
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
		driver.manage().window().maximize();
		driver.get(url);
	}

	// order=100: runs before latch waits (500/600), semaphore acquisition (700),
	// and browser creation (10000) so an ignored scenario wastes none of those resources.
	@Before(value = "@skipBasedOnThreshold", order = 100)
	public void skipScenarioBasedOnThreshold(Scenario scenario) {
		try {
			int retryBlockedUntil = getWalletPasscodeSettings().get("retryBlockedUntil");
			String envThreshold = System.getenv("THRESH_TEMP_LOCK");
			int tempLockThreshold = (envThreshold != null && !envThreshold.isEmpty())
					? Integer.parseInt(envThreshold)
					: 1;

			if (retryBlockedUntil > tempLockThreshold) {
				String reason = "Ignored — actuator retryBlockedUntil=" + retryBlockedUntil
						+ " min > THRESH_TEMP_LOCK=" + tempLockThreshold
						+ " min. Running this scenario would require waiting " + retryBlockedUntil
						+ " min for the temporary lock to expire, which exceeds the allowed threshold.";
				logger.info("[IGNORED] Scenario '{}': {}", scenario.getName(), reason);
				markScenarioIgnored(reason);
				throw new SkipException(reason); // propagates cleanly; not swallowed
			}
		} catch (SkipException e) {
			throw e; // intentional control flow — do not re-wrap
		} catch (Exception e) {
			logger.error("Error checking threshold for scenario '{}'", scenario.getName(), e);
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

	@BeforeStep
	public void beforeStep(Scenario scenario) {
		ScreenshotUtil.resetFailureScreenshotFlag();
		String stepName = getStepName(scenario);
		if (isScenarioSkipped()) {
			ExtentCucumberAdapter.getCurrentStep().log(Status.SKIP,
					"Step Skipped: " + stepName + " - " + getSkipReason());
			throw new io.cucumber.java.PendingException("Scenario skipped: " + getSkipReason());
		}
		ExtentCucumberAdapter.getCurrentStep().log(Status.INFO, "Step Started: " + stepName);
	}

	@AfterStep
	public void afterStep(Scenario scenario) {
		String stepName = getStepName(scenario);
		if (isScenarioSkipped()) {
			ExtentCucumberAdapter.getCurrentStep().log(Status.SKIP,
					"Step Skipped: " + stepName + " - " + getSkipReason());
			return;
		}

		if (scenario.isFailed()) {
			ExtentCucumberAdapter.getCurrentStep().log(Status.FAIL, "Step Failed: " + stepName);
			ScreenshotUtil.attachScreenshot(DRIVER.get(), "FailureScreenshot");
		} else {
			ExtentCucumberAdapter.getCurrentStep().log(Status.PASS, "Step Passed: " + stepName);
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
			clearSkip();
			return;
		}
		if (policyRetryAttempt.get()) {
			policyRetryAttempt.remove();
			PolicyManager.releaseCurrentThreadPolicy(); // no-op: nothing was acquired
			clearSkip();
			return;
		}

		try {
			if (isScenarioIgnored()) {
				// I bucket: threshold/environment constraint — not a failure or pre-req issue.
				// Logged at INFO so it is visually distinct from S (yellow skip) in Extent.
				ignoredCount++;
				ExtentReportManager.getTest().info(
						"[IGNORED] " + scenario.getName() + " — " + getSkipReason());
			} else if (isScenarioSkipped()) {
				// S bucket: prerequisite scenario failed or timed out.
				skippedCount++;
				ExtentReportManager.getTest().skip(
						"[SKIPPED] " + scenario.getName() + " — " + getSkipReason());
			} else if (scenario.isFailed()) {
				failedCount++;
				ExtentReportManager.getTest().fail("Scenario Failed: " + scenario.getName());
			} else {
				passedCount++;
				ExtentReportManager.getTest().pass("Scenario Passed: " + scenario.getName());
			}
		} finally {
			WebDriver driver = DRIVER.get();
			if (driver != null) {
				try {
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
			// Release any UIN / Policy held by this thread back to their pools.
			// Both are no-ops when nothing was acquired on this thread.
			UINManager.releaseCurrentThreadUIN();
			PolicyManager.releaseCurrentThreadPolicy();
			clearSkip();
		}
	}

	private String getStepName(Scenario scenario) {
		try {
			Field testCaseField = scenario.getClass().getDeclaredField("testCase");
			testCaseField.setAccessible(true);
			io.cucumber.plugin.event.TestCase testCase = (io.cucumber.plugin.event.TestCase) testCaseField.get(scenario);
			List<TestStep> testSteps = testCase.getTestSteps();
			for (TestStep step : testSteps) {
				if (step instanceof PickleStepTestStep) {
					return ((PickleStepTestStep) step).getStep().getText();
				}
			}
		} catch (Exception e) {
			return "Unknown Step";
		}
		return "Unknown Step";
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
				+ skippedCount + "-I-" + ignoredCount + ".html";
		File newReportFile = new File(System.getProperty("user.dir") + "/test-output/" + newFileName);

		System.out.println("Attempting to rename report file...");
		System.out.println("Original: " + originalReportFile.getAbsolutePath());
		System.out.println("Target:   " + newReportFile.getAbsolutePath());

		if (originalReportFile.renameTo(newReportFile)) {
			System.out.println("Report renamed to: " + newFileName);
		} else {
			System.out.println("Failed to rename the report file.");
		}

		if (ConfigManager.getPushReportsToS3().equalsIgnoreCase("yes")) {
			S3Adapter s3Adapter = new S3Adapter();
			boolean isStoreSuccess = false;
			try {
				isStoreSuccess = s3Adapter.putObject(ConfigManager.getS3Account(), "", null, null, newFileName,
						newReportFile);
				System.out.println("isStoreSuccess:: " + isStoreSuccess);
			} catch (Exception e) {
				System.out.println("Error occurred while pushing the object: " + e.getLocalizedMessage());
				System.out.println(e.getMessage());
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

		return new String[] { issuerSearchText, issuerSearchTextforSunbird };
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
}
