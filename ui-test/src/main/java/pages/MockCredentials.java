package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import base.BasePage;

public class MockCredentials extends BasePage {

	private WebDriver driver;

	public MockCredentials(WebDriver driver) {
		this.driver = driver;
	}

	public Boolean isCredentialTypeDisplayed(String credentialTypeText) {
		return isElementIsVisible(driver,
				By.xpath(String.format("//h3[text()='%s']", credentialTypeText)),
				getConfiguredWaitTimeInSeconds(),
				"Verify '" + credentialTypeText + "' option is displayed");
	}

	public void clickOnCredentialType(String credentialTypeText) {
		clickOnElement(driver,
				By.xpath(String.format("//h3[text()='%s']", credentialTypeText)),
				"Click on '" + credentialTypeText + "' option");
	}

}
