package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import base.BasePage;
import java.time.Duration;

public class MosipCredentials extends BasePage {

	private WebDriver driver;
	public String pdfName;
	private static final By OTP_INPUT = By.xpath("(//input[@class='pincode-input-text'])[1]");
	private static final By VERIFY_OTP_BUTTON = By.xpath("//button[@id='verify_otp']");

	public MosipCredentials(WebDriver driver) {
		this.driver = driver;
	}

	public Boolean isMockVerifiableCredentialDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//h3[text()='Mock Verifiable Credential']"),
				getConfiguredWaitTimeInSeconds(),
				"Verify 'Mock Verifiable Credential' option is displayed");
	}

	public void clickOnMockVerifiableCredential() {
		clickOnElement(driver,
				By.xpath("//h3[text()='Mock Verifiable Credential']"),
				"Click on 'Mock Verifiable Credential' option");
	}

	public void enterVid(String uinOrVid) {
		enterSensitiveTextInFirstVisible(driver, uinOrVid,
				By.xpath("//input[@id='Otp_mosip-vid']"),
				By.xpath("//input[@id='Otp_vid']"));
	}

	public void clickOnGetOtpButton() {
		clickOnElement(driver,
				By.xpath("//button[@id='get_otp']"),
				"Click 'Get OTP' button to request OTP");
	}

	public boolean isOtpVerificationPageDisplayed(int timeoutSeconds) {
		try {
			boolean visible = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds))
					.until(webDriver -> webDriver.findElements(OTP_INPUT).stream().anyMatch(element -> element.isDisplayed())
							|| webDriver.findElements(VERIFY_OTP_BUTTON).stream().anyMatch(element -> element.isDisplayed()));
			logStep("Verify OTP verification page is displayed", OTP_INPUT);
			return visible;
		} catch (Exception e) {
			logWarning("OTP verification page not displayed within timeout", OTP_INPUT);
			return false;
		}
	}

	public void enterOtp(WebDriver driver, String otpString) {
		if (!isElementIsVisible(driver, OTP_INPUT, "Verify OTP input field is visible before entering OTP")) {
			throw new RuntimeException("OTP input field is not visible");
		}
		for (int i = 0; i < otpString.length(); i++) {
			String locator = "(//input[@class='pincode-input-text'])[" + (i + 1) + "]";
			driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(otpString.charAt(i)));
		}
		logStep("Enter OTP digits into pincode input fields", OTP_INPUT);
	}

	public void clickOnMosipNationalId() {
		By itemLocator = By.xpath("//*[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]");
		pdfName = getElementAttribute(driver, itemLocator, "data-testid")
				.replaceFirst("ItemBox-Outer-Container-0-", "") + ".pdf";
		clickOnElement(driver,
				By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"),
				"Click on MOSIP National ID issuer card");
	}

	public Boolean isLoginPageLableDisplayed() {
		try {
			waitForFirstVisible(driver,
					By.xpath("//label[@for='Mosip vid']"),
					By.xpath("//label[@for='Otp_vid']"));
			logStep("Verify login page UIN/VID label is displayed",
					By.xpath("//label[@for='Otp_vid']"));
			return true;
		} catch (Exception e) {
			logWarning("Login page label not displayed", By.xpath("//label[@for='Otp_vid']"));
			return false;
		}
	}

	public void clickOnLoginWithOtp() {
		By loginWithOtp = By.xpath("//*[@id='login_with_otp']");
		By getOtp = By.xpath("//*[@id='get_otp']");
		if (isElementIsVisible(driver, loginWithOtp, getConfiguredWaitTimeInSeconds(),
				"Check if 'Login with OTP' button is visible")) {
			clickOnElement(driver, loginWithOtp, "Click 'Login with OTP' button");
		} else if (isElementIsVisible(driver, getOtp, getConfiguredWaitTimeInSeconds(),
				"Check if 'Get OTP' button is visible")) {
			clickOnElement(driver, getOtp, "Click 'Get OTP' button");
		} else {
			logWarning("Neither 'Login with OTP' nor 'Get OTP' button is visible", loginWithOtp);
			utils.BaseTest.markScenarioFailed();
			throw new AssertionError("Step failed: no OTP action button is visible");
		}
	}

	public Boolean isVidInputBoxHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//label[text() = 'UIN/VID']"),
				"Verify UIN/VID input box header label is displayed");
	}

	public Boolean isDownloadingDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='title-download-result']"),
				"Verify 'Downloading in Progress' description text is displayed");
	}

	/**
	 * Verifies the MOSIP VC download completed successfully end-to-end:
	 * 1. Waits up to configured seconds for the download-result page to appear.
	 * 2. Waits up to configured seconds for a vc-card-view to render on that page.
	 */
	public Boolean isMosipVcDownloadedSuccessfully() {
		if (!isElementIsVisible(driver,
				By.xpath("//*[@data-testid='title-download-result']"),
				getConfiguredWaitTimeInSeconds(),
				"Verify download-result page appeared after OTP submission")) {
			return false;
		}
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='vc-card-view']"),
				getConfiguredWaitTimeInSeconds(),
				"Verify VC card rendered successfully on download-result page");
	}

}