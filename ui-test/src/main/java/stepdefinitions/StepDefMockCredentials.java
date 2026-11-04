package stepdefinitions;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import org.openqa.selenium.WebDriver;

import pages.HomePage;
import pages.MockCredentials;
import pages.MosipCredentials;
import utils.BaseTest;
import utils.InjiWebConfigManager;

import static org.testng.Assert.assertTrue;

public class StepDefMockCredentials {
	public WebDriver driver;
	BaseTest baseTest;
	private HomePage homePage;
	private MockCredentials mockCredentials;
	private MosipCredentials mosipCredentials;

	public StepDefMockCredentials() {
		this.baseTest = new BaseTest();
		this.driver = baseTest.getDriver();
		this.homePage = new HomePage(driver);
		this.mockCredentials = new MockCredentials(driver);
		this.mosipCredentials = new MosipCredentials(driver);
	}

	@Then("User search the issuers mock")
	public void user_search_the_issuers_mock() throws Exception {
		String issuerText = InjiWebConfigManager.getproperty("issuerSearchTextforMock");
		homePage.clearIssuersSearchBox();
		homePage.isIssuersDisplayed();
		homePage.enterIssuersInSearchBox(issuerText);
	}

	@When("User click on download mock credentials button")
	public void user_click_on_download_mock_credentials_button() {
		homePage.scrollDownByPage(baseTest.getDriver());
		String issuerText = InjiWebConfigManager.getproperty("issuerSearchTextforMock");
		homePage.clickOnIssuerCardByName(issuerText);
	}

	@Then("User verify list of credential types displayed for mock")
	public void user_verify_list_of_credential_types_displayed_for_mock() {
		assertTrue(homePage.isListOfCredentialsTypeDisplayed());
	}

	@Then("User verify mock verifiable credential SD-JWT displayed")
	public void user_verify_mock_verifiable_credential_sd_jwt_displayed() {
		String credentialTypeText = InjiWebConfigManager.getproperty("credentialTypeTextforMock");
		assertTrue(mockCredentials.isCredentialTypeDisplayed(credentialTypeText),
				credentialTypeText + " is not displayed");
	}

	@When("User click on mock verifiable credential SD-JWT button")
	public void user_click_on_mock_verifiable_credential_sd_jwt_button() {
		mockCredentials.clickOnCredentialType(InjiWebConfigManager.getproperty("credentialTypeTextforMock"));
	}

	@When("User enter the sd-jwt uin")
	public void user_enter_the_sd_jwt_uin() {
		mosipCredentials.enterVid(InjiWebConfigManager.getproperty("sd-jwt-uin"));
	}

	@Then("User search the issuers mdl")
	public void user_search_the_issuers_mdl() throws Exception {
		String issuerText = InjiWebConfigManager.getproperty("issuerSearchTextforMdl");
		homePage.clearIssuersSearchBox();
		homePage.isIssuersDisplayed();
		homePage.enterIssuersInSearchBox(issuerText);
	}

	@When("User click on download mdl credentials button")
	public void user_click_on_download_mdl_credentials_button() {
		homePage.scrollDownByPage(baseTest.getDriver());
		String issuerText = InjiWebConfigManager.getproperty("issuerSearchTextforMdl");
		homePage.clickOnIssuerCardByName(issuerText);
	}

	@Then("User verify list of credential types displayed for mdl")
	public void user_verify_list_of_credential_types_displayed_for_mdl() {
		assertTrue(homePage.isListOfCredentialsTypeDisplayed());
	}

	@Then("User verify mock verifiable credential MDL displayed")
	public void user_verify_mock_verifiable_credential_mdl_displayed() {
		String credentialTypeText = InjiWebConfigManager.getproperty("credentialTypeTextforMdl");
		assertTrue(mockCredentials.isCredentialTypeDisplayed(credentialTypeText),
				credentialTypeText + " is not displayed");
	}

	@When("User click on mock verifiable credential MDL button")
	public void user_click_on_mock_verifiable_credential_mdl_button() {
		mockCredentials.clickOnCredentialType(InjiWebConfigManager.getproperty("credentialTypeTextforMdl"));
	}

	@When("User enter the mdl uin")
	public void user_enter_the_mdl_uin() {
		mosipCredentials.enterVid(InjiWebConfigManager.getproperty("mdl-uin"));
	}

	@When("User enter the mock otp")
	public void user_enter_the_mock_otp() {
		mosipCredentials.enterOtp(baseTest.getDriver(), InjiWebConfigManager.getproperty("mockOTP"));
	}

}
