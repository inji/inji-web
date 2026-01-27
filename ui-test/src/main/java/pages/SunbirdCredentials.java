package pages;

import base.BasePage;
import org.openqa.selenium.*;
import utils.BaseTest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SunbirdCredentials extends BasePage {
	protected final Logger logger = LoggerFactory.getLogger(getClass());
	private WebDriver driver;

	public SunbirdCredentials(WebDriver driver) {
		this.driver = driver;
	}

	public Boolean isDownloadSunbirdCredentialsDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

	public Boolean isSunbirdInsuranceDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"),
				(BasePage.explicit_timeout)*2);
	}

	public String pdfNameInsurance;

	public void clickOnSunbirdInsurance() {
		pdfNameInsurance = getElementAttribute(driver,
				By.xpath("//*[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"), "data-testid")
				.replaceFirst("ItemBox-Outer-Container-0-", "") + ".pdf";
		logger.info("Pdf Name for Insurance: " + pdfNameInsurance);
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

	public void clickOnDownloadSunbird() {
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

	public void enterPolicyNumer(String string) {
		enterText(driver, By.xpath("//input[@id='_form_policyNumber']"), string);
	}

	public Boolean isPolicyNumeTextBoxDisplayed() {
		return isElementIsVisible(driver, By.xpath("//input[@id='_form_policyNumber']"));
	}

	public void enterFullName(String string) {
		enterText(driver, By.xpath("//input[@id='_form_fullName']"), string);
	}

	public void selectDateOfBirth(String string) {
		driver.findElement(By.xpath("//input[@id='_form_fullName']")).sendKeys(Keys.TAB);
		driver.findElement(By.id("_form_dob")).sendKeys(string);
		driver.findElement(By.xpath("//input[@id='_form_dob']")).click();
	}

	public void clickOnLogin() {
		clickOnElement(driver, By.xpath("//button[@id='verify_form']"));
	}

	public Boolean isLoginButtonDisplayed() {
		return isElementIsVisible(driver, By.xpath("//button[@id='verify_form']"));
	}

	public Boolean isLifeInceranceDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-1-')]"));
	}

	public Boolean isLoginFailedDisplayed() {
		return isElementIsVisible(driver, By.xpath("//*[contains(text(), 'Login failed')]"));
	}

	public void clickOnLifeInsurance() {
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-1-')]"));
	}

	public Boolean isEnterPolicyNumberHeaderDisplayed() {
		return isElementIsVisible(driver, By.xpath("//label[text() = 'Enter Policy Number']"));
	}

	public Boolean isEnterFullNameHeaderDisplayed() {
		return isElementIsVisible(driver, By.xpath("//label[text() = 'Enter Full Name']"));
	}

	public Boolean isEnterDOBHeaderDisplayed() {
		return isElementIsVisible(driver, By.xpath("//label[text() = 'Enter DOB']"));
	}

	public Boolean isAuthenticationFailedDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[@id='error-banner']"));
	}

	public Boolean isVehicleInsuranceDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

	public void clickOnVehicleInsurance() {
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

}