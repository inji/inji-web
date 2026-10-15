Feature: Login using Sunbird Credentials

  @smoke @VerifyAndDownloadVcViaSunbirdInsurance @NeedsPolicy
  Scenario Outline: download vc via sunbird with invalid and valid credentials
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers sunbird
    And User verify sunbird credentials button
    And User click on sunbird credentials button
    Then User verify list of credential types displayed
    And User verify sunbird rc insurance verifiable credential displayed
    And User click on sunbird rc insurance verifiable credential button
    Then User click on data share content validity
    Then User click on select custom validity button
    Then user enter validity for data share content "<Validity>"
    Then Use click on proceed button
    And User enter the policy number "<invalid policy number>"
    And User enter the full name
    And User enter the date of birth
    And User click on login button expecting failure
    Then User verify authentication failed message
    And User close the error message
    And User enter the policy number
    And User enter the full name "<invalid full name>"
    And User enter the date of birth
    And User click on login button expecting failure
    Then User verify authentication failed message
    And User close the error message
    And User enter the policy number
    And User enter the full name
    And User enter the date of birth "<invalid date of birth>"
    And User click on login button expecting failure
    Then User verify authentication failed message
    And User close the error message
    And User enter the policy number
    And User enter the full name
    And User enter the date of birth
    And User click on login button
    Then User verify Download Success text displayed
    And User verify pdf is downloaded for Insurance
    And User verify go home button

    Examples:
     | Validity | invalid policy number | invalid full name | invalid date of birth |
     |3| 1207202 | Invalid Name | 1990-01-01 |

  @smoke @VerifyAndDownloadVcViaSunbirdLife @NeedsPolicy
  Scenario Outline: download vc via sunbird life
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers sunbird
    And User verify sunbird credentials button
    And User click on sunbird credentials button
    Then User verify list of credential types displayed
    And User verify life Insurance displayed
    And User click on life Insurance button
    Then User click on data share content validity
    Then User click on select custom validity button
    Then user enter validity for data share content "<Validity>"
    Then Use click on proceed button
    And User verify policy number input box header
    And User enter the policy number
    And User verify full name input box header
    And User enter the full name
    And User verify date of birth input box header
    And User enter the date of birth
    And User click on login button
    Then User verify Download Success text displayed
    And User verify go home button

    Examples:
      | Validity |
      |3|