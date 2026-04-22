package pages;

import base.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.time.Duration;

public class HomePage extends BasePage {

	private WebDriver driver;

	public HomePage(WebDriver driver) {
		this.driver = driver;
	}

	public void clickOnFaq() {
		clickOnElement(driver,
				By.xpath("//button[@data-testid='Header-Menu-FAQ']"),
				"Click on FAQ menu button in header");
	}

	public boolean isFaqPageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='Header-Menu-Faq']"),
				"Verify FAQ page container is displayed");
	}

	public boolean isHeaderContanerDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='Header-Container']"),
				"Verify header container is displayed");
	}

	public boolean isFooterIsDisplayedOnHomePage() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='Footer-Text']"),
				"Verify footer text is displayed on home page");
	}

	public String getFooterText() {
		return getElementText(driver, By.xpath("//*[@data-testid='Footer-Text']"));
	}

	public boolean isHomePageContainerDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='Home-Page-Container']"),
				"Verify home page main container is displayed");
	}

	public boolean isAboutDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='Header-Menu-AboutInji']"),
				"Verify 'About Inji' menu item is displayed");
	}

	public boolean isSerchBoxDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='Search-Issuer-Input']"),
				"Verify issuer search box is displayed");
	}

	public boolean isIssuerLogoDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='ItemBox-Logo']"),
				"Verify issuer logo is displayed on issuer card");
	}

	public void clickOnAboutInji() {
		clickOnElement(driver,
				By.xpath("//*[@data-testid='Header-Menu-AboutInji']"),
				"Click on 'About Inji' menu item");
	}

	public Boolean isLogoDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='Header-InjiWeb-Logo-Container']"),
				"Verify Inji Web logo is displayed in header");
	}

	public String isPageTitleDisplayed() {
		return driver.getCurrentUrl();
	}

	public String isHomePageTextDisplayed() {
		return getElementText(driver, By.xpath("//h2[@data-testid='IntroBox-Text']"));
	}

	public String getHomePageDescriptionText() {
		return getElementText(driver, By.xpath("//p[@data-testid='IntroBox-SubText']"));
	}

	public boolean isHomePageDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//p[@data-testid='IntroBox-SubText']"),
				"Verify home page description sub-text is displayed");
	}

	public void clickOnDownloadMosipCredentials() {
		clickOnElement(driver,
				By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"),
				"Click on MOSIP National ID issuer card to start download");
	}

	public Boolean isListOfCredentialsTypeDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[@data-testid='HeaderTile-Text']"),
				"Verify list of credential types header is displayed");
	}

	public void clickOnVerify() {
		clickOnElement(driver,
				By.xpath("//button[@id='verify_otp']"),
				"Click 'Verify OTP' button");
	}

	/**
	 * Returns true if the OTP verification page is still displayed (verify button
	 * visible), false if the page has navigated away (OTP accepted / download started).
	 */
	public boolean isOnOtpVerificationPage(int timeoutSeconds) {
		return !isElementNotVisible(driver, By.xpath("//button[@id='verify_otp']"), timeoutSeconds);
	}

	public Boolean isSuccessMessageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//p[@data-testid='title-download-result']"),
				"Verify download success message is displayed");
	}

	public Boolean isMosipNationalIdDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"),
				"Verify MOSIP National ID issuer card is displayed");
	}

	public Boolean isIssuersDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"),
				"Verify issuer list is loaded and first card is visible");
	}

	public void clearIssuersSearchBox() {
		enterText(driver, By.xpath("//input[@type='text']"), "",
				"Clear issuer search box");
	}

	public void enterIssuersInSearchBox(String string) {
		enterText(driver, By.xpath("//input[@type='text']"), string,
				"Enter issuer search text");
	}

	public Boolean isGoHomeButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[text()='Go To Home']"),
				"Verify 'Go To Home' button is displayed");
	}

	public Boolean isLanguageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//button[@data-testid='Language-Selector-Button']"),
				"Verify language selector button is displayed");
	}

	public void clickOnLanguageButton() {
		clickOnElement(driver,
				By.cssSelector("button[data-testid='Language-Selector-Button']"),
				"Click language selector button to open language dropdown");
	}

	public boolean verifyLanguagesInLanguageFilter() {
		List<String> expectedLanguages = Arrays.asList("English", "தமிழ்", "ಕನ್ನಡ", "हिंदी", "Français", "عربي",
				"Português");
		List<String> actualLanguages = null;
		try {
			actualLanguages = getElementTexts(driver,
					By.xpath("//li[starts-with(@data-testid, 'Language-Selector-DropDown-Item-')]"));
		} catch (TimeoutException e) {
			e.printStackTrace();
		}
		return new HashSet<>(expectedLanguages).equals(new HashSet<>(actualLanguages));
	}

	public Boolean isNoIssuerFoundMessageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//p[@data-testid='EmptyList-Text']"),
				"Verify 'No Issuer Found' empty-state message is displayed");
	}

	private void openLanguageDropdown() {
		clickOnLanguageButton();
		// Wait for the first dropdown item (English) to confirm the dropdown is fully rendered
		isElementIsVisible(driver,
				By.xpath("//li[@data-testid='Language-Selector-DropDown-Item-en']"),
				"Wait for language dropdown to fully render");
	}

	public void clickOnArabicLanguage() {
		openLanguageDropdown();
		clickOnElement(driver,
				By.xpath("//li[@data-testid='Language-Selector-DropDown-Item-ar']//button"),
				"Click Arabic language option");
	}

	public void clickOnTamilLanguage() {
		openLanguageDropdown();
		clickOnElement(driver,
				By.xpath("//li[@data-testid='Language-Selector-DropDown-Item-ta']//button"),
				"Click Tamil language option");
	}

	public void clickOnKannadaLanguage() {
		openLanguageDropdown();
		clickOnElement(driver,
				By.xpath("//li[@data-testid='Language-Selector-DropDown-Item-kn']//button"),
				"Click Kannada language option");
	}

	public void clickOnHindiLanguage() {
		openLanguageDropdown();
		clickOnElement(driver,
				By.xpath("//li[@data-testid='Language-Selector-DropDown-Item-hi']//button"),
				"Click Hindi language option");
	}

	public void clickOnFranchLanguage() {
		openLanguageDropdown();
		clickOnElement(driver,
				By.xpath("//li[@data-testid='Language-Selector-DropDown-Item-fr']//button"),
				"Click French language option");
	}

	public void clickOnPortuguesLanguage() {
		openLanguageDropdown();
		clickOnElement(driver,
				By.xpath("//li[@data-testid='Language-Selector-DropDown-Item-pt']//button"),
				"Click Portuguese language option");
	}

	public String isCredentialTypesDisplayed() {
		return getElementText(driver, By.xpath("//div[@data-testid='HeaderTile-Text']"));
	}

	public String isNationalIdentityDepartmentTextDisplayed() {
		return getElementText(driver, By.xpath("//span[@data-testid='NavBar-Text']"));
	}

	public String isVeridoniaInsuranceCompanyTextDisplayed() {
		return isNationalIdentityDepartmentTextDisplayed();
	}

	public static void scrollDownByPage(WebDriver driver) {
		Actions actions = new Actions(driver);
		actions.sendKeys(Keys.PAGE_DOWN).build().perform();
	}

//	public void ClickOnFaqForMobileBrowse() {
//		if (isElementIsVisible(driver, By.xpath("//div[@data-testid='Header-InjiWeb-Logo-Container']/div"))) {
//			clickOnElement(driver,
//					By.xpath("//div[@data-testid='Header-InjiWeb-Logo-Container']/div"),
//					"Click mobile hamburger menu to reveal navigation");
//		}
//	}

	public void verifyInvaildMessage() {
		isElementIsVisible(driver,
				By.xpath("//p[text()='Invalid Session']"),
				"Verify 'Invalid Session' error message is displayed");
	}

	public String isListOfIssuersTextDisplayed() {
		return getElementText(driver, By.xpath("(//*[@data-testid='HeaderTile-Text'])[1]"));
	}

	public String isListOfIssuersDescriptionTextDisplayed() {
		return getElementText(driver, By.xpath("//*[@data-testid='HeaderTile-Text-SubContent']"));
	}

	public boolean isAboutPageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//p[text()='Overview']"),
				"Verify About page 'Overview' section is displayed");
	}

	public boolean isHomeBannerHeadingDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeBanner-Heading']"),
				"Verify home banner heading is displayed");
	}

	public boolean isHomeBannerHeadingDescriptionDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//span[@data-testid='HomeBanner-Heading']/following-sibling::h2"),
				"Verify home banner heading description is displayed");
	}

	public boolean isGetStartedButtonDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeBanner-Get-Started']"),
				"Verify 'Get Started' button is displayed on home banner");
	}

	public boolean isFeatureHeadingDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatures-Heading']"),
				"Verify home features section heading is displayed");
	}

	public boolean isFeatureDescriptionDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatures-Description1']"),
				"Verify home features section description is displayed");
	}

	public boolean isFeatureMobileImageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatures-MobileImage']"),
				"Verify home features mobile illustration image is displayed");
	}

	public boolean isFeatureDesktopImageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatures-DesktopImage']"),
				"Verify home features desktop illustration image is displayed");
	}

	public boolean isAccessYourCredentialsTextHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem2-Heading']"),
				"Verify 'Access Your Credentials' feature heading is displayed");
	}

	public boolean isYourDocumentsDownloadedTextHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem2-Heading']"),
				"Verify 'Your Documents Downloaded' feature heading is displayed");
	}

	public boolean isEasySharingTextHeaderDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem3-Heading']"),
				"Verify 'Easy Sharing' feature heading is displayed");
	}

	public boolean isSecureAndPrivateDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem4-Heading']"),
				"Verify 'Secure and Private' feature heading is displayed");
	}

	public boolean isWiderAccessAndCompatibilityDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem5-Heading']"),
				"Verify 'Wider Access and Compatibility' feature heading is displayed");
	}

	public boolean isCredentialsSimplifiedTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem1-FirstFeature-Item']"),
				"Verify 'Credentials Simplified' feature item text is displayed");
	}

	public boolean isNoMorePaperworkTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem1-SecondFeature-Item']"),
				"Verify 'No More Paperwork' feature item text is displayed");
	}

	public boolean isDownloadWithConfidenceTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem2-FirstFeature-Item']"),
				"Verify 'Download With Confidence' feature item text is displayed");
	}

	public boolean isSafeAndSoundTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem2-SecondFeature-Item']"),
				"Verify 'Safe and Sound' feature item text is displayed");
	}

	public boolean isShareWithQRCodeTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem3-FirstFeature-Item']"),
				"Verify 'Share With QR Code' feature item text is displayed");
	}

	public boolean isReadSetShareTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem3-SecondFeature-Item']"),
				"Verify 'Read, Set, Share' feature item text is displayed");
	}

	public boolean isYourCredentialsProtectedTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem4-FirstFeature-Item']"),
				"Verify 'Your Credentials Protected' feature item text is displayed");
	}

	public boolean isRestEasyTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem4-SecondFeature-Item']"),
				"Verify 'Rest Easy' feature item text is displayed");
	}

	public boolean isAvailableOnYourFavouriteBrowserTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem5-FirstFeature-Item']"),
				"Verify 'Available on Your Favourite Browser' feature item text is displayed");
	}

	public boolean isAlwaysWithinReachTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem5-SecondFeature-Item']"),
				"Verify 'Always Within Reach' feature item text is displayed");
	}

	public void clickOnGetStartedButton() {
		clickOnElement(driver,
				By.xpath("//*[@data-testid='HomeBanner-Get-Started']"),
				"Click 'Get Started' button on home banner");
	}

	public void clickOnContinueAsGuest() {
		clickOnElement(driver,
				By.xpath("//button[@data-testid='home-banner-guest-login']"),
				"Click 'Continue as Guest' button");
	}

	public boolean isCredentialsSimplifiedDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem1-FirstFeature-Description']"),
				"Verify 'Credentials Simplified' description text is displayed");
	}

	public boolean isNomorePaperworkDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem1-SecondFeature-Description']"),
				"Verify 'No More Paperwork' description text is displayed");
	}

	public boolean isDownloadwithConfidenceDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem2-FirstFeature-Description']"),
				"Verify 'Download with Confidence' description text is displayed");
	}

	public boolean isSafeAndSoundDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem2-SecondFeature-Description']"),
				"Verify 'Safe and Sound' description text is displayed");
	}

	public boolean isSharewithQRCodeDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem3-FirstFeature-Description']"),
				"Verify 'Share with QR Code' description text is displayed");
	}

	public boolean isReadSetShareDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem3-SecondFeature-Description']"),
				"Verify 'Read, Set, Share' description text is displayed");
	}

	public boolean isYourCredentialsProtectedDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem4-FirstFeature-Description']"),
				"Verify 'Your Credentials Protected' description text is displayed");
	}

	public boolean isRestEasyDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem4-SecondFeature-Description']"),
				"Verify 'Rest Easy' description text is displayed");
	}

	public boolean isAvailableOnYourFavouriteBrowserDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem5-FirstFeature-Description']"),
				"Verify 'Available on Your Favourite Browser' description text is displayed");
	}

	public boolean isAlwaysWithinReachDescriptionTextDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem5-SecondFeature-Description']"),
				"Verify 'Always Within Reach' description text is displayed");
	}

	public void clickOnConsentValidityButton() {
		clickOnElement(driver,
				By.xpath("//*[@data-testid='DataShareContent-Selected-Validity-Times']"),
				"Click on data-share consent validity dropdown");
	}

	public void clickOnConsentValidityAsCustom() {
		clickOnElement(driver,
				By.xpath("//*[@data-testid='DataShareContent-Validity-Times-DropDown-Custom']"),
				"Select 'Custom' validity option from consent dropdown");
	}

	public void enterConsentValidityAsCustom(String string) {
		enterText(driver,
				By.xpath("//*[@data-testid='CustomExpiryTimesContent-Times-Value']"), string,
				"Enter custom consent validity value");
	}

	public void clickOnProccedCustomButton() {
		clickOnElement(driver,
				By.xpath("(//*[@data-testid='DataShareFooter-Success-Button'])[2]"),
				"Click 'Proceed' button for custom consent validity");
	}

	public void clickOnProccedConsentButton() {
		clickOnElement(driver,
				By.xpath("(//*[@data-testid='DataShareFooter-Success-Button'])[1]"),
				"Click 'Proceed' button to confirm consent");
	}

	public boolean isAccessYourCredentialsImageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem1-Image']"),
				"Verify 'Access Your Credentials' feature illustration image is displayed");
	}

	public boolean isYourDocumentsDownloadedImageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem2-Image']"),
				"Verify 'Your Documents Downloaded' feature illustration image is displayed");
	}

	public boolean isEasySharingImageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem3-Image']"),
				"Verify 'Easy Sharing' feature illustration image is displayed");
	}

	public boolean isSecureAndPrivateImageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem4-Image']"),
				"Verify 'Secure and Private' feature illustration image is displayed");
	}

	public boolean isWiderAccessAndCompatibilityImageDisplayed() {
		return isElementIsVisible(driver,
				By.xpath("//*[@data-testid='HomeFeatureItem5-Image']"),
				"Verify 'Wider Access and Compatibility' feature illustration image is displayed");
	}

	public void waitForPageLoad() {
		new WebDriverWait(driver, Duration.ofSeconds(getConfiguredWaitTimeInSeconds())).until(
				webDriver -> "complete".equals(((JavascriptExecutor) webDriver).executeScript("return document.readyState")));
	}

	/** @deprecated Use {@link #waitForPageLoad()} instead */
	@Deprecated
	public void waitForseconds() {
		waitForPageLoad();
	}

}