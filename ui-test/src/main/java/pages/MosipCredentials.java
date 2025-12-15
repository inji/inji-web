package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import base.BasePage;

public class MosipCredentials extends BasePage {

	private WebDriver driver;
	public String pdfName;

	public MosipCredentials(WebDriver driver) {
		this.driver = driver;
	}

	public Boolean isMockVerifiableCredentialDisplayed() {

		return isElementIsVisible(driver, By.xpath("//h3[text()='Mock Verifiable Credential']"), (BasePage.explicit_timeout)*2);
	}

	public void clickOnMockVerifiableCredential() {
		clickOnElement(driver, By.xpath("//h3[text()='Mock Verifiable Credential']"));
	}

	public void enterVid(String string) {
		if (isElementIsVisible(driver, By.xpath("//input[@id='Otp_mosip-vid']"))) {
			enterText(driver, By.xpath("//input[@id='Otp_mosip-vid']"), string);
		} else {
			if (isElementIsVisible(driver, By.xpath("//input[@id='Otp_vid']"))) {
				enterText(driver, By.xpath("//input[@id='Otp_vid']"), string);
			}
		}
	}

	public void clickOnGetOtpButton() {
		clickOnElement(driver, By.xpath("//button[@id='get_otp']"));
	}

	public void enterOtp(WebDriver driver, String otpString) {
		if (!isElementIsVisible(driver, By.xpath("(//input[@class='pincode-input-text'])[1]"))) {
			throw new RuntimeException("OTP input field is not visible");
		}
		for (int i = 0; i < otpString.length(); i++) {
			String locator = "(//input[@class='pincode-input-text'])[" + (i + 1) + "]";
			driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(otpString.charAt(i)));
		}
	}

	public void clickOnMosipNationalId() {
		pdfName = getElementAttribute(driver, By.xpath("//*[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"),
				"data-testid").replaceFirst("ItemBox-Outer-Container-0-", "") + ".pdf";
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"), (BasePage.explicit_timeout)*2);
	}

	public Boolean isLoginPageLableDisplayed() {
		return isElementIsVisible(driver, By.xpath("//label[@for='Mosip vid']"))
				|| isElementIsVisible(driver, By.xpath("//label[@for='Otp_vid']"));
	}

	public void clickOnLoginWithOtp() {

		if (isElementIsVisible(driver, By.xpath("//*[@id='login_with_otp']"), (BasePage.explicit_timeout)*2)) {
			clickOnElement(driver, By.xpath("//*[@id='login_with_otp']"));
		} else if (isElementIsVisible(driver, By.xpath("//*[@id='get_otp']"), (BasePage.explicit_timeout)*2)) {
			clickOnElement(driver, By.xpath("//*[@id='get_otp']"));
		}
	}

	public Boolean isVidInputBoxHeaderDisplayed() {
		return isElementIsVisible(driver, By.xpath("//label[text() = 'UIN/VID']"));
	}

	public Boolean isDownloadingDescriptionTextDisplayed() {
		return isElementIsVisible(driver, By.xpath("//*[@data-testid='title-download-result']"));
	}

}
