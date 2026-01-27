package utils;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Properties;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

public class ExtentReportManager {
	private static ExtentReports extent;
    private static final ThreadLocal<ExtentTest> testThread = new ThreadLocal<>();

	public static String currentReportFileName;
	private static String timestamp;

	public static void initReport() {
		if (extent == null) {
			String envUrl = BaseTest.url;
			if (envUrl.endsWith("/")) {
				envUrl = envUrl.substring(0, envUrl.length() - 1);
			}
			timestamp = new SimpleDateFormat("yyyy-MM-dd-HH-mm").format(new Date());
			String domainOnly = envUrl.replaceFirst("https?://", "");
			String formattedEnvName = "InjiWebUi-" + domainOnly;
			currentReportFileName = formattedEnvName + "-" + timestamp + ".html";
			ExtentHtmlReporter htmlReporter = new ExtentHtmlReporter("test-output/" + currentReportFileName);
			htmlReporter.config().setTheme(Theme.DARK);
			htmlReporter.config().setDocumentTitle("Automation Report");
			htmlReporter.config().setReportName(formattedEnvName);
			extent = new ExtentReports();
			extent.attachReporter(htmlReporter);
			addSystemInfo(envUrl, timestamp);
		}
	}

	public static String getCurrentReportFileName() {
		return currentReportFileName;
	}

	private static void addSystemInfo(String envUrl, String timestamp) {
		String branch = getGitBranch();
		String commitId = getGitCommitId();
		String testUrl = System.getenv("TEST_URL");
		if (testUrl == null || testUrl.trim().isEmpty()) {
			testUrl = envUrl;
		}

		if (extent != null) {
			extent.setSystemInfo("Git BRANCH", branch);
			extent.setSystemInfo("COMMIT ID", commitId);
			extent.setSystemInfo("TEST URL", testUrl);
            extent.setSystemInfo("EXECUTION TIME", timestamp);
		}
	}

	private static String getGitBranch() {
		return getGitProperty("git.branch");
	}

	private static String getGitCommitId() {
		return getGitProperty("git.commit.id");
	}

	private static String getGitProperty(String key) {
		Properties properties = new Properties();
		try (InputStream is = ExtentReportManager.class.getClassLoader().getResourceAsStream("git.properties")) {
			if (is == null) {
				throw new IllegalStateException("git.properties file not found in classpath.");
			}
			properties.load(is);
			String value = properties.getProperty(key);
			if (value == null) {
				throw new IllegalStateException("Key '" + key + "' not found in git.properties.");
			}
			return value;
		} catch (IOException e) {
			throw new RuntimeException("Failed to read git.properties", e);
		}
	}

    public static synchronized void createTest(String testName) {
        ExtentTest test = extent.createTest(testName);
        testThread.set(test);
	}

    public static ExtentTest getTest() {
        return testThread.get();
		}

	public static void flushReport() {
		if (extent != null) {
			extent.flush();
		}
	}

    public static void removeTest() {
        testThread.remove();
	}
    public static void logStep(String message) {
        ExtentTest test = testThread.get(); 
        if (test != null) {
            test.info(message);
        }
    }
}
