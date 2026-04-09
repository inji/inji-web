package utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicBoolean;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.SkipException;

import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.cucumber.adapter.ExtentCucumberAdapter;
import com.browserstack.local.Local;

import api.InjiWebConfigManager;
import api.InjiWebUtil;
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

public class BaseTest {
	private static final Logger logger = LoggerFactory.getLogger(BaseTest.class);
	private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();
	private static final ThreadLocal<JavascriptExecutor> JSE = new ThreadLocal<>();
	private static final ThreadLocal<Boolean> skipScenario = ThreadLocal.withInitial(() -> false);
	private static final ThreadLocal<String> skipReason = new ThreadLocal<>();
	private static final AtomicBoolean BROWSERSTACK_LOCAL_STARTED = new AtomicBoolean(false);
	private static final Object BROWSERSTACK_LOCAL_LOCK = new Object();

	private static Local browserStackLocal;
	private static int passedCount = 0;
	private static int failedCount = 0;
	private static int totalCount = 0;
	private static int skippedCount = 0;
	private static HashMap<String, Integer> walletPasscodeSettingsCache;

	private final String username = System.getenv("BROWSERSTACK_USERNAME");
	private final String accessKey = System.getenv("BROWSERSTACK_ACCESS_KEY");
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

	public static void clearSkip() {
		skipScenario.set(false);
		skipReason.remove();
	}

	@Before
	public void beforeAll(Scenario scenario) throws MalformedURLException {
		clearSkip();
		startBrowserStackLocal();
		totalCount++;
		ExtentReportManager.initReport();
		ExtentReportManager.createTest(scenario.getName());
		ExtentReportManager.logStep("Scenario Started: " + scenario.getName());

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

		WebDriver driver = new RemoteWebDriver(new URL(URL), capabilities);
		DRIVER.set(driver);
		JSE.set((JavascriptExecutor) driver);
		driver.manage().timeouts().implicitlyWait(Duration.ZERO);
		driver.manage().window().maximize();
		driver.get(url);
	}

	@Before("@skipBasedOnThreshold")
	public void skipScenarioBasedOnThreshold(Scenario scenario) {
		try {
			int retryBlockedUntil = getWalletPasscodeSettings().get("retryBlockedUntil");
			String envThreshold = System.getenv("THRESH_TEMP_LOCK");
			int tempLockThreshold = (envThreshold != null && !envThreshold.isEmpty()) ? Integer.parseInt(envThreshold) : 1;

			if (retryBlockedUntil > tempLockThreshold) {
				String reason = "Threshold not met: retryBlockedUntil(" + retryBlockedUntil + ") < THRESH_TEMP_LOCK("
						+ tempLockThreshold + ")";
				markScenarioSkipped(reason);
				throw new SkipException("Scenario skipped due to threshold: " + reason);
			}
		} catch (Exception e) {
			logger.error("Error checking threshold for skipping scenario", e);
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
		try {
			if (isScenarioSkipped()) {
				skippedCount++;
				ExtentReportManager.getTest().skip("Scenario Skipped: " + scenario.getName() + " - " + getSkipReason());
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
		executeLsCommand(System.getProperty("user.dir") + "/test-output/ExtentReport.html");
		executeLsCommand(System.getProperty("user.dir") + "/utils/");
		executeLsCommand(System.getProperty("user.dir") + "/screenshots/");

		executeLsCommand(System.getProperty("user.dir") + "/test-output/");
		String originalFileName = ExtentReportManager.getCurrentReportFileName();
		File originalReportFile = new File(System.getProperty("user.dir") + "/test-output/" + originalFileName);
		String nameWithoutExt = originalFileName.replace(".html", "");
		String newFileName = nameWithoutExt + "-T-" + totalCount + "-P-" + passedCount + "-F-" + failedCount + "-S-"
				+ skippedCount + ".html";
		File newReportFile = new File(System.getProperty("user.dir") + "/test-output/" + newFileName);

		System.out.println("Attempting to rename report file...");
		System.out.println("Original: " + originalReportFile.getAbsolutePath());
		System.out.println("Target:   " + newReportFile.getAbsolutePath());

		if (originalReportFile.renameTo(newReportFile)) {
			System.out.println("Report renamed to: " + newFileName);
		} else {
			System.out.println("Failed to rename the report file.");
		}

		executeLsCommand(newReportFile.getAbsolutePath());

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

	private static void executeLsCommand(String directoryPath) {
		try {
			String os = System.getProperty("os.name").toLowerCase();
			Process process;

			if (os.contains("win")) {
				String windowsDirectoryPath = directoryPath.replace("/", File.separator);
				process = Runtime.getRuntime().exec(new String[] { "cmd.exe", "/c", "dir /a " + windowsDirectoryPath });
			} else {
				process = Runtime.getRuntime().exec(new String[] { "/bin/sh", "-c", "ls -al " + directoryPath });
			}

			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			String line;
			System.out.println("--- Directory listing for " + directoryPath + " ---");
			while ((line = reader.readLine()) != null) {
				System.out.println(line);
			}

			int exitCode = process.waitFor();
			if (exitCode != 0) {
				BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
				String errorLine;
				System.err.println("--- Directory listing error ---");
				while ((errorLine = errorReader.readLine()) != null) {
					System.err.println(errorLine);
				}
			}
			System.out.println("--- End directory listing ---");

		} catch (IOException | InterruptedException e) {
			System.err.println("Error executing directory listing command: " + e.getMessage());
		}
	}

	public static String[] fetchIssuerTexts() {
		String issuerSearchText = System.getenv("issuerSearchText");
		String issuerSearchTextforSunbird = System.getenv("issuerSearchTextforSunbird");

		if (issuerSearchText == null || issuerSearchTextforSunbird == null) {
			String propertyFilePath = System.getProperty("user.dir") + "/src/test/resources/config.properties";
			Properties properties = new Properties();

			try (FileInputStream fileInputStream = new FileInputStream(propertyFilePath)) {
				properties.load(fileInputStream);

				if (issuerSearchText == null) {
					issuerSearchText = properties.getProperty("issuerSearchText");
				}

				if (issuerSearchTextforSunbird == null) {
					issuerSearchTextforSunbird = properties.getProperty("issuerSearchTextforSunbird");
				}

			} catch (IOException e) {
				logger.error("Failed to load config.properties from {}", propertyFilePath, e);
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
}
