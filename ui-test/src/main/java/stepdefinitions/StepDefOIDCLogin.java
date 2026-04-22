package stepdefinitions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.testng.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.Properties;

import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;

import base.BasePage;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import pages.Loginpage;
import pages.MosipCredentials;
import pages.SetNetwork;
import utils.BaseTest;
import utils.InjiWebConstants;
import utils.HttpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StepDefOIDCLogin {

	public WebDriver driver;
	BaseTest baseTest;
	private MosipCredentials mosipCredentials;
	private SetNetwork setNetwork;
	private Loginpage loginpage;

	private String sessionCookieName = "SESSION";
	private String sessionCookieValue;
	String baseUrl = BaseTest.url;
	String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
	private static final Logger logger = LoggerFactory.getLogger(StepDefOIDCLogin.class);

	public static void updateConfigProperty(String key, String value) throws IOException {
		File file = new File("src/main/resources/config/injiweb.properties");
		Properties props = new Properties();
		try (FileInputStream fis = new FileInputStream(file)) {
			props.load(fis);
		}

		props.setProperty(key, value);

		try (FileOutputStream fos = new FileOutputStream(file)) {
			props.store(fos, null);
		}
	}

	public StepDefOIDCLogin() {
		this.baseTest = new BaseTest();
		this.driver = baseTest.getDriver();
		this.mosipCredentials = new MosipCredentials(driver);
		this.loginpage = new Loginpage(driver);
		this.setNetwork = new SetNetwork();
	}

	@Then("user performs token-based login using Gmail refresh token")
	public void user_performs_token_login_using_refresh_token() throws Exception {
		String idToken = HttpUtils.getIdToken();
		String sessionCookie = HttpUtils.getSessionCookieFromIdToken(idToken);
		String sessionCookieValue = sessionCookie.contains("=") ? sessionCookie.split("=", 2)[1].split(";")[0].trim()
				: sessionCookie;
		driver.get(baseUrl);
		assertTrue(loginpage.isgoogleButtonDisplayed(), "google Login Button on Home page");
		driver.manage().deleteAllCookies();

		Cookie myCookie = new Cookie.Builder(sessionCookieName, sessionCookieValue).path("/v1/mimoto").isHttpOnly(true)
				.isSecure(true).build();
		driver.manage().addCookie(myCookie);
		driver.navigate().refresh();
		loginpage.waituntilpagecompletelyloaded();
	}

	@Then("user enters the passcode {string}")
	public void user_enters_passcode(String string) throws InterruptedException {
		loginpage.enterPasscode(string);
	}

	@Then("user click on toggle button")
	public void user_click_on_toggle_button() {
		loginpage.clickonToggleButton();
	}

	@Then("user verify the toggle button")
	public void user_verify_toggleButton() {
		assertTrue(loginpage.isToggleAppearinPlainTextFormat(), "Toggle button displayed text in plain test format");
	}

	@Then("user toggles the password visibility using keyboard and verifies it")
	public void user_toggle_with_keyboard_and_verify() {
		loginpage.focusToggleButtonWithKeyboard();
		assertTrue(loginpage.isToggleAppearinPlainTextFormat(), "Password should be visible in plain text format");
	}

	@Then("user enters the passcode for confirmation {string}")
	public void user_enters_passcode_for_confirmation(String string) throws InterruptedException {
		loginpage.enterConfirmPasscode(string);
	}

	@Then("user click on toggle button for confirmation")
	public void user_click_on_toggle_button_for_confimration() {
		loginpage.clickonToggleButtonConfimration();
	}

	@Then("user verifies the submit button enabled")
	public void user_verifies_submit_button_enabled() {
		assertTrue(loginpage.isSubmitButtonEnabled(), "Submit button enabled");
	}

	@Then("user verifies the submit button is not enabled")
	public void user_verifies_submit_button_disabled() {
		assertFalse(loginpage.isSubmitButtonEnabledFast(), "Submit button should be disabled");
	}

	@Then("user click on submit button")
	public void user_click_on_submit_button() throws Exception {
		loginpage.clickonSubmitButton();
	}

	@Then("user verify error message for mismatch")
	public void user_verify_error_message_for_mismatch() {
		assertEquals(InjiWebConstants.MisMatchError, loginpage.getMismatchErrorText().trim());
	}

	@Then("user prints verify message for mismatch")
	public void user_verify_error_message_mismatch() {
		assertEquals(loginpage.getMismatchErrorText().trim(), InjiWebConstants.MisMatchError);
	}

	@Then("user click on logout button")
	public void user_click_on_logout_button() {
		loginpage.clickonLogout();
	}

	@Then("user verify confirmation passcode option for secondtime login")
	public void user_verify_confirmation_passcode_option_missing() {
		assertTrue(loginpage.confirmPasscodeSecondTimeLogin(), "confirm Password Shold Not Appear");
	}

	@Then("User click on cards button")
	public void clickonAddCardsButton() {
		loginpage.clickOnElement(driver, By.xpath("//button[@data-testid='btn-add-cards']"));
	}

	@Then("user verify current url userhome")
	public void user_verify_current_url() {
		loginpage.waituntilpagecompletelyloaded();
		String currentUrl = loginpage.getCurrentUrlUserHome();
		assertEquals(currentUrl, normalizedBaseUrl + "user/home", "URL did not match expected user home");
	}

	@Then("user verify profile details displayed")
	public void user_verify_profile_details_displayed() throws InterruptedException {
		assertTrue(loginpage.isProfileDetailsDisplayed(), "Profile details displayed");
	}

	@Then("user verify profile image displayed")
	public void user_verify_profile_image_displayed() throws InterruptedException {
		assertTrue(loginpage.isProfileImageDisplayed(), "Profile image displayed");
	}

	@Then("user verify profile name displayed")
	public void user_verify_profile_name_displayed() throws InterruptedException {
		assertTrue(loginpage.isProfileNameDisplayed(), "Profile name displayed");
	}

	@Then("user verify dropdown displayed")
	public void user_verify_profile_dropdown_displayed() throws InterruptedException {
		assertTrue(loginpage.isProfileDropDownDisplayed(), "Profile dropdown displayed");
	}

	@Then("user click on dropdown box for profile")
	public void user_click_on_profile_dropdown() {
		loginpage.clickOnProfileDropDown();
	}

	@Then("user click on dropdown box for profile again")
	public void user_click_on_profile_dropdown_again() throws InterruptedException {
		loginpage.clickOnProfileDropDownDisplayedAgain();
	}

	@Then("user verify home button")
	public void user_verify_home_button() throws InterruptedException {
		assertTrue(loginpage.isHomeButtonDisplayed(), "Home button on home page Displayed");
	}

	@Then("user verify stored cards button")
	public void user_verify_storedcredentials_button() throws InterruptedException {
		assertTrue(loginpage.isVerifyStoredCredentialsButtonDisplayed(), "Stored cards button on home page Displayed");
	}

	@Then("user click on stored credentials button")
	public void user_click_on_stored_credentils_button() throws InterruptedException {
		loginpage.clickonStoredCredentialsButton();
	}

	@Then("user verify current url user credentials")
	public void user_verify_current_url_credentials() {
		loginpage.waituntilpagecompletelyloaded();
		String currentUrl = loginpage.getCurrentUrlUserCredentials();
		assertEquals(currentUrl, normalizedBaseUrl + "user/credentials", "URL did not match expected user home");
	}

	@Then("user verify collapse button")
	public void user_verify_collapse_button() throws InterruptedException {
		assertTrue(loginpage.isCollapseButtonDisplayed(), "Collapse button on home page Displayed");
	}

	@Then("user verify no cards stored message")
	public void user_verify_no_cardsstoredmessage() throws InterruptedException {
		assertTrue(loginpage.isnoCardsAddedMessageDisplayed(), "no cards message displayed");
	}

	@Then("user verify substring when no cards stored")
	public void user_verify_substring_when_nocards_stored() throws InterruptedException {
		assertTrue(loginpage.isnoCardsAddedMessageSubstringMessage(), "Substring for no cards message displayed");
	}

	@Then("user toggles the password visibility using keyboard")
	public void user_toggle_with_keyboard() {
		loginpage.focusToggleButtonWithKeyboard();
	}

	@Then("user selects profile option")
	public void user_selects_profile_option() {
		loginpage.clickOnProfileOption();
	}

	@Then("user verify My Profile Text")
	public void user_verify_MyProfile_Text() {
		String ProfileText = loginpage.getTextMyProfile();
		assertEquals(ProfileText, InjiWebConstants.ProfileText);
	}

	@Then("user verify back arrow button")
	public void user_verify_back_arrow_button() {
		assertTrue(loginpage.isArrowButtonDisplayed(), "Back arrow button on profile Displayed");
	}

	@Then("user verify home arrow button")
	public void user_verify_home_arrow_button() {
		assertTrue(loginpage.isHomeArrowButtonDisplayed(), "Home arrow button on profile Displayed");
	}

	@Then("user verify label fullname")
	public void user_verify_label_fullname() {
		assertTrue(loginpage.isLabelFullnameDisplayed(), "Label fullname Displayed");
	}

	@Then("user verify label fullname value")
	public void user_verify_label_fullname_value() {
		assertTrue(loginpage.isLabelFullnameValueDisplayed(), "Label fullname value Displayed");
	}

	@Then("user verify label fullname info")
	public void user_verify_label_fullname_info() {
		assertTrue(loginpage.isLabelFullnameInfoDisplayed(), "Label fullname info Displayed");
	}

	@Then("user verify label fullname info value")
	public void user_verify_label_fullname_info_value_value() {
		assertTrue(loginpage.isLabelFullnameInfoValueDisplayed(), "Label fullname info value Displayed");
	}

	@Then("user click on back arrow button verify userhome page")
	public void user_click_on_back_arrow_button() {
		loginpage.clickonBackAwroeButton();
	}

	@Then("user click on home arrow button verify userhome page")
	public void user_click_on_home_arrow_button() {
		loginpage.clickonHomeAwroeButton();
	}

	@Then("user verify forget passcode option")
	public void user_verify_forget_passcode_option() {
		assertTrue(loginpage.isForgetPasscodeOptionDisplayed(), "Forget passcode option Displayed");
	}

	@Then("user click on forget passcode option")
	public void user_click_on_forget_passcode_option() {
		loginpage.clickOnForgetPasscodeOption();
	}

	@Then("user verify the title of the window")
	public void user_verify_the_title_of_the_window() {
		String windowTitle = loginpage.getTitleOfTheForgetPasswordWindow();
		assertEquals(windowTitle, InjiWebConstants.windowTitle);
	}

	@Then("user verify the current url userresetpasscode")
	public void user_verify_the_current_url_userresetpasscode() {
		loginpage.waituntilpagecompletelyloaded();
		String currentUrl = loginpage.getCurrentUrluserresetpasscode();
		assertEquals(currentUrl, normalizedBaseUrl + "user/reset-passcode",
				"URL did not match expected user reset passcode");
	}

	@Then("user verify the back button")
	public void user_verify_the_back_button() {
		assertTrue(loginpage.isbackButtonDisplayedOnForgetpasscode(),
				"Back button on Forget passcode option Displayed");
	}

	@Then("user verify passcode reset info1 available")
	public void user_verify_passcode_reset_info1_available() {
		assertTrue(loginpage.isInfoTextForgetPasswordDisplayed(),
				"User info1 for forget passcode button Displayed");
	}

	@Then("user verify user info on reset passcode available")
	public void user_verify_user_info_on_reset_passcode_available() {
		assertTrue(loginpage.isResetUserInfoOnForgetPasswordDisplayed(),
				"User info for forget passcode button Displayed");
	}

	@Then("user verify forget passcode button")
	public void user_verify_forget_passcode_button() {
		assertTrue(loginpage.isForgetPasscodeButtonDisplayed(), "Forget passcode button Displayed");
	}

	@Then("user verify forget passcode button enabled")
	public void user_verify_forget_passcode_button_enabled() {
		assertTrue(loginpage.isForgetPasscodeButtonenabled(), "Forget passcode button Enabled");
	}

	@Then("user click on forget passcode button")
	public void user_click_on_forget_passcode_button() {
		loginpage.clickOnForgetPasscodeButton();
	}

	@Then("user click on back button on forget passcode option")
	public void user_click_on_back_button_on_forget_passcode_option() {
		loginpage.clickOnBackButtonOnForgetPasscodeOption();
	}

	@Then("user verify the userpasscode url")
	public void user_verify_the_userpasscode_url() {
		loginpage.waituntilpagecompletelyloaded();
		String currentUrl = loginpage.getCurrentUrluserpasscode();
		assertEquals(currentUrl, normalizedBaseUrl + "user/passcode", "URL did not match expected user home");
	}

	Map<String, Boolean> menuHighlightStatus;

	@When("user fetches highlight status of {string} menu")
	public void user_fetch_Menu_Highlight_Status(String menuName) {
		menuHighlightStatus = loginpage.getMenuHighlightStatus(menuName);
	}

	@Then("user verifies {string} text is highlighted")
	public void user_verifyMenu_Text(String menuName) {
		assertTrue(menuHighlightStatus.get("textHighlighted"), menuName + " text is not highlighted");
	}

	@Then("user verifies {string} icon is highlighted")
	public void user_verify_MenuIcon(String menuName) {
		assertTrue(menuHighlightStatus.get("iconHighlighted"), menuName + " icon is not highlighted");
	}

	@Then("user verifies visual bar is present near {string}")
	public void user_verifyMenuBar(String menuName) {
		assertTrue(menuHighlightStatus.get("barPresent"), "Visual bar is not present near " + menuName);
	}

	@Then("user sees a valid welcome message")
	public void user_Sees_Welcome_Message() {
		assertTrue(loginpage.isValidWelcomeMessage(), "Welcome message is invalid or not found.");
	}

	@Then("user searches for mosip credentials")
	public void user_searche_For_Downloaded_MosipCredential() {
		loginpage.getTextonMosipCredential();
	}

	@Then("user verifies card search functionality")
	public void user_Verifies_CardSearch_Functionality() {
		loginpage.verifyCardSearchFunctionality();
	}

	@Then("user verifies cards are in horizontal order")
	public void user_verify_Cards_HorizontalOrder() {
		assertTrue(loginpage.areCardsInHorizontalOrder(), "Cards are not aligned horizontally");
	}

	@Then("user verifies profile dropdown options are visible")
	public void verifyProfileDropdownVisible() {
		assertTrue(loginpage.isProfileDropDownOptionsDisplayed(), "profile drop down options are visible");
	}

	@Then("user verifies {string} option is present in dropdown")
	public void verifyOptionInDropdown(String optionText) {
		assertTrue(loginpage.isProfileDrownOptionsPresent(optionText),
				"profile drop down options" + optionText + " is visible");
	}

	@And("user click on FAQ link")
	public void user_click_on_faq_link() {
		loginpage.clickonFAQLink();
	}

	@Then("user verify current url faq")
	public void user_verify_faq_url() {
		loginpage.waituntilpagecompletelyloaded();
		String currentUrl = loginpage.getCurrentUrlUserFAQ();
		assertEquals(currentUrl, normalizedBaseUrl + "user/faq", "URL did not match expected user home");
	}

	@Then("user verify current url issuer")
	public void user_verify_issueer_url() throws Exception {
		loginpage.waituntilpagecompletelyloaded();
		String currentUrl = loginpage.getCurrentUrlUserFAQ();
		assertEquals(currentUrl, normalizedBaseUrl + "user/faq", "URL did not match expected user home");
	}

	@Then("user click on collapse button")
	public void user_click_on_collpase_button() {
		loginpage.clickOnCollapseButton();
	}

	@And("user verify if home headings are displayed")
	public void user_verify_only_icons_visible() {
		assertTrue(loginpage.isHomeStringDisplayedAfterCollpase(),
				"After clicking on collpase button Home string is not visible");
	}

	@Then("user verify icons are visible")
	public void user_verify_icons_visible() {
		assertTrue(loginpage.isIconVisibleAfterCollpase(),
				"After clicking on collpase button icons are visble visible");
	}

	@Then("user click on collapse button again")
	public void user_click_on_collpase_button_again() {
		loginpage.clickOnCollapseButtonAgain();
	}

	@Then("user enters the wrong passcode {string} to lessthan max failed attempts")
	public void user_enters_wrong_passcode_to_lessthan_max_failed_attempts(String wrongPasscode) throws Exception {
		int noOfTimes = BaseTest.getWalletPasscodeSettings().get("maxFailedAttempts") - 1;

		for (int i = 1; i <= noOfTimes; i++) {
			loginpage.enterPasscode(wrongPasscode);
			loginpage.clickonSubmitButton();
			assertTrue(loginpage.isMismatchErroDisplayed(), "After attempt " + i + ": Error Message is not displayed");
			assertTrue(!loginpage.isSubmitButtonEnabledFast(), "After attempt " + i + ": Submit button disabled");
		}
	}

	@Then("user enters the wrong passcode {string} to lessthan max failed attempts before perm lock")
	public void user_enters_wrong_passcode_to_lessthan_max_failed_beforeperm_attempts(String wrongPasscode)
			throws Exception {
		int noOfTimes = BaseTest.getWalletPasscodeSettings().get("maxFailedAttempts") - 1;

		for (int i = 1; i <= noOfTimes; i++) {
			loginpage.enterPasscode(wrongPasscode);
			loginpage.clickonSubmitButton();
			assertTrue(!loginpage.isSubmitButtonEnabledFast(), "After attempt " + i + ": Submit button disabled");
		}
	}

	@Then("user enters the wrong passcode {string} for max failed attempts")
	public void user_enters_wrong_passcode_for_max_failed_attempts(String wrongPasscode) throws Exception {
		logger.info("Maximum no.of attempts:" + BaseTest.getWalletPasscodeSettings().get("maxFailedAttempts"));

		int maxNoOfTimes = BaseTest.getWalletPasscodeSettings().get("maxFailedAttempts");

		for (int i = 1; i <= maxNoOfTimes; i++) {
			loginpage.enterPasscode(wrongPasscode);
			loginpage.clickonSubmitButton();

			if (i < maxNoOfTimes) {
				assertTrue(loginpage.isMismatchErroDisplayed(),
						"After attempt " + i + ": Mismatch error not displayed");
				assertTrue(!loginpage.isSubmitButtonEnabledFast(),
						"After attempt " + i + ": Submit button should be enabled");
			} else {
				assertTrue(loginpage.isTempLockErroDisplayed(),
						"After attempt " + i + ": Temp lock error not displayed");
				assertFalse(loginpage.isSubmitButtonEnabledFast(),
						"After attempt " + i + ": Submit button should be disabled");
				assertTrue(loginpage.isPasscodeInputDisabled(),
						"After attempt " + i + ": Pass code not disabled after max fail");
			}
		}
	}

	@Then("user wait for temporary lock to expire")
	public void user_wait_for_tempory_lock_to_expire() throws InterruptedException, Exception {
		int lockSeconds = BaseTest.getWalletPasscodeSettings().get("retryBlockedUntil") * 60;
		logger.info("Temp Lock time:" + lockSeconds);

		BasePage.waitForSeconds(driver, Math.max(lockSeconds - 10, 1));
		driver.navigate().refresh();
		assertTrue(!loginpage.isSubmitButtonEnabledFast(), "Before temporaty lock Expire Submit button is enabled");
		driver.navigate().refresh();
		loginpage.waitUntilPasscodeEnabled(BasePage.getConfiguredWaitTimeInSeconds());
		assertTrue(!loginpage.isPasscodeInputDisabled(), "Passocde button is not enabled after temporaty lock Expire");
	}

	@Then("user verify the warning message before to permanent lock")
	public void user_verify_warning_message_before_permanent_lock() throws InterruptedException {
		assertTrue(loginpage.isPermLockWarningMsgDisplayed(), "Warning message before temp lock is not displayed");
	}

	@Then("user verify the wallet permanently locked")
	public void user_verify_the_wallet_permanently_locked() throws InterruptedException {
		assertTrue(!loginpage.isPermLockMsgDisplayed(), "Permanent lock message is not displayed");
	}

}