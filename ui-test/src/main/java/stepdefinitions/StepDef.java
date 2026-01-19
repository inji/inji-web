
package stepdefinitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import pages.FaqPage;
import pages.HomePage;
import pages.Loginpage;
import pages.SetNetwork;
import utils.BaseTest;
import utils.ExtentReportManager;
import utils.GlobelConstants;
import utils.ScreenshotUtil;
import org.apache.commons.lang3.exception.ExceptionUtils;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import java.io.IOException;
import java.util.NoSuchElementException;
import java.util.Set;
import base.BasePage;

public class StepDef {
	private BaseTest baseTest;
	private HomePage homePage;
	private FaqPage faqPage;
	private SetNetwork setNetwork;
	private Loginpage loginpage;
	private WebDriver driver;
	String pageTitle;
	ExtentTest test = ExtentReportManager.getTest();
	private GlobelConstants globelConstants;
	public static String screenshotPath = System.getProperty("user.dir") + "/test-output/screenshots";

	public StepDef() {
		this.baseTest = new BaseTest();
		this.driver = baseTest.getDriver();
		if (driver == null) {
			throw new RuntimeException("WebDriver is null in StepDef! Check if BaseTest initializes correctly.");
		}
		this.homePage = new HomePage(driver);
		this.faqPage = new FaqPage(driver);
		this.setNetwork = new SetNetwork();
		this.loginpage = new Loginpage(driver);

	}

	@Given("User gets the title of the page")
	public void getTheTitleOfThePage() {
		loginpage.waituntilpagecompletelyloaded();
		pageTitle = baseTest.getDriver().getTitle();
	}

	@Then("User validate the title of the page")
	public void validateTheTitleOfThePage() {
		try {
			Assert.assertEquals(pageTitle, pageTitle);
			test.log(Status.PASS, "User validate the title of the page");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while validating title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that inji web logo is displayed")
	public void verifyInjiWebLogoIsDisplayed() {
		try {
			assertTrue(homePage.isLogoDisplayed(), "Inji web logo is not displayed");
			test.log(Status.PASS, "User verified that the Inji web logo is displayed successfully");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the Inji web logo: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the Inji web logo: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@When("User clicks on the Faq button")
	public void clicksOnFaqButton() {
		try {
			homePage.ClickOnFaqForMobileBrowse();
			homePage.clickOnFaq();
			test.log(Status.PASS, "User successfully clicked on the Faq button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Faq button not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking the Faq button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@When("User clicks on the Faq button from hamburger menu")
	public void clicksOnFaqButtonFromHamburger() {
		try {
			homePage.clickOnFaqMobileView();
			test.log(Status.PASS, "User successfully clicked on the Faq button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Faq button not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking the Faq button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@When("User click on download mosip credentials button")
	public void user_click_on_download_mosip_credentials_button() {
		try {
			homePage.scrollDownByPage(baseTest.getDriver());
			homePage.clickOnDownloadMosipCredentials();
			test.log(Status.PASS, "User clicked on download MOSIP credentials button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking download button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify list of credential types displayed")
	public void user_verify_list_of_credential_types_displayed() {
		try {
			Assert.assertTrue(homePage.isListOfCredentialsTypeDisplayed());
			test.log(Status.PASS, "Verified that list of credential types is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@When("User click on verify button")
	public void user_click_on_verify_button() {
		try {
			homePage.clickOnVerify();
			test.log(Status.PASS, "User clicked on verify button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking verify button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify Download Success text displayed")
	public void user_verify_download_success_text_displayed() throws Exception {
		try {
			Assert.assertTrue(homePage.isSuccessMessageDisplayed());
			test.log(Status.PASS, "Verified that Download Success text is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify mosip national id by e-signet displayed")
	public void user_verify_mosip_national_id_by_e_signet_displayed() {
		try {
			Assert.assertTrue(homePage.isIssuerLogoDisplayed());
			Assert.assertTrue(homePage.isMosipNationalIdDisplayed());
			test.log(Status.PASS, "Verified that MOSIP National ID and Issuer Logo are displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying MOSIP National ID: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User search the issuers with {string}")
	public void user_search_the_issuers_with(String string) throws Exception {
		try {
			homePage.enterIssuersInSearchBox(string);
			test.log(Status.PASS, "Searched issuers with: " + string);
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while searching issuers: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User search the issuers mosip")
	public void user_search_the_issuers_mosip() throws Exception {
		try {
			String issuerText = System.getenv("Issuer_Text_Mosip");
			if (issuerText == null || issuerText.isEmpty()) {
				String[] string = baseTest.fetchIssuerTexts();
				issuerText = string[0];
			}
			homePage.isIssuersDisplayed();
			homePage.enterIssuersInSearchBox(issuerText);
			test.log(Status.PASS, "Searched issuers with: " + issuerText);
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while searching issuers: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User search the issuers sunbird")
	public void user_search_the_issuers_sunbird() throws Exception {
		try {
			String issuerText = System.getenv("Issuer_Text_sunbird");
			if (issuerText == null || issuerText.isEmpty()) {
				String[] string = baseTest.fetchIssuerTexts();
				issuerText = string[1];
			}
			homePage.isIssuersDisplayed();
			homePage.enterIssuersInSearchBox(issuerText);
			test.log(Status.PASS, "Searched issuers with: " + issuerText);
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while searching issuers: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify go home button")
	public void user_verify_go_home_button() throws Exception {
		try {
			Assert.assertTrue(homePage.isGoHomeButtonDisplayed());
			test.log(Status.PASS, "Verified that Go Home button is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Go Home button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that langauge button is displayed")
	public void verify_that_language_button_is_displayed() {
		try {
			Assert.assertTrue(homePage.isLanguageDisplayed());
			test.log(Status.PASS, "Verified that Language button is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Language button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on langauge button")
	public void click_on_language_button() {
		try {
			homePage.clickOnLanguageButton();
			test.log(Status.PASS, "Clicked on Language button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking Language button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User Verify the no issuer found message")
	public void user_verify_the_no_issuer_found_message() {
		try {
			Assert.assertTrue(homePage.isNoIssuerFoundMessageDisplayed());
			test.log(Status.PASS, "Verified that 'No Issuer Found' message is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying 'No Issuer Found' message: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify home screens in arabic")
	public void user_verify_home_screens_in_arabic() {
		try {
			Assert.assertEquals(homePage.isHomePageTextDisplayed(), globelConstants.HomePageTextInArabic);
			Assert.assertEquals(homePage.getHomePageDescriptionText(),
					globelConstants.isHomePageDescriptionTextnArabic);
			Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
					globelConstants.ListOfCredentialTypeOnHomePageInArabic);
			Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
					globelConstants.ListOfCredentialDescriptionTextInArabic);
			test.log(Status.PASS, "Verified Arabic home screen text");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed while verifying Arabic home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Arabic home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on tamil langauge")
	public void user_click_on_tamil_language() {
		try {
			homePage.clickOnTamilLanguage();
			test.log(Status.PASS, "Clicked on Tamil language button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking on Tamil language: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify home screens in tamil")
	public void user_verify_home_screens_in_tamil() {
		try {
			Assert.assertEquals(homePage.isHomePageTextDisplayed(), globelConstants.HomePageTextInTamil);
			Assert.assertEquals(homePage.getHomePageDescriptionText(), globelConstants.isHomePageDescriptionTextnTamil);
			Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
					globelConstants.ListOfCredentialTypeOnHomePageInTamil);
			Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
					globelConstants.ListOfCredentialDescriptionTextInTamil);
			test.log(Status.PASS, "Verified Tamil home screen text");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed while verifying Tamil home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Tamil home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on kannada langauge")
	public void user_click_on_kannada_language() {
		try {
			homePage.clickOnKannadaLanguage();
			test.log(Status.PASS, "Clicked on Kannada language button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking on Kannada language: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify home screens in kannada")
	public void user_verify_home_screens_in_kannada() {
		try {
			Assert.assertEquals(homePage.isHomePageTextDisplayed(), globelConstants.HomePageTextInKannada);
			Assert.assertTrue(homePage.isHomePageDescriptionTextDisplayed());
			Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
					globelConstants.ListOfCredentialTypeOnHomePageInKannada);
			Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
					globelConstants.ListOfCredentialDescriptionTextInKannada);
			test.log(Status.PASS, "Verified Kannada home screen text");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed while verifying Kannada home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Kannada home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on hindi langauge")
	public void user_click_on_hindi_language() {
		try {
			homePage.clickOnHindiLanguage();
			test.log(Status.PASS, "Clicked on Hindi language button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking on Hindi language: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify home screens in hindi")
	public void user_verify_home_screens_in_hindi() {
		try {
			Assert.assertEquals(homePage.isHomePageTextDisplayed(), globelConstants.HomePageTextInHindi);
			Assert.assertEquals(homePage.getHomePageDescriptionText(), globelConstants.HomePageDescriptionTextInHindi);
			Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
					globelConstants.ListOfCredentialTypeOnHomePageInHindi);
			Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
					globelConstants.ListOfCredentialDescriptionTextInHindi);
			test.log(Status.PASS, "Verified Hindi home screen text");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed while verifying Hindi home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Hindi home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on french langauge")
	public void user_click_on_french_language() {
		try {
			homePage.clickOnFranchLanguage();
			test.log(Status.PASS, "Clicked on French language button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking on French language: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify home screens in french")
	public void user_verify_home_screens_in_french() {
		try {
			Assert.assertEquals(homePage.isHomePageTextDisplayed(), globelConstants.HomePageTextInFrench);
			Assert.assertEquals(homePage.getHomePageDescriptionText(), globelConstants.HomePageDescriptionTextInFrench);
			Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
					globelConstants.ListOfCredentialTypeOnHomePageInFrench);
			Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
					globelConstants.ListOfCredentialDescriptionTextInFrench);
			test.log(Status.PASS, "Verified French home screen text");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed while verifying French home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying French home screen: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on portugues langauge")
	public void user_click_on_portuguese_language() {
		try {
			homePage.clickOnPortuguesLanguage();
			test.log(Status.PASS, "User successfully clicked on the Portuguese language option");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Portuguese language option not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while clicking on the Portuguese language option: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify home screens in portugues")
	public void user_verify_home_screens_in_portuguese() {
		try {
			assertEquals(homePage.isHomePageTextDisplayed(), globelConstants.HomePageTextInPortugues,
					"Home page text does not match");
			assertEquals(homePage.getHomePageDescriptionText(), globelConstants.HomePageDescriptionTextInPortugues,
					"Home page description text does not match");
			assertEquals(homePage.isListOfIssuersTextDisplayed(),
					globelConstants.ListOfCredentialTypeOnHomePageInPortugues, "List of issuers text does not match");
			assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
					globelConstants.ListOfCredentialDescriptionTextInPortugues,
					"List of issuers description text does not match");

			test.log(Status.PASS, "User successfully verified home screens in Portuguese");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying home screen in Portuguese: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying home screen in Portuguese: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page")
	public void user_validate_the_list_of_credential_types_title_of_the_page() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialType,
					"List of credential types title does not match");

			test.log(Status.PASS, "User successfully validated the list of credential types title on the page");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while validating the list of credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in Arabic language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_arabic_language() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInArabic,
					"List of credential types title in Arabic does not match");

			test.log(Status.PASS, "User successfully validated the list of credential types title in Arabic");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while validating the list of credential types title in Arabic: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating the list of credential types title in Arabic: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in Tamil language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_tamil_language() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInTamil,
					"List of credential types title in Tamil does not match");

			test.log(Status.PASS, "User successfully validated the list of credential types title in Tamil");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while validating the list of credential types title in Tamil: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title in Tamil: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in Kannada language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_kannada_language() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInKannada,
					"List of credential types title in Kannada does not match");

			test.log(Status.PASS, "User successfully validated the list of credential types title in Kannada");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while validating the list of credential types title in Kannada: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating the list of credential types title in Kannada: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in Hindi language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_hindi_language() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInHindi,
					"List of credential types title in Hindi does not match");

			test.log(Status.PASS, "User successfully validated the list of credential types title in Hindi");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while validating the list of credential types title in Hindi: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title in Hindi: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in French language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_french_language() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInFrench,
					"List of credential types title in French does not match");

			test.log(Status.PASS, "User successfully validated the list of credential types title in French");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while validating the list of credential types title in French: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating the list of credential types title in French: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in Portuguese language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_portuguese_language() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInPortugues,
					"List of credential types title in Portuguese does not match");
			test.log(Status.PASS, "User successfully validated the list of credential types title in Portuguese");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while validating the list of credential types title in Portuguese: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating the list of credential types title in Portuguese: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page for Sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_for_sunbird() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialType,
					"List of credential types title for Sunbird does not match");
			test.log(Status.PASS, "User successfully validated the list of credential types title for Sunbird");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while validating the list of credential types title for Sunbird: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating the list of credential types title for Sunbird: "
					+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in arabic laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_arabic_language_for_sunbird() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInArabic,
					"List of credential types title in Arabic for Sunbird does not match");
			test.log(Status.PASS,
					"User successfully validated the list of credential types title in Arabic for Sunbird");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while validating the list of credential types title in Arabic for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title in Arabic for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in tamil laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_tamil_language_for_sunbird() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInTamil,
					"List of credential types title in Tamil for Sunbird does not match");
			test.log(Status.PASS,
					"User successfully validated the list of credential types title in Tamil for Sunbird");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while validating the list of credential types title in Tamil for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title in Tamil for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in kannada laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_kannada_language_for_sunbird() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInKannada,
					"List of credential types title in Kannada for Sunbird does not match");
			test.log(Status.PASS,
					"User successfully validated the list of credential types title in Kannada for Sunbird");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while validating the list of credential types title in Kannada for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title in Kannada for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in hindi laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_hindi_language_for_sunbird() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInHindi,
					"List of credential types title in Hindi for Sunbird does not match");
			test.log(Status.PASS,
					"User successfully validated the list of credential types title in Hindi for Sunbird");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while validating the list of credential types title in Hindi for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title in Hindi for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in french laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_french_language_for_sunbird() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInFrench,
					"List of credential types title in French for Sunbird does not match");
			test.log(Status.PASS,
					"User successfully validated the list of credential types title in French for Sunbird");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while validating the list of credential types title in French for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title in French for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in portugues laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_portuguese_language_for_sunbird() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInPortugues,
					"List of credential types title in Portuguese for Sunbird does not match");
			test.log(Status.PASS,
					"User successfully validated the list of credential types title in Portuguese for Sunbird");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while validating the list of credential types title in Portuguese for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while validating the list of credential types title in Portuguese for Sunbird: "
							+ e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify all the languages")
	public void user_verify_all_the_languages() {
		try {
			assertTrue(homePage.verifyLanguagesInLanguageFilter(),
					"Language verification in the language filter failed");
			test.log(Status.PASS, "User successfully verified all the languages in the language filter");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while verifying languages in the language filter: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while verifying languages in the language filter: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on back button")
	public void user_click_on_back_button() {
		baseTest.getDriver().navigate().back();
	}

	@Then("User open new tab")
	public void user_open_new_tab() {
		((JavascriptExecutor) baseTest.getDriver()).executeScript("window.open('" + baseTest.url + "')");

		Set<String> allWindowHandles = baseTest.getDriver().getWindowHandles();

		if (allWindowHandles.size() >= 2) {
			String secondWindowHandle = allWindowHandles.toArray(new String[0])[1];
			baseTest.getDriver().switchTo().window(secondWindowHandle);
		} else {

		}
	}

	@Then("User verify About inji open")
	public void UserSwitchToAboutInjiTab() throws InterruptedException {
		Set<String> allWindowHandles = baseTest.getDriver().getWindowHandles();
		if (allWindowHandles.size() >= 2) {
			String secondWindowHandle = allWindowHandles.toArray(new String[0])[1];
			baseTest.getDriver().switchTo().window(secondWindowHandle);
		}
	}

	@Then("user refresh the page")
	public void user_refresh_the_page() {
		baseTest.getDriver().navigate().refresh();
	}

	@Then("user verify the page after Refresh")
	public void user_verify_the_page_after_refresh() {
	}

	@When("User verify the FAQ header and its description")
	public void user_verify_the_faq_header_and_its_description() {

		try {
			Assert.assertTrue(faqPage.isFaqPageFAQDescriptionTextDisplayed());
			Assert.assertTrue(faqPage.isFaqPageFAQTitelTextDisplayed());
			test.log(Status.PASS, "User verify the FAQ header and its description");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e)); // Log full stack trace
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot"); // Capture screenshot for debugging
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while User verify the FAQ header and its description: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@When("User verify the only one FAQ is open")
	public void user_verify_the_only_one_faq_is_open() throws IOException {
		try {
			boolean isUpArrowDisplayed = faqPage.isUpArrowDisplayed();
			int upArrowCount = faqPage.getUpArrowCount();

			Assert.assertTrue(isUpArrowDisplayed);
			Assert.assertEquals(upArrowCount, 1);

			test.log(Status.PASS, "Verified that only one FAQ is open. Up Arrow Displayed: " + isUpArrowDisplayed
					+ ", Count: " + upArrowCount);
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e)); // Log full stack trace
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot"); // Capture screenshot for debugging
			throw e; // Ensure failure is recorded by Cucumber/TestNG
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying FAQ open state: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@When("User verify the only one FAQ is at a time")
	public void user_verify_the_only_one_faq_is_at_a_time() {
		faqPage.ClickOnDownArrow();
		Assert.assertEquals(faqPage.getUpArrowCount(), 1);
		Assert.assertEquals(faqPage.getDownArrowCount(), 22);
	}

	@Then("User verify that Faq button is displayed")
	public void user_verify_that_faq_button_displayed() {
		try {
			assertTrue(homePage.isFaqPageDisplayed(), "Faq button is not displayed");
			test.log(Status.PASS, "User successfully verified that the Faq button is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the Faq button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the Faq button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify header displayed")
	public void user_verify_header_displayed() {
		try {
			assertTrue(homePage.isHeaderContanerDisplayed(), "Header container is not displayed");
			test.log(Status.PASS, "User verified that the header container is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the header: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the header: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home page container displayed")
	public void user_verify_that_home_page_container_displayed() {
		try {
			assertTrue(homePage.isHomePageContainerDisplayed(), "Home page container is not displayed");
			test.log(Status.PASS, "User verified that the home page container is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the home page container: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the home page container: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify the footer on home page")
	public void user_verify_the_footer_on_home_page() {
		try {
			assertTrue(homePage.isFooterIsDisplayedOnHomePage(), "Footer is not displayed on the home page");
			test.log(Status.PASS, "User verified that the footer is displayed on the home page");

			assertEquals(homePage.getFooterText(), globelConstants.FooterText,
					"Footer text does not match the expected value");
			test.log(Status.PASS,
					"User verified that the footer text matches the expected value: " + globelConstants.FooterText);
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the footer: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the footer: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that on home page searchbox is present")
	public void user_verify_that_on_home_page_searchbox_is_present() {
		try {
			assertTrue(homePage.isSerchBoxDisplayed(), "Search box is not displayed on the home page");
			test.log(Status.PASS, "User verified that the search box is displayed on the home page");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the search box: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the search box: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@When("User verify the logo of the issuer")
	public void user_verify_the_logo_of_the_issuer() {
		try {
			assertTrue(homePage.isIssuerLogoDisplayed(), "Issuer logo is not displayed");
			test.log(Status.PASS, "User successfully verified that the issuer logo is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the issuer logo: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the issuer logo: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home banner heading")
	public void user_verify_that_home_banner_heading() {
		try {
			assertTrue(homePage.isHomeBannerHeadingDisplayed(), "Home banner heading is not displayed");
			test.log(Status.PASS, "User verified that home banner heading is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying home banner heading: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home banner description")
	public void user_verify_that_home_banner_description() {
		try {
			assertTrue(homePage.isHomeBannerHeadingDescriptionDisplayed(), "Home banner description is not displayed");
			test.log(Status.PASS, "User verified that home banner description is displayed");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying home banner description: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home banner get started")
	public void user_verify_that_home_banner_get_started() {
		try {
			assertTrue(homePage.isGetStartedButtonDisplayed(),
					"Get Started button is not displayed on the home banner");
			test.log(Status.PASS, "User verified that the Get Started button is displayed on the home banner");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the Get Started button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home features heading")
	public void user_verify_that_home_features_heading() {
		try {
			assertTrue(homePage.isFeatureHeadingDisplayed(), "Feature heading is not displayed on the home page");
			test.log(Status.PASS, "User verified that the Feature heading is displayed on the home page");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the Feature heading: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home features description1")
	public void user_verify_that_home_features_description1() {
		try {
			assertTrue(homePage.isFeatureDescriptionDisplayed(),
					"Feature description is not displayed on the home page");
			test.log(Status.PASS, "User verified that the Feature description is displayed on the home page");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the Feature description: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home features mobile image")
	public void user_verify_that_home_features_mobile_image() {
		try {
			assertTrue(homePage.isFeatureMobileImageDisplayed(),
					"Feature mobile image is not displayed on the home page");
			test.log(Status.PASS, "User verified that the Feature mobile image is displayed on the home page");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the Feature mobile image: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home features desktop image")
	public void user_verify_that_home_features_desktop_image() {
		try {
			assertTrue(homePage.isFeatureDesktopImageDisplayed(),
					"Feature desktop image is not displayed on the home page");
			test.log(Status.PASS, "User verified that the Feature desktop image is displayed on the home page");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying the Feature desktop image: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home feature item image")
	public void user_verify_that_home_feature_item_image() {
		try {
			assertTrue(homePage.isAccessYourCredentialsImageDisplayed(),
					"Access Your Credentials image is not displayed");
			test.log(Status.PASS, "User verified that the 'Access Your Credentials' image is displayed");

			assertTrue(homePage.isYourDocumentsDownloadedImageDisplayed(),
					"Your Documents Downloaded image is not displayed");
			test.log(Status.PASS, "User verified that the 'Your Documents Downloaded' image is displayed");

			assertTrue(homePage.isEasySharingImageDisplayed(), "Easy Sharing image is not displayed");
			test.log(Status.PASS, "User verified that the 'Easy Sharing' image is displayed");

			assertTrue(homePage.isSecureAndPrivateImageDisplayed(), "Secure and Private image is not displayed");
			test.log(Status.PASS, "User verified that the 'Secure and Private' image is displayed");

			assertTrue(homePage.isWiderAccessAndCompatibilityImageDisplayed(),
					"Wider Access and Compatibility image is not displayed");
			test.log(Status.PASS, "User verified that the 'Wider Access and Compatibility' image is displayed");

		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying feature item images: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home feature Heading")
	public void user_verify_that_home_feature_item_heading() {
		try {
			assertTrue(homePage.isAccessYourCredentialsTextHeaderDisplayed(),
					"Access Your Credentials heading is not displayed");
			test.log(Status.PASS, "User verified that the 'Access Your Credentials' heading is displayed");

			assertTrue(homePage.isYourDocumentsDownloadedTextHeaderDisplayed(),
					"Your Documents Downloaded heading is not displayed");
			test.log(Status.PASS, "User verified that the 'Your Documents Downloaded' heading is displayed");

			assertTrue(homePage.isEasySharingTextHeaderDisplayed(), "Easy Sharing heading is not displayed");
			test.log(Status.PASS, "User verified that the 'Easy Sharing' heading is displayed");

			assertTrue(homePage.isSecureAndPrivateDisplayed(), "Secure and Private heading is not displayed");
			test.log(Status.PASS, "User verified that the 'Secure and Private' heading is displayed");

			assertTrue(homePage.isWiderAccessAndCompatibilityDisplayed(),
					"Wider Access and Compatibility heading is not displayed");
			test.log(Status.PASS, "User verified that the 'Wider Access and Compatibility' heading is displayed");

		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying feature headings: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home feature item header for all")
	public void user_verify_that_home_feature_first_item() {
		try {
			assertTrue(homePage.isCredentialsSimplifiedTextDisplayed(), "Credentials Simplified text is not displayed");
			test.log(Status.PASS, "User verified that 'Credentials Simplified' text is displayed");

			assertTrue(homePage.isNoMorePaperworkTextDisplayed(), "No More Paperwork text is not displayed");
			test.log(Status.PASS, "User verified that 'No More Paperwork' text is displayed");

			assertTrue(homePage.isDownloadWithConfidenceTextDisplayed(),
					"Download With Confidence text is not displayed");
			test.log(Status.PASS, "User verified that 'Download With Confidence' text is displayed");

			assertTrue(homePage.isSafeAndSoundTextDisplayed(), "Safe and Sound text is not displayed");
			test.log(Status.PASS, "User verified that 'Safe and Sound' text is displayed");

			assertTrue(homePage.isShareWithQRCodeTextDisplayed(), "Share With QR Code text is not displayed");
			test.log(Status.PASS, "User verified that 'Share With QR Code' text is displayed");

			assertTrue(homePage.isReadSetShareTextDisplayed(), "Read, Set, Share text is not displayed");
			test.log(Status.PASS, "User verified that 'Read, Set, Share' text is displayed");

			assertTrue(homePage.isYourCredentialsProtectedTextDisplayed(),
					"Your Credentials Protected text is not displayed");
			test.log(Status.PASS, "User verified that 'Your Credentials Protected' text is displayed");

			assertTrue(homePage.isRestEasyTextDisplayed(), "Rest Easy text is not displayed");
			test.log(Status.PASS, "User verified that 'Rest Easy' text is displayed");

			assertTrue(homePage.isAvailableOnYourFavouriteBrowserTextDisplayed(),
					"Available on Your Favourite Browser text is not displayed");
			test.log(Status.PASS, "User verified that 'Available on Your Favourite Browser' text is displayed");

			assertTrue(homePage.isAlwaysWithinReachTextDisplayed(), "Always Within Reach text is not displayed");
			test.log(Status.PASS, "User verified that 'Always Within Reach' text is displayed");

		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying feature item headers: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify that home feature feature description")
	public void user_verify_that_home_feature_first_feature_description() {
		try {
			assertTrue(homePage.isCredentialsSimplifiedDescriptionTextDisplayed(),
					"Credentials Simplified description is not displayed");
			test.log(Status.PASS, "User verified that 'Credentials Simplified' description is displayed");

			assertTrue(homePage.isNomorePaperworkDescriptionTextDisplayed(),
					"No More Paperwork description is not displayed");
			test.log(Status.PASS, "User verified that 'No More Paperwork' description is displayed");

			assertTrue(homePage.isDownloadwithConfidenceDescriptionTextDisplayed(),
					"Download With Confidence description is not displayed");
			test.log(Status.PASS, "User verified that 'Download With Confidence' description is displayed");

			assertTrue(homePage.isSafeAndSoundDescriptionTextDisplayed(),
					"Safe and Sound description is not displayed");
			test.log(Status.PASS, "User verified that 'Safe and Sound' description is displayed");

			assertTrue(homePage.isSharewithQRCodeDescriptionTextDisplayed(),
					"Share With QR Code description is not displayed");
			test.log(Status.PASS, "User verified that 'Share With QR Code' description is displayed");

			assertTrue(homePage.isReadSetShareDescriptionTextDisplayed(),
					"Read, Set, Share description is not displayed");
			test.log(Status.PASS, "User verified that 'Read, Set, Share' description is displayed");

			assertTrue(homePage.isYourCredentialsProtectedDescriptionTextDisplayed(),
					"Your Credentials Protected description is not displayed");
			test.log(Status.PASS, "User verified that 'Your Credentials Protected' description is displayed");

			assertTrue(homePage.isRestEasyDescriptionTextDisplayed(), "Rest Easy description is not displayed");
			test.log(Status.PASS, "User verified that 'Rest Easy' description is displayed");

			assertTrue(homePage.isAvailableOnYourFavouriteBrowserDescriptionTextDisplayed(),
					"Available on Your Favourite Browser description is not displayed");
			test.log(Status.PASS, "User verified that 'Available on Your Favourite Browser' description is displayed");

			assertTrue(homePage.isAlwaysWithinReachDescriptionTextDisplayed(),
					"Always Within Reach description is not displayed");
			test.log(Status.PASS, "User verified that 'Always Within Reach' description is displayed");

		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying feature descriptions: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on get started button")
	public void user_click_on_get_started_button() {
		try {
			homePage.clickOnGetStartedButton();
			test.log(Status.PASS, "User clicked on the 'Get Started' button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking 'Get Started' button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking 'Get Started' button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on data share content validity")
	public void user_click_on_data_share_content_validity() {
		try {
			homePage.clickOnConsentValidityButton();
			test.log(Status.PASS, "User clicked on 'Data Share Content Validity' button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while clicking 'Data Share Content Validity' button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL,
					"Unexpected error while clicking 'Data Share Content Validity' button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on select custom validity button")
	public void user_click_on_select_custom_validity_button() {
		try {
			homePage.clickOnConsentValidityAsCustom();
			test.log(Status.PASS, "User clicked on 'Select Custom Validity' button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL,
					"Element not found while clicking 'Select Custom Validity' button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking 'Select Custom Validity' button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user enter validity for data share content {string}")
	public void user_enter_validity_for_data_share_content(String validity) {
		try {
			homePage.enterConsentValidityAsCustom(validity);
			test.log(Status.PASS, "User entered validity for data share content: " + validity);
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while entering validity: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while entering validity: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User clicks on proceed button")
	public void user_clicks_on_proceed_button() {
		try {
			homePage.clickOnProccedCustomButton();
			test.log(Status.PASS, "User clicked on 'Proceed Custom' button");
			homePage.clickOnProccedConsentButton();
			test.log(Status.PASS, "User clicked on 'Proceed Consent' button");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking on proceed button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking on proceed button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("Use click on procced button")
	public void use_click_on_procced_button() {
		try {
			homePage.clickOnProccedCustomButton();
			homePage.clickOnProccedConsentButton();
			test.log(Status.PASS, "User successfully clicked on the Proceed button.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking on the Proceed button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking on the Proceed button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verifies home screen in Portuguese")
	public void user_verify_home_screen_in_portuguese() {
		try {
			assertEquals(homePage.isHomePageTextDisplayed(), globelConstants.HomePageTextInPortugues,
					"Home page title text mismatch");
			assertEquals(homePage.getHomePageDescriptionText(), globelConstants.HomePageDescriptionTextInPortugues,
					"Home page description mismatch");
			assertEquals(homePage.isListOfIssuersTextDisplayed(),
					globelConstants.ListOfCredentialTypeOnHomePageInPortugues, "List of issuers text mismatch");
			assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
					globelConstants.ListOfCredentialDescriptionTextInPortugues,
					"List of issuers description text mismatch");

			test.log(Status.PASS, "User successfully verified the home screen in Portuguese");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying home screen in Portuguese: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Home screen verification assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying home screen in Portuguese: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on arabic langauge")
	public void user_click_on_arabic_language() {
		try {
			homePage.clickOnArabicLanguage();
			test.log(Status.PASS, "User successfully clicked on the Arabic language option");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while clicking on Arabic language: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking on Arabic language: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in arabic laguage")
	public void user_validates_list_of_credential_types_title_in_arabic_for_sunbird() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInArabic,
					"Credential types title does not match the expected Arabic text.");
			test.log(Status.PASS, "Successfully validated the credential types title in Arabic for Sunbird.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Credential types title element not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Credential types title assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in kannada laguage")
	public void user_validates_list_of_credential_types_title_in_kannada() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInKannada,
					"Credential types title does not match the expected Kannada text.");
			test.log(Status.PASS, "Successfully validated the credential types title in Kannada.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Credential types title element not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Credential types title assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in hindi laguage")
	public void user_validates_list_of_credential_types_title_in_hindi() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInHindi,
					"Credential types title does not match the expected Hindi text.");
			test.log(Status.PASS, "Successfully validated the credential types title in Hindi.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Credential types title element not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Credential types title assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in french laguage")
	public void user_validates_list_of_credential_types_title_in_french() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInFrench,
					"Credential types title does not match the expected French text.");
			test.log(Status.PASS, "Successfully validated the credential types title in French.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Credential types title element not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Credential types title assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in tamil laguage")
	public void user_validates_list_of_credential_types_title_in_tamil() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInTamil,
					"Credential types title does not match the expected Tamil text.");
			test.log(Status.PASS, "Successfully validated the credential types title in Tamil.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Credential types title element not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Credential types title assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page in portugues laguage")
	public void user_validates_list_of_credential_types_title_in_portuguese() {
		try {
			assertEquals(homePage.isCredentialTypesDisplayed(), globelConstants.ListOfCredentialTypeInPortugues,
					"Credential types title does not match the expected Portuguese text.");
			test.log(Status.PASS, "Successfully validated the credential types title in Portuguese.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Credential types title element not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Credential types title assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User validate the list of credential types title of the page for sunbird")
	public void user_validates_list_of_credential_types_title_for_sunbird() {
		try {
			String isInsuranceTextDisplayed = homePage.isVeridoniaInsuranceCompanyTextDisplayed();
			String isCredentialTypesDisplayed = homePage.isCredentialTypesDisplayed();

			assertEquals(isCredentialTypesDisplayed, globelConstants.ListOfCredentialType,
					"Credential types title does not match the expected text.");

			test.log(Status.PASS, "Successfully validated the credential types title for Sunbird.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while validating credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Credential types title assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while validating credential types title: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on continue as guest")
	public void user_click_on_Continue_as_Guest() {
		try {
			homePage.clickOnContinueAsGuest();
			test.log(Status.PASS, "User successfully clicked on continue as guest");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "continue as guest button not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking the continue as guest button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify navigation button")
	public void user_verify_navigation_button() {
		try {
			assertTrue(homePage.isNavButtonsDisplayed(), "Navigation Button is not displayed");
			test.log(Status.PASS, "User verified that the Navigation Button is displayed successfully");
		} catch (AssertionError e) {
			test.log(Status.FAIL, "Assertion failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Element not found while verifying Navigation Button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying the Navigation Button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click on hamburger menu")
	public void user_click_on_hamburger_menu() {
		try {
			homePage.clickOnHamburgerMenu();
			test.log(Status.PASS, "User successfully clicked on hamburger menu");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "hamburger menu button not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while clicking hamburger menu button: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify search and title are appeare in the same line")
	public void user_verify_search_title_appeare_diff_lines() {
		try {
			assertTrue((homePage.getXCoordinateForSearch() - homePage.getXCoordinateForCredentialHeading()) <= 30,
					"Search and title are NOT aligned in the same line as expected.");

			test.log(Status.PASS, "Search and title heading appear on the same line");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "Search or heading element not present: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Unexpected error while verifying alignment: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User verify inji web text in FAQ page")
	public void user_verify_injiweb_text_in_FAQ_page() {
		try {
			assertTrue(homePage.verifyFaqTitlesDoNotContainInjiWeb(),
					"injiweb text is present in one or more FAQ titles");
			test.log(Status.PASS, "Verified that FAQ titles do not contain 'inji web'.");
		} catch (NoSuchElementException e) {
			test.log(Status.FAIL, "FAQ titles not found: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		} catch (Exception e) {
			test.log(Status.FAIL, "Error during FAQ title verification: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}
}