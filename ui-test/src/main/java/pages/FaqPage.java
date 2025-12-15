package pages;

import base.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class FaqPage extends BasePage {

	private WebDriver driver;

	public FaqPage(WebDriver driver) {
		this.driver = driver;
	}

	public boolean isFaqPageFAQDescriptionTextDisplayed() {
		return isElementIsVisible(driver, By.xpath("//*[@data-testid='Faq-Item-Content-Text']"));
	}

	public boolean isFaqPageFAQTitelTextDisplayed() {
		return isElementIsVisible(driver, By.xpath("//*[@data-testid='Faq-Item-Title-Text']"));
	}

	public boolean isUpArrowDisplayed() {
		return isElementIsVisible(driver, By.xpath("//*[@data-testid='Faq-Item-UpArrow']"));
	}

	public int getUpArrowCount() {
		List<WebElement> upArrowElements = driver.findElements(By.xpath("//*[@data-testid='Faq-Item-UpArrow']"));
		return upArrowElements.size();
	}

	public int getDownArrowCount() {
		List<WebElement> upArrowElements = driver.findElements(By.xpath("//*[@data-testid='Faq-Item-DownArrow']"));
		return upArrowElements.size();
	}

	public void ClickOnDownArrow() {
		clickOnElement(driver, By.xpath("//*[@data-testid='Faq-Item-DownArrow']"));
	}

}
