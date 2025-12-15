@sequential
Feature: OIDC Login for InjiWeb

  @oidcLogin
  Scenario Outline: User first time login with OIDC using various passcode attempts
    When user performs token-based login using Gmail refresh token
    Then user verifies the submit button is not enabled
    And user enters the passcode "<initialPasscode>"
    Then user click on toggle button
    Then user verify the toggle button
    And user enters the passcode for confirmation "<wrongConfirmation1>"
    And user click on submit button
    Then user verify error message for mismatch
    And user enters the passcode for confirmation "<stringPasscode>"
    Then user click on toggle button for confirmation
    And user enters the passcode for confirmation "<initialPasscode>"
    And user click on toggle button for confirmation
    Then user toggles the password visibility using keyboard and verifies it
    And user click on submit button
    Then user click on dropdown box for profile
    Then user click on logout button

    Examples:
      | initialPasscode | wrongConfirmation1 | stringPasscode |
      | 123456          | 123455             | abcdef         |

  @oidcLogin
  Scenario Outline: User verifies Profile page options
    When user performs token-based login using Gmail refresh token
    And user enters the passcode "<initialPasscode>"
    And user click on submit button
    Then user verify current url userhome
    Then user click on dropdown box for profile
    Then user selects profile option
    Then user verify My Profile Text
    Then user verify back arrow button
    Then user verify home arrow button
    Then user verify label fullname
    Then user verify label fullname value
    Then user verify label fullname info
    Then user verify label fullname info value
    Then user click on back arrow button verify userhome page
    Then user verify current url userhome
    Then user click on dropdown box for profile
    Then user selects profile option
    Then user click on home arrow button verify userhome page
    Then user verify current url userhome

    Examples:
      | initialPasscode |
      | 123456          |

  @oidcLogin
  Scenario Outline: User home page verification for all the options
    When user performs token-based login using Gmail refresh token
    And user enters the passcode "<initialPasscode>"
    And user click on submit button
    Then user verify home button
    And user verify stored cards button
    And user verify collapse button
    Then user click on collapse button
    And user verify if home headings are displayed
    Then user verify icons are visible
    Then user click on collapse button again
    And user verify profile details displayed
    And user verify profile image displayed
    And user verify profile name displayed
    And user verify dropdown displayed
    Then user click on dropdown box for profile
    And user verifies profile dropdown options are visible
    And user verifies "Profile" option is present in dropdown
    And user verifies "FAQ" option is present in dropdown
    And user verifies "Logout" option is present in dropdown
    And user click on dropdown box for profile again
    Then user sees a valid welcome message
    When user fetches highlight status of "Home" menu
    Then user verifies "Home" text is highlighted
    And user verifies "Home" icon is highlighted
    And user verifies visual bar is present near "Home"
    Then user click on stored credentials button
    And user verify current url usercredentials
    When user fetches highlight status of "Stored Cards" menu
    Then user verifies "Stored Cards" text is highlighted
    And user verifies "Stored Cards" icon is highlighted
    And user verifies visual bar is present near "Stored Cards"
    Then user click on dropdown box for profile
    And user click on FAQ link
    Then user verify current url faq

    Examples:
      | initialPasscode |
      | 123456          |

  @oidcLogin
  Scenario Outline: User download card verification and verifies it
    When user performs token-based login using Gmail refresh token
    And user enters the passcode "<initialPasscode>"
    And user click on submit button
    Then user click on stored credentials button
    Then user verify current url usercredentials
    Then user verify no cards stored message
    Then user verify substring when no cards stored
    Then User click on cards button
    And User search the issuers mosip
    When User click on download mosip credentials button
    Then User verify list of credential types displayed
    And User verify mosip national id by e-signet displayed
    When User click on mosip national id by e-signet button
    And User verify login page lables
    And User verify vid input box header
    And User enter the uin
    And User click on getOtp button
    And User enter the otp
    And User click on verify button
    Then user click on stored credentials button
    Then User click on cards button
    And User search the issuers sunbird
    And User verify sunbird cridentials button
    And User click on sunbird cridentials button
    Then User verify list of credential types displayed
    And User verify sunbird rc insurance verifiable credential displayed
    And User click on sunbird rc insurance verifiable credential button
    And User enter the policy number
    And User enter the full name
    And User enter the date of birth
    And User click on login button
    Then user click on stored credentials button
    Then User click on cards button
    And User search the issuers sunbird
    And User verify sunbird cridentials button
    And User click on sunbird cridentials button
    Then User verify list of credential types displayed
    And User verify life Insurance displayed
    And User click on life Insurance button
    And User verify policy number input box header
    And User enter the policy number
    And User verify full name input box header
    And User enter the full name
    And User verify date of birth input box header
    And User enter the date of birth
    And User click on login button
    Then user verifies card search functionality
     Then user click on back arrow button verify userhome page
     Then user click on stored credentials button
    Then user verifies cards are in horizontal order
     Then user verify menu option on downloaded cards
     Then user click menu option on downloaded cards
     Then user click view card option
     Then user verify cards details from view option
     Then user click view card back option
     Then user click menu option on downloaded cards
     Then user click on delete card option
     Then user click on cancel delete card option
     Then user click menu option on downloaded cards
     Then user click on delete card option
     Then user click on confirm delete card option

    Examples:
      | initialPasscode |
      | 123456          |

  @oidcLogin
  Scenario Outline: User Reset passcode and verify login with new passcode
    When user performs token-based login using Gmail refresh token
    Then user verify forget passcode option
    Then user click on forget passcode option
    Then user verify the title of the window
    Then user verify the current url userresetpasscode
    Then user verify the back button
    Then user verify passcode reset info1 available
    Then user verify user info on resetpasscode available
    Then user verify forget passcode button
    Then user verify forget passcode button enabled
    Then user click on forget passcode button
    And user enters the passcode "<resetPasscode>"
    And user enters the passcode for confirmation "<wrongConfirmation1>"
    And user click on submit button
    Then user verify error message for mismatch
    And user enters the passcode for confirmation "<resetPasscode>"
    And user click on submit button
    Then user click on dropdown box for profile
    Then user click on logout button
    When user performs token-based login using Gmail refresh token
    And user enters the passcode "<resetPasscode>"
    And user click on submit button
    Then user verify current url userhome
    Then user click on stored credentials button
    Then user verify current url usercredentials
    Then user verify no cards stored message
    Then user verify substring when no cards stored
    Then user click on dropdown box for profile
    Then user click on logout button
    When user performs token-based login using Gmail refresh token
    Then user verify forget passcode option
    Then user click on forget passcode option

    Examples:
      | resetPasscode | wrongConfirmation1 |
      | 111111        | 123455            |

  @oidcLogin
  Scenario Outline: User verify reset passcode attempts
    When user performs token-based login using Gmail refresh token
    And user enters the passcode "<initialPasscode>"
    And user click on submit button
    Then user click on dropdown box for profile
    Then user click on logout button
    When user performs token-based login using Gmail refresh token
    And user enters the wrong passcode "<wrongConfirmation1>" to lessthan max failed attempts
    And user enters the passcode "<initialPasscode>"
    And user click on submit button
    Then user click on dropdown box for profile
    Then user click on logout button

    Examples:
      | initialPasscode | wrongConfirmation1 |
      | 111111          | 123455             |


  @oidcLogin @skipBasedOnThreshold
  Scenario Outline: User verify passcode lock and reset flow
    When user performs token-based login using Gmail refresh token
    And user enters the wrong passcode "<wrongConfirmation1>" for max failed attempts
    Then user wait for temporary lock to expire
    And user enters the passcode "<initialPasscode>"
    And user click on submit button
    Then user click on dropdown box for profile
    Then user click on logout button

    Examples:
      | initialPasscode | wrongConfirmation1 |
      | 111111          | 123455             |


  @oidcLogin @skipBasedOnThreshold
  Scenario Outline: User verify lock then less-than max attempts after reset
    When user performs token-based login using Gmail refresh token
    And user enters the wrong passcode "<wrongConfirmation1>" for max failed attempts
    Then user wait for temporary lock to expire
    And user enters the wrong passcode "<wrongConfirmation1>" to lessthan max failed attempts
    And user enters the passcode "<initialPasscode>"
    And user click on submit button
    Then user click on dropdown box for profile
    Then user click on logout button

    Examples:
      | initialPasscode | wrongConfirmation1 |
      | 111111          | 123455             |


  @oidcLogin @skipBasedOnThreshold
  Scenario Outline: User verify permanent lock and forget passcode flow
    When user performs token-based login using Gmail refresh token
    And user enters the wrong passcode "<wrongConfirmation1>" for max failed attempts
    Then user wait for temporary lock to expire
    And user enters the wrong passcode "<wrongConfirmation1>" for max failed attempts
    Then user wait for temporary lock to expire
    Then user enters the wrong passcode "<wrongConfirmation1>" to lessthan max failed attempts before perm lock
    Then user verify the warning message before to permanent lock
    And user enters the passcode "<wrongConfirmation1>"
    And user verify the wallet permanently locked
    Then user click on forget passcode option
    Then user click on forget passcode button
    And user enters the passcode "<initialPasscode>"
    And user enters the passcode for confirmation "<initialPasscode>"
    And user click on submit button
    Then user click on dropdown box for profile
    Then user click on logout button

    Examples:
      | initialPasscode | wrongConfirmation1 |
      | 111111          | 123455             |

  @oidcLogin @mobileview
  Scenario Outline: User first time login with OIDC using various passcode attempts
    When user performs token-based login using Gmail refresh token
    Then user click on forget passcode option
    Then user click on forget passcode button
    Then user verifies the submit button is not enabled
    And user enters the passcode "<initialPasscode>"
    Then user click on toggle button
    Then user verify the toggle button
    And user enters the passcode for confirmation "<initialPasscode>"
    And user click on toggle button for confirmation
    And user click on submit button
    Then user click on collapse button
    Then user sees a valid welcome message
    Then user click on hamburger menu from user account
    Then user selects profile option for mobile
    Then user verify My Profile Text
    Then user verify back arrow button
    Then user verify home arrow button
    Then user verify label fullname
    Then user verify label fullname value
    Then user verify label fullname info
    Then user verify label fullname info value
    Then user click on back arrow button verify userhome page
    Then user verify current url userhome
    Then user click on hamburger menu from user account
    And user verifies "Profile" option is present in dropdown for mobile
    And user verifies "FAQ" option is present in dropdown for mobile
    And user verifies "Logout" option is present in dropdown for mobile
    Then user selects profile option for mobile
    Then user click on home arrow button verify userhome page
    Then user verify current url userhome
    Then user click on collapse button
    When user fetches highlight status of "Home" menu
    Then user verifies "Home" text is highlighted
    And user verifies "Home" icon is highlighted
    And user verifies visual bar is present near "Home"
    Then user click on stored credentials button
    And user verify current url usercredentials
    When user fetches highlight status of "Stored Cards" menu
    Then user verifies "Stored Cards" text is highlighted
    And user verifies "Stored Cards" icon is highlighted
    And user verifies visual bar is present near "Stored Cards"
    Then user click on collapse button
    Then user click on hamburger menu from user account
    And user click on FAQ button for mobile
    Then user verify current url faq
    Then user click on collapse button
    Then user click on stored credentials button
    Then user verify current url usercredentials
    Then user click on collapse button
    Then user verify no cards stored message
    Then user verify substring when no cards stored
    Then User click on cards button for mobile
    And User search the issuers mosip
    When User click on download mosip credentials button
    Then User verify list of credential types displayed
    And User verify mosip national id by e-signet displayed
    When User click on mosip national id by e-signet button
    And User verify login page lables
    And User verify vid input box header
    And User enter the uin
    And User click on getOtp button
    And User enter the otp
    And User click on verify button
    Then user click on collapse button
    Then user click on back arrow button verify userhome page
    And User search the issuers sunbird
    And User verify sunbird cridentials button
    And User click on sunbird cridentials button
    Then User verify list of credential types displayed
    And User verify sunbird rc insurance verifiable credential displayed
    And User click on sunbird rc insurance verifiable credential button
    And User enter the policy number
    And User enter the full name
    And User enter the date of birth
    And User click on login button
    Then user click on collapse button
    Then user verifies card search functionality
    Then user click on hamburger menu from user account
    Then user click on logout button for mobile
    Examples:
      | initialPasscode | wrongConfirmation1 | stringPasscode |
      | 111111          | 123455             | abcdef         |