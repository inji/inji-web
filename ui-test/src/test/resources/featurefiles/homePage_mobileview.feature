Feature: Inji web homepage testing

  @smoke @verifyingHomepage @mobileview
  Scenario: Verify the Inji web homepage
    Given User gets the title of the page
    Then User validate the title of the page
    Then User verify that home banner heading
    Then User verify that home banner description
    Then User verify that home features heading
    Then User verify that home features description1
    Then User verify that home features mobile image
    Then User verify navigation button
    Then User click on continue as guest
    Then User verify header displayed
    Then User verify that home page container displayed
    Then User verify the footer on home page
    And User verify that inji web logo is displayed
    And User verify that on home page searchbox is present
    And User verify that langauge button is displayed

  @smoke @VerifyAndDownloadVcViaSunbirdInsurance @mobileview
  Scenario Outline: download vc via sunbird
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers sunbird
    And User verify sunbird cridentials button
    And User click on sunbird cridentials button
    Then User verify list of credential types displayed
    And User verify sunbird rc insurance verifiable credential displayed
    And User click on sunbird rc insurance verifiable credential button
    Then User click on data share content validity
    Then User click on select custom validity button
    Then user enter validity for data share content "<Vailidty>"
    Then Use click on procced button
    And User enter the policy number
    And User enter the full name
    And User enter the date of birth
    And User click on login button
    Then User verify Download Success text displayed
    And User verify pdf is downloaded for Insurance
    And User verify go home button

    Examples:
      | Vailidty |
      | 3        |

  @smoke @VerifyAndDownloadVcViaSunbirdLife @mobileview
  Scenario Outline: download vc via sunbird life
    Then User gets the title of the page
    Then User click on continue as guest
    And User search the issuers sunbird
    And User verify sunbird cridentials button
    And User click on sunbird cridentials button
    Then User verify list of credential types displayed
    And User verify life Insurance displayed
    And User click on life Insurance button
    Then User click on data share content validity
    Then User click on select custom validity button
    Then user enter validity for data share content "<Vailidty>"
    Then Use click on procced button
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
      | Vailidty |
      | 3        |

  @regression @verifyFaqPage @mobileview
  Scenario: verify Faq Page
    Given User gets the title of the page
    Then User validate the title of the page
    Then user click on hamburger menu
    When User clicks on the Faq button from hamburger menu
    Then User verify inji web text in FAQ page
    And User verify the FAQ header and its description
    And User verify the only one FAQ is open
    And User verify the only one FAQ is at a time
    And User verify that inji web logo is displayed