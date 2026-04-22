package utils;

import io.cucumber.plugin.event.*;

public class StepContext {

    private static final ThreadLocal<String> CURRENT_STEP = new ThreadLocal<>();

    public static void setStep(String step) {
        CURRENT_STEP.set(step);
    }

    public static String getCurrentStepText() {
        return CURRENT_STEP.get();
    }
}