package utils;

import java.text.SimpleDateFormat;
import java.util.Date;

import com.aventstack.extentreports.*;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

public class ExtentReportManager {

	private static ExtentReports extent;
	private static final ThreadLocal<ExtentTest> TEST = new ThreadLocal<>();

	public static String currentReportFileName;
	private static String timestamp;

	public static synchronized void initReport() {
		if (extent == null) {

			String envUrl = BaseTest.url;
			if (envUrl.endsWith("/")) {
				envUrl = envUrl.substring(0, envUrl.length() - 1);
			}

			timestamp = new SimpleDateFormat("yyyy-MM-dd-HH-mm").format(new Date());
			String domainOnly = envUrl.replaceFirst("https?://", "");
			String formattedEnvName = "InjiWebUi-" + domainOnly;

			currentReportFileName = formattedEnvName + "-" + timestamp + ".html";

			ExtentHtmlReporter htmlReporter =
					new ExtentHtmlReporter("test-output/" + currentReportFileName);

			htmlReporter.config().setTheme(Theme.DARK);
			htmlReporter.config().setDocumentTitle("Automation Report");
			htmlReporter.config().setReportName(formattedEnvName);

			// ✅ CUSTOM CSS (TEXT instead of icons)
			htmlReporter.config().setCss(
					".status.pass::before {content:'PASS ';}" +
							".status.fail::before {content:'FAIL ';}" +
							".status.skip::before {content:'SKIP ';}" +
							".status.warning::before {content:'WARNING ';}" +
							".status.info::before {content:'INFO ';}" +

							// KI badge colour in the summary pie/legend
							".badge-warning {background-color:#e67e22 !important;}" +
							".badge-primary {background-color:#3498db !important;}" +
							".badge-success {background-color:#2ecc71 !important;}" +
							".badge-danger {background-color:#e74c3c !important;}"
			);

			extent = new ExtentReports();
			extent.attachReporter(htmlReporter);

			addSystemInfo(envUrl, timestamp);
		}
	}

	public static synchronized void createTest(String testName) {
		TEST.set(extent.createTest(testName));
	}

	public static ExtentTest getTest() {
		return TEST.get();
	}

	// ✅ NORMAL STEP (NO LOCATOR)
	public static void logStep(String message) {
		ExtentTest t = getTest();
		if (t != null) t.info(message);
	}

	// ✅ STEP LOGGING (clean)
	public static void logStepWithLocator(String description, String locator) {
		ExtentTest t = getTest();
		if (t == null) return;

		String html = description +
				"<br><details style='margin-left:20px;'>" +
				"<summary style='cursor:pointer;'>▶ Locator Details</summary>" +
				"<pre>" + locator + "</pre></details>";

		t.info(html);
	}

	// ✅ WARNING (uses warning status for visual distinction in the report)
	public static void logWarning(String message) {
		ExtentTest t = getTest();
		if (t != null) t.warning(message);
	}

	// ✅ IGNORED
	public static void logIgnored(String message) {
		ExtentTest t = getTest();
		if (t != null) t.info("<span style='color:orange;font-weight:bold;'>IGNORED</span> - " + message);
	}

	// ✅ KNOWN ISSUE — skip status renders as KNOWN_ISSUE in the report summary
	public static void logKnownIssue(String jiraId, String bugUrl) {
		ExtentTest t = getTest();
		if (t == null) return;

		t.skip("🟠 KNOWN ISSUE: Test skipped due to a known issue.<br>Refer to Bug ID: "
				+ "<a href='" + bugUrl + "' target='_blank'>" + jiraId + "</a>");

		t.info("Test is Marked as Known Issue: "
				+ "<a href='" + bugUrl + "' target='_blank'>" + jiraId + "</a>");
	}

	// ✅ FAILURE LOGGER
	public static void logFailure(String stepDesc, String locator, Exception e) {
		ExtentTest t = getTest();
		if (t == null) return;

		String html = "FAILED STEP: " + stepDesc +
				"<br><details style='margin-left:20px;'>" +
				"<summary style='cursor:pointer;'>▶ Locator Details</summary>" +
				"<pre>" + locator;

		if (e != null) {
			html += "\n\n" + e.getMessage();
		}

		html += "</pre></details>";

		t.fail(html);
	}

	public static void logFailure(String message, Exception e) {
		ExtentTest t = getTest();
		if (t == null) return;

		String html = "FAILED: " + message;

		if (e != null) {
			html += "<br><pre>" + e.getMessage() + "</pre>";
		}

		t.fail(html);
	}

	public static void logIgnoredScenario(String reason) {
		ExtentTest t = getTest();
		if (t != null) t.skip("🟡 IGNORED SCENARIO<br>" + reason);
	}

	public static synchronized void flushReport() {
		if (extent != null) {
			extent.flush();
		}
	}

	private static void addSystemInfo(String envUrl, String timestamp) {
		if (extent != null) {
			extent.setSystemInfo("TEST URL", envUrl);
			extent.setSystemInfo("EXECUTION TIME", timestamp);
		}
	}

	public static String getCurrentReportFileName() {
		return currentReportFileName;
	}
}