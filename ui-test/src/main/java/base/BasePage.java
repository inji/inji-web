package base;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import io.restassured.RestAssured;
import io.restassured.specification.RequestSpecification;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.yaml.snakeyaml.Yaml;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import utils.BaseTest;
import utils.ExtentReportManager;
import utils.InjiWebConfigManager;

public class BasePage {

	// ─── Reporting helpers ────────────────────────────────────────────────────

	protected static void logStep(String description, By locator) {
		ExtentReportManager.logStepWithLocator(description, locator.toString());
	}

	protected static void logStep(String description) {
		ExtentReportManager.logStep(description);
	}

	protected static void logWarning(String message, By locator) {

		String html = message +
				"<br><details style='margin-left:20px;'>" +
				"<summary style='cursor:pointer;font-weight:500;'>▶ Locator Details</summary>" +
				"<pre>" + locator.toString() + "</pre></details>";

		ExtentReportManager.getTest().warning(html);
	}

	protected static void logWarning(String message) {
		ExtentReportManager.logWarning(message);
	}

	// ─── Config ───────────────────────────────────────────────────────────────

	public static int getConfiguredWaitTimeInSeconds() {
		return InjiWebConfigManager.getWaitTimeInSeconds();
	}

	public static int getConfiguredShortWaitTimeInSeconds() {
		return InjiWebConfigManager.getShortWaitTimeInSeconds();
	}

	// ─── Click ────────────────────────────────────────────────────────────────

	public void clickOnElement(WebDriver driver, By locator) {
		clickOnElement(driver, locator, "Clicked element");
	}

	public void clickOnElement(WebDriver driver, By locator, String stepDesc) {
		try {
			WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.elementToBeClickable(locator));

			element.click();
			logStep(stepDesc, locator);

		} catch (Exception e) {
			ExtentReportManager.logFailure(stepDesc, locator.toString(), e);

			// ✅ mark scenario failed
			BaseTest.markScenarioFailed();

			throw new AssertionError("Step failed: " + stepDesc, e);
		}
	}

	public static void clickOnElement(WebDriver driver, By locator, int timeoutInSeconds) {
		try {
			WebElement element = new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.elementToBeClickable(locator));
			element.click();
			logStep("Clicked element", locator);
		} catch (Exception e) {
			ExtentReportManager.logFailure("Failed to click element", locator.toString(), e);
			throw new AssertionError("Failed to click on element: " + locator, e);
		}
	}

	// ─── Visibility ──────────────────────────────────────────────────────────

	public static boolean isElementIsVisible(WebDriver driver, By by) {
		return isElementIsVisible(driver, by, "Verified element is visible");
	}

	public static boolean isElementIsVisible(WebDriver driver, By by, int timeoutInSeconds) {
		return isElementIsVisible(driver, by, timeoutInSeconds, "Verified element is visible");
	}

	public static boolean isElementIsVisible(WebDriver driver, By by, String stepDesc) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
			logStep(stepDesc, by);
			return driver.findElement(by).isDisplayed();
		} catch (Exception e) {
			logWarning(stepDesc + " — element not visible", by);
			return false;
		}
	}

	public static boolean isElementIsVisible(WebDriver driver, By by, int timeoutInSeconds, String stepDesc) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
			logStep(stepDesc, by);
			return driver.findElement(by).isDisplayed();
		} catch (Exception e) {
			logWarning(stepDesc + " — element not visible", by);
			return false;
		}
	}

	// ─── Silent probe (no log on either outcome) ─────────────────────────────

	protected static boolean probeElementVisible(WebDriver driver, By by, int timeoutInSeconds) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
			return driver.findElement(by).isDisplayed();
		} catch (Exception e) {
			return false;
		}
	}

	// ─── Invisibility ────────────────────────────────────────────────────────

	public static boolean isElementNotVisible(WebDriver driver, By by) {
		return isElementNotVisible(driver, by, "Verified element is not visible");
	}

	public static boolean isElementNotVisible(WebDriver driver, By by, int timeoutInSeconds) {
		try {
			boolean result = new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.invisibilityOfElementLocated(by));
			logStep("Verified element is not visible", by);
			return result;
		} catch (Exception e) {
			logWarning("Element still visible or error during invisibility check", by);
			return false;
		}
	}

	public static boolean isElementNotVisible(WebDriver driver, By by, String stepDesc) {
		try {
			boolean result = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.invisibilityOfElementLocated(by));

			logStep(stepDesc, by);
			return result;

		} catch (TimeoutException e) {
			logWarning(stepDesc + " — element still visible", by);
			return false;

		} catch (Exception e) {
			logWarning(stepDesc + " — error while waiting", by);
			return false;
		}
	}

	// ─── Text input ──────────────────────────────────────────────────────────

	public void enterText(WebDriver driver, By locator, String text) {
		enterText(driver, locator, text, "Entered text");
	}

	public void enterText(WebDriver driver, By locator, String text, String stepDesc) {
		try {
			WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.presenceOfElementLocated(locator));

			element.clear();
			element.sendKeys(text);

			logStep(stepDesc + " [value: " + text + "]", locator);

		} catch (Exception e) {
			ExtentReportManager.logFailure(stepDesc, locator.toString(), e);
			throw new AssertionError("Step failed: " + stepDesc, e);
		}
	}

	// ─── Text retrieval ──────────────────────────────────────────────────────

	public String getElementText(WebDriver driver, By locator) {
		try {
			WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.presenceOfElementLocated(locator));

			String text = element.getText();
			logStep("Retrieved text [value: " + text + "]", locator);
			return text;

		} catch (Exception e) {
			ExtentReportManager.logFailure("Failed to get text", locator.toString(), e);
			throw new AssertionError("Failed to get text", e);
		}
	}

	public List<String> getElementTexts(WebDriver driver, By locator) throws TimeoutException {
		List<String> textContents = new ArrayList<>();
		List<WebElement> elements = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.presenceOfAllElementsLocatedBy(locator));
		for (WebElement element : elements) {
			textContents.add(element.getText());
		}
		logStep("Retrieved " + textContents.size() + " element texts", locator);
		return textContents;
	}

	// ─── Attribute retrieval ─────────────────────────────────────────────────

	public String getElementAttribute(WebDriver driver, By locator, String attribute) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		String value = element.getAttribute(attribute);
		logStep("Retrieved attribute [" + attribute + ": " + value + "]", locator);
		return value;
	}

	// ─── Enabled state ───────────────────────────────────────────────────────

	public static boolean isElementEnabled(WebDriver driver, By by) {
		return isElementEnabled(driver, by, "Verified element enabled state");
	}

	public static boolean isElementEnabled(WebDriver driver, By by, int timeoutInSeconds) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
			boolean enabled = driver.findElement(by).isEnabled();
			logStep("Verified element enabled state [enabled: " + enabled + "]", by);
			return enabled;
		} catch (Exception e) {
			// Element not visible within timeout — treated as not enabled (valid outcome).
			logStep("Element not visible within timeout — treated as not enabled", by);
			return false;
		}
	}

	public static boolean isElementEnabled(WebDriver driver, By by, String stepDesc) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
			boolean enabled = driver.findElement(by).isEnabled();
			logStep(stepDesc + " [enabled: " + enabled + "]", by);
			return enabled;
		} catch (Exception e) {
			// Element not visible within timeout — treated as not enabled (valid outcome).
			logStep("Element not visible within timeout — treated as not enabled", by);
			return false;
		}
	}

	// ─── URL wait ────────────────────────────────────────────────────────────

	public String waitForUrlContains(WebDriver driver, String partialUrl, int timeoutInSeconds) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.urlContains(partialUrl));
			String currentUrl = driver.getCurrentUrl();
			logStep("URL contains '" + partialUrl + "' [current: " + currentUrl + "]");
			return currentUrl;
		} catch (TimeoutException e) {
			ExtentReportManager.logFailure("Timed out waiting for URL: " + partialUrl, null, e);
			throw new AssertionError("Timed out waiting for URL", e);
		}
	}

	// ─── Multi-locator wait ───────────────────────────────────────────────────

	@SuppressWarnings("unchecked")
	public WebElement waitForFirstVisible(WebDriver driver, By... locators) {
		ExpectedCondition<?>[] conditions = Arrays.stream(locators)
				.map(ExpectedConditions::visibilityOfElementLocated)
				.toArray(ExpectedCondition[]::new);
		new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.or(conditions));
		for (By locator : locators) {
			try {
				WebElement el = driver.findElement(locator);
				if (el.isDisplayed()) {
					logStep("First visible element found among candidates", locator);
					return el;
				}
			} catch (NoSuchElementException ignored) {
			}
		}
		ExtentReportManager.logFailure(
				"None of the locators became visible: " + Arrays.toString(locators),
				Arrays.toString(locators),
				null
		);
		throw new TimeoutException("None of the provided locators were visible after "
				+ getConfiguredWaitTimeInSeconds() + "s: " + Arrays.toString(locators));
	}

	public void enterTextInFirstVisible(WebDriver driver, String text, By... locators) {
		WebElement element = waitForFirstVisible(driver, locators);
		element.clear();
		element.sendKeys(text);
		logStep("Entered text in first visible element [value: " + text + "]", locators[0]);
	}

	// ─── Scroll ──────────────────────────────────────────────────────────────

	public static void scrollIntoView(WebDriver driver, By locator) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", element);
		logStep("Scrolled element into view", locator);
	}

	// ─── Wait until enabled ──────────────────────────────────────────────────

	public void waitUntilElementEnabled(WebDriver driver, By locator, int timeoutSeconds) {
		new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds))
				.until(ExpectedConditions.elementToBeClickable(locator));
		logStep("Waited until element is enabled/clickable", locator);
	}

	// ─── Fixed wait ──────────────────────────────────────────────────────────

	public static void waitForSeconds(WebDriver driver, int seconds) {
		Instant startTime = Instant.now();
		new WebDriverWait(driver, Duration.ofSeconds(seconds + 1))
				.until(new Function<WebDriver, Boolean>() {
					@Override
					public Boolean apply(WebDriver driver) {
						long elapsed = Duration.between(startTime, Instant.now()).getSeconds();
						return elapsed >= seconds;
					}
				});
		logStep("Waited for " + seconds + " seconds");
	}

	// ─── YAML ────────────────────────────────────────────────────────────────

	public static String getKeyValueFromYaml(String filePath, String key) {
		FileReader reader = null;
		try {
			reader = new FileReader(System.getProperty("user.dir") + filePath);
		} catch (FileNotFoundException e) {
			throw new RuntimeException(e);
		}
		Yaml yaml = new Yaml();
		Object data = yaml.load(reader);
		if (data instanceof Map) {
			@SuppressWarnings("unchecked")
			Map<String, String> map = (Map<String, String>) data;
			return map.get(key);
		} else {
			throw new RuntimeException("Invalid YAML format, expected a map");
		}
	}

	// ─── BrowserStack network ────────────────────────────────────────────────

	public static void resetNetworkProfile(String sessionID) {
		String baseURL = "https://api-cloud.browserstack.com";
		String endpoint = "/app-automate/sessions/" + sessionID + "/update_network.json";
		String accessKey = getKeyValueFromYaml("/browserstack.yml", "accessKey");
		String userName = getKeyValueFromYaml("/browserstack.yml", "userName");
		RequestSpecification requestSpec = RestAssured.given().auth().basic(userName, accessKey)
				.header("Content-Type", "application/json").body("{\"networkProfile\":\"reset\"}");
		requestSpec.put(baseURL + endpoint);
		logStep("Reset BrowserStack network profile to default");
	}

	public static void setNoNetworkProfile(String sessionID) {
		String baseURL = "https://api-cloud.browserstack.com";
		String endpoint = "/app-automate/sessions/" + sessionID + "/update_network.json";
		String accessKey = getKeyValueFromYaml("/browserstack.yml", "accessKey");
		String userName = getKeyValueFromYaml("/browserstack.yml", "userName");
		RequestSpecification requestSpec = RestAssured.given().auth().basic(userName, accessKey)
				.header("Content-Type", "application/json").body("{\"networkProfile\":\"no-network\"}");
		requestSpec.put(baseURL + endpoint);
		logStep("Set BrowserStack network profile to no-network");
	}
}