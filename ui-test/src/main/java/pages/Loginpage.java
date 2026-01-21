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
		if (!isElementIsVisible(driver,
				By.xpath("//div[@data-testid='passcode-container']//input[@type='password' and @maxlength='1']"), (BasePage.explicit_timeout)*2)) {
			throw new NoSuchElementException("passcode input field not found — cannot enter passcode.");

		}

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
			try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}

	public void enterConfirmPasscode(String string) {
		if (!isElementIsVisible(driver,
				By.xpath(
						"//div[@data-testid='confirm-passcode-container']//input[@type='password' and @maxlength='1']"),
				60)) {
			throw new NoSuchElementException("passcode input field not found — cannot enter passcode.");

		}

		List<WebElement> confirmFields = driver.findElements(By
				.xpath("//div[@data-testid='confirm-passcode-container']//input[@type='password' and @maxlength='1']"));

		if (confirmFields.size() < string.length()) {
			throw new RuntimeException("Not enough confirm passcode input fields found: expected " + string.length()
					+ " but found " + confirmFields.size());
		}

		for (int i = 0; i < string.length(); i++) {
			WebElement field = confirmFields.get(i);
			field.click();
			field.clear();
			field.sendKeys(String.valueOf(string.charAt(i)));
			try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}

	public void clickonToggleButton() {
		clickOnElement(driver, By.xpath("(//button[@type='button'])[2]"));
	}

	public void focusToggleButtonWithKeyboard() {
		WebElement toggleButton = driver.findElement(By.xpath("(//button[@type='button'])[2]"));
		toggleButton.sendKeys(Keys.TAB);
		toggleButton.sendKeys(Keys.SPACE);
	}

	public void clickonToggleButtonConfimration() {
		clickOnElement(driver, By.xpath("(//button[@type='button'])[3]"));
	}

	public Boolean isToggleAppearinPlainTextFormat() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='btn-toggle-visibility-passcode']/*[@data-testid='eye-view']"));
	}

	public Boolean isSubmitButtonEnabled() {
		return isElementEnabled(driver, By.xpath("//button[@data-testid='btn-submit-passcode']"));
	}

	public void clickonSubmitButton() {
		clickOnElement(driver, By.xpath("//button[@data-testid='btn-submit-passcode']"));
	}

	public Boolean isMismatchErroDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div/*[@data-testid='error-msg-passcode']"));
	}

	public Boolean isTempLockErroDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div/*[@data-testid='error-msg-passcode-temporarily-locked']"));
	}

	public String getMismatchErrorText() {
		return getElementText(driver, By.xpath("//div[@data-testid='error-passcode']"));
	}

	public void clickonuserprofiledropdownbutton() {
		clickOnElement(driver, By.xpath("(//div[@data-testid='profile-details']//div)[4]"), (BasePage.explicit_timeout)*2);
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
		clickOnElement(driver, By.xpath("(//div[@data-testid='profile-details']//div)[4]"), (BasePage.explicit_timeout)*2);
	}

	public void waituntilpagecompletelyloaded() {
		new WebDriverWait(driver, Duration.ofSeconds(15)).until(webDriver -> ((JavascriptExecutor) webDriver)
				.executeScript("return document.readyState").equals("complete"));
	}

	public void clickOnProfileDropDownDisplayedAgain() {
		waituntilpagecompletelyloaded();
		clickOnElement(driver, By.xpath("(//div[@data-testid='profile-details']//div)[4]"), (BasePage.explicit_timeout)*2);
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
		List<WebElement> collapsedText = driver
				.findElements(By.xpath("//div[@data-testid='sidebar-container']//span[text()='Home']"));
		return (collapsedText.isEmpty() || !collapsedText.get(0).isDisplayed());
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
		return waitForUrlContains(driver, "user/home", 5);
	}

	public String getCurrentUrlUserCredentials() {
		return waitForUrlContains(driver, "user/credentials", 5);
	}

	public void clickOnProfileOption() {
		clickOnElement(driver, By.xpath("//div[@data-testid='profile-dropdown']//div[text()='Profile']"));
	}

	public void clickOnProfileOptionMobileView() {
		clickOnElement(driver, By.xpath("//div[text()='Profile']"));
	}

	public void clickOnLogoutOptionMobileView() {
		clickOnElement(driver, By.xpath("//div[text()='Logout']"));
	}

	public void clickOnFaqOptionMobileView() {
		clickOnElement(driver, By.xpath("//div[text()='FAQ']"));
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
		clickOnElement(driver, By.xpath("//button[@data-testid='btn-forgot-passcode']"));
	}

	public String getTitleOfTheForgetPasswordWindow() {
		return getElementText(driver, By.xpath("//h1[@data-testid='title-reset-passcode']"));
	}

	public String getCurrentUrluserresetpasscode() {
		return waitForUrlContains(driver, "user/reset-passcode", 5);
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
		return isElementIsVisible(driver, By.xpath("//button[@data-testid='btn-set-new-passcode']"));
	}

	public Boolean isForgetPasscodeButtonenabled() {
		return isElementEnabled(driver, By.xpath("//button[@data-testid='btn-set-new-passcode']"));
	}

	public String getCurrentUrluserpasscode() {
		return waitForUrlContains(driver, "user/passcode", 5);
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

	public boolean isMobileMenuOptionPresent(String optionText) {
		String xpath = String.format("//div[@data-testid='hamburger-menu-dropdown']//div[text()='%s']", optionText);
		return isElementIsVisible(driver, By.xpath(xpath), 10);
	}

	public void clickonFAQLink() {
		clickOnElement(driver, By.xpath("//div[@data-testid='profile-dropdown']//div[text()='FAQ']"));
	}

	public String getCurrentUrlUserFAQ() {
		return waitForUrlContains(driver, "user/faq", 5);
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
		waitUntilElementEnabled(driver, By.cssSelector("input[data-testid='input-passcode']"), 10);
	}

	public void clickOnHamburgerMenu() {
		clickOnElement(driver, By.xpath("//div[@data-testid='hamburger-menu']"));
	}

	public boolean isDownloadedCardMenubuttonDisplayed() {
		return isElementIsVisible(driver, By.xpath("(//button[@data-testid='icon-mini-view-card-menu'])[1]"));
	}

	public void clickOnDownloadedCardMenubutton() {
		clickOnElement(driver, By.xpath("(//button[@data-testid='icon-mini-view-card-menu'])[1]"));
	}

	public void clickOnViewCardMenubutton() {
		clickOnElement(driver, By.xpath("//span[@data-testid='label-view']"));
	}

	public boolean isDownloadedCardViewDisplayed() {
		return isElementIsVisible(driver, By.xpath("//span[@data-testid='title-credential-type-display-name']"));
	}

	public void clickOnViewCardBackbutton() {
		clickOnElement(driver, By.xpath("//button[@data-testid='btn-back']"));
	}

	public void clickOnDownloadCardMenubutton() {
		clickOnElement(driver, By.xpath("//span[@data-testid='label-download']"));
	}

	public void clickOnDeleteCardMenubutton() {
		clickOnElement(driver, By.xpath("//span[@data-testid='label-delete']"));
	}

	public void clickOnConfirmDeleteCardOption() {
		clickOnElement(driver, By.xpath("//button[@data-testid='btn-confirm']"));
	}

	public void clickOnDownloadCardFromViewbutton() {
		clickOnElement(driver, By.xpath("(//button[@data-testid='btn-download'])[2]"));
	}

	public void clickOnCancelDeleteCardOption() {
		clickOnElement(driver, By.xpath("(//button[@data-testid='btn-cancel'])"));
	}
}