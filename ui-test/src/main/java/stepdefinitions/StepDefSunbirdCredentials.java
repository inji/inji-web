
package stepdefinitions;

import io.cucumber.java.en.Then;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.openqa.selenium.WebDriver;
import pages.HomePage;
import pages.SetNetwork;
import pages.SunbirdCredentials;
import utils.BaseTest;

import static org.testng.Assert.assertTrue;
import utils.ExtentReportManager;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.ExtentTest;

import utils.InjiWebConfigManager;
import utils.InjiWebUtil;
import utils.testdatamanager.PolicyManager;

import java.io.IOException;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Base64;

import base.BasePage;

public class StepDefSunbirdCredentials {
	public WebDriver driver;
	BaseTest baseTest;
	private HomePage homePage;
	private SunbirdCredentials sunbirdCredentials;
	private SetNetwork setNetwork;
	ExtentTest test = ExtentReportManager.getTest();

	public StepDefSunbirdCredentials() {
		this.baseTest = new BaseTest();
		this.driver = baseTest.getDriver();
		this.homePage = new HomePage(driver);
		this.sunbirdCredentials = new SunbirdCredentials(driver);
		this.setNetwork = new SetNetwork();
	}

	@Then("User verify sunbird credentials button")
	public void user_verify_sunbird_credentials_button() {
		assertTrue(sunbirdCredentials.isDownloadSunbirdCredentialsDisplayed(),
				"Sunbird credentials button is not displayed");
	}

	@Then("User verify sunbird rc insurance verifiable credential displayed")
	public void user_verify_sunbird_rc_insurance_verifiable_credential_displayed() {
		assertTrue(sunbirdCredentials.isSunbirdInsuranceDisplayed(),
				"Sunbird RC insurance verifiable credential is not displayed");
	}

	@Then("User click on sunbird rc insurance verifiable credential button")
	public void user_click_on_sunbird_rc_insurance_verifiable_credential_button() {
		sunbirdCredentials.clickOnSunbirdInsurance();
	}

	@Then("User enter the policy number")
	public void user_enter_the_policy_number() {
		sunbirdCredentials.enterPolicyNumber(PolicyManager.getPolicyNumber());
	}

	@Then("User enter the full name")
	public void user_enter_the_full_name() {
		sunbirdCredentials.enterFullName(PolicyManager.getName());
	}

	@Then("User enter the date of birth {string}")
	public void user_enter_the_date_of_birth(String dateOfBirth) {
		sunbirdCredentials.selectDateOfBirth(dateOfBirth);
	}

	@Then("User enter the date of birth")
	public void user_enter_the_date_of_birth() {
		sunbirdCredentials.selectDateOfBirth(PolicyManager.getDob());
	}

	@Then("User click on login button")
	public void user_click_on_login_button() {
		int maxRetries = 3;
		int waitTime = InjiWebConfigManager.getOtpVerificationPageWaitTimeInSeconds();

		for (int attempt = 1; attempt <= maxRetries; attempt++) {

			sunbirdCredentials.clickOnLogin();
			test.log(Status.INFO, "Clicked Login button. Attempt: " + attempt + "/" + maxRetries);

			boolean isFailed = sunbirdCredentials.waitForLoginFailure(waitTime);

			if (isFailed) {
				test.log(Status.WARNING, "Login failed on attempt " + attempt);

				if (attempt == maxRetries) {
					throw new RuntimeException("Login failed after " + maxRetries + " attempts");
				}

				continue;
			}

			// ✅ SUCCESS (failure didn't appear within wait)
			test.log(Status.INFO, "Login succeeded on attempt " + attempt);
			return;
		}
	}

	@Then("User verify life Insurance displayed")
	public void user_verify_life_insurance_displayed() {
		assertTrue(sunbirdCredentials.isLifeInceranceDisplayed(), "Life Insurance is not displayed.");
	}

	@Then("User click on life Insurance button")
	public void user_click_on_life_insurance_button() {
		sunbirdCredentials.clickOnLifeInsurance();
	}

	@Then("User click on sunbird credentials button")
	public void click_on_sunbird_credentials_button() {
		HomePage.scrollDownByPage(baseTest.getDriver());
		sunbirdCredentials.clickOnDownloadSunbird();
	}

	@Then("User verify pdf is downloaded for Insurance")
	public String user_verify_pdf_is_downloaded_for_insurance() throws Exception {
		String pdfName = sunbirdCredentials.pdfNameInsurance;
		File pdfFile;
		if (BaseTest.isBrowserStackRunEnabled()) {
			pdfFile = InjiWebUtil.waitAndDownloadFile(
					baseTest.getJse(),
					pdfName,
					BasePage.getConfiguredWaitTimeInSeconds(),     // timeout seconds
					2000    // polling interval
			);
		} else {
			pdfFile = waitForDownloadedFile(pdfName, BasePage.getConfiguredWaitTimeInSeconds());
		}

		PDDocument document = PDDocument.load(pdfFile);

		PDFTextStripper stripper = new PDFTextStripper();
		return stripper.getText(document);
	}

	private File waitForDownloadedFile(String fileName, int timeoutSeconds) {
		File downloadsDir = new File(System.getProperty("user.dir"), "downloads");
		File targetFile = new File(downloadsDir, fileName);
		long deadline = System.currentTimeMillis() + (timeoutSeconds * 1000L);

		while (System.currentTimeMillis() < deadline) {
			if (targetFile.exists() && targetFile.length() > 0) {
				return targetFile;
			}
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
				throw new IllegalStateException("Interrupted while waiting for downloaded PDF: " + fileName, e);
			}
		}

		throw new IllegalStateException("PDF file not found in local downloads directory: " + targetFile.getAbsolutePath());
	}

	@Then("User verify policy number input box header")
	public void user_verify_policy_number_input_box_header() {
		assertTrue(sunbirdCredentials.isEnterPolicyNumberHeaderDisplayed(),
				"Policy number input box header is not displayed.");
	}

	@Then("User verify date of birth input box header")
	public void user_verify_date_of_birth_input_box_header() {
		assertTrue(sunbirdCredentials.isEnterDOBHeaderDisplayed(),
				"Date of birth input box header is not displayed.");
	}

	@Then("User verify authentication failed message")
	public void user_verify_authentication_failed_message() {
		assertTrue(sunbirdCredentials.isAuthenticationFailedDisplayed(),
				"Authentication failed message is not displayed.");
	}

	@Then("User verify Vehicle Insurance displayed")
	public void user_verify_vehicle_insurance_displayed() {
		assertTrue(sunbirdCredentials.isVehicleInsuranceDisplayed(), "Vehicle Insurance is not displayed.");
	}

	@Then("User click on Vehicle Insurance button")
	public void user_click_on_vehicle_insurance_button() {
		sunbirdCredentials.clickOnVehicleInsurance();
	}

	@Then("User verify full name input box header")
	public void user_verify_full_name_input_box_header() {
		assertTrue(sunbirdCredentials.isEnterFullNameHeaderDisplayed(),
				"Full name input box header is not displayed.");
	}

	@Then("User enter the policy number {string}")
	public void user_enter_the_policy_number(String string) {
		sunbirdCredentials.enterPolicyNumber(string);
	}

	@Then("User enter the full name  {string}")
	public void user_enter_the_full_name(String string) {
		sunbirdCredentials.enterFullName(string);
	}
}