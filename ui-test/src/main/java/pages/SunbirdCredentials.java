package pages;

import base.BasePage;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import utils.InjiWebConfigManager;
import utils.InjiWebUtil;

import java.time.Duration;

public class SunbirdCredentials extends BasePage {
	protected final Logger logger = LoggerFactory.getLogger(getClass());
	private WebDriver driver;

	public SunbirdCredentials(WebDriver driver) {
		this.driver = driver;
	}

	private static final By FIRST_ITEM = By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]");
	private static final By SECOND_ITEM = By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-1-')]");

	public Boolean isDownloadSunbirdCredentialsDisplayed() {
		String issuerText = InjiWebConfigManager.getproperty("issuerSearchTextforSunbird");
		By sunbirdCredentialsButton = By.xpath(String.format("//div[@role='menuitem'][.//h3[normalize-space(.)='%s']]", issuerText));
		return isElementIsVisible(driver, sunbirdCredentialsButton,
				"Verify Sunbird credential issuer card is displayed");
	}

	public Boolean isSunbirdInsuranceDisplayed() {
		By healthInsuranceCard = By.xpath("//div[@role='menuitem'][.//h3[normalize-space(.)='Health Insurance']]");
		return isElementIsVisible(driver, healthInsuranceCard,
				"Verify Health Insurance issuer card is displayed");
	}

	public String pdfNameInsurance;

	public void clickOnSunbirdInsurance() {
		By healthInsuranceCard = By.xpath("//div[@role='menuitem'][.//h3[normalize-space(.)='Health Insurance']]");

		pdfNameInsurance = getElementAttribute(driver, healthInsuranceCard, "data-testid")
				.replaceFirst("ItemBox-Outer-Container-\\d+-", "") + ".pdf";

		logger.info("PDF Name for Insurance: " + pdfNameInsurance);

		clickOnElement(driver, healthInsuranceCard,
				"Click on Sunbird Insurance issuer card"
		);
	}

	public void clickOnDownloadSunbird() {
		String issuerText = InjiWebConfigManager.getproperty("issuerSearchTextforSunbird");
		By sunbirdCredentialsButton = By.xpath(String.format("//div[@role='menuitem'][.//h3[normalize-space(.)='%s']]", issuerText));
		clickOnElement(driver, sunbirdCredentialsButton,
				"Click on Sunbird credential issuer card to start download");
	}

	public void enterPolicyNumber(String string) {
		enterText(driver, By.id("policyNumber"), string,
				"Enter policy number");
	}

	public Boolean isPolicyNumeTextBoxDisplayed() {
		return isElementIsVisible(driver,
				By.id("policyNumber"),
				"Verify policy number input box is displayed");
	}

	public void enterFullName(String string) {
		enterText(driver, By.id("fullName"), string,
				"Enter full name");
	}

	public void selectDateOfBirth(String dob) {
		WebElement fullNameField = driver.findElement(By.id("fullName"));
		By realDateInput = By.cssSelector("input.real-date-input[name='dob']");
		WebElement dobField = driver.findElement(realDateInput);
		InjiWebUtil injiWebUtil = new InjiWebUtil();
		String formattedDob = injiWebUtil.resolveAcceptedDateOfBirthFormat(dob, dobField);

		fullNameField.sendKeys(Keys.TAB);

		dobField.clear();
		dobField.sendKeys(formattedDob);
		dobField.sendKeys(Keys.TAB);

		logStep("Enter date of birth", By.id("dob"));
	}

	public void clickOnLogin() {
		clickOnElement(driver,
				By.id("form-submit-button"),
				"Click 'Login' button to submit Sunbird credentials form");
	}

	public Boolean isLoginButtonDisplayed() {
		return isElementIsVisible(driver,
				By.id("form-submit-button"),
				getConfiguredWaitTimeInSeconds(),
				"Verify 'Login' submit button is displayed on Sunbird form");
	}

	public Boolean isLifeInceranceDisplayed() {
		By healthInsuranceCard = By.xpath("//div[@role='menuitem'][.//h3[normalize-space(.)='Life Insurance']]");
		return isElementIsVisible(driver, healthInsuranceCard,
				"Verify Life Insurance issuer card is displayed");
	}

	public Boolean isLoginFailedDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[contains(text(), 'Login failed')]"),
				getConfiguredWaitTimeInSeconds(),
				"Verify 'Login failed' error message is displayed");
	}

	public void clickOnLifeInsurance() {
		By lifeInsuranceCard = By.xpath("//div[@role='menuitem'][.//h3[normalize-space(.)='Life Insurance']]");
		clickOnElement(driver, lifeInsuranceCard,
				"Click on 'Life Insurance' issuer card");
	}

	public Boolean isEnterPolicyNumberHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//input[@id='policyNumber']"),
				"Verify 'Enter Policy Number' field header is displayed");
	}

	public Boolean isEnterFullNameHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//input[@id='fullName']"),
				"Verify 'Enter Full Name' field header is displayed");
	}

	public Boolean isEnterDOBHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.id("dob"), "Verify 'Enter DOB' field header is displayed");
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