package base;

import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.yaml.snakeyaml.Yaml;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import utils.InjiWebConfigManager;

public class BasePage {

	public static int getConfiguredWaitTimeInSeconds() {
		return InjiWebConfigManager.getWaitTimeInSeconds();
	}

	public static int getConfiguredShortWaitTimeInSeconds() {
		return InjiWebConfigManager.getShortWaitTimeInSeconds();
	}

	public void clickOnElement(WebDriver driver, By locator) {
		// elementToBeClickable (visible + enabled) is always the correct condition for
		// a click. presenceOfElementLocated only checks DOM existence — clicking a
		// present-but-disabled element throws ElementNotInteractableException.
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.elementToBeClickable(locator));
		element.click();
	}

	public static boolean isElementIsVisible(WebDriver driver, By by) {
		try {
			(new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds())))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
            return driver.findElement(by).isDisplayed();
		} catch (Exception e) {
			return false;
		}
	}

	public static boolean isElementIsVisible(WebDriver driver, By by, int timeoutInSeconds) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
            return driver.findElement(by).isDisplayed();
		} catch (Exception e) {
			return false;
		}
	}

	public static void clickOnElement(WebDriver driver, By locator, int timeoutInSeconds) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds));
			WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
			element.click();
		} catch (Exception e) {
			throw new RuntimeException("Failed to click on element: " + locator, e);
		}
	}

	public static boolean isElementNotVisible(WebDriver driver, By by) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()));
            return wait.until(ExpectedConditions.invisibilityOfElementLocated(by));
		} catch (Exception e) {
			return true; // Treat errors as "not visible"
		}
	}

	public static boolean isElementNotVisible(WebDriver driver, By by, int timeoutInSeconds) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds));
            return wait.until(ExpectedConditions.invisibilityOfElementLocated(by));
		} catch (Exception e) {
			return false;
		}
	}

	public void enterText(WebDriver driver, By locator, String text) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		element.clear();
		element.sendKeys(text);
	}

	public String getElementText(WebDriver driver, By locator) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
        return element.getText();
	}

	public List<String> getElementTexts(WebDriver driver, By locator) throws TimeoutException {
		List<String> textContents = new ArrayList<>();
		List<WebElement> elements = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.presenceOfAllElementsLocatedBy(locator));
		for (WebElement element : elements) {
			textContents.add(element.getText());
		}
		return textContents;
	}

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

	public static void resetNetworkProfile(String sessionID) {
		String baseURL = "https://api-cloud.browserstack.com";
		String endpoint = "/app-automate/sessions/" + sessionID + "/update_network.json";

		String accessKey = getKeyValueFromYaml("/browserstack.yml", "accessKey");
		String userName = getKeyValueFromYaml("/browserstack.yml", "userName");
		String networkSettingsJson = "{\"networkProfile\":\"reset\"}";

		RequestSpecification requestSpec = RestAssured.given().auth().basic(userName, accessKey)
				.header("Content-Type", "application/json").body(networkSettingsJson);

		requestSpec.put(baseURL + endpoint);
	}

	public static void setNoNetworkProfile(String sessionID) {
		String baseURL = "https://api-cloud.browserstack.com";
		String endpoint = "/app-automate/sessions/" + sessionID + "/update_network.json";
		String accessKey = getKeyValueFromYaml("/browserstack.yml", "accessKey");
		String userName = getKeyValueFromYaml("/browserstack.yml", "userName");
		String networkSettingsJson = "{\"networkProfile\":\"no-network\"}";
		RequestSpecification requestSpec = RestAssured.given().auth().basic(userName, accessKey)
				.header("Content-Type", "application/json").body(networkSettingsJson);
		requestSpec.put(baseURL + endpoint);
	}

	public static boolean isElementEnabled(WebDriver driver, By by) {
		try {
			(new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds())))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
            return driver.findElement(by).isEnabled();
		} catch (Exception e) {
			return false;
		}
	}

	public static boolean isElementEnabled(WebDriver driver, By by, int timeoutInSeconds) {
		try {
			(new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds)))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
            return driver.findElement(by).isEnabled();
		} catch (Exception e) {
			return false;
		}
	}

	public String waitForUrlContains(WebDriver driver, String partialUrl, int timeoutInSeconds) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds));
			wait.until(ExpectedConditions.urlContains(partialUrl));
            return driver.getCurrentUrl();
		} catch (TimeoutException e) {
			throw new AssertionError("Timed out waiting for URL to contain: " + partialUrl, e);
		}
	}

	/**
	 * Waits until the first visible element matching any of the provided locators appears,
	 * then returns that element. Useful when the same logical field can have different
	 * IDs/XPaths across environments or UI versions — all candidates are polled in parallel
	 * on every tick, so no time is wasted waiting for a locator that will never match.
	 *
	 * @param locators       one or more locators tried simultaneously
	 * @return the first visible WebElement found
	 * @throws TimeoutException if none of the locators becomes visible within the timeout
	 */
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
					return el;
				}
			} catch (NoSuchElementException ignored) {
			}
		}
		throw new TimeoutException("None of the provided locators were visible after "
				+ getConfiguredWaitTimeInSeconds() + "s: "
				+ Arrays.toString(locators));
	}

	/**
	 * Convenience wrapper: waits for the first visible element among the given locators,
	 * clears it, and types the supplied text.
	 */
	public void enterTextInFirstVisible(WebDriver driver, String text, By... locators) {
		WebElement element = waitForFirstVisible(driver, locators);
		element.clear();
		element.sendKeys(text);
	}

	public static void waitForSeconds(WebDriver driver, int seconds) {
		Instant startTime = Instant.now();

		new WebDriverWait(driver, Duration.ofSeconds(seconds + 1)) // a buffer
				.until(new Function<WebDriver, Boolean>() {
					@Override
					public Boolean apply(WebDriver driver) {
						long elapsed = Duration.between(startTime, Instant.now()).getSeconds();
						return elapsed >= seconds;
					}
				});
	}

	public String getElementAttribute(WebDriver driver, By locator, String data) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		return element.getAttribute(data);
	}

	public void waitUntilElementEnabled(WebDriver driver, By locator, int timeoutSeconds) {
		WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
		wait.until(ExpectedConditions.elementToBeClickable(locator));
	}

	/**
	 * Scrolls the element matching the given locator into the visible viewport
	 * using JavaScript. Use this before visibility checks when the element exists
	 * in the DOM but is outside the current viewport (e.g. below the fold).
	 */
	public static void scrollIntoView(WebDriver driver, By locator) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", element);
	}
}
