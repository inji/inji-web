package pages;

import base.BasePage;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import utils.InjiWebUtil;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

public class SunbirdCredentials extends BasePage {
	protected final Logger logger = LoggerFactory.getLogger(getClass());
	private WebDriver driver;

	public SunbirdCredentials(WebDriver driver) {
		this.driver = driver;
	}

	private static final By FIRST_ITEM = By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]");
	private static final By SECOND_ITEM = By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-1-')]");

	public Boolean isDownloadSunbirdCredentialsDisplayed() {
		return isElementIsVisible(driver, FIRST_ITEM,
				"Verify Sunbird credential issuer card is displayed");
	}

	public Boolean isSunbirdInsuranceDisplayed() {
		return isDownloadSunbirdCredentialsDisplayed();
	}

	public String pdfNameInsurance;

	public void clickOnSunbirdInsurance() {
		pdfNameInsurance = getElementAttribute(driver,
				By.xpath("//*[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"), "data-testid")
				.replaceFirst("ItemBox-Outer-Container-0-", "") + ".pdf";
		logger.info("PDF Name for Insurance: " + pdfNameInsurance);
		clickOnElement(driver, FIRST_ITEM,
				"Click on Sunbird Insurance issuer card");
	}

	public void clickOnDownloadSunbird() {
		clickOnElement(driver, FIRST_ITEM,
				"Click on Sunbird credential issuer card to start download");
	}

	public void enterPolicyNumber(String string) {
		enterText(driver, By.xpath("//input[@id='_form_policyNumber']"), string,
				"Enter policy number");
	}

	public Boolean isPolicyNumeTextBoxDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//input[@id='_form_policyNumber']"),
				"Verify policy number input box is displayed");
	}

	public void enterFullName(String string) {
		enterText(driver, By.xpath("//input[@id='_form_fullName']"), string,
				"Enter full name");
	}

	public void selectDateOfBirth(String dob) {
		WebElement fullNameField = driver.findElement(By.id("_form_fullName"));
		WebElement dobField = driver.findElement(By.id("_form_dob"));
		InjiWebUtil injiWebUtil = new InjiWebUtil();
		String formattedDob = injiWebUtil.resolveAcceptedDateOfBirthFormat(dob, dobField);

		fullNameField.sendKeys(Keys.TAB);

		dobField.clear();
		dobField.sendKeys(formattedDob);
		dobField.sendKeys(Keys.TAB);

		logStep("Enter date of birth [value: " + formattedDob + "]", By.id("_form_dob"));
	}

	public void clickOnLogin() {
		clickOnElement(driver,
				By.xpath("//button[@id='verify_form']"),
				"Click 'Login' button to submit Sunbird credentials form");
	}

	public Boolean isLoginButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//button[@id='verify_form']"),
				getConfiguredWaitTimeInSeconds(),
				"Verify 'Login' submit button is displayed on Sunbird form");
	}

	public Boolean isLifeInceranceDisplayed() {
		return isElementIsVisible(driver, SECOND_ITEM,
				"Verify 'Life Insurance' issuer card is displayed");
	}

	public Boolean isLoginFailedDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[contains(text(), 'Login failed')]"),
				getConfiguredWaitTimeInSeconds(),
				"Verify 'Login failed' error message is displayed");
	}

	public void clickOnLifeInsurance() {
		clickOnElement(driver, SECOND_ITEM,
				"Click on 'Life Insurance' issuer card");
	}

	public Boolean isEnterPolicyNumberHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//label[text() = 'Enter Policy Number']"),
				"Verify 'Enter Policy Number' field header is displayed");
	}

	public Boolean isEnterFullNameHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//label[text() = 'Enter Full Name']"),
				"Verify 'Enter Full Name' field header is displayed");
	}

	public Boolean isEnterDOBHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//label[text() = 'Enter DOB']"),
				"Verify 'Enter DOB' field header is displayed");
	}

	public Boolean isAuthenticationFailedDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@id='error-banner']"),
				"Verify authentication-failed error banner is displayed");
	}

	public Boolean isVehicleInsuranceDisplayed() {
		return isDownloadSunbirdCredentialsDisplayed();
	}

	public void clickOnVehicleInsurance() {
		clickOnSunbirdInsurance();
	}

	public boolean waitForLoginFailure(int timeoutInSeconds) {
		try {
			new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds))
					.until(ExpectedConditions.visibilityOfElementLocated(
							By.xpath("//*[contains(text(),'Login failed')]")
					));

			return true; // failure appeared

		} catch (TimeoutException e) {
			return false; // failure did NOT appear → success assumed
		}
	}

}