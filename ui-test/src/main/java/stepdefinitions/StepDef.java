
package stepdefinitions;

import io.cucumber.java.PendingException;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import io.mosip.testrig.apirig.utils.NotificationListener;
import org.junit.Assert;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;

import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import pages.FaqPage;
import pages.HomePage;
import pages.SetNetwork;
import utils.BaseTest;
import utils.ExtentReportManager;
import utils.InjiWebConfigManager;
import utils.InjiWebConstants;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import java.io.IOException;
import java.time.Duration;
import java.util.Set;

public class StepDef {
	private BaseTest baseTest;
	private HomePage homePage;
	private FaqPage faqPage;
	private SetNetwork setNetwork;
	private WebDriver driver;
	String pageTitle;
	ExtentTest test = ExtentReportManager.getTest();

	public StepDef() {
		this.baseTest = new BaseTest();
		this.driver = baseTest.getDriver();
		if (driver == null) {
			throw new RuntimeException("WebDriver is null in StepDef! Check if BaseTest initializes correctly.");
		}
		this.homePage = new HomePage(driver);
		this.faqPage = new FaqPage(driver);
		this.setNetwork = new SetNetwork();

	}

	@Given("User gets the title of the page")
	public void getTheTitleOfThePage() {

		WebDriverWait wait = new WebDriverWait(baseTest.getDriver(), Duration.ofSeconds(InjiWebConfigManager.getWaitTimeInSeconds()));

		wait.until(ExpectedConditions.titleIs(InjiWebConstants.PAGE_TITLE));

		pageTitle = baseTest.getDriver().getTitle();

		ExtentReportManager.logStep("Retrieved page title: " + pageTitle);
	}

	@Then("User validate the title of the page")
	public void validateTheTitleOfThePage() {
		String expected = InjiWebConstants.PAGE_TITLE;

		ExtentReportManager.logStep(
				"Validating page title → Expected: " + expected + " | Actual: " + pageTitle
		);

		Assert.assertEquals(expected, pageTitle);
	}

	@Then("User verify that inji web logo is displayed")
	public void verifyInjiWebLogoIsDisplayed() {
		assertTrue(homePage.isLogoDisplayed(), "Inji web logo is not displayed");
	}

	@When("User clicks on the Faq button")
	public void clicksOnFaqButton() {
		homePage.clickOnFaq();
	}

	@When("User click on download mosip credentials button")
	public void user_click_on_download_mosip_credentials_button() {
		homePage.scrollDownByPage(baseTest.getDriver());
		homePage.clickOnDownloadMosipCredentials();
	}

	@Then("User verify list of credential types displayed")
	public void user_verify_list_of_credential_types_displayed() {
		Assert.assertTrue(homePage.isListOfCredentialsTypeDisplayed());
	}

	@When("User click on verify button")
	public void user_click_on_verify_button() {
		int maxAttempts = 3;
		int otpPageWaitTime = InjiWebConfigManager.getOtpVerificationPageWaitTimeInSeconds();
		Exception lastException = null;
		for (int attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				homePage.clickOnVerify();
				test.log(Status.INFO, "Clicked on verify OTP button. Attempt: " + attempt + "/" + maxAttempts);

				if (!homePage.isOnOtpVerificationPage(otpPageWaitTime)) {
					NotificationListener.markRequestRemove();
					test.log(Status.INFO, "OTP verified successfully on attempt " + attempt);
					return;
				}

				test.log(Status.WARNING, "Still on OTP verification page after verify attempt "
						+ attempt + "/" + maxAttempts + ". Retrying if attempts remain.");
			} catch (Exception e) {
				lastException = e;
				test.log(Status.WARNING, "Verify OTP attempt " + attempt + "/" + maxAttempts
						+ " failed: " + e.getMessage());
			}
		}

		NotificationListener.markRequestRemove();
		throw new RuntimeException("Still on OTP verification page after " + maxAttempts
				+ " verify attempts", lastException);
	}

	@Then("User verify Download Success text displayed")
	public void user_verify_download_success_text_displayed() throws Exception {
		Assert.assertTrue(homePage.isSuccessMessageDisplayed());
	}

	@Then("User verify mosip national id by e-signet displayed")
	public void user_verify_mosip_national_id_by_e_signet_displayed() {
		Assert.assertTrue(homePage.isIssuerLogoDisplayed());
		Assert.assertTrue(homePage.isMosipNationalIdDisplayed());
	}

	@Then("User search the issuers with {string}")
	public void user_search_the_issuers_with(String string) {
		homePage.enterIssuersInSearchBox(string);
	}

	@Then("User search the issuers mosip")
	public void user_search_the_issuers_mosip() throws Exception {
		String issuerText = System.getenv("Issuer_Text_Mosip");
		if (issuerText == null || issuerText.isEmpty()) {
			String[] string = baseTest.fetchIssuerTexts();
			issuerText = string[0];
		}
		homePage.clearIssuersSearchBox();
		homePage.enterIssuersInSearchBox(issuerText);
	}

	@Then("User search the issuers sunbird")
	public void user_search_the_issuers_sunbird() throws Exception {
		String issuerText = System.getenv("Issuer_Text_sunbird");
		if (issuerText == null || issuerText.isEmpty()) {
			String[] string = baseTest.fetchIssuerTexts();
			issuerText = string[1];
		}
		homePage.clearIssuersSearchBox();
		homePage.isIssuersDisplayed();
		homePage.enterIssuersInSearchBox(issuerText);
	}

	@Then("User verify go home button")
	public void user_verify_go_home_button() throws Exception {
		Assert.assertTrue(homePage.isGoHomeButtonDisplayed());
	}

	@Then("User verify that langauge button is displayed")
	public void verify_that_language_button_is_displayed() {
		Assert.assertTrue(homePage.isLanguageDisplayed());
	}

	@Then("User click on langauge button")
	public void click_on_language_button() {
		homePage.clickOnLanguageButton();
	}

	@Then("User Verify the no issuer found message")
	public void user_verify_the_no_issuer_found_message() {
		Assert.assertTrue(homePage.isNoIssuerFoundMessageDisplayed());
	}

	@Then("User verify home screens in arabic")
	public void user_verify_home_screens_in_arabic() {
		Assert.assertEquals(homePage.isHomePageTextDisplayed(), InjiWebConstants.HomePageTextInArabic);
		Assert.assertEquals(homePage.getHomePageDescriptionText(), InjiWebConstants.isHomePageDescriptionTextnArabic);
		Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
				InjiWebConstants.ListOfCredentialTypeOnHomePageInArabic);
		Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
				InjiWebConstants.ListOfCredentialDescriptionTextInArabic);
	}

	@Then("User click on tamil langauge")
	public void user_click_on_tamil_language() {
		homePage.clickOnTamilLanguage();
	}

	@Then("User verify home screens in tamil")
	public void user_verify_home_screens_in_tamil() {
		Assert.assertEquals(homePage.isHomePageTextDisplayed(), InjiWebConstants.HomePageTextInTamil);
		Assert.assertEquals(homePage.getHomePageDescriptionText(), InjiWebConstants.isHomePageDescriptionTextnTamil);
		Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
				InjiWebConstants.ListOfCredentialTypeOnHomePageInTamil);
		Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
				InjiWebConstants.ListOfCredentialDescriptionTextInTamil);
	}

	@Then("User click on kannada langauge")
	public void user_click_on_kannada_language() {
		homePage.clickOnKannadaLanguage();
	}

	@Then("User verify home screens in kannada")
	public void user_verify_home_screens_in_kannada() {
		Assert.assertEquals(homePage.isHomePageTextDisplayed(), InjiWebConstants.HomePageTextInKannada);
		Assert.assertTrue(homePage.isHomePageDescriptionTextDisplayed());
		Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
				InjiWebConstants.ListOfCredentialTypeOnHomePageInKannada);
		Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
				InjiWebConstants.ListOfCredentialDescriptionTextInKannada);
	}

	@Then("User click on hindi langauge")
	public void user_click_on_hindi_language() {
		homePage.clickOnHindiLanguage();
	}

	@Then("User verify home screens in hindi")
	public void user_verify_home_screens_in_hindi() {
		Assert.assertEquals(homePage.isHomePageTextDisplayed(), InjiWebConstants.HomePageTextInHindi);
		Assert.assertEquals(homePage.getHomePageDescriptionText(), InjiWebConstants.HomePageDescriptionTextInHindi);
		Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
				InjiWebConstants.ListOfCredentialTypeOnHomePageInHindi);
		Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
				InjiWebConstants.ListOfCredentialDescriptionTextInHindi);
	}

	@Then("User click on french langauge")
	public void user_click_on_french_language() {
		homePage.clickOnFranchLanguage();
	}

	@Then("User verify home screens in french")
	public void user_verify_home_screens_in_french() {
		Assert.assertEquals(homePage.isHomePageTextDisplayed(), InjiWebConstants.HomePageTextInFrench);
		Assert.assertEquals(homePage.getHomePageDescriptionText(), InjiWebConstants.HomePageDescriptionTextInFrench);
		Assert.assertEquals(homePage.isListOfIssuersTextDisplayed(),
				InjiWebConstants.ListOfCredentialTypeOnHomePageInFrench);
		Assert.assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
				InjiWebConstants.ListOfCredentialDescriptionTextInFrench);
	}

	@Then("User click on portugues langauge")
	public void user_click_on_portuguese_language() {
		homePage.clickOnPortuguesLanguage();
	}

	@Then("User verify home screens in portugues")
	public void user_verify_home_screens_in_portuguese() {
		assertEquals(homePage.isHomePageTextDisplayed(), InjiWebConstants.HomePageTextInPortugues,
				"Home page text does not match");
		assertEquals(homePage.getHomePageDescriptionText(), InjiWebConstants.HomePageDescriptionTextInPortugues,
				"Home page description text does not match");
		assertEquals(homePage.isListOfIssuersTextDisplayed(),
				InjiWebConstants.ListOfCredentialTypeOnHomePageInPortugues, "List of issuers text does not match");
		assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
				InjiWebConstants.ListOfCredentialDescriptionTextInPortugues,
				"List of issuers description text does not match");
	}

	@Then("User validate the list of credential types title of the page")
	public void user_validate_the_list_of_credential_types_title_of_the_page() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialType,
				"List of credential types title does not match");
	}

	@Then("User validate the list of credential types title of the page in Arabic language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_arabic_language() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInArabic,
				"List of credential types title in Arabic does not match");
	}

	@Then("User validate the list of credential types title of the page in Tamil language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_tamil_language() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInTamil,
				"List of credential types title in Tamil does not match");
	}

	@Then("User validate the list of credential types title of the page in Kannada language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_kannada_language() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInKannada,
				"List of credential types title in Kannada does not match");
	}

	@Then("User validate the list of credential types title of the page in Hindi language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_hindi_language() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInHindi,
				"List of credential types title in Hindi does not match");
	}

	@Then("User validate the list of credential types title of the page in French language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_french_language() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInFrench,
				"List of credential types title in French does not match");
	}

	@Then("User validate the list of credential types title of the page in Portuguese language")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_portuguese_language() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInPortugues,
				"List of credential types title in Portuguese does not match");
	}

	@Then("User validate the list of credential types title of the page for Sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_for_sunbird() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialType,
				"List of credential types title for Sunbird does not match");
	}

	@Then("User validate the list of credential types title of the page in arabic laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_arabic_language_for_sunbird() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInArabic,
				"List of credential types title in Arabic for Sunbird does not match");
	}

	@Then("User validate the list of credential types title of the page in tamil laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_tamil_language_for_sunbird() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInTamil,
				"List of credential types title in Tamil for Sunbird does not match");
	}

	@Then("User validate the list of credential types title of the page in kannada laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_kannada_language_for_sunbird() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInKannada,
				"List of credential types title in Kannada for Sunbird does not match");
	}

	@Then("User validate the list of credential types title of the page in hindi laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_hindi_language_for_sunbird() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInHindi,
				"List of credential types title in Hindi for Sunbird does not match");
	}

	@Then("User validate the list of credential types title of the page in french laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_french_language_for_sunbird() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInFrench,
				"List of credential types title in French for Sunbird does not match");
	}

	@Then("User validate the list of credential types title of the page in portugues laguage for sunbird")
	public void user_validate_the_list_of_credential_types_title_of_the_page_in_portuguese_language_for_sunbird() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInPortugues,
				"List of credential types title in Portuguese for Sunbird does not match");
	}

	@Then("User verify all the languages")
	public void user_verify_all_the_languages() {
		assertTrue(homePage.verifyLanguagesInLanguageFilter(),
				"Language verification in the language filter failed");
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
		Assert.assertTrue(faqPage.isFaqPageFAQDescriptionTextDisplayed());
		Assert.assertTrue(faqPage.isFaqPageFAQTitelTextDisplayed());
	}

	@When("User verify the only one FAQ is open")
	public void user_verify_the_only_one_faq_is_open() throws IOException {
		boolean isUpArrowDisplayed = faqPage.isUpArrowDisplayed();
		int upArrowCount = faqPage.getUpArrowCount();

		Assert.assertTrue(isUpArrowDisplayed);
		Assert.assertEquals(upArrowCount, 1);
	}

	@When("User verify the only one FAQ is at a time")
	public void user_verify_the_only_one_faq_is_at_a_time() {
		faqPage.ClickOnDownArrow();
		Assert.assertEquals(faqPage.getUpArrowCount(), 1);
		Assert.assertEquals(faqPage.getDownArrowCount(), 22);
	}

	@Then("User verify that Faq button is displayed")
	public void user_verify_that_faq_button_displayed() {
		assertTrue(homePage.isFaqPageDisplayed(), "Faq button is not displayed");
	}

	@Then("User verify header displayed")
	public void user_verify_header_displayed() {
		assertTrue(homePage.isHeaderContanerDisplayed(), "Header container is not displayed");
	}

	@Then("User verify that home page container displayed")
	public void user_verify_that_home_page_container_displayed() {
		assertTrue(homePage.isHomePageContainerDisplayed(), "Home page container is not displayed");
	}

	@Then("User verify the footer on home page")
	public void user_verify_the_footer_on_home_page() {
		assertTrue(homePage.isFooterIsDisplayedOnHomePage(), "Footer is not displayed on the home page");
		assertEquals(homePage.getFooterText(), InjiWebConstants.FooterText,
				"Footer text does not match the expected value");
	}

	@Then("User verify that on home page searchbox is present")
	public void user_verify_that_on_home_page_searchbox_is_present() {
		assertTrue(homePage.isSerchBoxDisplayed(), "Search box is not displayed on the home page");
	}

	@When("User verify the logo of the issuer")
	public void user_verify_the_logo_of_the_issuer() {
		assertTrue(homePage.isIssuerLogoDisplayed(), "Issuer logo is not displayed");
	}

	@Then("User verify that home banner heading")
	public void user_verify_that_home_banner_heading() {
		assertTrue(homePage.isHomeBannerHeadingDisplayed(), "Home banner heading is not displayed");
	}

	@Then("User verify that home banner description")
	public void user_verify_that_home_banner_description() {
		assertTrue(homePage.isHomeBannerHeadingDescriptionDisplayed(), "Home banner description is not displayed");
	}

	@Then("User verify that home banner get started")
	public void user_verify_that_home_banner_get_started() {
		assertTrue(homePage.isGetStartedButtonDisplayed(),
				"Get Started button is not displayed on the home banner");
	}

	@Then("User verify that home features heading")
	public void user_verify_that_home_features_heading() {
		assertTrue(homePage.isFeatureHeadingDisplayed(), "Feature heading is not displayed on the home page");
	}

	@Then("User verify that home features description1")
	public void user_verify_that_home_features_description1() {
		assertTrue(homePage.isFeatureDescriptionDisplayed(),
				"Feature description is not displayed on the home page");
	}

	@Then("User verify that home features mobile image")
	public void user_verify_that_home_features_mobile_image() {
		assertTrue(homePage.isFeatureMobileImageDisplayed(),
				"Feature mobile image is not displayed on the home page");
	}

	@Then("User verify that home features desktop image")
	public void user_verify_that_home_features_desktop_image() {
		assertTrue(homePage.isFeatureDesktopImageDisplayed(),
				"Feature desktop image is not displayed on the home page");
	}

	@Then("User verify that home feature item image")
	public void user_verify_that_home_feature_item_image() {
		assertTrue(homePage.isAccessYourCredentialsImageDisplayed(),
				"Access Your Credentials image is not displayed");
		assertTrue(homePage.isYourDocumentsDownloadedImageDisplayed(),
				"Your Documents Downloaded image is not displayed");
		assertTrue(homePage.isEasySharingImageDisplayed(), "Easy Sharing image is not displayed");
		assertTrue(homePage.isSecureAndPrivateImageDisplayed(), "Secure and Private image is not displayed");
		assertTrue(homePage.isWiderAccessAndCompatibilityImageDisplayed(),
				"Wider Access and Compatibility image is not displayed");
	}

	@Then("User verify that home feature Heading")
	public void user_verify_that_home_feature_item_heading() {
		assertTrue(homePage.isAccessYourCredentialsTextHeaderDisplayed(),
				"Access Your Credentials heading is not displayed");
		assertTrue(homePage.isYourDocumentsDownloadedTextHeaderDisplayed(),
				"Your Documents Downloaded heading is not displayed");
		assertTrue(homePage.isEasySharingTextHeaderDisplayed(), "Easy Sharing heading is not displayed");
		assertTrue(homePage.isSecureAndPrivateDisplayed(), "Secure and Private heading is not displayed");
		assertTrue(homePage.isWiderAccessAndCompatibilityDisplayed(),
				"Wider Access and Compatibility heading is not displayed");
	}

	@Then("User verify that home feature item header for all")
	public void user_verify_that_home_feature_first_item() {
		assertTrue(homePage.isCredentialsSimplifiedTextDisplayed(), "Credentials Simplified text is not displayed");
		assertTrue(homePage.isNoMorePaperworkTextDisplayed(), "No More Paperwork text is not displayed");
		assertTrue(homePage.isDownloadWithConfidenceTextDisplayed(),
				"Download With Confidence text is not displayed");
		assertTrue(homePage.isSafeAndSoundTextDisplayed(), "Safe and Sound text is not displayed");
		assertTrue(homePage.isShareWithQRCodeTextDisplayed(), "Share With QR Code text is not displayed");
		assertTrue(homePage.isReadSetShareTextDisplayed(), "Read, Set, Share text is not displayed");
		assertTrue(homePage.isYourCredentialsProtectedTextDisplayed(),
				"Your Credentials Protected text is not displayed");
		assertTrue(homePage.isRestEasyTextDisplayed(), "Rest Easy text is not displayed");
		assertTrue(homePage.isAvailableOnYourFavouriteBrowserTextDisplayed(),
				"Available on Your Favourite Browser text is not displayed");
		assertTrue(homePage.isAlwaysWithinReachTextDisplayed(), "Always Within Reach text is not displayed");
	}

	@Then("User verify that home feature feature description")
	public void user_verify_that_home_feature_first_feature_description() {
		assertTrue(homePage.isCredentialsSimplifiedDescriptionTextDisplayed(),
				"Credentials Simplified description is not displayed");
		assertTrue(homePage.isNomorePaperworkDescriptionTextDisplayed(),
				"No More Paperwork description is not displayed");
		assertTrue(homePage.isDownloadwithConfidenceDescriptionTextDisplayed(),
				"Download With Confidence description is not displayed");
		assertTrue(homePage.isSafeAndSoundDescriptionTextDisplayed(),
				"Safe and Sound description is not displayed");
		assertTrue(homePage.isSharewithQRCodeDescriptionTextDisplayed(),
				"Share With QR Code description is not displayed");
		assertTrue(homePage.isReadSetShareDescriptionTextDisplayed(),
				"Read, Set, Share description is not displayed");
		assertTrue(homePage.isYourCredentialsProtectedDescriptionTextDisplayed(),
				"Your Credentials Protected description is not displayed");
		assertTrue(homePage.isRestEasyDescriptionTextDisplayed(), "Rest Easy description is not displayed");
		assertTrue(homePage.isAvailableOnYourFavouriteBrowserDescriptionTextDisplayed(),
				"Available on Your Favourite Browser description is not displayed");
		assertTrue(homePage.isAlwaysWithinReachDescriptionTextDisplayed(),
				"Always Within Reach description is not displayed");
	}

	@Then("User click on get started button")
	public void user_click_on_get_started_button() {
		homePage.clickOnGetStartedButton();
	}

	@Then("User click on data share content validity")
	public void user_click_on_data_share_content_validity() {
		homePage.clickOnConsentValidityButton();
	}

	@Then("User click on select custom validity button")
	public void user_click_on_select_custom_validity_button() {
		homePage.clickOnConsentValidityAsCustom();
	}

	@Then("user enter validity for data share content {string}")
	public void user_enter_validity_for_data_share_content(String validity) {
		homePage.enterConsentValidityAsCustom(validity);
	}

	@Then("User clicks on proceed button")
	public void user_clicks_on_proceed_button() {
		homePage.waitForseconds();
		homePage.clickOnProccedCustomButton();
		homePage.clickOnProccedConsentButton();
	}

	@Then("Use click on proceed button")
	public void use_click_on_proceed_button() {
		homePage.clickOnProccedCustomButton();
		homePage.clickOnProccedConsentButton();
	}

	@Then("User verifies home screen in Portuguese")
	public void user_verify_home_screen_in_portuguese() {
		assertEquals(homePage.isHomePageTextDisplayed(), InjiWebConstants.HomePageTextInPortugues,
				"Home page title text mismatch");
		assertEquals(homePage.getHomePageDescriptionText(), InjiWebConstants.HomePageDescriptionTextInPortugues,
				"Home page description mismatch");
		assertEquals(homePage.isListOfIssuersTextDisplayed(),
				InjiWebConstants.ListOfCredentialTypeOnHomePageInPortugues, "List of issuers text mismatch");
		assertEquals(homePage.isListOfIssuersDescriptionTextDisplayed(),
				InjiWebConstants.ListOfCredentialDescriptionTextInPortugues,
				"List of issuers description text mismatch");
	}

	@Then("User click on arabic langauge")
	public void user_click_on_arabic_language() {
		homePage.clickOnArabicLanguage();
	}

	@Then("User validate the list of credential types title of the page in arabic laguage")
	public void user_validates_list_of_credential_types_title_in_arabic_for_sunbird() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInArabic,
				"Credential types title does not match the expected Arabic text.");
	}

	@Then("User validate the list of credential types title of the page in kannada laguage")
	public void user_validates_list_of_credential_types_title_in_kannada() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInKannada,
				"Credential types title does not match the expected Kannada text.");
	}

	@Then("User validate the list of credential types title of the page in hindi laguage")
	public void user_validates_list_of_credential_types_title_in_hindi() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInHindi,
				"Credential types title does not match the expected Hindi text.");
	}

	@Then("User validate the list of credential types title of the page in french laguage")
	public void user_validates_list_of_credential_types_title_in_french() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInFrench,
				"Credential types title does not match the expected French text.");
	}

	@Then("User validate the list of credential types title of the page in tamil laguage")
	public void user_validates_list_of_credential_types_title_in_tamil() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInTamil,
				"Credential types title does not match the expected Tamil text.");
	}

	@Then("User validate the list of credential types title of the page in portugues laguage")
	public void user_validates_list_of_credential_types_title_in_portuguese() {
		assertEquals(homePage.isCredentialTypesDisplayed(), InjiWebConstants.ListOfCredentialTypeInPortugues,
				"Credential types title does not match the expected Portuguese text.");
	}

	@Then("User validate the list of credential types title of the page for sunbird")
	public void user_validates_list_of_credential_types_title_for_sunbird() {
		homePage.isVeridoniaInsuranceCompanyTextDisplayed();
		String isCredentialTypesDisplayed = homePage.isCredentialTypesDisplayed();
		assertEquals(isCredentialTypesDisplayed, InjiWebConstants.ListOfCredentialType,
				"Credential types title does not match the expected text.");
	}

	@Then("User click on continue as guest")
	public void user_click_on_Continue_as_Guest() {
		homePage.clickOnContinueAsGuest();
	}

	@And("Issuers list should be displayed")
	public void issuersListShouldBeDisplayed() {
		assertTrue(homePage.isIssuersDisplayed(), "Issuers list is displayed after clicking Continue as Guest");
	}
}