package runnerfiles;

import utils.InjiWebConfigManager;
import io.cucumber.junit.Cucumber;
import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;
import io.cucumber.testng.CucumberOptions.SnippetType;
import io.cucumber.testng.FeatureWrapper;
import io.cucumber.testng.PickleWrapper;
import io.mosip.testrig.apirig.dataprovider.BiometricDataProvider;
import io.mosip.testrig.apirig.testrunner.BaseTestCase;
import io.mosip.testrig.apirig.testrunner.ExtractResource;
import io.mosip.testrig.apirig.testrunner.HealthChecker;
import io.mosip.testrig.apirig.testrunner.OTPListener;
import io.mosip.testrig.apirig.utils.*;
import org.apache.log4j.Logger;
import org.junit.runner.RunWith;
import org.testng.ITestResult;
import org.testng.TestNG;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.xml.XmlSuite;
import utils.InjiWebConstants;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RunWith(Cucumber.class)
@CucumberOptions(
		features = {},
		dryRun = false,
		glue = {"stepdefinitions", "utils"},
		snippets = SnippetType.CAMELCASE,
		monochrome = true,
		plugin = {"pretty",
				"html:reports",
				"html:target/cucumber.html", "json:target/cucumber.json",
				"summary","com.aventstack.extentreports.cucumber.adapter.ExtentCucumberAdapter:"}
		//tags = "@smoke"
)
public class Runner extends AbstractTestNGCucumberTests{
	
	private static final Logger LOGGER = Logger.getLogger(Runner.class);
	private static String cachedPath = null;

	public static String jarUrl = Runner.class.getProtectionDomain().getCodeSource().getLocation().getPath();
	public static OTPListener otpListener = null;
	

	public static void main(String[] args) {
		try {
			LOGGER.info("** ------------- Inji web ui Run Started for prerequisite creation---------------------------- **");
			
			BaseTestCase.setRunContext(getRunType(), jarUrl);
			ExtractResource.removeOldMosipTestTestResource();
			if (getRunType().equalsIgnoreCase("JAR")) {
				ExtractResource.extractCommonResourceFromJar();
			} else {
				ExtractResource.copyCommonResources();
			}
			AdminTestUtil.init();
			InjiWebConfigManager.init();
			
			suiteSetup(getRunType());
			setLogLevels();

			HealthChecker healthcheck = new HealthChecker();
			healthcheck.setCurrentRunningModule(BaseTestCase.currentModule);
			Thread trigger = new Thread(healthcheck);
			trigger.start();
			
			KeycloakUserManager.removeUser();
			KeycloakUserManager.createUsers();
			KeycloakUserManager.closeKeycloakInstance();
			AdminTestUtil.getRequiredField();

			// Generate device certificates to be consumed by Mock-MDS
			PartnerRegistration.deleteCertificates();
			AdminTestUtil.createAndPublishPolicy();
			AdminTestUtil.createEditAndPublishPolicy();
			PartnerRegistration.deviceGeneration();

			// Generating biometric details with mock MDS
			BiometricDataProvider.generateBiometricTestData("Registration");
			updateFeaturesPath();
			startTestRunner();
		} catch (Exception e) {
			LOGGER.error("Exception " + e.getMessage());
		}

		OTPListener.bTerminate = true;
		HealthChecker.bTerminate = true;
		System.exit(0);
	}
	
	public static void suiteSetup(String runType) {
		BaseTestCase.initialize();
		LOGGER.info("Done with BeforeSuite and test case setup! su TEST EXECUTION!\n\n");

		if (!runType.equalsIgnoreCase("JAR")) {
			AuthTestsUtil.removeOldMosipTempTestResource();
		}
		
		BaseTestCase.currentModule = BaseTestCase.runContext + "injiweb";
		BaseTestCase.certsForModule = BaseTestCase.runContext + "injiweb";
		BaseTestCase.copymoduleSpecificAndConfigFile(InjiWebConstants.INJI_WEB);

		otpListener = new OTPListener();
		otpListener.run();
	}
		
	public static void startTestRunner() {
		File homeDir = null;
		String os = System.getProperty("os.name");
		LOGGER.info(os);
		if (getRunType().contains("IDE") || os.toLowerCase().contains("windows")) {
			homeDir = new File(System.getProperty("user.dir") + "/testNgXmlFiles");
			LOGGER.info("IDE :" + homeDir);
		} else {
			File dir = new File(System.getProperty("user.dir"));
			homeDir = new File(dir.getParent() + "/inji/testNgXmlFiles");
			LOGGER.info("ELSE :" + homeDir);
		}
		File[] files = homeDir.listFiles();
		if (files != null) {
			for (File file : files) {
				TestNG runner = new TestNG();
				List<String> suitefiles = new ArrayList<>();
				if (file.getName().toLowerCase().contains("mastertestsuite")) {
					BaseTestCase.setReportName("injiweb");
					suitefiles.add(file.getAbsolutePath());
					runner.setTestSuites(suitefiles);
					int threadCount = getConfiguredThreadCount();
					runner.setParallel(XmlSuite.ParallelMode.METHODS);
					runner.setThreadCount(threadCount);
					runner.setDataProviderThreadCount(threadCount);
					System.getProperties().setProperty("testng.outpur.dir", "testng-report");
					runner.setOutputDirectory("testng-report");
					runner.run();
				}
			}
		} else {
			LOGGER.error("No files found in directory: " + homeDir);
		}
	}

	public static String getRunType() {
		if (Runner.class.getResource("Runner.class").getPath().contains(".jar"))
			return "JAR";
		else
			return "IDE";
	}
	
	@Override
	@DataProvider(parallel = true)
	public Object[][] scenarios() {
		return super.scenarios();
	}

	@BeforeMethod
	public void setTestName(ITestResult result) {
		result.getMethod().setDescription("Running Scenario: " + result.getMethod().getMethodName());
	}



	@Test(dataProvider = "scenarios", retryAnalyzer = utils.ScenarioRetryAnalyzer.class)
	public void runScenario(PickleWrapper pickle, FeatureWrapper feature) {
		System.out.println("Running Scenario: " + pickle.getPickle().getName());
		Thread.currentThread().setName(pickle.getPickle().getName());
		super.runScenario(pickle, feature);
	}
	
	public static String getGlobalResourcePath() {
		if (cachedPath != null) {
			return cachedPath;
		}

		String path = null;
		if (getRunType().equalsIgnoreCase("JAR")) {
			path = new File(jarUrl).getParentFile().getAbsolutePath() + "/MosipTestResource/MosipTemporaryTestResource";
		} else if (getRunType().equalsIgnoreCase("IDE")) {
			path = new File(Runner.class.getClassLoader().getResource("").getPath()).getAbsolutePath()
					+ "/MosipTestResource/MosipTemporaryTestResource";
			if (path.contains(GlobalConstants.TESTCLASSES))
				path = path.replace(GlobalConstants.TESTCLASSES, "classes");
		}

		if (path != null) {
			cachedPath = path;
			return path;
		} else {
			return "Global Resource File Path Not Found";
		}
	}


	public static String getResourcePath() {
		return getGlobalResourcePath();
	}
	
	private static void setLogLevels() {
		AdminTestUtil.setLogLevel();
		OutputValidationUtil.setLogLevel();
		PartnerRegistration.setLogLevel();
		KeyCloakUserAndAPIKeyGeneration.setLogLevel();
		MispPartnerAndLicenseKeyGeneration.setLogLevel();
		JWKKeyUtil.setLogLevel();
		CertsUtil.setLogLevel();
	}

	public static void updateFeaturesPath() {
		String annotationFeatures = getFeaturesFromAnnotation();
		if (annotationFeatures != null) {
			System.setProperty("cucumber.features", annotationFeatures);
			LOGGER.info("Using cucumber features from @CucumberOptions: " + annotationFeatures);
		} else {
			String configuredFeatures = System.getProperty("cucumber.features");
			if (configuredFeatures == null || configuredFeatures.trim().isEmpty()) {
				String os = System.getProperty("os.name").toLowerCase();
				if (os.contains("windows")) {
					System.setProperty("cucumber.features", "src\\test\\resources\\featurefiles\\");
				} else {
					System.setProperty("cucumber.features", "/home/inji/featurefiles/");
				}
			}
		}

		String configuredTags = System.getProperty("cucumber.filter.tags");
		if (configuredTags != null && !configuredTags.trim().isEmpty()) {
			LOGGER.info("Applying cucumber tag filter: " + configuredTags);
		}
		LOGGER.info("Using cucumber features path: " + System.getProperty("cucumber.features"));
	} 

	private static String getFeaturesFromAnnotation() {
		CucumberOptions options = Runner.class.getAnnotation(CucumberOptions.class);
		if (options == null || options.features() == null || options.features().length == 0) {
			return null;
		}

		StringBuilder features = new StringBuilder();
		for (String feature : options.features()) {
			if (feature == null || feature.trim().isEmpty()) {
				continue;
			}
			if (features.length() > 0) {
				features.append(",");
			}
			features.append(feature.trim());
		}
		return features.length() == 0 ? null : features.toString();
	}

	private static int getConfiguredThreadCount() {
		boolean runOnBrowserStack = isBrowserStackRunEnabled();
		try {
			String configuredPropertyName = runOnBrowserStack ? "browserStackRunThreadCount" : "localRunThreadCount";
			String configuredValue = InjiWebConfigManager.getproperty(configuredPropertyName);
			if (configuredValue == null || configuredValue.trim().isEmpty()) {
				throw new IllegalStateException(configuredPropertyName + " is missing in injiweb.properties");
			}
			int parsed = Integer.parseInt(configuredValue.trim());
			if (parsed < 1) {
				LOGGER.warn("Invalid " + configuredPropertyName + " '" + configuredValue
						+ "'. Falling back to 1 thread.");
				return 1;
			}
			return parsed;
		} catch (Exception e) {
			LOGGER.warn("Failed to read thread config from injiweb.properties. Falling back to 1 thread.", e);
			return 1;
		}
	}

	private static boolean isBrowserStackRunEnabled() {
		String envValue = System.getenv("RUN_ON_BROWSERSTACK");
		if (envValue != null && !envValue.trim().isEmpty()) {
			return Boolean.parseBoolean(envValue.trim());
		}

		String propertyValue = InjiWebConfigManager.getproperty("runOnBrowserStack");
		if (propertyValue == null || propertyValue.trim().isEmpty()) {
			return true;
		}
		return Boolean.parseBoolean(propertyValue.trim());
	}

}
