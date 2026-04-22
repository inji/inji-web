package utils;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.log4j.Logger;

import io.mosip.testrig.apirig.utils.ConfigManager;
import runnerfiles.Runner;

public class InjiWebConfigManager extends ConfigManager{
	private static final Logger LOGGER = Logger.getLogger(InjiWebConfigManager.class);
	private static final String WAIT_TIME_PROPERTY = "waitTime";
	private static final String SHORT_WAIT_TIME_PROPERTY = "shortWaitTime";
	private static final String OTP_VERIFICATION_PAGE_WAIT_TIME_PROPERTY = "otpVerificationPageWaitTime";
	private static final int DEFAULT_WAIT_TIME_SECONDS = 30;
	private static final int DEFAULT_SHORT_WAIT_TIME_SECONDS = 3;
	private static final int DEFAULT_OTP_VERIFICATION_PAGE_WAIT_TIME_SECONDS = 30;

	public static void init() {
		Map<String, Object> moduleSpecificPropertiesMap = new HashMap<>();
		// Load scope specific properties
		try {
			String path = Runner.getGlobalResourcePath() + "/config/injiweb.properties";
			Properties props = getproperties(path);
			// Convert Properties to Map and add to moduleSpecificPropertiesMap
			for (String key : props.stringPropertyNames()) {
				moduleSpecificPropertiesMap.put(key, props.getProperty(key));
			}
		} catch (Exception e) {
			LOGGER.error(e.getMessage());
		}
		// Add module specific properties as well.
		init(moduleSpecificPropertiesMap);
	}

	public static String getapiEndUser() { return getproperty("apiEnvUser"); }

	public static int getWaitTimeInSeconds() {
		return getIntProperty(WAIT_TIME_PROPERTY, DEFAULT_WAIT_TIME_SECONDS);
	}

	public static int getShortWaitTimeInSeconds() {
		return getIntProperty(SHORT_WAIT_TIME_PROPERTY, DEFAULT_SHORT_WAIT_TIME_SECONDS);
	}

	public static int getOtpVerificationPageWaitTimeInSeconds() {
		return getIntProperty(OTP_VERIFICATION_PAGE_WAIT_TIME_PROPERTY,
				DEFAULT_OTP_VERIFICATION_PAGE_WAIT_TIME_SECONDS);
	}

	private static int getIntProperty(String propertyName, int defaultValue) {
		String value = getproperty(propertyName);
		if (value == null || value.trim().isEmpty()) {
			return defaultValue;
		}
		try {
			return Integer.parseInt(value.trim());
		} catch (NumberFormatException e) {
			LOGGER.warn("Invalid " + propertyName + " value '" + value
					+ "'. Using default " + defaultValue + " seconds.");
			return defaultValue;
		}
	}
	
	
	public static boolean isHeadless() {
		String value = getproperty("headless");
		if (value == null || value.trim().isEmpty()) {
			return false;
		}
		return Boolean.parseBoolean(value.trim());
	}

	public static String getSunbirdBaseURL() {
		return InjiWebUtil.getValueFromMimotoActuator("overrides", "mosip.sunbird.url");
		
	}

}
