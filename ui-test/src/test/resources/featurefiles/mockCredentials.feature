Feature: download mock identity sd-jwt and mdl credentials

  @smoke @oidcLogin @preResetPasscode @mutatesWalletCards
  Scenario Outline: User download Mock Identity SD-JWT and MDL card and verifies it
    When user performs token-based login using Gmail refresh token
    And user enters the passcode "<initialPasscode>"
    And user click on submit button
    Then user click on stored credentials button
    Then user verify current url user credentials
    Then user captures the stored credential card count
    Then User click on cards button
    And User search the issuers mock
    When User click on download mock credentials button
    Then User verify list of credential types displayed for mock
    And User verify mock verifiable credential SD-JWT displayed
    When User click on mock verifiable credential SD-JWT button
    And User verify login page lables
    And User verify vid input box header
    And User enter the sd-jwt uin
    And User click on getOtp button
    And User enter the mock otp
    And User click on verify button
    Then User verifies mosip vc is downloaded successfully
    Then user click on stored credentials button
    Then user verifies a new credential card is added to stored cards
    Then user deletes the most recently added credential card
    Then user verifies the credential card is removed from stored cards
    Then user refresh the page
    Then user verifies the credential card is removed from stored cards
    Then User click on cards button
    And User search the issuers mdl
    When User click on download mdl credentials button
    Then User verify list of credential types displayed for mdl
    And User verify mock verifiable credential MDL displayed
    When User click on mock verifiable credential MDL button
    And User verify login page lables
    And User verify vid input box header
    And User enter the mdl uin
    And User click on getOtp button
    And User enter the mock otp
    And User click on verify button
    Then User verifies mosip vc is downloaded successfully
    Then user click on stored credentials button
    Then user verifies a new credential card is added to stored cards
    Then user deletes the most recently added credential card
    Then user verifies the credential card is removed from stored cards
    Then user refresh the page
    Then user verifies the credential card is removed from stored cards

    Examples:
      | initialPasscode |
      | 123456          |
