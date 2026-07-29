# Email Client QA Checklist

Use real employee-like test data and send the full and compact signatures to each supported client before release.

## Test data

- Use a long name and job title.
- Use a Malaysian mobile number entered without `+60`.
- Use a valid company email address.
- Test every company profile: SSH, SSW, SSC, SSE, and SST.
- Test the full signature with the contact QR enabled and disabled.

## Clients

- Gmail web
- Gmail mobile on Android
- Gmail mobile on iOS
- Outlook desktop for Windows
- New Outlook for Windows
- Outlook on the web
- Outlook mobile
- Apple Mail on macOS and iOS

## Visual checks

- The approved vertical logo is sharp and proportional.
- SS Prussian Blue, SS Blue, and Azure remain consistent.
- The address breaks immediately before the postcode.
- The banner spans the full signature width.
- Social icons and app badges load without broken images.
- Dark mode preserves readable text and logo contrast.
- The compact signature remains on one concise block.

## Functional checks

- Phone links dial the normalized `+60` number.
- Email, website, map, group, social, and app links open correctly.
- The contact QR scans from both desktop and mobile displays.
- The scanned vCard contains the correct name, position, company, phone, email, website, and address.
- Copying and pasting does not introduce extra borders, spacing, or font substitutions.
- Replies and forwards do not cause the signature width to overflow.

## Release evidence

Record the test date, tester, operating system, email-client version, result, and a screenshot for every client.
