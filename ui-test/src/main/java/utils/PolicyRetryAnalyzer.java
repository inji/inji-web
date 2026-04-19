package utils;

import models.Policy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.IRetryAnalyzer;
import org.testng.ITestResult;
import utils.testdatamanager.PolicyManager;

import java.util.concurrent.TimeUnit;

/**
 * TestNG retry analyzer for {@code @NeedsPolicy} scenarios.
 *
 * <p>When a scenario fails because no Policy was available, this analyzer blocks the
 * current (idle) thread until a Policy is released by another test — then puts it back
 * and signals TestNG to retry the scenario. No thread is wasted spinning: the wait
 * lasts exactly as long as it takes for a Policy to be freed.
 *
 * <p>TestNG creates one instance of this class per test invocation (data-provider row),
 * so {@code retryCount} is tracked independently per scenario.
 */
public class PolicyRetryAnalyzer implements IRetryAnalyzer {

    private static final Logger logger = LoggerFactory.getLogger(PolicyRetryAnalyzer.class);

    /** Maximum number of retry attempts per scenario before permanently giving up. */
    private static final int MAX_RETRIES = 20;

    /**
     * How long (seconds) to wait for a Policy to be released on each retry attempt.
     */
    private static final long WAIT_TIMEOUT_SECONDS = 120;

    private int retryCount = 0;

    @Override
    public boolean retry(ITestResult result) {
        if (result.getStatus() != ITestResult.FAILURE) {
            return false;
        }
        if (!(result.getThrowable() instanceof NoPolicyAvailableException)) {
            return false;
        }
        if (retryCount >= MAX_RETRIES) {
            logger.warn("[PolicyRetry] '{}' – exhausted {} retries, no Policy ever became available",
                    scenarioName(result), MAX_RETRIES);
            return false;
        }

        retryCount++;
        logger.info("[PolicyRetry] '{}' – retry {}/{}: blocking until a Policy is released (max {}s)",
                scenarioName(result), retryCount, MAX_RETRIES, WAIT_TIMEOUT_SECONDS);

        try {
            Policy policy = PolicyManager.waitForPolicy(WAIT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (policy != null) {
                PolicyManager.offerPolicy(policy);
                logger.info("[PolicyRetry] '{}' – Policy released, queuing retry {}/{}",
                        scenarioName(result), retryCount, MAX_RETRIES);
                return true;
            }
            logger.warn("[PolicyRetry] '{}' – timed out after {}s waiting for a Policy (retry {}/{})",
                    scenarioName(result), WAIT_TIMEOUT_SECONDS, retryCount, MAX_RETRIES);
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