package utils;

import io.cucumber.plugin.ConcurrentEventListener;
import io.cucumber.plugin.event.*;

public class StepListener implements ConcurrentEventListener {

    @Override
    public void setEventPublisher(EventPublisher publisher) {

        publisher.registerHandlerFor(TestStepStarted.class, event -> {

            if (ExtentReportManager.getTest() == null) {
                return; // ✅ prevents NPE
            }

            // ✅ STOP logging for skipped / KI / ignored / failed
            if (BaseTest.isScenarioFailed()
                    || BaseTest.isScenarioSkipped()
                    || BaseTest.isScenarioIgnored()
                    || BaseTest.isKnownIssueScenario()) {
                return;
            }

            if (event.getTestStep() instanceof PickleStepTestStep) {

                String stepText =
                        ((PickleStepTestStep) event.getTestStep())
                                .getStep().getText();

                StepContext.setStep(stepText);

                // ✅ Step counter
                int stepNumber = BaseTest.getStepCounter().get() + 1;

                // ✅ LOG STEP HERE (CORRECT PLACE)
                ExtentReportManager.getTest().info(
                        "<br><b style='color:#00bcd4;'>STEP " + stepNumber + ":</b> " + stepText
                );

                BaseTest.getStepCounter().set(stepNumber);
            }
        });
    }
}