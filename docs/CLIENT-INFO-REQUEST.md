# Information needed from HardTech IT Corp

Everything below is currently **placeholder or seed data** in the system. The
site runs on it, but none of it can go live as-is — some of it is legally or
financially sensitive (payment details), and some of it would be dishonest to
publish (invented testimonials).

Send this list to the client. Each item says what it is for and what "done"
looks like, so nothing comes back half-answered.

---

## 1. Payment details — BLOCKING for real enrollments

The enrollment flow already collects payments and an admin verifies them. The
account numbers on screen right now are seed values and **must not** be used to
receive real money.

For **each** method you want to accept, we need:

### GCash
- [ ] Registered account name (exactly as it appears in GCash)
- [ ] Mobile number
- [ ] A screenshot of the QR code, if you want it shown on the payment step

### Maya
- [ ] Registered account name
- [ ] Mobile number
- [ ] QR code image, if applicable

### Bank transfer
- [ ] Bank name
- [ ] Branch
- [ ] Account name
- [ ] Account number
- [ ] Account type (savings / current)

### Anything else
- [ ] Are you accepting cash on-site? If yes, should the site say so, and what
      should it tell an applicant to do?
- [ ] Is there an enrollment/reservation fee separate from the program price?
- [ ] Are instalment or "downpayment now, balance later" arrangements offered?
      If yes, we need the exact terms to display.

**Why we need it:** an applicant pays before an admin can verify. Wrong details
mean money sent to the wrong account.

---

## 2. Program catalogue — pricing and schedule

The programs render from the database. Confirm each one:

- [ ] Exact program name as it should appear publicly
- [ ] Price (and whether it is inclusive of assessment or materials)
- [ ] Duration in hours, and the label to display (e.g. "120 hrs", "3 months")
- [ ] Schedule options actually offered (morning / afternoon / weekend?)
- [ ] Level label (Beginner / Intermediate / Advanced)
- [ ] Which programs are open for the 2026 batches, and which are
      "To be announced"
- [ ] Maximum trainees per batch

---

## 3. Testimonials / success stories — currently invented

The home page shows five graduate testimonials with names, job titles and
employers. **These were written as placeholders and are not real people.**
Publishing invented testimonials as real is a serious problem, so they must be
replaced or removed before launch.

For each real testimonial:
- [ ] Graduate's full name, and **written permission to publish it**
- [ ] Their quote, in their own words
- [ ] Current job title and employer (and permission to name the employer)
- [ ] Which program they completed
- [ ] A photo, if they consent to one

If real testimonials are not available yet, say so — we will remove the section
rather than ship fabricated ones.

---

## 4. Photos and media

- [ ] Real training facility photos for the gallery (the current ones are
      stand-ins)
- [ ] Photos or headshots for each trainer shown on the About page
- [ ] Company logo in a high-resolution file (SVG preferred, PNG acceptable)
- [ ] Any photo where a trainee's face is identifiable needs their consent

---

## 5. Company and contact details — verify these are correct

Currently on the site:
- Address: 673 Quirino Highway, Novaliches, Quezon City
- Phone: (123) 456-7890  ← **this is clearly a placeholder**
- Email: hardtechitcorp@gmail.com

Confirm or correct:
- [ ] Full registered business address
- [ ] Real contact phone number(s)
- [ ] Public email address for enquiries
- [ ] Facebook page URL
- [ ] Business hours
- [ ] Any TESDA registration or accreditation number that should be displayed

---

## 6. Trainers

For each trainer who should appear publicly:
- [ ] Full name and how they want to be addressed
- [ ] Title (e.g. "Owner & Lead Trainer")
- [ ] Short bio
- [ ] Credentials to list
- [ ] Whether they want their Facebook profile linked

> **Note:** Adelan Sistoso has been hidden from the About page at your request,
> since he is a TESDA assessor. This was done with a status change, not a
> deletion — restoring him is a one-line change whenever you want.

---

## 7. Certificates

The system now generates a real certificate with a QR code that links to a
public verification page.

- [ ] Confirm the signatory name and title printed on it
  (currently "Mr. Henry Gomata Lopez — Owner & Lead Trainer")
- [ ] Should a second signatory appear (e.g. a TESDA assessor)?
- [ ] Do you want the company logo on the certificate? If so, send the file.
- [ ] Confirm the wording: "has successfully completed the training program"
- [ ] Should the certificate show the program hours?

---

## 8. Policy and legal text

- [ ] Refund / cancellation policy
- [ ] Terms of service
- [ ] Privacy policy — required, since the site collects names, emails, phone
      numbers and payment references
- [ ] Who is the data protection contact?

---

## 9. Email sending

Password reset is fully built but cannot send email yet — the token creation,
expiry and single-use rules all work; only the delivery step is unwired.

- [ ] Which email service should we use? (Resend, Amazon SES and Postmark are
      all straightforward.)
- [ ] What "from" address should system email come from?
- [ ] Do you own the domain it will send from? Sending from a Gmail address
      will land in spam.

---

## 10. Domain

- [ ] Confirm the final domain for the live site
- [ ] Who controls the DNS (you mentioned Hostinger)?

---

## Decisions we need from you, not data

- [ ] The three demo accounts (`admin@`, `trainer@`, `trainee@` at gmail.com)
      are shown on the login page because the reference design shows them.
      **Remove them before launch, or keep them?** If kept, they need real
      passwords and must not hold real trainee data.
- [ ] The forum will be cleared of test content before launch — confirm when.
- [ ] Should trainees be able to message each other privately, or only
      trainee-to-trainer?
