package stepdefinitions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.testng.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Properties;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;

import base.BasePage;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import pages.Loginpage;
import pages.MosipCredentials;
import pages.SetNetwork;
import utils.BaseTest;
import utils.ExtentReportManager;
import utils.GlobelConstants;
import utils.HttpUtils;
import utils.ScreenshotUtil;
import utils.BaseTest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StepDefOIDCLogin {

	public WebDriver driver;
	BaseTest baseTest;
	private MosipCredentials mosipCredentials;
	private SetNetwork setNetwork;
	ExtentTest test = ExtentReportManager.getTest();
	private GlobelConstants globelConstants;
	private Loginpage loginpage;

	private String sessionCookieName = "SESSION";
	private String sessionCookieValue;
	String baseUrl = BaseTest.url;
	String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
	private static final Logger logger = LoggerFactory.getLogger(StepDefOIDCLogin.class);

	public static void updateConfigProperty(String key, String value) throws IOException {
		File file = new File("src/test/resources/config.properties");
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
		try {
			boolean isDisplayed = loginpage.isgoogleButtonDisplayed();
			assertTrue(isDisplayed, "google Login Button on Home page");
			test.log(Status.PASS, "User successfully verified that google Login Button on Home page");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
		driver.manage().deleteAllCookies();

		Cookie myCookie = new Cookie.Builder(sessionCookieName, sessionCookieValue).path("/v1/mimoto").isHttpOnly(true)
				.isSecure(true).build();
		// BasePage.waitForSeconds(driver, 10);
		driver.manage().addCookie(myCookie);
		// BasePage.waitForSeconds(driver, 10);
		driver.navigate().refresh();
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
		try {
			boolean isDisplayed = loginpage.isToggleAppearinPlainTextFormat();
			assertTrue(isDisplayed, "Toggle button displayed text in plain test format");
			test.log(Status.PASS, "User successfully verified that Toggle button displayed text in plain test format");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user toggles the password visibility using keyboard and verifies it")
	public void user_toggle_with_keyboard_and_verify() {
		try {
			loginpage.focusToggleButtonWithKeyboard();
			boolean isDisplayed = loginpage.isToggleAppearinPlainTextFormat();
			assertTrue(isDisplayed, "Password should be visible in plain text format");
			test.log(Status.PASS, "Verified password is shown in plain text using keyboard interaction");
		} catch (Exception e) {
			test.log(Status.FAIL, "Keyboard toggle failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "KeyboardToggleFailure");
			throw e;
		}
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
		try {
			boolean isEnabled = loginpage.isSubmitButtonEnabled();
			assertTrue(isEnabled, "Submit button enabled");
			test.log(Status.PASS, "User successfully verified Submit button enabled");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Submit check failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verifies the submit button is not enabled")
	public void user_verifies_submit_button_disabled() {
		try {
			boolean isEnabled = loginpage.isSubmitButtonEnabled();
			assertFalse(isEnabled, "Submit button should be disabled");
			test.log(Status.PASS, "User successfully verified Submit button is disabled");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Submit button disabled check failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click on submit button")
	public void user_click_on_submit_button() throws Exception {
		loginpage.clickonSubmitButton();
	}

	@Then("user verify error message for mismatch")
	public void user_verify_error_message_for_mismatch() throws Exception {
		loginpage.isMismatchErroDisplayed();
	}

	@Then("user prints error message for mismatch")
	public void user_prints_error_message_for_mismatch() throws Exception {
		loginpage.getMismatchErrorText();
	}

	@Then("user prints verify message for mismatch")
	public void user_verify_error_message_mismatch() throws Exception {

		try {

			assertEquals(loginpage.getMismatchErrorText().trim(), globelConstants.MisMatchError);
			test.log(Status.PASS,
					"Passcodes do not match. Please ensure both passcode fields match exactly. Re-enter and try again.");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click on logout button")
	public void user_click_on_logout_button() {
		loginpage.clickonLogout();
	}

	@Then("user verify confirmation passcode option for secondtime login")
	public void user_verify_confirmation_passcode_option_missing() {
		try {
			boolean isVisile = loginpage.confirmPasscodeSecondTimeLogin();
			assertTrue(isVisile, "confirm Password Shold Not Appear");
			test.log(Status.PASS, "confirm Password Shold Not Appeared");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "confirm Password check failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("User click on cards button")
	public void clickonAddCardsButton() {
		loginpage.clickOnElement(driver, By.xpath("//button[@data-testid='btn-add-cards']"));
	}

	@Then("User click on cards button for mobile")
	public void clickonAddCardsButtonforMobile() {
		loginpage.clickOnElement(driver, By.xpath("(//button[@data-testid='btn-add-cards'])[2]"));
	}

	@Then("user verify current url userhome")
	public void user_verify_current_url() {
		try {
			loginpage.waituntilpagecompletelyloaded();
			String currentUrl = loginpage.getCurrentUrlUserHome();
			assertEquals(currentUrl, normalizedBaseUrl + "user/home", "URL did not match expected user home");
			test.log(Status.PASS, "User successfully redirected to user home page");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify profile details displayed")
	public void user_verify_profile_details_displayed() throws InterruptedException {
		try {
			boolean isVisile = loginpage.isProfileDetailsDisplayed();
			assertTrue(isVisile, "Profile details displayed");
			test.log(Status.PASS, "User successfully verified Profile details disabled ");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Profile details displayed check failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify profile image displayed")
	public void user_verify_profile_image_displayed() throws InterruptedException {
		try {
			boolean isVisile = loginpage.isProfileImageDisplayed();
			assertTrue(isVisile, "Profile image displayed");
			test.log(Status.PASS, "User successfully verified Profile image disabled ");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Profile details displayed check failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}

	}

	@Then("user verify profile name displayed")
	public void user_verify_profile_name_displayed() throws InterruptedException {
		try {
			boolean isVisile = loginpage.isProfileNameDisplayed();
			assertTrue(isVisile, "Profile name displayed");
			test.log(Status.PASS, "User successfully verified Profile name disabled ");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Profile details displayed check failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify dropdown displayed")
	public void user_verify_profile_dropdown_displayed() throws InterruptedException {
		try {
			boolean isVisile = loginpage.isProfileDropDownDisplayed();
			assertTrue(isVisile, "Profile dropdown displayed");
			test.log(Status.PASS, "User successfully verified Profile dropdown disabled ");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Profile details displayed check failed: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click on dropdown box for profile")
	public void user_click_on_profile_dropdown() throws InterruptedException {
		loginpage.clickOnProfileDropDown();

	}

	@Then("user click on dropdown box for profile again")
	public void user_click_on_profile_dropdown_again() throws InterruptedException {
		loginpage.clickOnProfileDropDownDisplayedAgain();
	}

	@Then("user verify home button")
	public void user_verify_home_button() throws InterruptedException {

		try {
			boolean isDisplayed = loginpage.isHomeButtonDisplayed();
			assertTrue(isDisplayed, "Home button on home page Displayed");
			test.log(Status.PASS, "User successfully verified Home button on home page Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify stored cards button")
	public void user_verify_storedcredentials_button() throws InterruptedException {
		try {
			boolean isDisplayed = loginpage.isVerifyStoredCredentialsButtonDisplayed();
			assertTrue(isDisplayed, "Stored cards button on home page Displayed");
			test.log(Status.PASS, "User successfully verified Stored cards  on home page Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}

	}

	@Then("user click on stored credentials button")
	public void user_click_on_stored_credentils_button() throws InterruptedException {
		loginpage.clickonStoredCredentialsButton();
	}

	@Then("user verify current url usercredentials")
	public void user_verify_current_url_credentials() {
		try {
			loginpage.waituntilpagecompletelyloaded();
			String currentUrl = loginpage.getCurrentUrlUserCredentials();
			assertEquals(currentUrl, normalizedBaseUrl + "user/credentials", "URL did not match expected user home");
			test.log(Status.PASS, "User successfully redirected to user credentials page");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify collapse button")
	public void user_verify_collapse_button() throws InterruptedException {
		try {
			boolean isDisplayed = loginpage.isCollapseButtonDisplayed();
			assertTrue(isDisplayed, "Collapse button on home page Displayed");
			test.log(Status.PASS, "User successfully verified Collapse on home page Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}

	}

	@Then("user verify no cards stored message")
	public void user_verify_no_cardsstoredmessage() throws InterruptedException {
		try {
			boolean isDisplayed = loginpage.isnoCardsAddedMessageDisplayed();
			assertTrue(isDisplayed, "no cards message displayed");
			test.log(Status.PASS, "User successfully verified no cards message Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify substring when no cards stored")
	public void user_verify_substring_when_nocards_stored() throws InterruptedException {
		try {
			boolean isDisplayed = loginpage.isnoCardsAddedMessageSubstringMessage();
			assertTrue(isDisplayed, "Substring for no cards message displayed");
			test.log(Status.PASS, "User successfully verified Substring for no cards message Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user toggles the password visibility using keyboard")
	public void user_toggle_with_keyboard() {
		loginpage.focusToggleButtonWithKeyboard();
	}

	@Then("user selects profile option")
	public void user_selects_profile_option() {
		loginpage.clickOnProfileOption();
	}

	@Then("user selects profile option for mobile")
	public void user_selects_profile_option_for_mobileView() {
		loginpage.clickOnProfileOptionMobileView();
	}

	@Then("user click on logout button for mobile")
	public void user_selects_logout_option_for_mobileView() {
		loginpage.clickOnLogoutOptionMobileView();
	}

	@Then("user click on FAQ button for mobile")
	public void user_selects_faq_option_for_mobileView() {
		loginpage.clickOnFaqOptionMobileView();
	}

	@Then("user verify My Profile Text")
	public void user_verify_MyProfile_Text() {
		try {
			String ProfileText = loginpage.getTextMyProfile();
			assertEquals(ProfileText, globelConstants.ProfileText);
			test.log(Status.PASS,
					"Passcodes do not match. Please ensure both passcode fields match exactly. Re-enter and try again.");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify back arrow button")
	public void user_verify_back_arrow_button() {
		try {
			boolean isDisplayed = loginpage.isArrowButtonDisplayed();
			assertTrue(isDisplayed, "Back arrow button on profile Displayed");
			test.log(Status.PASS, "User successfully verified Back arrow button on profile Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify home arrow button")
	public void user_verify_home_arrow_button() {
		try {
			boolean isDisplayed = loginpage.isHomeArrowButtonDisplayed();
			assertTrue(isDisplayed, "Home arrow button on profile Displayed");
			test.log(Status.PASS, "User successfully verified Home arrow button on profile Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify label fullname")
	public void user_verify_label_fullname() {
		try {
			boolean isDisplayed = loginpage.isLabelFullnameDisplayed();
			assertTrue(isDisplayed, "Label fullname Displayed");
			test.log(Status.PASS, "User successfully verified Label fullname Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify label fullname value")
	public void user_verify_label_fullname_value() {
		try {
			boolean isDisplayed = loginpage.isLabelFullnameValueDisplayed();
			assertTrue(isDisplayed, "Label fullname value Displayed");
			test.log(Status.PASS, "User successfully verified Label fullname value Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify label fullname info")
	public void user_verify_label_fullname_info() {
		try {
			boolean isDisplayed = loginpage.isLabelFullnameInfoDisplayed();
			assertTrue(isDisplayed, "Label fullname info Displayed");
			test.log(Status.PASS, "User successfully verified Label fullname info Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify label fullname info value")
	public void user_verify_label_fullname_info_value_value() {
		try {
			boolean isDisplayed = loginpage.isLabelFullnameInfoValueDisplayed();
			assertTrue(isDisplayed, "Label fullname info value Displayed");
			test.log(Status.PASS, "User successfully verified Label fullname info value value Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
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
		try {
			boolean isDisplayed = loginpage.isForgetPasscodeOptionDisplayed();
			assertTrue(isDisplayed, "Forget passcode option Displayed");
			test.log(Status.PASS, "User successfully verified Forget passcode option Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click on forget passcode option")
	public void user_click_on_forget_passcode_option() {
		loginpage.clickOnForgetPasscodeOption();
	}

	@Then("user verify the title of the window")
	public void user_verify_the_title_of_the_window() {
		try {
			String windowTitle = loginpage.getTitleOfTheForgetPasswordWindow();
			assertEquals(windowTitle, globelConstants.windowTitle);
			test.log(Status.PASS, "Title of the forget Passcode window");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Text verification failed: " + e.getMessage());
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify the current url userresetpasscode")
	public void user_verify_the_current_url_userresetpasscode() {

		try {
			loginpage.waituntilpagecompletelyloaded();
			String currentUrl = loginpage.getCurrentUrluserresetpasscode();
			assertEquals(currentUrl, normalizedBaseUrl + "user/reset-passcode",
					"URL did not match expected user reset passcode");
			test.log(Status.PASS, "User successfully redirected to user reset pass code page");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}

	}

	@Then("user verify the back button")
	public void user_verify_the_back_button() {

		try {
			boolean isDisplayed = loginpage.isbackButtonDisplayedOnForgetpasscode();
			assertTrue(isDisplayed, "Back button on Forget passcode option Displayed");
			test.log(Status.PASS, "User successfully verified Back button on Forget passcode option Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify passcode reset info1 available")
	public void user_verify_passcode_reset_info1_available() {

		try {
			boolean isDisplayed = loginpage.isInfoTextForgetPasswordDisplayed();
			assertTrue(isDisplayed, "User info1 for forget passcode button Displayed");
			test.log(Status.PASS, "User successfully User info1 for forget passcode button Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify user info on resetpasscode available")
	public void user_verify_user_info_on_resetpasscode_available() {

		try {
			boolean isDisplayed = loginpage.isResetUserInfoOnForgetPasswordDisplayed();
			assertTrue(isDisplayed, "User info for forget passcode button Displayed");
			test.log(Status.PASS, "User successfully User info for forget passcode button Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}

	}

	@Then("user verify forget passcode button")
	public void user_verify_forget_passcode_button() {

		try {
			boolean isDisplayed = loginpage.isForgetPasscodeButtonDisplayed();
			assertTrue(isDisplayed, "Forget passcode button Displayed");
			test.log(Status.PASS, "User successfully verified Forget passcode button Displayed");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}

	}

	@Then("user verify forget passcode button enabled")
	public void user_verify_forget_passcode_button_enabled() {
		try {
			boolean isEnabled = loginpage.isForgetPasscodeButtonenabled();
			assertTrue(isEnabled, "Forget passcode button Enabled");
			test.log(Status.PASS, "User successfully verified Forget passcode button Enabled");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}

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
		try {
			loginpage.waituntilpagecompletelyloaded();
			String currentUrl = loginpage.getCurrentUrluserpasscode();
			assertEquals(currentUrl, normalizedBaseUrl + "user/passcode", "URL did not match expected user home");
			test.log(Status.PASS, "User successfully redirected to user home page");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	Map<String, Boolean> menuHighlightStatus;

	@When("user fetches highlight status of {string} menu")
	public void user_fetch_Menu_Highlight_Status(String menuName) {
		menuHighlightStatus = loginpage.getMenuHighlightStatus(menuName);
	}

	@Then("user verifies {string} text is highlighted")
	public void user_verifyMenu_Text(String menuName) {
		try {
			assertTrue(menuHighlightStatus.get("textHighlighted"), menuName + " text is not highlighted");
			test.log(Status.PASS, "User successfully verified " + menuName + " text is highlighted");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Text highlight assertion failed: " + e.getMessage());
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verifies {string} icon is highlighted")
	public void user_verify_MenuIcon(String menuName) {
		try {
			assertTrue(menuHighlightStatus.get("iconHighlighted"), menuName + " icon is not highlighted");
			test.log(Status.PASS, "User successfully verified " + menuName + " icon is highlighted");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Icon highlight assertion failed: " + e.getMessage());
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verifies visual bar is present near {string}")
	public void user_verifyMenuBar(String menuName) {
		try {
			assertTrue(menuHighlightStatus.get("barPresent"), "Visual bar is not present near " + menuName);
			test.log(Status.PASS, "User successfully verified visual bar near " + menuName);
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Visual bar assertion failed: " + e.getMessage());
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user sees a valid welcome message")
	public void user_Sees_Welcome_Message() {

		try {
			assertTrue(loginpage.isValidWelcomeMessage(), "Welcome message is invalid or not found.");
			test.log(Status.PASS, "User successfully verified welcome message");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
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
		{
			try {
				boolean isDisplayed = loginpage.isProfileDropDownOptionsDisplayed();
				assertTrue(isDisplayed, "profile drop down options are visible");
				test.log(Status.PASS, "User successfully verified that profile drop down options are Displayed");
			} catch (AssertionError | NoSuchElementException e) {
				test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
				test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
				ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
				throw e;
			}
		}

	}

	@Then("user verifies {string} option is present in dropdown")
	public void verifyOptionInDropdown(String optionText) {
		try {
			boolean isDisplayed = loginpage.isProfileDrownOptionsPresent(optionText);
			assertTrue(isDisplayed, "profile drop down options" + optionText + " is visible");
			test.log(Status.PASS,
					"User successfully verified that profile drop down options" + optionText + "is visible");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verifies {string} option is present in dropdown for mobile")
	public void verifyOptionInDropdownForMobile(String optionText) {
		try {
			boolean isDisplayed = loginpage.isMobileMenuOptionPresent(optionText);
			assertTrue(isDisplayed, "profile drop down options" + optionText + " is visible");
			test.log(Status.PASS,
					"User successfully verified that profile drop down options" + optionText + "is visible");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@And("user click on FAQ link")
	public void user_click_on_faq_link() {
		loginpage.clickonFAQLink();

	}

	@Then("user verify current url faq")
	public void user_verify_faq_url() {
		try {
			loginpage.waituntilpagecompletelyloaded();
			String currentUrl = loginpage.getCurrentUrlUserFAQ();
			assertEquals(currentUrl, normalizedBaseUrl + "user/faq", "URL did not match expected user home");
			test.log(Status.PASS, "User successfully redirected to user faq page");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify current url issuer")
	public void user_verify_issueer_url() throws Exception {
		try {
			loginpage.waituntilpagecompletelyloaded();
			String currentUrl = loginpage.getCurrentUrlUserFAQ();
			assertEquals(currentUrl, normalizedBaseUrl + "user/faq", "URL did not match expected user home");
			test.log(Status.PASS, "User successfully redirected to user faq page");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click on collapse button")
	public void user_click_on_collpase_button() {

		loginpage.clickOnCollapseButton();

	}

	@And("user verify if home headings are displayed")
	public void user_verify_only_icons_visible() {
		try {
			boolean isDisplayed = loginpage.isHomeStringDisplayedAfterCollpase();
			assertTrue(isDisplayed, "After clicking on collpase button Home string is not visible");
			test.log(Status.PASS,
					"User successfully verified that After clicking on collpase button Home string is not visible");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user verify icons are visible")
	public void user_verify_icons_visible() {
		try {
			boolean isDisplayed = loginpage.isIconVisibleAfterCollpase();
			assertTrue(isDisplayed, "After clicking on collpase button icons are visble visible");
			test.log(Status.PASS,
					"User successfully verified that After clicking on collpase button icons are visible visible");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click on collapse button again")
	public void user_click_on_collpase_button_again() {
		loginpage.clickOnCollapseButtonAgain();
	}

	@Then("user enters the wrong passcode {string} to lessthan max failed attempts")
	public void user_enters_wrong_passcode_to_lessthan_max_failed_attempts(String wrongPasscode) throws Exception {
		// Get maxFailedAttempts from actuator and subtract 1
		int noOfTimes = BaseTest.getWalletPasscodeSettings().get("maxFailedAttempts") - 1;

		for (int i = 1; i <= noOfTimes; i++) {
			loginpage.enterPasscode(wrongPasscode);
			loginpage.clickonSubmitButton();
			assertTrue(loginpage.isMismatchErroDisplayed(), "After attempt " + i + ": Error Message is not displayed");
			assertTrue(!loginpage.isSubmitButtonEnabled(), "After attempt " + i + ": Submit button disabled");
		}
	}

	@Then("user enters the wrong passcode {string} to lessthan max failed attempts before perm lock")
	public void user_enters_wrong_passcode_to_lessthan_max_failed_beforeperm_attempts(String wrongPasscode)
			throws Exception {
		// Get maxFailedAttempts from actuator and subtract 1
		int noOfTimes = BaseTest.getWalletPasscodeSettings().get("maxFailedAttempts") - 1;

		for (int i = 1; i <= noOfTimes; i++) {
			loginpage.enterPasscode(wrongPasscode);
			loginpage.clickonSubmitButton();
			assertTrue(!loginpage.isSubmitButtonEnabled(), "After attempt " + i + ": Submit button disabled");
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
				assertTrue(!loginpage.isSubmitButtonEnabled(),
						"After attempt " + i + ": Submit button should be enabled");
			} else {
				assertTrue(loginpage.isTempLockErroDisplayed(),
						"After attempt " + i + ": Temp lock error not displayed");
				assertFalse(loginpage.isSubmitButtonEnabled(),
						"After attempt " + i + ": Submit button should be disabled");
				assertTrue(loginpage.isPasscodeInputDisabled(),
						"After attempt " + i + ": Pass code not disabled after max fail");
			}
		}
	}

	@Then("user wait for temporary lock to expire")
	public void user_wait_for_tempory_lock_to_expire() throws InterruptedException, Exception {
		logger.info("Temp Lock time:" + BaseTest.getWalletPasscodeSettings().get("retryBlockedUntil") * 60);

		BasePage.waitForSeconds(driver, (BaseTest.getWalletPasscodeSettings().get("retryBlockedUntil") * 60) - 10);
		driver.navigate().refresh();
		assertTrue(!loginpage.isSubmitButtonEnabled(), "Before temporaty lock Expire Submit button is enabled");
		BasePage.waitForSeconds(driver, BaseTest.getWalletPasscodeSettings().get("retryBlockedUntil") * 60);
		driver.navigate().refresh();
		loginpage.waitUntilPasscodeEnabled();
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

	@Then("user click on hamburger menu from user account")
	public void user_click_on_hamburger_menu() {
		loginpage.clickOnHamburgerMenu();
	}

	@Then("user verify menu option on downloaded cards")
	public void user_verify_menu_option_on_downloaded_cards() {
		try {
			assertTrue(loginpage.isDownloadedCardMenubuttonDisplayed(), "Menu button is not displayed on stored cards");
			test.log(Status.PASS, "User successfully verified that Menu button is displayed on stored cards");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click menu option on downloaded cards")
	public void user_click_menu_option_on_downloaded_cards() {
		loginpage.clickOnDownloadedCardMenubutton();
	}

	@Then("user click view card option")
	public void user_click_view_card_option() {
		loginpage.clickOnViewCardMenubutton();
	}

	@Then("user verify cards details from view option")
	public void user_verify_cards_details_from_view_option() {
		try {
			assertTrue(loginpage.isDownloadedCardViewDisplayed(), "Card details are not displayed from view option");
			test.log(Status.PASS, "User successfully verified that ard details are displayed from view option");
		} catch (AssertionError | NoSuchElementException e) {
			test.log(Status.FAIL, "Assertion/Element error: " + e.getMessage());
			test.log(Status.FAIL, ExceptionUtils.getStackTrace(e));
			ScreenshotUtil.attachScreenshot(driver, "FailureScreenshot");
			throw e;
		}
	}

	@Then("user click view card back option")
	public void user_click_view_back_card_option() {
		loginpage.clickOnViewCardBackbutton();
	}

	@Then("user click on delete card option")
	public void user_click_delete_card_option() {
		loginpage.clickOnDeleteCardMenubutton();
	}

	@Then("user click on confirm delete card option")
	public void user_click_confirm_delete_card_option() {
		loginpage.clickOnConfirmDeleteCardOption();
	}

	@Then("user click on download card option")
	public void user_click_on_download_card_option() {
		loginpage.clickOnDownloadCardMenubutton();
	}

	@Then("user click on download card option from view page")
	public void user_click_on_download_card_option_from_view_page() {
		loginpage.clickOnDownloadCardFromViewbutton();
	}

	@Then("user click on cancel delete card option")
	public void user_click_on_cancel_delete_card_option() {
		loginpage.clickOnCancelDeleteCardOption();
	}
}
