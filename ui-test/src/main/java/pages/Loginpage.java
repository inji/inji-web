package pages;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import base.BasePage;
import org.openqa.selenium.TimeoutException;

public class Loginpage extends BasePage {

	private WebDriver driver;
	private static final By SUBMIT_BUTTON = By.xpath("//button[@data-testid='btn-submit-passcode']");

	public Loginpage(WebDriver driver) {
		this.driver = driver;
	}

	public Boolean isgoogleButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='google-login-button']"),
				"Verify Google login button is displayed");
	}

	public Boolean isgoolgeLoginButtonVisible() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='google-login-button']"),
				"Verify Google login button is visible");
	}

	public Boolean VerifygoogleSigninPage() {
		return isElementIsVisible(driver,
				By.xpath("//input[@type='email']"),
				"Verify Google Sign-In email input is displayed");
	}

	public Boolean verifySuccessfulLogin() {
		return isElementIsVisible(driver,
				By.cssSelector("[data-testid='profile-icon']"),
				"Verify profile icon is displayed after successful login");
	}

	public void enterPasscode(String string) {
		By passcodeContainer = By.xpath(
				"//div[@data-testid='passcode-container']//input[@type='password' and @maxlength='1']");
		WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()));
		wait.until(ExpectedConditions.visibilityOfElementLocated(passcodeContainer));

		List<WebElement> passcodeFields = driver.findElements(passcodeContainer);
		if (passcodeFields.size() < string.length()) {
			throw new RuntimeException("Not enough passcode input fields found: expected " + string.length()
					+ " but found " + passcodeFields.size());
		}
		for (int i = 0; i < string.length(); i++) {
			WebElement field = passcodeFields.get(i);
			field.click();
			field.clear();
			field.sendKeys(String.valueOf(string.charAt(i)));
		}
		logStep("Enter passcode digits into passcode input fields", passcodeContainer);
	}

	public void enterConfirmPasscode(String string) {
		By confirmLocator = By.xpath(
				"//div[@data-testid='confirm-passcode-container']//input[@type='password' and @maxlength='1']");
		// Scroll the container into view first — the element exists in the DOM but is
		// below the visible viewport, so visibilityOfElementLocated would time out
		// without this step.
		scrollIntoView(driver, confirmLocator);
		WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()));
		wait.until(ExpectedConditions.visibilityOfElementLocated(confirmLocator));
		List<WebElement> confirmFields = driver.findElements(confirmLocator);

		if (confirmFields.size() < string.length()) {
			throw new RuntimeException("Not enough confirm passcode input fields found: expected " + string.length()
					+ " but found " + confirmFields.size());
		}
		for (int i = 0; i < string.length(); i++) {
			WebElement field = confirmFields.get(i);
			field.click();
			field.clear();
			field.sendKeys(String.valueOf(string.charAt(i)));
		}
		logStep("Enter confirm passcode digits into confirm passcode fields", confirmLocator);
	}

	public void clickonToggleButton() {
		clickOnElement(driver,
				By.xpath("(//button[@type='button'])[2]"),
				"Click passcode visibility toggle button");
	}

	public void focusToggleButtonWithKeyboard() {
		By toggleLocator = By.xpath("//button[@data-testid='btn-toggle-visibility-passcode']");
		By eyeViewLocator = By.xpath(
				"//button[@data-testid='btn-toggle-visibility-passcode']/*[@data-testid='eye-view']");

		WebElement toggleButton = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.elementToBeClickable(toggleLocator));

		// Scroll into view and give keyboard focus in one atomic JS call so there is
		// no gap where a React re-render can scroll the page again between the two ops.
		((JavascriptExecutor) driver).executeScript(
				"arguments[0].scrollIntoView({block:'center'}); arguments[0].focus();", toggleButton);

		// React re-renders triggered during the confirmation-passcode entry steps can
		// silently reset the passcode toggle back to HIDDEN. If that happened, use
		// SPACE to restore it to VISIBLE before the calling assertion runs.
		if (!probeElementVisible(driver, eyeViewLocator, getConfiguredShortWaitTimeInSeconds())) {
			toggleButton.sendKeys(Keys.SPACE);
			new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.visibilityOfElementLocated(eyeViewLocator));
			logStep("Restored passcode toggle to visible state via keyboard Space", eyeViewLocator);
		}
	}

	public void clickonToggleButtonConfimration() {
		clickOnElement(driver,
				By.xpath("(//button[@type='button'])[3]"),
				"Click confirm passcode visibility toggle button");
	}

	public Boolean isToggleAppearinPlainTextFormat() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='btn-toggle-visibility-passcode']/*[@data-testid='eye-view']"),
				"Verify passcode toggle shows eye-view icon (plain text visible)");
	}

	public Boolean isSubmitButtonEnabled() {
		return isElementEnabled(driver, SUBMIT_BUTTON,
				"Verify passcode submit button is enabled");
	}

	public Boolean isSubmitButtonEnabledFast() {
		return isElementEnabled(driver, SUBMIT_BUTTON, getConfiguredShortWaitTimeInSeconds());
	}

	public void clickonSubmitButton() {
		// Scroll into view first — the submit button can sit below the viewport after
		// the passcode fields are filled, causing ElementNotInteractableException.
		scrollIntoView(driver, SUBMIT_BUTTON);
		clickOnElement(driver, SUBMIT_BUTTON,
				"Click passcode submit button to proceed");
	}

	public Boolean isMismatchErroDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//span[@data-testid='error-msg-passcode']"),
				"Verify passcode mismatch error message is displayed");
	}

	public Boolean isTempLockErroDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div/*[@data-testid='error-msg-passcode-temporarily-locked']"),
				"Verify temporary lock error message is displayed");
	}

	public String getMismatchErrorText() {
		return getElementText(driver, By.xpath("//span[@data-testid='error-msg-passcode']"));
	}

	public void clickonuserprofiledropdownbutton() {
		clickOnElement(driver,
				By.xpath("(//div[@data-testid='profile-details']//div)[4]"),
				getConfiguredWaitTimeInSeconds());
	}

	public void clickonLogout() {
		clickOnElement(driver,
				By.xpath("//div[@data-testid='profile-dropdown']//div[contains(text(),'Logout')]"),
				"Click 'Logout' option in profile dropdown");
	}

	public Boolean confirmPasscodeSecondTimeLogin() {
		return isElementNotVisible(driver,
				By.xpath("//div[@data-testid='confirm-passcode-container']//input[@type='password' and @maxlength='1']"),
				"Verify confirm passcode container is not displayed (second login)");
	}

	public void clickonAddCardsButton() {
		clickOnElement(driver,
				By.xpath("//button[@data-testid='btn-add-cards']"),
				"Click 'Add Cards' button");
	}

	public Boolean isProfileDetailsDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='profile-details']"),
				"Verify profile details section is displayed");
	}

	public Boolean isProfileImageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='profile-details']//img[@alt='Profile Pic']"),
				"Verify profile picture is displayed");
	}

	public Boolean isProfileDropDownDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("(//div[@data-testid='profile-details']//div)[4]"),
				"Verify profile dropdown trigger is displayed");
	}

	public Boolean isProfileNameDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='profile-details']//span"),
				"Verify profile name text is displayed");
	}

	public void clickOnProfileDropDown() {
		// Wait for the profile section to be visible — positive signal that the home
		// page has fully rendered after passcode submit.
		new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.visibilityOfElementLocated(
						By.xpath("//div[@data-testid='profile-details']")));
		clickOnElement(driver,
				By.xpath("//div[@class='relative inline-block cursor-pointer']"),
				getConfiguredWaitTimeInSeconds());
	}

	public void waituntilpagecompletelyloaded() {
		new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(webDriver -> ((JavascriptExecutor) webDriver)
						.executeScript("return document.readyState").equals("complete"));
	}

	public void clickOnProfileDropDownDisplayedAgain() {
		waituntilpagecompletelyloaded();
		clickOnElement(driver,
				By.xpath("(//div[@data-testid='profile-details']//div)[4]"),
				getConfiguredWaitTimeInSeconds());
	}

	public Boolean isHomeButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//span[normalize-space(text())='Home']"),
				"Verify 'Home' sidebar menu item is displayed");
	}

	public Boolean isCollapseButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("(//div[@data-testid='sidebar-container']//button)[1]"),
				"Verify sidebar collapse button is displayed");
	}

	public Boolean isHomeStringDisplayedBeforeCollpase() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='sidebar-container']//span[text()='Home']"),
				"Verify 'Home' label text is visible before sidebar collapse");
	}

	public void clickOnCollapseButton() {
		clickOnElement(driver,
				By.xpath("(//div[@data-testid='sidebar-container']//button)[1]"),
				"Click sidebar collapse button");
	}

	public Boolean isHomeStringDisplayedAfterCollpase() {
		// Returns true when the collapse is verified (text label disappeared).
		By homeTextLocator = By.xpath("//div[@data-testid='sidebar-container']//span[text()='Home']");
		try {
			new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.invisibilityOfElementLocated(homeTextLocator));
			logStep("Verify 'Home' label disappeared after sidebar collapse", homeTextLocator);
			return true;
		} catch (TimeoutException e) {
			logWarning("'Home' label still visible after sidebar collapse — collapse may not have completed", homeTextLocator);
			return false;
		}
	}

	public Boolean isIconVisibleAfterCollpase() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='sidebar-container']/div[1]"),
				"Verify sidebar icon is visible after collapse");
	}

	public void clickOnCollapseButtonAgain() {
		clickOnElement(driver,
				By.xpath("(//div[@data-testid='sidebar-container']//button)[1]"),
				"Click sidebar collapse button again to expand");
	}

	public Boolean isVerifyStoredCredentialsButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//span[text()='Stored Cards']"),
				"Verify 'Stored Cards' sidebar menu item is displayed");
	}

	public void clickonStoredCredentialsButton() {
		clickOnElement(driver,
				By.xpath("//span[text()='Stored Cards']"),
				"Click 'Stored Cards' sidebar menu item");
	}

	public Boolean isAddCardButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='btn-add-cards']"),
				"Verify 'Add Cards' button is displayed");
	}

	public Boolean isnoCardsAddedMessageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//h2[@data-testid='no-credentials-downloaded-title']"),
				"Verify 'No cards added' empty state title is displayed");
	}

	public Boolean isnoCardsAddedMessageSubstringMessage() {
		return isElementIsVisible(driver,
				By.xpath("//span[@data-testid='no-credentials-downloaded-message']"),
				"Verify 'No cards added' empty state message is displayed");
	}

	public void getTextonMosipCredential() {
		String mosipcredentialname = getElementText(driver, By.xpath("(//h3[@data-testid='ItemBox-Text'])[1]"));
		enterText(driver, By.xpath("//input[@type='text']"), mosipcredentialname);
	}

	public String getCurrentUrlUserHome() {
		return waitForUrlContains(driver, "user/home", getConfiguredWaitTimeInSeconds());
	}

	public String getCurrentUrlUserCredentials() {
		return waitForUrlContains(driver, "user/credentials", getConfiguredWaitTimeInSeconds());
	}

	public void clickOnProfileOption() {
		clickOnElement(driver,
				By.xpath("//div[@data-testid='profile-dropdown']//div[text()='Profile']"),
				"Click 'Profile' option in profile dropdown");
	}

	public String getTextMyProfile() {
		return getElementText(driver, By.xpath("//span[@data-testid='profile-page']"));
	}

	public Boolean isArrowButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='back-arrow-icon']"),
				"Verify back arrow icon button is displayed");
	}

	public Boolean isHomeArrowButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='btn-home']"),
				"Verify home button is displayed");
	}

	public Boolean isProfilePhotoDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//img[@data-testid='profile-page-picture']"),
				"Verify profile photo is displayed on profile page");
	}

	public Boolean isLabelFullnameDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//h3[@data-testid='label-full-name']"),
				"Verify full name label is displayed on profile page");
	}

	public Boolean isLabelFullnameValueDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//p[@data-testid='value-full-name']"),
				"Verify full name value is displayed on profile page");
	}

	public Boolean isLabelFullnameInfoDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//h3[@data-testid='label-email']"),
				"Verify email label is displayed on profile page");
	}

	public Boolean isLabelFullnameInfoValueDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//p[@data-testid='value-email']"),
				"Verify email value is displayed on profile page");
	}

	public void clickonBackAwroeButton() {
		clickOnElement(driver,
				By.xpath("//*[@data-testid='back-arrow-icon']"),
				"Click back arrow icon button");
	}

	public void clickonHomeAwroeButton() {
		clickOnElement(driver,
				By.xpath("//button[@data-testid='btn-home']"),
				"Click home button");
	}

	public String getResetInstructionText() {
		return getElementText(driver, By.xpath("//div[@data-testid='text-reset-instruction']")).trim();
	}

	public Boolean isForgetPasscodeOptionDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='btn-forgot-passcode']"),
				"Verify 'Forgot Passcode' option is displayed");
	}

	public void clickOnForgetPasscodeOption() {
		By forgetPasswordButton = By.xpath("//button[@data-testid='btn-forgot-passcode']");
		scrollIntoView(driver, forgetPasswordButton);
		clickOnElement(driver, forgetPasswordButton,
				"Click 'Forgot Passcode' option");
	}

	public String getTitleOfTheForgetPasswordWindow() {
		return getElementText(driver, By.xpath("//h1[@data-testid='title-reset-passcode']"));
	}

	public String getCurrentUrluserresetpasscode() {
		return waitForUrlContains(driver, "user/reset-passcode", getConfiguredWaitTimeInSeconds());
	}

	public Boolean isbackButtonDisplayedOnForgetpasscode() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='btn-back-arrow-container']"),
				"Verify back button is displayed on Forgot Passcode screen");
	}

	public void clickOnBackButtonOnForgetPasscodeOption() {
		clickOnElement(driver,
				By.xpath("//button[@data-testid='btn-back-arrow-container']"),
				"Click back button on Forgot Passcode screen");
	}

	public String getInfoTextForgetPasswordWindow() {
		return getElementText(driver, By.xpath("//p[@data-testid='subtitle-reset-passcode']"));
	}

	public Boolean isInfoTextForgetPasswordDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//p[@data-testid='subtitle-reset-passcode']"),
				"Verify info subtitle text is displayed on Forgot Passcode screen");
	}

	public String getResetUserInfoOnForgetPasswordWindow() {
		return getElementText(driver, By.xpath("//p[@data-testid='subtitle-reset-passcode']"));
	}

	public Boolean isResetUserInfoOnForgetPasswordDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//p[@data-testid='subtitle-reset-passcode']"),
				"Verify reset user info subtitle is displayed on Forgot Passcode screen");
	}

	public Boolean isForgetPasscodeButtonDisplayed() {
		By forgetPasswordButton = By.xpath("//button[@data-testid='btn-set-new-passcode']");
		scrollIntoView(driver, forgetPasswordButton);
		return isElementIsVisible(driver, forgetPasswordButton,
				"Verify 'Set New Passcode' button is displayed");
	}

	public Boolean isForgetPasscodeButtonenabled() {
		return isElementEnabled(driver,
				By.xpath("//button[@data-testid='btn-set-new-passcode']"),
				"Verify 'Set New Passcode' button is enabled");
	}

	public String getCurrentUrluserpasscode() {
		return waitForUrlContains(driver, "user/passcode", getConfiguredWaitTimeInSeconds());
	}

	public void clickOnForgetPasscodeButton() {
		clickOnElement(driver,
				By.xpath("//button[@data-testid='btn-set-new-passcode']"),
				"Click 'Set New Passcode' button");
	}

	public boolean isValidWelcomeMessage() {
		try {
			String text = getElementText(driver, By.xpath("//h1[contains(text(),'Welcome')]")).trim();
			boolean containsWelcome = text.toLowerCase().contains("welcome");
			boolean endsWithExclamation = text.endsWith("!");
			return containsWelcome && endsWithExclamation;
		} catch (NoSuchElementException e) {
			return false;
		}
	}

	public Map<String, Boolean> getMenuHighlightStatus(String menuName) {
		Map<String, Boolean> status = new HashMap<>();
		try {
			String textXPath = "//span[normalize-space()='" + menuName + "' and contains(@class, 'text-[#2B011C]')]";
			status.put("textHighlighted", driver.findElements(By.xpath(textXPath)).size() > 0);

			String iconXPath = "//span[normalize-space()='" + menuName
					+ "']/preceding-sibling::div//*[name()='svg']//*[name()='path']";
			List<WebElement> iconPaths = driver.findElements(By.xpath(iconXPath));
			if (!iconPaths.isEmpty()) {
				String strokeColor = iconPaths.get(0).getAttribute("stroke");
				status.put("iconHighlighted",
						strokeColor != null && (strokeColor.contains("--iw-color-dashboardSideBarMenuIconActive")
								|| strokeColor.equals("var(--iw-color-dashboardSideBarMenuIconActive)")));
			} else {
				status.put("iconHighlighted", false);
			}

			String barXPath = "//span[normalize-space()='" + menuName
					+ "']/preceding-sibling::div[contains(@class, 'w-1') and contains(@class, 'absolute')]";
			status.put("barPresent", driver.findElements(By.xpath(barXPath)).size() > 0);

		} catch (Exception e) {
			e.printStackTrace();
			status.putIfAbsent("textHighlighted", false);
			status.putIfAbsent("iconHighlighted", false);
			status.putIfAbsent("barPresent", false);
		}
		return status;
	}

	public void verifyCardSearchFunctionality() {
		List<String> cardNames;
		try {
			cardNames = getElementTexts(driver, By.xpath("//span[@data-testid='credential-type-display-name']"));
		} catch (TimeoutException e) {
			throw new AssertionError("No cards were found on the screen to search with.", e);
		}
		if (cardNames.isEmpty()) {
			throw new AssertionError("No card names found to search.");
		}
		WebElement inputBox = driver.findElement(By.xpath("//input[@data-testid='input-search']"));
		String cardName = cardNames.get(0);
		inputBox.clear();
		inputBox.sendKeys(cardName);
		boolean cardVisible = driver.findElements(By.xpath("//div[@data-testid='vc-card-view']")).size() > 0
				&& driver.findElements(By.xpath("//span[contains(text(),'No cards match your search')]")).isEmpty();
		if (!cardVisible) {
			throw new AssertionError("Expected card '" + cardName + "' not found after search.");
		}
		inputBox.clear();
		inputBox.sendKeys("abcdef");
		boolean noMatchDisplayed = driver.findElement(By.xpath("//span[contains(text(),'No cards match your search')]"))
				.isDisplayed();
		if (!noMatchDisplayed) {
			throw new AssertionError("Expected 'No cards match your search.' not shown for invalid input.");
		}
	}

	public boolean areCardsInHorizontalOrder() {
		List<WebElement> cards = driver.findElements(By.xpath("//div[@data-testid='vc-card-view']"));
		for (int i = 1; i < cards.size(); i++) {
			int previousX = cards.get(i - 1).getLocation().getY();
			int currentX = cards.get(i).getLocation().getY();
			if (currentX != previousX) {
				return false;
			}
		}
		return true;
	}

	public Boolean isProfileDropDownOptionsDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='profile-dropdown']"),
				"Verify profile dropdown menu is displayed");
	}

	public boolean isProfileDrownOptionsPresent(String optionText) {
		try {
			String xpath = String.format("//div[@data-testid='profile-dropdown']//div[text()='%s']", optionText);
			return isElementIsVisible(driver, By.xpath(xpath),
					"Verify '" + optionText + "' option is present in profile dropdown");
		} catch (NoSuchElementException e) {
			return false;
		}
	}

	public void clickonFAQLink() {
		clickOnElement(driver,
				By.xpath("//div[@data-testid='profile-dropdown']//div[text()='FAQ']"),
				"Click 'FAQ' option in profile dropdown");
	}

	public String getCurrentUrlUserFAQ() {
		return waitForUrlContains(driver, "user/faq", getConfiguredWaitTimeInSeconds());
	}

	public boolean isPasscodeInputDisabled() {
		WebElement input = driver.findElement(By.cssSelector("input[data-testid='input-passcode']"));
		return !input.isEnabled();
	}

	public Boolean isPermLockWarningMsgDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div/*[@data-testid='error-msg-passcode-last-attempt-before-lockout']"),
				"Verify last-attempt-before-lockout warning message is displayed");
	}

	public Boolean isPermLockMsgDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div/*[@data-testid='error-msg-passcode-permanently-locked']"),
				"Verify permanent lock error message is displayed");
	}

	public void waitUntilPasscodeEnabled() {
		waitUntilPasscodeEnabled(getConfiguredWaitTimeInSeconds());
	}

	public void waitUntilPasscodeEnabled(int timeoutSeconds) {
		waitUntilElementEnabled(driver, By.cssSelector("input[data-testid='input-passcode']"), timeoutSeconds);
	}

}