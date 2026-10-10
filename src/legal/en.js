// Terms and Conditions and Privacy Policy (English).
export default (c) => ({
  terminos: {
    titulo: 'Terms and Conditions of Use',
    intro: `Version ${c.version}. Please read this document carefully: it governs the use of the Platform and the relationship between you and ${c.titular}.`,
    secciones: [
      {
        t: '1. Who provides the service and acceptance',
        p: [
          `The Platform is an installable web application (PWA) for managing small businesses, offered by ${c.titular} ("the Owner", "we").`,
          'By creating an account, ticking the acceptance box, or using the Platform, you accept these Terms and the Privacy Policy. If you use the Platform on behalf of a company, you declare that you have authority to bind it. If you do not agree, do not use it.',
        ],
      },
      {
        t: '2. Definitions',
        p: [
          '"Platform": the application, its public catalog, its code, its databases and related services.',
          '"Company": the business that subscribes to the Platform (for example, a bakery).',
          '"Team": the people the Company invites to use its account (owner, administrators, employees).',
          '"End customers": the people who buy from the Company and whose data the Company enters into the Platform. They have no account and are not users of the Platform.',
          '"Company Content": everything the Company or its Team enters: products, prices, photos, recipes, supplies, stock, orders, customers, delivery zones, texts and files.',
        ],
      },
      {
        t: '3. What the Platform is (and is not)',
        p: [
          'The Platform is a tool to organize daily work: catalog, orders, deliveries, supply stock, recipes and costs, customers and shipping.',
          'It is not an accounting, invoicing or tax system; it does not issue tax documents; it is not an online store or a payment gateway; it does not collect or intermediate payments between the Company and its End customers; it does not verify health permits or allergen information; and it does not provide accounting, tax, legal or food-safety advice.',
          'The public catalog lets a customer build an order and send it to the Company by WhatsApp. The order exists in the Platform only when the Team enters it.',
        ],
      },
      {
        t: '4. Registration, accounts and security',
        p: [
          'You must be at least 18 years old and have legal capacity to contract. The information you provide must be truthful, complete and up to date.',
          'To use the Platform you must confirm your email address. Each account is personal and non-transferable: do not share your password. You are responsible for all activity under your account.',
          'Tell us immediately if you suspect unauthorized access. The Company owner is responsible for the people they invite, the roles they assign and for deactivating anyone who leaves the Team.',
        ],
      },
      {
        t: '5. Free trial',
        p: [
          'Each Company gets a 30-day free trial, no card required. There is one trial per Company: creating repeated companies to obtain new trials is abusive use and may lead to suspension.',
          'When the trial ends, access is blocked until a payment is registered. Data is kept as described in section 27.',
        ],
      },
      {
        t: '6. Plans, prices and payment',
        p: [
          'The current plans are: monthly USD 20 and annual USD 120 (prices in US dollars, excluding taxes). Current prices are shown in the Platform.',
          'Payment is manual: bank transfer or Pix to the accounts shown by the Platform in the payment section. Pay only to those accounts and check the details; we are not responsible for payments made to other accounts.',
          'After paying, send the receipt by WhatsApp to the number shown in the Platform. We activate or renew the account once we verify the payment, within reasonable hours and with no guaranteed timeframe. Fees, transfer costs, exchange-rate differences and taxes arising from the payment are borne by the Company.',
          'We may change prices or plans with at least 30 days\' notice in the Platform. A change does not affect a period already paid.',
        ],
      },
      {
        t: '7. Expiry, grace period and suspension',
        p: [
          'If the plan expires, a 7-day grace period begins during which you can keep using the Platform with a notice. After that period without payment, access is blocked.',
          'Once payment is registered, access is restored. While blocked, the public catalog may stop updating.',
        ],
      },
      {
        t: '8. Cancellation and refunds',
        p: [
          'You may cancel at any time by telling us through the support channel. Cancellation takes effect at the end of the period already paid.',
          'Payments made are non-refundable, unless applicable law requires it or we agree in writing. The free trial exists so you can evaluate the service before paying.',
          'If the consumer protection law of your country gives you non-waivable rights (for example, a right of withdrawal), these Terms do not limit them.',
        ],
      },
      {
        t: '9. Company Content and data',
        p: [
          'Company Content belongs to the Company. You grant us a limited, non-exclusive license to host it, process it, resize it (for example, shrink photos), copy it for backup and display it as configured (for example, in the public catalog), solely to provide the service.',
          'We do not sell your data or your End customers\' data, nor use it for third-party advertising.',
          'You declare that you have the right to enter the Company Content (including photos, names, trademarks and texts) and that it does not infringe third-party rights or the law. You are solely responsible for that content.',
        ],
      },
      {
        t: '10. End customers\' personal data',
        p: [
          'Regarding End customers\' data (name, phone, address, notes), the Company is the data controller and the Owner acts as processor: it processes them only to provide the service and following the Company\'s instructions.',
          'The Company must comply with applicable data protection law (in Uruguay, Law 18.331; in Argentina, Law 25.326; in Brazil, Law 13.709, LGPD, and complementary rules), have a legal basis to enter that data, inform its End customers and handle their requests for access, rectification or deletion. It must not enter sensitive data (for example, health data) unless it has a legal basis and a real need; if it records a customer\'s allergies, it does so at its own responsibility.',
          'Processing is also governed by the Privacy Policy. We may use infrastructure providers (section 5 of the Privacy Policy) and will notify you of security incidents affecting your data where appropriate.',
        ],
      },
      {
        t: '11. The Company\'s responsibility for its business',
        p: [
          'The Company is the sole seller and is responsible to its End customers. The Owner is not a party to the sales and does not guarantee, make, store, transport or deliver products.',
          'The Company is solely responsible for: the quality, hygiene, safety, storage and labeling of its products; health and commercial permits and registrations; ingredient and allergen information; published prices and promotions; taxes and the issuing of invoices or receipts; labor and social security obligations; deliveries, delays, transport damage and claims; and the advertising and intellectual property of whatever it displays.',
        ],
      },
      {
        t: '12. Allergens and food safety',
        p: [
          'Allergies and intolerances can be serious. The Platform does not validate ingredients or allergens. The Company must correctly inform its customers and not rely on free-text notes as the only control.',
          'Order notes (for example, "no nuts") are free text entered by people; the Platform does not guarantee they will be read, followed or passed on correctly.',
        ],
      },
      {
        t: '13. Calculations, costs and estimates',
        p: [
          'Recipe costs, margins, profits, stock deductions, balances, totals and other indicators are estimates calculated from the data the Company enters. They depend on that data being complete and up to date (purchase prices, recipe yields, waste, units).',
          'They do not constitute accounting, financial or tax advice. Check the results before making decisions (setting prices, purchasing, paying taxes). We are not liable for decisions based on them.',
        ],
      },
      {
        t: '14. Public catalog and WhatsApp',
        p: [
          'The public catalog is accessible to anyone with the link and shows only the commercial information the Company chooses to publish. The Company is responsible for keeping it accurate and removing anything inappropriate.',
          'WhatsApp is a third-party service (Meta) with its own terms and policies. Tapping a WhatsApp button opens that app with a prepared message; we do not access conversations nor guarantee the delivery, reading or reply to messages. We are not a party to the relationship between the Company and its End customers.',
        ],
      },
      {
        t: '15. Acceptable use',
        p: [
          'You may not: use the Platform for illegal or fraudulent activities; enter unlawful, misleading or offensive content, content that infringes third-party rights or contains malware; attempt to access other companies\' data or breach security; reverse engineer, copy or resell the Platform without authorization; automate mass access (scraping) or overload the service; impersonate others; send spam using Platform data; or circumvent plan limits.',
          'We may remove content or suspend accounts that breach this section, without prejudice to other legal action.',
        ],
      },
      {
        t: '16. Technical limits and reasonable use',
        p: [
          'The Platform runs on cloud services with quotas. To protect them, photos are reduced before uploading and size and quantity limits may apply.',
          'The bakery plan allows up to 10 Team members; End customers do not count. The security-company plan does not limit the number of people, subject to reasonable use of storage and of photos or videos. We may ask for an adjustment if usage affects the service.',
        ],
      },
      {
        t: '17. Availability and development version',
        p: [
          'The Platform is under continuous development. It is provided "as is" and "as available", with no guarantee of uninterrupted or error-free operation. Interruptions may occur due to maintenance, our own failures or those of providers (for example, Google Firebase), connectivity problems or force majeure.',
          'We may add, change or remove features. If a change removes an essential feature of the plan you subscribed to, you may cancel under section 8.',
        ],
      },
      {
        t: '18. Backups and data loss',
        p: [
          'We apply reasonable measures to preserve information, but we do not guarantee that it will not be lost, corrupted or become inaccessible. Keep a copy of your important information (for example, your price list and recipes) and record your sales through your own means as well.',
          'Some features use a local copy on the device to work with poor connectivity; data syncs when the internet returns. In case of conflicts or simultaneous changes, the last save may prevail.',
        ],
      },
      {
        t: '19. Intellectual property',
        p: [
          `The Platform, its design, code, texts and trademarks belong to the Owner (${c.titular}) or its licensors. We grant you a limited, personal, non-exclusive, non-transferable and revocable license to use it while you have an active account and comply with these Terms.`,
          'If you send us suggestions or ideas, we may use them without any obligation to you.',
        ],
      },
      {
        t: '20. Security',
        p: [
          'We use reasonable measures: authentication, access rules per company and per role, and encryption in transit. No system is completely secure. You must also look after your devices, passwords and your Team\'s permissions.',
          'Roles limit what each person can do, but some entered data (such as costs) is technically accessible to those who belong to the same Company; the owner decides whom to invite.',
        ],
      },
      {
        t: '21. Disclaimer of warranties',
        p: [
          'To the maximum extent permitted by law, we give no express or implied warranties, including fitness for a particular purpose, absence of errors, sales results or profitability.',
        ],
      },
      {
        t: '22. Limitation of liability',
        p: [
          'To the maximum extent permitted by law, the Owner is not liable for lost profits, lost sales, customers, data or opportunities, moral damages, or indirect or consequential damages arising from the use of or inability to use the Platform.',
          'If any liability is established, it will be limited to the greater of the amount paid by the Company in the 12 months before the event and USD 20.',
          'This limitation does not apply to willful misconduct, gross negligence or anything the law does not allow to be limited.',
        ],
      },
      {
        t: '23. Indemnification',
        p: [
          'The Company will hold the Owner harmless from third-party claims, costs and expenses (including reasonable fees), including those of End customers or authorities, arising from its Content, its products or services, its legal breaches or the unlawful use of the Platform by its Team.',
        ],
      },
      {
        t: '24. Force majeure',
        p: [
          'We are not liable for failures or delays caused by events beyond our reasonable control: disasters, power or internet outages, cloud provider failures, cyberattacks despite reasonable measures, government decisions, conflicts, pandemics, among others.',
        ],
      },
      {
        t: '25. Suspension and termination by the Owner',
        p: [
          'We may suspend or cancel access, with notice where possible, for non-payment, breach of these Terms, unlawful use or risk to security or to other users. In serious or urgent cases, suspension may be immediate.',
        ],
      },
      {
        t: '26. Communications',
        p: [
          'We may contact you through the Platform, your registered email or WhatsApp. Keep your contact details up to date. Electronic communications are fully valid between the parties.',
        ],
      },
      {
        t: '27. Effects of termination and data retention',
        p: [
          'If the account is blocked or cancelled, we will keep the Company\'s data for up to 90 days to make reactivation easier. You may request a copy of your data within that period. After it, we may delete or anonymize the data, except what we must keep by legal obligation (for example, payment records).',
          'Backups may persist for an additional time until their natural rotation.',
        ],
      },
      {
        t: '28. Changes to these Terms',
        p: [
          'We may update these Terms. If the change is significant, we will notify you in the Platform and may ask you to accept the new version to keep using it. If you disagree, you may cancel before it takes effect. Using the Platform afterwards means accepting the changes, to the extent the law allows.',
        ],
      },
      {
        t: '29. Assignment, severability and entire agreement',
        p: [
          'The Company may not assign its account or these Terms without our written consent. We may assign them in a reorganization, a transfer of the business or for operational reasons, with notice.',
          'If any clause is invalid, the rest remains in force. Failing to enforce a right is not a waiver of it. These Terms and the Privacy Policy form the entire agreement between the parties regarding the Platform.',
          'If versions in different languages differ, the Spanish version prevails.',
        ],
      },
      {
        t: '30. Governing law and jurisdiction',
        p: [
          `These Terms are governed by the laws of ${c.jurisdiccion}. Before starting legal proceedings, the parties will try to resolve the dispute in good faith for 30 days.`,
          `Unless a mandatory rule provides otherwise (for example, for consumers), the courts of ${c.foro} will have jurisdiction.`,
        ],
      },
      {
        t: '31. Commercial relationship between the parties',
        p: [
          'The Company contracts the Platform for its own business or professional purposes. To the fullest extent permitted by law, this is a business-to-business relationship and not a consumer relationship. If a mandatory rule treats you as a consumer, those non-waivable rights remain in force.',
          'There is no employment, partnership, representation, agency or franchise relationship between the Owner and the Company (or its Team). Each party acts at its own risk.',
        ],
      },
      {
        t: '32. Third-party services and links',
        p: [
          'The Platform depends on third-party services (for example, Google Firebase for authentication, database, files and hosting; Meta’s WhatsApp; Google Maps to open addresses; banks and payment systems such as Pix). Each service has its own terms, prices and policies, which the Company must follow.',
          'We do not control those services and are not responsible for their failures, changes, account blocks, costs, delays or decisions, or for the content of linked sites.',
        ],
      },
      {
        t: '33. Mistaken payments, differences and refunds',
        p: [
          'If the Company pays an amount different from the current price, the payment is credited for the period it covers or the difference is requested, at the Owner’s discretion and based on the exchange rate and the amounts actually received.',
          'Duplicate or mistaken payments are credited to future periods or returned by the same means, minus bank costs, unless otherwise agreed in writing. No interest accrues in favor of the Company.',
          'The person who pays is responsible for checking that the payment goes to the account shown by the Platform. A receipt is not an activation: the account is updated when the Owner verifies the payment.',
        ],
      },
      {
        t: '34. Support',
        p: [
          'Support is provided on a best-effort basis through the WhatsApp channel shown in the Platform, during reasonable hours and with no guaranteed response times. It does not include support for devices, networks, printers or third-party apps, or loading data on the Company’s behalf, unless agreed in writing.',
        ],
      },
      {
        t: '35. Reports and removal of content',
        p: [
          'If you believe content published in a catalog infringes your rights or the law, tell us through the support channel with the information needed to identify and assess it. We may remove or hide content, or suspend the catalog, as a precaution and without prior notice while the case is reviewed.',
          'This does not make us reviewers of content, and we do not assume any duty to monitor it.',
        ],
      },
      {
        t: '36. Other industries, modules and test versions',
        p: [
          'The Platform may offer modules for other industries (for example, private security, with staff data, shifts, rounds, incidents, photos or location). Those modules or features in testing may have additional conditions, which will be disclosed before use, and are offered with no guarantee of continuity.',
          'Each Company is responsible for having the legal basis, consent and information needed to process the data of its staff, its customers and third parties that it loads into any module.',
        ],
      },
      {
        t: '37. Electronic acceptance and records',
        p: [
          'Acceptance of these documents is given electronically. We keep the accepted version and the date and time of each acceptance as evidence. The parties acknowledge that the Platform’s electronic records and WhatsApp or email messages are valid evidence of what was agreed and of what happened, to the extent permitted by the applicable rules on electronic documents and signatures.',
        ],
      },
      {
        t: '38. Contact',
        p: [
          'For questions, requests about your data, cancellation notices or complaints, write to us on the support WhatsApp shown in the payment section of the Platform.',
        ],
      },
    ],
  },

  privacidad: {
    titulo: 'Privacy Policy',
    intro: `Version ${c.version}. It explains what data we process, why, who we share it with and what rights you have.`,
    secciones: [
      {
        t: '1. Controller and scope',
        p: [
          `The controller of account and usage data is ${c.titular} ("the Owner"). This policy covers the data of people who use the Platform (owners, administrators and employees of Companies) and of the Companies themselves.`,
          'End customers\' data that a Company enters is that Company\'s responsibility; the Owner processes it as processor, following its instructions (see Terms, section 10).',
        ],
      },
      {
        t: '2. What data we process',
        p: [
          'Account: name, email, password (managed by Firebase Authentication; we do not see it in clear text), language, role and the date you accepted these documents.',
          'Company: name, country, currency, time zone, WhatsApp, logo and color, plan, status, expiry dates and payment records (amount, date and method). We do not store card numbers or banking passwords.',
          'Entered content: products, prices, photos, supplies, stock, recipes, orders, delivery zones and End customers (name, phone, address and notes).',
          'Technical: connection and device data generated by our providers (for example, IP address, browser, security logs) and data stored on your device (see section 11).',
        ],
      },
      {
        t: '3. What we use it for and on what basis',
        p: [
          'To provide the service you subscribed to (performance of the contract): create your account, display and store your information, send confirmation and password-reset emails, and enable the public catalog.',
          'To bill and manage subscriptions and for support (performance of the contract and legitimate interest).',
          'For security, fraud and abuse prevention and service improvement (legitimate interest).',
          'To comply with legal, accounting and tax obligations and to defend rights in a claim.',
          'We do not use your data for third-party advertising and we do not sell it.',
        ],
      },
      {
        t: '4. Who can see the data',
        p: [
          'Each Company\'s Team, according to their role. A Company cannot see another Company\'s data.',
          'The Owner, for administration, support, billing and security tasks.',
          'The public, only what the Company publishes in its catalog (name, logo, business WhatsApp, products, descriptions, prices and photos).',
        ],
      },
      {
        t: '5. Providers',
        p: [
          'We use Google services (Firebase Authentication, Cloud Firestore, Cloud Storage and Firebase Hosting) to authenticate, store data and files and publish the application. Google acts as an infrastructure provider and applies its own security measures and terms.',
          'If you tap a WhatsApp button, WhatsApp (Meta) opens with a prepared message; that service is governed by its own policies. Payments are made by transfer or Pix through your bank; we do not intervene in those platforms.',
          'We do not share data with other third parties except by legal obligation, order of a competent authority or with your consent.',
        ],
      },
      {
        t: '6. International transfers',
        p: [
          'Our providers\' servers may be outside Uruguay, Argentina or Brazil. By using the Platform you accept that transfer, which we carry out with providers that offer reasonable contractual and technical safeguards, within the framework of applicable law.',
        ],
      },
      {
        t: '7. How long we keep data',
        p: [
          'While your account is active. If it is blocked or cancelled, for up to 90 days to make reactivation easier; afterwards we delete or anonymize the data, except what the law requires us to keep (for example, payment records) for the applicable period.',
          'Backups may persist for an additional time until rotation.',
        ],
      },
      {
        t: '8. Security',
        p: [
          'We apply reasonable technical and organizational measures: authentication with a confirmed email, access rules per company and per role, encryption in transit and minimization of public data. No system is infallible; if an incident affecting your data occurs, we will inform you as required by law.',
        ],
      },
      {
        t: '9. Your rights',
        p: [
          'You may request access, rectification, updating, deletion, objection, restriction and, where applicable, portability of your data, and withdraw consents you have given. You may also request information about the processing.',
          'To exercise them, write to us on the Platform\'s support WhatsApp. We will respond within the legal deadlines.',
          'If you feel your rights have not been respected, you may complain to the supervisory authority: in Uruguay, the Unidad Reguladora y de Control de Datos Personales (URCDP); in Argentina, the Agencia de Acceso a la Información Pública (AAIP), the supervisory body of Law 25.326, which handles complaints about non-compliance; in Brazil, the Autoridade Nacional de Proteção de Dados (ANPD).',
        ],
      },
      {
        t: '10. End customers\' data',
        p: [
          'If you are a customer of a Company and want to exercise your rights over the data it entered (name, phone, address, notes), contact that Company first. The Owner will assist it as far as it is responsible as processor.',
        ],
      },
      {
        t: '11. Local storage and cookies',
        p: [
          'We do not use advertising or third-party tracking cookies. The Platform stores necessary technical information on your device: the session, your language and a local copy of data to work with poor connectivity (local storage and IndexedDB). If you use a shared device, sign out.',
        ],
      },
      {
        t: '12. Minors',
        p: [
          'The Platform is not directed at people under 18. Companies must not enter minors\' data without a legal basis and, where applicable, the consent of their guardians.',
        ],
      },
      {
        t: '13. Changes to this policy',
        p: [
          'We may update this policy. We will publish the new version in the Platform, with its date, and notify you if the change is significant.',
        ],
      },
      {
        t: '14. Automated decisions and records',
        p: [
          'We do not make decisions with legal effects on people based solely on automated processing, and we do not build profiles for advertising. The Platform’s cost, stock and total calculations are support tools used by the Company.',
          'We keep the version and date on which you accepted the Terms and this Policy as evidence of your consent.',
        ],
      },
      {
        t: '15. Contact',
        p: ['Write to us on the support WhatsApp shown in the payment section of the Platform.'],
      },
    ],
  },
});
