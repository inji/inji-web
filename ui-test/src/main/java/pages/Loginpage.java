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
		return isElementIsVisible(driver, By.xpath("//button[@data-testid='google-login-button']"));
	}

	public Boolean isgoolgeLoginButtonVisible() {
		return isElementIsVisible(driver, By.xpath("//button[@data-testid='google-login-button']"));
	}

	public Boolean VerifygoogleSigninPage() {
		return isElementIsVisible(driver, By.xpath("//input[@type='email']"));
	}

	public Boolean verifySuccessfulLogin() {
		return isElementIsVisible(driver, By.cssSelector("[data-testid='profile-icon']"));
	}

	public void enterPasscode(String string) {
		WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()));
		wait.until(ExpectedConditions.visibilityOfElementLocated(
				By.xpath("//div[@data-testid='passcode-container']//input[@type='password' and @maxlength='1']")));

		List<WebElement> passcodeFields = driver.findElements(
				By.xpath("//div[@data-testid='passcode-container']//input[@type='password' and @maxlength='1']"));

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
	}

	public void clickonToggleButton() {
		clickOnElement(driver, By.xpath("(//button[@type='button'])[2]"));
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
		// If the toggle is already VISIBLE no action is taken, so this is idempotent.
		// Use the short wait here — if the toggle hasn't recovered in 3 s it was reset
		// and needs the SPACE key; waiting the full 30 s just delays the fix.
		if (!isElementIsVisible(driver, eyeViewLocator, getConfiguredShortWaitTimeInSeconds())) {
			toggleButton.sendKeys(Keys.SPACE);
			new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.visibilityOfElementLocated(eyeViewLocator));
		}
	}

	public void clickonToggleButtonConfimration() {
		clickOnElement(driver, By.xpath("(//button[@type='button'])[3]"));
	}

	public Boolean isToggleAppearinPlainTextFormat() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='btn-toggle-visibility-passcode']/*[@data-testid='eye-view']"));
	}

	public Boolean isSubmitButtonEnabled() {
		return isElementEnabled(driver, SUBMIT_BUTTON);
	}

	public Boolean isSubmitButtonEnabledFast() {
		return isElementEnabled(driver, SUBMIT_BUTTON, getConfiguredShortWaitTimeInSeconds());
	}

	public void clickonSubmitButton() {
		By submitLocator = SUBMIT_BUTTON;
		// Scroll into view first — the submit button can sit below the viewport after
		// the passcode fields are filled, causing ElementNotInteractableException even
		// though the element is present in the DOM and CSS-visible.
		scrollIntoView(driver, submitLocator);
		clickOnElement(driver, submitLocator);
	}

	public Boolean isMismatchErroDisplayed() {
		return isElementIsVisible(driver, By.xpath("//span[@data-testid='error-msg-passcode']"));
	}

	public Boolean isTempLockErroDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div/*[@data-testid='error-msg-passcode-temporarily-locked']"));
	}

	public String getMismatchErrorText() {
		return getElementText(driver, By.xpath("//span[@data-testid='error-msg-passcode']"));
	}

	public void clickonuserprofiledropdownbutton() {
		clickOnElement(driver, By.xpath("(//div[@data-testid='profile-details']//div)[4]"),
				getConfiguredWaitTimeInSeconds());
	}

	public void clickonLogout() {
		clickOnElement(driver, By.xpath("//div[@data-testid='profile-dropdown']//div[contains(text(),'Logout')]"));
	}

	public Boolean confirmPasscodeSecondTimeLogin() {
		return isElementNotVisible(driver, By
				.xpath("//div[@data-testid='confirm-passcode-container']//input[@type='password' and @maxlength='1']"));
	}

	public void clickonAddCardsButton() {
		clickOnElement(driver, By.xpath("//button[@data-testid='btn-add-cards']"));
	}

	public Boolean isProfileDetailsDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[@data-testid='profile-details']"));
	}

	public Boolean isProfileImageDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[@data-testid='profile-details']//img[@alt='Profile Pic']"));
	}

	public Boolean isProfileDropDownDisplayed() {
		return isElementIsVisible(driver, By.xpath("(//div[@data-testid='profile-details']//div)[4]"));
	}

	public Boolean isProfileNameDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[@data-testid='profile-details']//span"));
	}

	public void clickOnProfileDropDown() {
		// Wait for the profile section to be visible — this is the positive signal that
		// the home page has fully rendered after passcode submit. Relying on the submit
		// button disappearing is not reliable because it may already be gone from the
		// DOM before this method is called.
		new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
				.until(ExpectedConditions.visibilityOfElementLocated(
						By.xpath("//div[@data-testid='profile-details']")));
		clickOnElement(driver, By.xpath("//div[@class='relative inline-block cursor-pointer']"),
				getConfiguredWaitTimeInSeconds());
	}

	public void waituntilpagecompletelyloaded() {
		new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds())).until(webDriver -> ((JavascriptExecutor) webDriver)
				.executeScript("return document.readyState").equals("complete"));
	}

	public void clickOnProfileDropDownDisplayedAgain() {
		waituntilpagecompletelyloaded();
		clickOnElement(driver, By.xpath("(//div[@data-testid='profile-details']//div)[4]"),
				getConfiguredWaitTimeInSeconds());
	}

	public Boolean isHomeButtonDisplayed() {
		return isElementIsVisible(driver, By.xpath("//span[normalize-space(text())='Home']"));
	}

	public Boolean isCollapseButtonDisplayed() {
		return isElementIsVisible(driver, By.xpath("(//div[@data-testid='sidebar-container']//button)[1]"));
	}

	public Boolean isHomeStringDisplayedBeforeCollpase() {
		return isElementIsVisible(driver, By.xpath("//div[@data-testid='sidebar-container']//span[text()='Home']"));
	}

	public void clickOnCollapseButton() {
		clickOnElement(driver, By.xpath("(//div[@data-testid='sidebar-container']//button)[1]"));
	}

	public Boolean isHomeStringDisplayedAfterCollpase() {
		// Returns true when the collapse is verified (text label disappeared), false
		// if the text is still visible after the animation window.
		// The caller does assertTrue(result), so true == "collapse confirmed".
		By homeTextLocator = By.xpath("//div[@data-testid='sidebar-container']//span[text()='Home']");
		try {
			new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds()))
					.until(ExpectedConditions.invisibilityOfElementLocated(homeTextLocator));
			return true; // element became invisible — collapse confirmed
		} catch (TimeoutException e) {
			return false; // element still visible after 5 s — collapse did not complete
		}
	}

	public Boolean isIconVisibleAfterCollpase() {
		return isElementIsVisible(driver, By.xpath("//div[@data-testid='sidebar-container']/div[1]"));
	}

	public void clickOnCollapseButtonAgain() {
		clickOnElement(driver, By.xpath("(//div[@data-testid='sidebar-container']//button)[1]"));
	}

	public Boolean isVerifyStoredCredentialsButtonDisplayed() {
		return isElementIsVisible(driver, By.xpath("//span[text()='Stored Cards']"));
	}

	public void clickonStoredCredentialsButton() {
		clickOnElement(driver, By.xpath("//span[text()='Stored Cards']"));
	}

	public Boolean isAddCardButtonDisplayed() {
		return isElementIsVisible(driver, By.xpath("//button[@data-testid='btn-add-cards']"));
	}

	public Boolean isnoCardsAddedMessageDisplayed() {
		return isElementIsVisible(driver, By.xpath("//h2[@data-testid='no-credentials-downloaded-title']"));
	}

	public Boolean isnoCardsAddedMessageSubstringMessage() {
		return isElementIsVisible(driver, By.xpath("//span[@data-testid='no-credentials-downloaded-message']"));
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
		clickOnElement(driver, By.xpath("//div[@data-testid='profile-dropdown']//div[text()='Profile']"));
	}

	public String getTextMyProfile() {
		return getElementText(driver, By.xpath("//span[@data-testid='profile-page']"));

	}

	public Boolean isArrowButtonDisplayed() {
		return isElementIsVisible(driver, By.xpath("//*[@data-testid='back-arrow-icon']"));
	}

	public Boolean isHomeArrowButtonDisplayed() {
		return isElementIsVisible(driver, By.xpath("//button[@data-testid='btn-home']"));
	}

	public Boolean isProfilePhotoDisplayed() {
		return isElementIsVisible(driver, By.xpath("//img[@data-testid='profile-page-picture']"));
	}

	public Boolean isLabelFullnameDisplayed() {
		return isElementIsVisible(driver, By.xpath("//h3[@data-testid='label-full-name']"));
	}

	public Boolean isLabelFullnameValueDisplayed() {
		return isElementIsVisible(driver, By.xpath("//p[@data-testid='value-full-name']"));
	}

	public Boolean isLabelFullnameInfoDisplayed() {
		return isElementIsVisible(driver, By.xpath("//h3[@data-testid='label-email']"));
	}

	public Boolean isLabelFullnameInfoValueDisplayed() {
		return isElementIsVisible(driver, By.xpath("//p[@data-testid='value-email']"));
	}

	public void clickonBackAwroeButton() {
		clickOnElement(driver, By.xpath("//*[@data-testid='back-arrow-icon']"));
	}

	public void clickonHomeAwroeButton() {
		clickOnElement(driver, By.xpath("//button[@data-testid='btn-home']"));
	}

	public String getResetInstructionText() {
		return getElementText(driver, By.xpath("//div[@data-testid='text-reset-instruction']")).trim();
	}

	public Boolean isForgetPasscodeOptionDisplayed() {
		return isElementIsVisible(driver, By.xpath("//button[@data-testid='btn-forgot-passcode']"));
	}

	public void clickOnForgetPasscodeOption() {
		By forgetPasswordButton = By.xpath("//button[@data-testid='btn-forgot-passcode']");
		scrollIntoView(driver, forgetPasswordButton);
		clickOnElement(driver, forgetPasswordButton);
	}

	public String getTitleOfTheForgetPasswordWindow() {
		return getElementText(driver, By.xpath("//h1[@data-testid='title-reset-passcode']"));
	}

	public String getCurrentUrluserresetpasscode() {
		return waitForUrlContains(driver, "user/reset-passcode", getConfiguredWaitTimeInSeconds());
	}

	public Boolean isbackButtonDisplayedOnForgetpasscode() {
		return isElementIsVisible(driver, By.xpath("//button[@data-testid='btn-back-arrow-container']"));
	}

	public void clickOnBackButtonOnForgetPasscodeOption() {
		clickOnElement(driver, By.xpath("//button[@data-testid='btn-back-arrow-container']"));
	}

	public String getInfoTextForgetPasswordWindow() {
		return getElementText(driver, By.xpath("//p[@data-testid='subtitle-reset-passcode']"));
	}

	public Boolean isInfoTextForgetPasswordDisplayed() {
		return isElementIsVisible(driver, By.xpath("//p[@data-testid='subtitle-reset-passcode']"));
	}

	public String getResetUserInfoOnForgetPasswordWindow() {
		return getElementText(driver, By.xpath("//p[@data-testid='subtitle-reset-passcode']"));
	}

	public Boolean isResetUserInfoOnForgetPasswordDisplayed() {
		return isElementIsVisible(driver, By.xpath("//p[@data-testid='subtitle-reset-passcode']"));
	}

	public Boolean isForgetPasscodeButtonDisplayed() {
		By forgetPasswordButton = By.xpath("//button[@data-testid='btn-set-new-passcode']");
		scrollIntoView(driver, forgetPasswordButton);
		return isElementIsVisible(driver, forgetPasswordButton);
	}

	public Boolean isForgetPasscodeButtonenabled() {
		return isElementEnabled(driver, By.xpath("//button[@data-testid='btn-set-new-passcode']"));
	}

	public String getCurrentUrluserpasscode() {
		return waitForUrlContains(driver, "user/passcode", getConfiguredWaitTimeInSeconds());
	}

	public void clickOnForgetPasscodeButton() {
		clickOnElement(driver, By.xpath("//button[@data-testid='btn-set-new-passcode']"));
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
		return isElementIsVisible(driver, By.xpath("//div[@data-testid='profile-dropdown']"));
	}

	public boolean isProfileDrownOptionsPresent(String optionText) {
		try {
			String xpath = String.format("//div[@data-testid='profile-dropdown']//div[text()='%s']", optionText);
			WebElement option = driver.findElement(By.xpath(xpath));
			return isElementIsVisible(driver, By.xpath(xpath));
		} catch (NoSuchElementException e) {
			return false;
		}
	}

	public void clickonFAQLink() {
		clickOnElement(driver, By.xpath("//div[@data-testid='profile-dropdown']//div[text()='FAQ']"));
	}

	public String getCurrentUrlUserFAQ() {
		return waitForUrlContains(driver, "user/faq", getConfiguredWaitTimeInSeconds());
	}

	public boolean isPasscodeInputDisabled() {
		WebElement input = driver.findElement(By.cssSelector("input[data-testid='input-passcode']"));
		return !input.isEnabled(); // returns true if disabled
	}

	public Boolean isPermLockWarningMsgDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div/*[@data-testid='error-msg-passcode-last-attempt-before-lockout']"));
	}

	public Boolean isPermLockMsgDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div/*[@data-testid='error-msg-passcode-permanently-locked']"));
	}

	public void waitUntilPasscodeEnabled() {
		waitUntilPasscodeEnabled(getConfiguredWaitTimeInSeconds());
	}

	public void waitUntilPasscodeEnabled(int timeoutSeconds) {
		waitUntilElementEnabled(driver, By.cssSelector("input[data-testid='input-passcode']"), timeoutSeconds);
	}

}
