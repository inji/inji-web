package base;

import io.mosip.testrig.apirig.utils.ConfigManager;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.yaml.snakeyaml.Yaml;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BasePage {
	private static final Logger logger = LoggerFactory.getLogger(BasePage.class);
	public static int explicit_timeout;
	static {
		int fallback = 30; // reasonable default
		try {
			String configured = ConfigManager.getproperty("explicit_timeout");
			if (configured != null && !configured.isEmpty()) {
				explicit_timeout = Integer.parseInt(configured);
				if (explicit_timeout <= 0) {
					logger.warn("explicit_timeout must be positive; defaulting to {}", fallback);
					explicit_timeout = fallback;
				}
			} else {
				explicit_timeout = fallback;
			}
		} catch (NumberFormatException e) {
			logger.warn("Invalid explicit_timeout config; defaulting to {}", fallback);
			explicit_timeout = fallback;
		}
	}

	public static void safeScrollForMobileView(WebDriver driver, By locator) {
		int maxAttempts = 3; // fallback
		try {
			String configured = ConfigManager.getproperty("maxAttempts");
			if (configured != null && !configured.isEmpty()) {
				maxAttempts = Integer.parseInt(configured);
			}
		} catch (NumberFormatException e) {
			logger.warn("Invalid maxAttempts config; defaulting to {}", maxAttempts);
		}
		for (int i = 0; i < maxAttempts; i++) {
			try {
				WebElement element = driver.findElement(locator);
				((JavascriptExecutor) driver)
						.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", element);
				return;
			} catch (NoSuchElementException | StaleElementReferenceException e) {
				logger.warn("Attempt {}: Retrying scroll for {}", i + 1, locator);
			} catch (Exception e) {
				logger.error("Attempt {}: Unexpected error while scrolling {} - {}", i + 1, locator, e.getMessage());
			}
		}
		logger.error("⚠️ Element {} not visible after {} attempts.", locator, maxAttempts);
	}

	public void clickOnElement(WebDriver driver, By locator) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) * 2))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		safeScrollForMobileView(driver, locator);
		element.click();
	}

	public static boolean isElementIsVisible(WebDriver driver, By by) {
		try {
			(new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) * 2)))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
			safeScrollForMobileView(driver, by);
			return driver.findElement(by).isDisplayed();
		} catch (Exception e) {
			return false;
		}
	}

	public static boolean isElementIsVisible(WebDriver driver, By by, int timeoutInSeconds) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
			safeScrollForMobileView(driver, by);
			return driver.findElement(by).isDisplayed();
		} catch (Exception e) {
			return false;
		}
	}

	public static void clickOnElement(WebDriver driver, By locator, int timeoutInSeconds) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds));
			WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
			safeScrollForMobileView(driver, locator);
			element.click();
		} catch (Exception e) {
			throw new RuntimeException("Failed to click on element: " + locator, e);
		}
	}

	public static boolean isElementNotVisible(WebDriver driver, By by) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) / 5));
			return wait.until(ExpectedConditions.invisibilityOfElementLocated(by));
		} catch (Exception e) {
			// Retry after scroll
			try {
				safeScrollForMobileView(driver, by);
				WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) / 6));
				return wait.until(ExpectedConditions.invisibilityOfElementLocated(by));
			} catch (Exception ex) {
				// ❗ As per pattern: exception = could not verify → return false
				return false;
			}
		}
	}

	public void enterText(WebDriver driver, By locator, String text) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) * 2))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		safeScrollForMobileView(driver, locator);
		element.clear();
		element.sendKeys(text);
	}

	public String getElementText(WebDriver driver, By locator) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) * 2))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		safeScrollForMobileView(driver, locator);
		return element.getText();
	}

	public List<String> getElementTexts(WebDriver driver, By locator) throws TimeoutException {
		List<String> textContents = new ArrayList<>();
		List<WebElement> elements = new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) * 2))
				.until(ExpectedConditions.presenceOfAllElementsLocatedBy(locator));
		for (WebElement element : elements) {
			safeScrollForMobileView(driver, locator);
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
			return (String) map.get(key);
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

		Response response = requestSpec.put(baseURL + endpoint);
	}

	public static void setNoNetworkProfile(String sessionID) {
		String baseURL = "https://api-cloud.browserstack.com";
		String endpoint = "/app-automate/sessions/" + sessionID + "/update_network.json";
		String accessKey = getKeyValueFromYaml("/browserstack.yml", "accessKey");
		String userName = getKeyValueFromYaml("/browserstack.yml", "userName");
		String networkSettingsJson = "{\"networkProfile\":\"no-network\"}";
		RequestSpecification requestSpec = RestAssured.given().auth().basic(userName, accessKey)
				.header("Content-Type", "application/json").body(networkSettingsJson);
		Response response = requestSpec.put(baseURL + endpoint);
	}

	public static boolean isElementEnabled(WebDriver driver, By by) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) / 10))
					.until(ExpectedConditions.visibilityOfElementLocated(by));
			safeScrollForMobileView(driver, by);
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

	public static void waitForSeconds(WebDriver driver, int seconds) {
		Instant startTime = Instant.now();

		new WebDriverWait(driver, Duration.ofSeconds(seconds + 1)) // a buffer
				.until(new java.util.function.Function<WebDriver, Boolean>() {
					@Override
					public Boolean apply(WebDriver driver) {
						long elapsed = Duration.between(startTime, Instant.now()).getSeconds();
						return elapsed >= seconds;
					}
				});
	}

	public String getElementAttribute(WebDriver driver, By locator, String data) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) * 2))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		safeScrollForMobileView(driver, locator);
		return element.getAttribute(data);
	}

	public void waitUntilElementEnabled(WebDriver driver, By locator, int timeoutSeconds) {
		WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
		wait.until(ExpectedConditions.elementToBeClickable(locator));
	}

	public int getXCoordinateValue(WebDriver driver, By locator) {
		WebElement element = new WebDriverWait(driver, Duration.ofSeconds((BasePage.explicit_timeout) * 2))
				.until(ExpectedConditions.presenceOfElementLocated(locator));
		return element.getLocation().getX();
	}
}
