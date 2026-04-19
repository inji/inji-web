package utils;

import com.aventstack.extentreports.MediaEntityBuilder;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.util.Base64;

public class ScreenshotUtil {
	private static final ThreadLocal<Boolean> FAILURE_SCREENSHOT_CAPTURED = ThreadLocal.withInitial(() -> false);

	public static void resetFailureScreenshotFlag() {
		FAILURE_SCREENSHOT_CAPTURED.set(false);
	}

	public static void clearFailureScreenshotFlag() {
		FAILURE_SCREENSHOT_CAPTURED.remove();
	}

	public static boolean isFailureScreenshotCaptured() {
		return Boolean.TRUE.equals(FAILURE_SCREENSHOT_CAPTURED.get());
	}

	public static String captureScreenshot(WebDriver driver, String screenshotName) throws IOException {
		byte[] screenshotBytes = shouldCaptureFullPage()
				? captureFullPageScreenshot(driver)
				: ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
		String destinationPath = System.getProperty("user.dir") + "/screenshots/" + screenshotName + "_"
				+ System.currentTimeMillis() + ".png";
		File destination = new File(destinationPath);
		destination.getParentFile().mkdirs();
		FileUtils.writeByteArrayToFile(destination, screenshotBytes);
		return destinationPath;
	}

	private static byte[] captureFullPageScreenshot(WebDriver driver) throws IOException {
		if (driver == null) {
			System.err.println("WebDriver instance is null. Cannot take a screenshot.");
			throw new IllegalStateException("WebDriver instance is null.");
		}

		if (!(driver instanceof TakesScreenshot)) {
			throw new IllegalStateException("Driver does not support screenshots.");
		}

		Dimension originalSize = driver.manage().window().getSize();
		try {
			if (driver instanceof JavascriptExecutor) {
				JavascriptExecutor jsExecutor = (JavascriptExecutor) driver;
				Number fullWidth = (Number) jsExecutor.executeScript(
						"return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth,"
								+ " document.body.offsetWidth, document.documentElement.offsetWidth,"
								+ " document.documentElement.clientWidth);");
				Number fullHeight = (Number) jsExecutor.executeScript(
						"return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,"
								+ " document.body.offsetHeight, document.documentElement.offsetHeight,"
								+ " document.documentElement.clientHeight);");

				if (fullWidth != null && fullHeight != null) {
					int targetWidth = Math.max(fullWidth.intValue(), originalSize.getWidth());
					int targetHeight = Math.max(fullHeight.intValue(), originalSize.getHeight());
					driver.manage().window().setSize(new Dimension(targetWidth, targetHeight));
				}
			}

			return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
		} catch (Exception e) {
			return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
		} finally {
			try {
				driver.manage().window().setSize(originalSize);
			} catch (Exception ignored) {
				// Ignore restore failures to avoid masking the test failure.
			}
		}
	}

	public static void attachScreenshot(WebDriver driver, String screenshotName) {
		if (isFailureScreenshotCaptured()) {
			return;
		}

		try {
			String screenshotPath = captureScreenshot(driver, screenshotName);

			File screenshotFile = new File(screenshotPath);
			if (screenshotFile.exists()) {
				ExtentReportManager.getTest().info("Screenshot Captured", MediaEntityBuilder
						.createScreenCaptureFromBase64String(encodeFileToBase64Binary(screenshotPath)).build());
				FAILURE_SCREENSHOT_CAPTURED.set(true);
			} else {
				ExtentReportManager.getTest().warning("Screenshot file not found: " + screenshotPath);
			}
		} catch (IOException e) {
			ExtentReportManager.getTest().warning("Failed to attach screenshot to report: " + e.getMessage());
		}
	}

	public static String encodeFileToBase64Binary(String filePath) throws IOException {
		byte[] fileContent = FileUtils.readFileToByteArray(new File(filePath));
		return Base64.getEncoder().encodeToString(fileContent);
	}

	private static boolean shouldCaptureFullPage() {
		String screenshotMode = System.getenv("SCREENSHOT_MODE");
		return screenshotMode != null && "FULLPAGE".equalsIgnoreCase(screenshotMode.trim());
	}
}
