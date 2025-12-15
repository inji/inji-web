package runnerfiles;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.log4j.Logger;
import org.junit.runner.RunWith;
import org.testng.ITestResult;
import org.testng.TestNG;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import api.InjiWebConfigManager;
import io.cucumber.junit.Cucumber;
import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;
import io.cucumber.testng.CucumberOptions.SnippetType;
import io.cucumber.testng.FeatureWrapper;
import io.cucumber.testng.PickleWrapper;
import io.jsonwebtoken.lang.Collections;
import io.mosip.testrig.apirig.dataprovider.BiometricDataProvider;
import io.mosip.testrig.apirig.testrunner.BaseTestCase;
import io.mosip.testrig.apirig.testrunner.ExtractResource;
import io.mosip.testrig.apirig.testrunner.HealthChecker;
import io.mosip.testrig.apirig.testrunner.OTPListener;
import io.mosip.testrig.apirig.utils.AdminTestUtil;
import io.mosip.testrig.apirig.utils.AuthTestsUtil;
import io.mosip.testrig.apirig.utils.CertsUtil;
import io.mosip.testrig.apirig.utils.ConfigManager;
import io.mosip.testrig.apirig.utils.GlobalConstants;
import io.mosip.testrig.apirig.utils.JWKKeyUtil;
import io.mosip.testrig.apirig.utils.KeyCloakUserAndAPIKeyGeneration;
import io.mosip.testrig.apirig.utils.KeycloakUserManager;
import io.mosip.testrig.apirig.utils.MispPartnerAndLicenseKeyGeneration;
import io.mosip.testrig.apirig.utils.OutputValidationUtil;
import io.mosip.testrig.apirig.utils.PartnerRegistration;

@RunWith(Cucumber.class)
@CucumberOptions(features = {}, dryRun = false, glue = { "stepdefinitions",
		"utils" }, snippets = SnippetType.CAMELCASE, monochrome = true, plugin = { "pretty", "html:reports",
				"html:target/cucumber.html", "json:target/cucumber.json", "summary",
				"com.aventstack.extentreports.cucumber.adapter.ExtentCucumberAdapter:" }
// tags = "@smoke"
)

public class Runner extends AbstractTestNGCucumberTests {

	private static final Logger LOGGER = Logger.getLogger(Runner.class);
	private static String cachedPath = null;

	public static String jarUrl = Runner.class.getProtectionDomain().getCodeSource().getLocation().getPath();
	public static List<String> languageList = new ArrayList<>();
	public static boolean skipAll = false;
	private static final ReentrantLock sequentialLock = new ReentrantLock(true); // fair lock
	private static ThreadLocal<Boolean> sequentialFeatureFlag = ThreadLocal.withInitial(() -> false);

	public static void acquireLockIfRequired(boolean isSequentialFeature) {
		sequentialFeatureFlag.set(isSequentialFeature);
		if (isSequentialFeature) {
			sequentialLock.lock();
		}
	}

	public static void releaseLockIfRequired() {
		    try {
			      if (sequentialFeatureFlag.get()) {
			            sequentialLock.unlock();
			        }
			    } finally {
			        sequentialFeatureFlag.remove();
			    }
	}

	public static void main(String[] args) {
		OTPListener otpListener = new OTPListener();
		try {
			LOGGER.info(
					"** ------------- Inji web ui Run Started for prerequisite creation---------------------------- **");

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
			otpListener.run();

			// Generating biometric details with mock MDS
			BiometricDataProvider.generateBiometricTestData("Registration");
			updateFeaturesPath();
			startTestRunner();
		} catch (Exception e) {
			LOGGER.error("Exception " + e.getMessage());
		}
		otpListener.bTerminate = true;
		System.exit(0);
	}

	public static void suiteSetup(String runType) {
		BaseTestCase.initialize();
		LOGGER.info("Done with BeforeSuite and test case setup! su TEST EXECUTION!\n\n");

		if (!runType.equalsIgnoreCase("JAR")) {
			AuthTestsUtil.removeOldMosipTempTestResource();
		}

		BaseTestCase.currentModule = "injiweb";
		BaseTestCase.certsForModule = "injiweb";
		AdminTestUtil.copymoduleSpecificAndConfigFile("injiweb");
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
			homeDir = new File(dir.getParent() + "/mosip/testNgXmlFiles");
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
	@DataProvider(parallel = true, name = "scenarios")
	public Object[][] scenarios() {

	    // Defensive initialization
	    int threadCount = 3; // default value

	    // Safe property read
	    String threadCountStr = ConfigManager.getproperty("threadCount");
	    if (threadCountStr != null && !threadCountStr.trim().isEmpty()) {
	        try {
	            threadCount = Integer.parseInt(threadCountStr.trim());
	        } catch (NumberFormatException e) {
	            System.out.println("Invalid threadCount in config, using default " + threadCount);
	        }
	    }

	    Object[][] scenarios = super.scenarios();
	    System.out.println("Number of scenarios provided: " + scenarios.length);

	    // Safe scenario logging
	    for (Object[] scenario : scenarios) {
	        if (scenario != null && scenario.length > 0 && scenario[0] instanceof PickleWrapper) {
	            System.out.println("Scenario Name: "
	                    + ((PickleWrapper) scenario[0]).getPickle().getName());
	        } else {
	            System.out.println("Scenario data is not as expected!");
	        }
	    }

	    // Wrap scenarios into a new Object[][] (keeps your framework behavior unchanged)
	    List<Object[]> parallelScenarios = new ArrayList<>();
	    for (Object[] scenario : scenarios) {
	        if (scenario != null && scenario.length >= 2) {
	            parallelScenarios.add(new Object[]{scenario[0], scenario[1]});
	        }
	    }

	    return parallelScenarios.toArray(new Object[0][]);
	}


	@BeforeMethod
	public void setTestName(ITestResult result) {
		result.getMethod().setDescription("Running Scenario: " + result.getMethod().getMethodName());
	}

	@Test(dataProvider = "scenarios")
	public void runScenario(PickleWrapper pickle, FeatureWrapper feature) {
		// Optional: set thread name for easier logging
		Thread.currentThread().setName(pickle.getPickle().getName());
		boolean isSequentialScenario = pickle.getPickle().getTags().stream()
				.anyMatch(tag -> tag.equalsIgnoreCase("@sequential"));
		acquireLockIfRequired(isSequentialScenario);
		try {
			System.out.println("Running Scenario: " + pickle.getPickle().getName());
			super.runScenario(pickle, feature);
		} finally {
			releaseLockIfRequired();
		}
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
		File homeDir = null;
		String os = System.getProperty("os.name").toLowerCase();
		if (os.contains("windows")) {
			System.setProperty("cucumber.features", "src\\test\\resources\\featurefiles\\");
		} else {
			System.setProperty("cucumber.features", "/home/mosip/featurefiles/");
		}
	}

}
