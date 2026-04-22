package utils;

import models.Policy;
import models.Uin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.IRetryAnalyzer;
import org.testng.ITestResult;
import utils.testdatamanager.PolicyManager;
import utils.testdatamanager.UINManager;

import java.util.concurrent.TimeUnit;

/**
 * Combined TestNG retry analyzer for {@code @NeedsUIN} and {@code @NeedsPolicy} scenarios.
 *
 * <p>When a scenario fails because no UIN or Policy was available, this analyzer blocks
 * the current idle thread until one is released, then re-queues the scenario for retry.
 * TestNG creates one instance per test invocation (data-provider row), so retry counts
 * are tracked independently per scenario.
 */
public class ScenarioRetryAnalyzer implements IRetryAnalyzer {

    private static final Logger logger = LoggerFactory.getLogger(ScenarioRetryAnalyzer.class);

    private static final int MAX_RETRIES = 20;
    private static final long WAIT_TIMEOUT_SECONDS = 120;

    private int uinRetryCount = 0;
    private int policyRetryCount = 0;

    @Override
    public boolean retry(ITestResult result) {
        if (result.getStatus() != ITestResult.FAILURE) {
            return false;
        }

        logger.info("🔁 Retry triggered for scenario: {}", scenarioName(result));

        Throwable root = result.getThrowable();
        while (root.getCause() != null) {
            root = root.getCause();
        }

        if (root instanceof NoUINAvailableException) {
            return retryForUIN(result);
        }
        if (root instanceof NoPolicyAvailableException) {
            return retryForPolicy(result);
        }
        return false;
    }

    private boolean retryForUIN(ITestResult result) {
        if (uinRetryCount >= MAX_RETRIES) {
            logger.warn("[UINRetry] '{}' – exhausted {} retries, no UIN ever became available",
                    scenarioName(result), MAX_RETRIES);
            return false;
        }
        uinRetryCount++;
        logger.info("[UINRetry] '{}' – retry {}/{}: blocking until a UIN is released (max {}s)",
                scenarioName(result), uinRetryCount, MAX_RETRIES, WAIT_TIMEOUT_SECONDS);
        try {
            Uin uin = UINManager.waitForUIN(WAIT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (uin != null) {
                UINManager.offerUIN(uin);
                logger.info("[UINRetry] '{}' – UIN released, queuing retry {}/{}",
                        scenarioName(result), uinRetryCount, MAX_RETRIES);
                return true;
            }
            logger.warn("[UINRetry] '{}' – timed out after {}s waiting for a UIN (retry {}/{})",
                    scenarioName(result), WAIT_TIMEOUT_SECONDS, uinRetryCount, MAX_RETRIES);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("[UINRetry] '{}' – interrupted while waiting for UIN", scenarioName(result));
        }
        return false;
    }

    private boolean retryForPolicy(ITestResult result) {
        if (policyRetryCount >= MAX_RETRIES) {
            logger.warn("[PolicyRetry] '{}' – exhausted {} retries, no Policy ever became available",
                    scenarioName(result), MAX_RETRIES);
            return false;
        }
        policyRetryCount++;
        logger.info("[PolicyRetry] '{}' – retry {}/{}: blocking until a Policy is released (max {}s)",
                scenarioName(result), policyRetryCount, MAX_RETRIES, WAIT_TIMEOUT_SECONDS);
        try {
            Policy policy = PolicyManager.waitForPolicy(WAIT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (policy != null) {
                PolicyManager.offerPolicy(policy);
                logger.info("[PolicyRetry] '{}' – Policy released, queuing retry {}/{}",
                        scenarioName(result), policyRetryCount, MAX_RETRIES);
                return true;
            }
            logger.warn("[PolicyRetry] '{}' – timed out after {}s waiting for a Policy (retry {}/{})",
                    scenarioName(result), WAIT_TIMEOUT_SECONDS, policyRetryCount, MAX_RETRIES);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("[PolicyRetry] '{}' – interrupted while waiting for Policy", scenarioName(result));
        }
        return false;
    }

    private static String scenarioName(ITestResult result) {
        Object[] params = result.getParameters();
        if (params != null && params.length > 0) {
            return params[0].toString();
        }
        return result.getName();
    }
}