package pages;

import base.BasePage;
import org.openqa.selenium.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

public class SunbirdCredentials extends BasePage {
	protected final Logger logger = LoggerFactory.getLogger(getClass());
	private WebDriver driver;

	public SunbirdCredentials(WebDriver driver) {
		this.driver = driver;
	}

	public Boolean isDownloadSunbirdCredentialsDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

	public Boolean isSunbirdInsuranceDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"),
				getConfiguredWaitTimeInSeconds());
	}

	public String pdfNameInsurance;

	public void clickOnSunbirdInsurance() {
		pdfNameInsurance = getElementAttribute(driver,
				By.xpath("//*[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"), "data-testid")
				.replaceFirst("ItemBox-Outer-Container-0-", "") + ".pdf";
		logger.info("Pdf Name for Insurance: " + pdfNameInsurance);
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

	public void clickOnDownloadSunbird() {
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

	public void enterPolicyNumber(String string) {
		enterText(driver, By.xpath("//input[@id='_form_policyNumber']"), string);
	}

	public Boolean isPolicyNumeTextBoxDisplayed() {
		return isElementIsVisible(driver, By.xpath("//input[@id='_form_policyNumber']"));
	}

	public void enterFullName(String string) {
		enterText(driver, By.xpath("//input[@id='_form_fullName']"), string);
	}

	public void selectDateOfBirth(String string) {
		String formattedDob = formatDateForSystemLocale(string);
		driver.findElement(By.xpath("//input[@id='_form_fullName']")).sendKeys(Keys.TAB);
		driver.findElement(By.id("_form_dob")).sendKeys(formattedDob);
		driver.findElement(By.xpath("//input[@id='_form_dob']")).click();
	}

	/**
	 * Converts any supported date string (e.g. "1977-05-19" from PolicyManager) into
	 * the short date format of the OS/JVM locale with a guaranteed 4-digit year.
	 *
	 * <p>Why not DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT)?
	 * FormatStyle.SHORT in many locales emits a 2-digit year pattern ("yy"), so
	 * 1977 becomes "77". The date input then zero-pads it to "0077". To fix this,
	 * we read the raw locale pattern via SimpleDateFormat (which exposes the pattern
	 * string), replace "yy" with "yyyy" if needed, and reuse the rest of the pattern
	 * (separator, day/month order) unchanged.
	 *
	 * <p>Example on an Indian locale with pattern "dd-MM-yy":
	 *   pattern fixed → "dd-MM-yyyy"
	 *   "1977-05-19" → "19-05-1977"  ✓  (was "19-05-0077" before)
	 */
	private String formatDateForSystemLocale(String inputDate) {
		LocalDate parsedDate = parseDateInput(inputDate);
		if (parsedDate == null) {
			logger.warn("Could not parse DOB '{}', passing as-is", inputDate);
			return inputDate;
		}
		// Get the raw short-date pattern for the current OS locale
		String pattern = ((SimpleDateFormat) DateFormat.getDateInstance(DateFormat.SHORT, Locale.getDefault())).toPattern();
		// Ensure the year is always 4 digits — SHORT patterns often use "yy"
		if (!pattern.contains("yyyy")) {
			pattern = pattern.replace("yy", "yyyy");
		}
		String formatted = parsedDate.format(DateTimeFormatter.ofPattern(pattern).withLocale(Locale.getDefault()));
		logger.info("DOB '{}' → pattern '{}' (locale '{}') → '{}'", inputDate, pattern, Locale.getDefault(), formatted);
		return formatted;
	}

	private LocalDate parseDateInput(String inputDate) {
		if (inputDate == null || inputDate.trim().isEmpty()) {
			return null;
		}

		String value = inputDate.trim();
		DateTimeFormatter[] supportedFormats = new DateTimeFormatter[] {
				DateTimeFormatter.ISO_LOCAL_DATE,
				DateTimeFormatter.ofPattern("dd/MM/yyyy"),
				DateTimeFormatter.ofPattern("MM/dd/yyyy"),
				DateTimeFormatter.ofPattern("dd-MM-yyyy"),
				DateTimeFormatter.ofPattern("MM-dd-yyyy")
		};

		for (DateTimeFormatter formatter : supportedFormats) {
			try {
				return LocalDate.parse(value, formatter);
			} catch (DateTimeParseException ignored) {
				// Try next format
			}
		}
		return null;
	}

	public void clickOnLogin() {
		clickOnElement(driver, By.xpath("//button[@id='verify_form']"));
	}

	public Boolean isLoginButtonDisplayed() {
		return isElementIsVisible(driver, By.xpath("//button[@id='verify_form']"),
				getConfiguredWaitTimeInSeconds());
	}

	public Boolean isLifeInceranceDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-1-')]"));
	}

	public Boolean isLoginFailedDisplayed() {
		return isElementIsVisible(driver, By.xpath("//*[contains(text(), 'Login failed')]"),
				getConfiguredWaitTimeInSeconds());
	}

	public void clickOnLifeInsurance() {
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-1-')]"));
	}

	public Boolean isEnterPolicyNumberHeaderDisplayed() {
		return isElementIsVisible(driver, By.xpath("//label[text() = 'Enter Policy Number']"));
	}

	public Boolean isEnterFullNameHeaderDisplayed() {
		return isElementIsVisible(driver, By.xpath("//label[text() = 'Enter Full Name']"));
	}

	public Boolean isEnterDOBHeaderDisplayed() {
		return isElementIsVisible(driver, By.xpath("//label[text() = 'Enter DOB']"));
	}

	public Boolean isAuthenticationFailedDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[@id='error-banner']"));
	}

	public Boolean isVehicleInsuranceDisplayed() {
		return isElementIsVisible(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

	public void clickOnVehicleInsurance() {
		clickOnElement(driver, By.xpath("//div[starts-with(@data-testid, 'ItemBox-Outer-Container-0-')]"));
	}

}
