package utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.json.JSONObject;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.SkipException;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
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
import java.util.Base64;
import runnerfiles.Runner;

import org.openqa.selenium.Dimension;
import io.mosip.testrig.apirig.utils.ConfigManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BaseTest {
	private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();
	private static final ThreadLocal<JavascriptExecutor> jseThreadLocal = new ThreadLocal<>();
	private static final Logger LOGGER = LoggerFactory.getLogger(BaseTest.class);

	public void setDriver(WebDriver driver) {
		driverThreadLocal.set(driver);
	}

	public void setJse(JavascriptExecutor jse) {
		jseThreadLocal.set(jse);
	}

	public static WebDriver getDriver() {
		return driverThreadLocal.get();
	}

	public static JavascriptExecutor getJse() {
		return jseThreadLocal.get();
	}

	private static int passedCount = 0;
	private static int failedCount = 0;
	private static int totalCount = 0;
	private static int skippedCount = 0;
	private long scenarioStartTime;
	String username = System.getenv("BROWSERSTACK_USERNAME");
	String accessKey = System.getenv("BROWSERSTACK_ACCESS_KEY");
	public final String URL = "https://" + username + ":" + accessKey + "@hub-cloud.browserstack.com/wd/hub";
	private Scenario scenario;
	private static final Logger logger = LoggerFactory.getLogger(BaseTest.class);
	private static ThreadLocal<Boolean> skipScenario = ThreadLocal.withInitial(() -> false);
	private static ThreadLocal<String> skipReason = new ThreadLocal<>();
	private static final ThreadLocal<Boolean> mobileViewFlag = ThreadLocal.withInitial(() -> false);

	public static void setMobileView(boolean isMobile) {
		mobileViewFlag.set(isMobile);
	}

	public static boolean isMobileView() {
		return mobileViewFlag.get();
	}

	public static void clearMobileView() {
		mobileViewFlag.remove();
	}

	public static final String url = System.getenv("TEST_URL") != null && !System.getenv("TEST_URL").isEmpty()
			? System.getenv("TEST_URL")
			: InjiWebConfigManager.getproperty("injiWebUi");

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
		Local bsLocal = new Local();
		HashMap<String, String> bsLocalArgs = new HashMap<>();
		bsLocalArgs.put("key", accessKey);
		try {
			bsLocal.start(bsLocalArgs);
		} catch (Exception e) {
			e.printStackTrace();
		}
		totalCount++;
		ExtentReportManager.initReport();
		ExtentReportManager.createTest(scenario.getName());
		ExtentReportManager.logStep("Scenario Started: " + scenario.getName());
		DesiredCapabilities capabilities = new DesiredCapabilities();
		capabilities.setCapability("browserName", "Chrome");
		capabilities.setCapability("browserVersion", "latest");
		HashMap<String, Object> browserstackOptions = new HashMap<String, Object>();
		browserstackOptions.put("os", "Windows");
		browserstackOptions.put("local", true);
		browserstackOptions.put("interactiveDebugging", true);
		capabilities.setCapability("bstack:options", browserstackOptions);
		WebDriver driver = new RemoteWebDriver(new URL(URL), capabilities);
		setDriver(driver); // sets ThreadLocal
		setJse((JavascriptExecutor) driver); // sets ThreadLocal
		setMobileView(scenario.getSourceTagNames().contains("@mobileview"));
		if (isMobileView()) {
			String dim = ConfigManager.getproperty("dimensions");
			if (dim != null && dim.contains(",")) {
				String[] parts = dim.split(",");
				int width = Integer.parseInt(parts[0].trim());
				int height = Integer.parseInt(parts[1].trim());
				getDriver().manage().window().setSize(new Dimension(width, height));
				logger.info("📱 Running in Mobile View ({}, {}) for scenario: {}", width, height, scenario.getName());
			} else {
				getDriver().manage().window().maximize();
				logger.warn("⚠️ dimensions not set in properties, defaulting to maximize for Mobile View scenario: {}",
						scenario.getName());
			}
		} else {
			getDriver().manage().window().maximize();
			logger.info("💻 Running in Desktop View for scenario: {}", scenario.getName());
		}
		getDriver().get(url);
	}

	@Before("@skipBasedOnThreshold")
	public void skipScenarioBasedOnThreshold(Scenario scenario) {
		try {
			int retryBlockedUntil = getWalletPasscodeSettings().get("retryBlockedUntil");
			String envThreshold = System.getenv("THRESH_TEMP_LOCK");
			int THRESH_TEMP_LOCK = (envThreshold != null && !envThreshold.isEmpty()) ? Integer.parseInt(envThreshold)
					: 1;

			if (retryBlockedUntil > THRESH_TEMP_LOCK) {
				String reason = "Threshold not met: retryBlockedUntil(" + retryBlockedUntil + ") < THRESH_TEMP_LOCK("
						+ THRESH_TEMP_LOCK + ")";
				markScenarioSkipped(reason);
				throw new SkipException("Scenario skipped due to threshold: " + reason);
			}
		} catch (Exception e) {
			logger.error("Error checking threshold for skipping scenario", e);
		}
	}

	@BeforeStep
	public void beforeStep(Scenario scenario) {
		if (BaseTest.isScenarioSkipped()) {
			ExtentReportManager.logStep("⏭ Step Skipped: — " + BaseTest.getSkipReason());
			throw new io.cucumber.java.PendingException("Scenario skipped: " + BaseTest.getSkipReason());
		}
	}

	@AfterStep
	public void afterStep(Scenario scenario) {
		if (BaseTest.isScenarioSkipped()) {
			ExtentReportManager.logStep("⏭ Step Skipped — " + BaseTest.getSkipReason());
			return;
		}

		if (scenario.isFailed()) {
			captureScreenshot();
		}
	}

	@After
	public void afterScenario(Scenario scenario) {
		WebDriver driver = getDriver();
		String publicUrl = null;
		String videoUrl = null;
		if (driver instanceof RemoteWebDriver) {
			RemoteWebDriver remoteDriver = (RemoteWebDriver) driver;
			String sessionId = remoteDriver.getSessionId().toString();
			try {
				String jsonUrl = "https://api.browserstack.com/automate/sessions/" + sessionId + ".json";
				String auth = username + ":" + accessKey;
				String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes());
				HttpURLConnection conn = (HttpURLConnection) new URL(jsonUrl).openConnection();
				conn.setConnectTimeout(10_000);
				conn.setReadTimeout(30_000);
				conn.setRequestMethod("GET");
				conn.setRequestProperty("Authorization", basicAuth);
				if (conn.getResponseCode() == 200) {
					StringBuilder response = new StringBuilder();
					try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
						String inputLine;
						while ((inputLine = in.readLine()) != null)
							response.append(inputLine);
					}
					JSONObject jsonResponse = new JSONObject(response.toString());
					JSONObject session = jsonResponse.getJSONObject("automation_session");
					publicUrl = session.getString("public_url");
					videoUrl = session.getString("video_url");
					ExtentTest test = ExtentReportManager.getTest();
					if (test != null && publicUrl != null) {
						test.info("<a href='" + publicUrl + "' target='_blank'>View on BrowserStack</a>");
					}

					if (test != null && videoUrl != null) {
						test.info("<a href='" + videoUrl + "' target='_blank'>Click here to view only Video</a>");
					}
				} else {
					ExtentReportManager.getTest().warning(
							"Failed to fetch BrowserStack session JSON, response code: " + conn.getResponseCode());
				}
			} catch (Exception e) {
				ExtentReportManager.getTest()
						.warning("Failed to fetch BrowserStack build/session info:" + e.getMessage());
			}
		}
		try {
			if (isScenarioSkipped()) {
				skippedCount++;
				ExtentReportManager.getTest()
						.skip("⏭ Scenario Skipped: " + scenario.getName() + " — " + getSkipReason());
			} else if (scenario.isFailed()) {
				failedCount++;
				ExtentReportManager.getTest().fail("❌ Scenario Failed: " + scenario.getName());
			} else {
				passedCount++;
				ExtentReportManager.getTest().pass("✅ Scenario Passed: " + scenario.getName());
			}
		} finally {
			if (driver != null) {
				try {
					LOGGER.info("Closing WebDriver session...");
					driver.quit();
				} catch (Exception e) {
					LOGGER.warn("Error while closing WebDriver: " + e.getMessage());
				} finally {
					driverThreadLocal.remove();
					jseThreadLocal.remove();
				}
			}
		}
		ExtentReportManager.flushReport();
		ExtentReportManager.getTest(); // optional: just for reference
		ExtentReportManager.removeTest(); // <-- add this method in ExtentReportManager
		clearSkip();
		clearMobileView();
	}

	private String getStepName(Scenario scenario) {
		try {
			Field testCaseField = scenario.getClass().getDeclaredField("testCase");
			testCaseField.setAccessible(true);
			io.cucumber.plugin.event.TestCase testCase = (io.cucumber.plugin.event.TestCase) testCaseField
					.get(scenario);
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

	private void captureScreenshot() {
		WebDriver driver = getDriver(); // ✅ get ThreadLocal WebDriver
		if (driver != null) {
			try {
				byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
				ExtentCucumberAdapter.getCurrentStep().addScreenCaptureFromBase64String(
						java.util.Base64.getEncoder().encodeToString(screenshot), "Failure Screenshot");
			} catch (Exception e) {
				LOGGER.warn("Failed to capture screenshot: {}", e.getMessage());
			}
		} else {
			LOGGER.warn("WebDriver is null, cannot capture screenshot.");
		}
	}

	@AfterAll
	public static void afterAll() {
		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			utils.HttpUtils.cleanupWallets();
			ExtentReportManager.flushReport();

			pushReportsToS3();
		}));
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

		LOGGER.info("Attempting to rename report file...");
		LOGGER.info("Original: " + originalReportFile.getAbsolutePath());
		LOGGER.info("Target:" + newReportFile.getAbsolutePath());

		if (originalReportFile.renameTo(newReportFile)) {
			LOGGER.info("✅ Report renamed to: " + newFileName);
		} else {
			LOGGER.info("❌ Failed to rename the report file.");
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

	private static HashMap<String, Integer> walletPasscodeSettingsCache;

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