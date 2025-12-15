@sequential
Feature: download mosip cridentials

  @smoke @VerifyAndDownloadVcViaMosipNatinalId
  Scenario Outline: Mosip Natonal Id by e-Signet
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers mosip
    When User click on download mosip credentials button
    Then User verify list of credential types displayed
    And User verify mosip national id by e-signet displayed
    When User click on mosip national id by e-signet button
    Then User click on data share content validity
    Then User click on select custom validity button
    Then user enter validity for data share content "<Validity>"
    Then Use click on procced button
    And User verify login page lables
    And User verify vid input box header
    And User enter the uin
    And User click on getOtp button
    And User enter the otp
    And User click on verify button
    And User verify downloading in progress text
    And User verify go home button
    Then User verify Download Success text displayed

    Examples:
      | Validity |
      | 3        |

  @smoke @VerifySearchWithInvalidString
  Scenario: Verify Search With Invalid String
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers with "qewqdda"
    And User Verify the no issuer found message
    And User search the issuers mosip
    When User click on download mosip credentials button

  @smoke @VerifyAndDownloadVcViaMosipNatinalId
  Scenario Outline: Verify And DownloadVc Via Mosip NatinalId
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers mosip
    And User verify the logo of the issuer
    When User click on download mosip credentials button
    And User verify the logo of the issuer
    Then User verify list of credential types displayed
    And User verify mosip national id by e-signet displayed
    When User click on mosip national id by e-signet button
    Then User click on data share content validity
    Then User click on select custom validity button
    Then user enter validity for data share content "<Validity>"
    Then Use click on procced button
    And User verify login page lables
    And User verify vid input box header
    And User enter the uin
    And User click on getOtp button
    And User enter the otp
    And User click on verify button
    And User verify go home button
    Then User verify Download Success text displayed
    And User verify pdf is downloaded

    Examples:
      | Validity |
      | 3        |

  @smoke @VerifyAndDownloadVcViaMosipNatinalIdAndRfreshPage
  Scenario Outline: Verify And DownloadVc Via Mosip NatinalId And rfreshPage
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers mosip
    When User click on download mosip credentials button
    Then User verify list of credential types displayed
    And User verify mosip national id by e-signet displayed
    When User click on mosip national id by e-signet button
    Then User click on data share content validity
    Then User click on select custom validity button
    Then user enter validity for data share content "<Validity>"
    Then Use click on procced button
    And User verify login page lables
    And User verify vid input box header
    And User enter the uin
    And User click on getOtp button
    And User enter the otp
    And User click on verify button
    And User verify go home button
    Then User verify Download Success text displayed
    And user refresh the page
    And user verify the page after Refresh

    Examples:
      | Validity |
      | 3        |
   
  @smoke @VerifyAndDownloadVcViaMosipNatinalId @mobileview
  Scenario Outline: Mosip Natonal Id by e-Signet
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers mosip
    When User click on download mosip credentials button
    Then User verify search and title are appeare in the same line
    Then User verify list of credential types displayed
    And User verify mosip national id by e-signet displayed
    When User click on mosip national id by e-signet button
    Then User click on data share content validity
    Then User click on select custom validity button
    Then user enter validity for data share content "<Validity>"
    Then Use click on procced button
    And User verify login page lables
    And User verify vid input box header
    And User enter the uin
    And User click on getOtp button
    And User enter the otp
    And User click on verify button
    And User verify downloading in progress text
    And User verify go home button
    Then User verify Download Success text displayed
    And User verify pdf is downloaded

    Examples:
      | Validity |
      | 3        |