
package stepdefinitions;

import io.cucumber.java.en.Then;
import io.mosip.testrig.apirig.injiweb.testscripts.SimplePostForAutoGenId;
import io.mosip.testrig.apirig.utils.AdminTestUtil;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.Assert;
import org.openqa.selenium.WebDriver;
import pages.HomePage;
import pages.SetNetwork;
import pages.SunbirdCredentials;
import utils.BaseTest;
import utils.GlobelConstants;

import static org.testng.Assert.assertTrue;
import utils.ScreenshotUtil;
import utils.ExtentReportManager;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.ExtentTest;

import org.apache.commons.lang3.exception.ExceptionUtils;

import static org.testng.Assert.assertEquals;
import java.io.IOException;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

public class StepDefSunbirdCredentials {
	public WebDriver driver;
	BaseTest baseTest;
	private GlobelConstants globelConstants;
	private HomePage homePage;
	private SunbirdCredentials sunbirdCredentials;
	private SetNetwork setNetwork;
	ExtentTest test = ExtentReportManager.getTest();
	public static String policynumber = SimplePostForAutoGenId.policyNumber;
	public static String fullname = SimplePostForAutoGenId.fullName;
	public static String dob = SimplePostForAutoGenId.dob;
	static LocalDate date = LocalDate.parse(dob);
	public static String formattedDate = date.format(DateTimeFormatter.ofPattern("MM-dd-yyyy"));

	public static String screenshotPath = System.getProperty("user.dir") + "/test-output/screenshots";

	public StepDefSunbirdCredentials() {
		this.baseTest = new BaseTest();
		this.driver = baseTest.getDriver();
		this.homePage = new HomePage(driver);
		this.sunbirdCredentials = new SunbirdCredentials(driver);
		this.setNetwork = new SetNetwork();
	}

	@Then("User verify sunbird cridentials button")
	public void user_verify_sunbird_credentials_button() {
		try {
			assertTrue(sunbirdCredentials.isDownloadSunbirdCredentialsDisplayed(),
					"Sunbird credentials button is not displayed");
			test.log(Status.PASS, "User successfully verified the Sunbird credentials button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Sunbird credentials button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Sunbird credentials button assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying Sunbird credentials button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify sunbird rc insurance verifiable credential displayed")
	public void user_verify_sunbird_rc_insurance_verifiable_credential_displayed() {
		try {
			assertTrue(sunbirdCredentials.isSunbirdInsuranceDisplayed(),
					"Sunbird RC insurance verifiable credential is not displayed");
			test.log(Status.PASS,
					"User successfully verified that Sunbird RC insurance verifiable credential is displayed");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while verifying Sunbird RC insurance verifiable credential: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Sunbird RC insurance verifiable credential assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while verifying Sunbird RC insurance verifiable credential: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on sunbird rc insurance verifiable credential button")
	public void user_click_on_sunbird_rc_insurance_verifiable_credential_button() {
		try {
			sunbirdCredentials.clickOnSunbirdInsurance();
			test.log(Status.PASS, "User successfully clicked on Sunbird RC insurance verifiable credential button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while clicking on Sunbird RC insurance verifiable credential button: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while clicking on Sunbird RC insurance verifiable credential button: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User enter the policy number")
	public void user_enter_the_policy_number() {
		try {
			sunbirdCredentials.enterPolicyNumer(policynumber);
			test.log(Status.PASS, "User successfully entered the policy number: " + policynumber);
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while entering the policy number: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while entering the policy number: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User enter the full name")
	public void user_enter_the_full_name() {
		try {
			sunbirdCredentials.enterFullName(fullname);
			test.log(Status.PASS, "User successfully entered the full name: " + fullname);
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while entering the full name: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while entering the full name: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User enter the date of birth {string}")
	public void user_enter_the_date_of_birth(String dateOfBirth) {
		try {
			sunbirdCredentials.selectDateOfBirth(dateOfBirth);
			test.log(Status.PASS, "User successfully entered the date of birth: " + dateOfBirth);
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while entering the date of birth: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while entering the date of birth: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User enter the date of birth")
	public void user_enter_the_date_of_birth() {
		try {
			sunbirdCredentials.selectDateOfBirth(formattedDate);
			test.log(Status.PASS, "User successfully entered the date of birth: " + formattedDate);
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while entering the date of birth: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while entering the date of birth: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on login button")
	public void user_click_on_login_button() throws InterruptedException {
		int retryCount = 0;

		while (retryCount < 3 && sunbirdCredentials.isLoginButtonDisplayed()) {
			Thread.sleep(2000);
			sunbirdCredentials.clickOnLogin();
			if (!sunbirdCredentials.isLoginFailedDisplayed()) {
				break;
			}
			retryCount++;
		}
	}

	@Then("User verify life Insurance displayed")
	public void user_verify_life_insurance_displayed() {
		try {
			assertTrue(sunbirdCredentials.isLifeInceranceDisplayed(), "Life Insurance is not displayed.");
			test.log(Status.PASS, "User successfully verified that Life Insurance is displayed.");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: Life Insurance is not displayed.");
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Life Insurance: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying Life Insurance: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on life Insurance button")
	public void user_click_on_life_insurance_button() {
		try {
			sunbirdCredentials.clickOnLifeInsurance();
			test.log(Status.PASS, "User successfully clicked on the Life Insurance button.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking on the Life Insurance button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking on the Life Insurance button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on sunbird cridentials button")
	public void click_on_sunbird_credentials_button() {
		try {
			homePage.scrollDownByPage(baseTest.getDriver());
			sunbirdCredentials.clickOnDownloadSunbird();
			test.log(Status.PASS, "User successfully clicked on the Sunbird credentials button.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while clicking on the Sunbird credentials button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while clicking on the Sunbird credentials button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify pdf is downloaded for Insurance")
	public String user_verify_pdf_is_downloaded_for_insurance() throws IOException {
		String pdfName = sunbirdCredentials.pdfNameInsurance;
		String base64EncodedFile = (String) baseTest.getJse().executeScript(
				"browserstack_executor: {\"action\": \"getFileContent\", \"arguments\": {\"fileName\": \"" + pdfName
						+ "\"}}");

		byte[] data = Base64.getDecoder().decode(base64EncodedFile);

		try (OutputStream os = new FileOutputStream(pdfName)) {
			os.write(data);
		}

		File pdfFile = new File(System.getProperty("user.dir") + "/" + pdfName);
		try (PDDocument document = PDDocument.load(pdfFile)) {
			PDFTextStripper stripper = new PDFTextStripper();
			return stripper.getText(document);
		}
	}

	@Then("User verify policy number input box header")
	public void user_verify_policy_number_input_box_header() {
		try {
			assertTrue(sunbirdCredentials.isEnterPolicyNumberHeaderDisplayed(),
					"Policy number input box header is not displayed.");
			test.log(Status.PASS, "User successfully verified that the policy number input box header is displayed.");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: Policy number input box header is not displayed.");
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while verifying the policy number input box header: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while verifying the policy number input box header: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify date of birth input box header")
	public void user_verify_date_of_birth_input_box_header() {
		try {
			assertTrue(sunbirdCredentials.isEnterDOBHeaderDisplayed(),
					"Date of birth input box header is not displayed.");
			test.log(Status.PASS, "User successfully verified that the date of birth input box header is displayed.");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: Date of birth input box header is not displayed.");
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while verifying the date of birth input box header: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while verifying the date of birth input box header: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify authentication failed message")
	public void user_verify_authentication_failed_message() {
		try {
			assertTrue(sunbirdCredentials.isAuthenticationFailedDisplayed(),
					"Authentication failed message is not displayed.");
			test.log(Status.PASS, "User successfully verified that the authentication failed message is displayed.");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: Authentication failed message is not displayed.");
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while verifying the authentication failed message: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while verifying the authentication failed message: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify Vehicle Insurance displayed")
	public void user_verify_vehicle_insurance_displayed() {
		try {
			assertTrue(sunbirdCredentials.isVehicleInsuranceDisplayed(), "Vehicle Insurance is not displayed.");
			test.log(Status.PASS, "User successfully verified that Vehicle Insurance is displayed.");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: Vehicle Insurance is not displayed.");
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Vehicle Insurance: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying Vehicle Insurance: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on Vehicle Insurance button")
	public void user_click_on_vehicle_insurance_button() {
		try {
			sunbirdCredentials.clickOnVehicleInsurance();
			test.log(Status.PASS, "User successfully clicked on the Vehicle Insurance button.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while clicking on the Vehicle Insurance button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking on the Vehicle Insurance button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify full name input box header")
	public void user_verify_full_name_input_box_header() {
		try {
			assertTrue(sunbirdCredentials.isEnterFullNameHeaderDisplayed(),
					"Full name input box header is not displayed.");
			test.log(Status.PASS, "User successfully verified that the full name input box header is displayed.");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: Full name input box header is not displayed.");
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while verifying the full name input box header: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the full name input box header: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User enter the policy number {string}")
	public void user_enter_the_policy_number(String string) {

		sunbirdCredentials.enterPolicyNumer(string);

	}

	@Then("User enter the full name  {string}")
	public void user_enter_the_full_name(String string) {
		sunbirdCredentials.enterFullName(string);
	}
}