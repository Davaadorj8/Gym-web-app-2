export type Language = 'en' | 'mn';

export interface Translations {
  // Login Page
  brandSubtitle: string;
  emailOrRegIdLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  signInButton: string;
  signingIn: string;
  authSuccess: string;
  hidePassword: string;
  showPassword: string;

  // Sidebar
  brandManagement: string;
  checkInMember: string;
  navDashboard: string;
  navCheckInDesk: string;
  navLockerUsage: string;
  navRegistration: string;
  navMemberDirectory: string;
  navAnalytics: string;
  navInventory: string;
  navStaffApprovals: string;
  ownerAdmin: string;
  signOut: string;

  // Registration Switch & Types
  regTypeIndividual: string;
  regTypeOrganization: string;
  regTypeDescIndividual: string;
  regTypeDescOrganization: string;

  // Registration Section 1: Personal Info
  sec1Title: string;
  sec1TitleOrg: string;
  orgNameLabel: string;
  orgNamePlaceholder: string;
  orgTaxIdLabel: string;
  orgTaxIdPlaceholder: string;
  orgLeadLabel: string;
  orgLeadPlaceholder: string;
  orgLeadEmailLabel: string;
  orgLeadPhoneLabel: string;
  orgMembersTitle: string;
  orgMembersDesc: string;
  addMemberBtn: string;
  memberNameLabel: string;
  memberNamePlaceholder: string;
  memberContactLabel: string;
  memberContactPlaceholder: string;
  memberRoleLabel: string;
  memberRolePlaceholder: string;
  noMembersYet: string;
  totalMembersInRoster: (count: number) => string;
  removeMemberTooltip: string;
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholderField: string;
  phoneLabel: string;
  phonePlaceholder: string;
  dobLabel: string;
  genderLabel: string;
  genderMale: string;
  genderFemale: string;
  genderNonBinary: string;
  genderPreferNot: string;
  addressLabel: string;
  addressPlaceholder: string;
  emergencyNotesLabel: string;
  emergencyPlaceholder: string;
  medicalPlaceholder: string;

  // Registration Profile Photo
  profilePhotoTitle: string;
  noPhoto: string;
  webcamTitle: string;
  webcamDesc: string;
  takePhotoBtn: string;
  retakeBtn: string;
  webcamModalTitle: string;
  cancelBtn: string;
  captureBtn: string;

  // Registration Section 2: Membership Plans
  sec2Title: string;
  sec2Subtitle: string;
  badgeUnder18: string;
  badgeOver18: string;
  badgeOrg: string;
  defaultBase: string;
  noPlansYet: string;
  goToInventoryBtn: string;

  // Registration Section 3: Duration & Summary
  sec3Title: string;
  customStepper: string;
  membershipDurationTitle: string;
  adjustInIncrements: string;
  selectedPlanLabel: string;
  startDateLabel: string;
  expirationDateLabel: string;
  calculatedFeeLabel: string;

  // Payment & Action
  paymentStatusTitle: string;
  paymentReceivedBadge: string;
  paymentMethodLabel: string;
  payCard: string;
  payCash: string;
  payTransfer: string;
  confirmRegisterBtn: string;
  registeringState: string;

  // Success Dialog
  successTitle: string;
  successDesc: (name: string, plan: string, duration: string) => string;
  registerAnotherBtn: string;

  // Inventory - Locker Management
  lockerCapTitle: string;
  lockerCapSubtitle: string;
  totalGymLockersLabel: string;
  saveLockerBtn: string;
  lockerSavedNotice: string;

  // Inventory - Plan Builder
  planBuilderTitle: string;
  planBuilderSubtitle: string;

  // Block 1
  block1Title: string;
  catUnder18Num: string;
  catUnder18Title: string;
  catUnder18Desc: string;
  catOver18Num: string;
  catOver18Title: string;
  catOver18Desc: string;
  catOrgNum: string;
  catOrgTitle: string;
  catOrgDesc: string;

  // Block 2
  block2Title: string;
  customPlanTitleLabel: string;
  customPlanTitlePlaceholder: string;
  specializedLessonsLabel: string;
  specializedLessonsPlaceholder: string;

  // Block 3
  block3Title: string;
  durationMonthsLabel: string;
  priceUsdLabel: string;
  buildSavePlanBtn: string;

  // Active Inventory
  activeBuiltPlansTitle: (count: number) => string;
  planPriceLabel: string;
  planCreatedToast: string;
  planDeletedToast: string;
  monthUnit: string;
  monthsUnit: string;

  // Check-In Desk
  lookupAthleteTitle: string;
  searchAthletePlaceholder: string;
  clearSearchBtn: string;
  athletePhotoIdTitle: string;
  showQrScannerBtn: string;
  showCameraBtn: string;
  membershipPlanLabel: string;
  expirationDateShortLabel: string;
  floorOccupancyLabel: string;
  occupancyCheckedIn: string;
  occupancyCheckedOut: string;
  assignedLockerKeyLabel: string;
  emergencyContactShortLabel: string;
  btnCheckOutAndReturnKey: string;
  btnCheckInAndAssignKey: string;
  btnCheckInSimple: string;
  btnCheckedInBadge: string;
  noAthletesFoundText: string;
  selectLockerModalTitle: string;
  selectLockerPrompt: string;
  noLockerAssigned: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Login
    brandSubtitle: 'IRONPULSE MANAGEMENT PORTAL',
    emailOrRegIdLabel: 'EMAIL ADDRESS OR MEMBER REG ID',
    emailPlaceholder: 'admin@arche.fitness',
    passwordLabel: 'PASSWORD',
    passwordPlaceholder: 'Enter password',
    signInButton: 'Sign In to Portal',
    signingIn: 'Signing In...',
    authSuccess: 'Signed in successfully',
    hidePassword: 'Hide password',
    showPassword: 'Show password',

    // Sidebar
    brandManagement: 'IRONPULSE MANAGEMENT',
    checkInMember: 'Check In Member',
    navDashboard: 'Dashboard',
    navCheckInDesk: 'Check-in Desk',
    navLockerUsage: 'Locker Usage',
    navRegistration: 'Registration',
    navMemberDirectory: 'Member Directory',
    navAnalytics: 'Analytics',
    navInventory: 'Inventory',
    navStaffApprovals: 'Staff Approvals',
    ownerAdmin: 'Owner (Admin)',
    signOut: 'Sign Out',

    // Registration Switch & Types
    regTypeIndividual: 'Single Person',
    regTypeOrganization: 'Organization (Group)',
    regTypeDescIndividual: 'Register an individual athlete or gym member with personal profile and emergency details.',
    regTypeDescOrganization: 'Register a corporate partner, sports team, or company group with member roster management.',

    // Section 1
    sec1Title: '1. ATHLETE PERSONAL INFORMATION',
    sec1TitleOrg: '1. ORGANIZATION & GROUP DETAILS',
    orgNameLabel: 'ORGANIZATION / COMPANY NAME *',
    orgNamePlaceholder: 'e.g. Apex Dynamics LLC / National Team',
    orgTaxIdLabel: 'REGISTRATION / TAX ID',
    orgTaxIdPlaceholder: 'e.g. 1234567-8',
    orgLeadLabel: 'COORDINATOR / CONTACT PERSON *',
    orgLeadPlaceholder: 'e.g. Alex Miller',
    orgLeadEmailLabel: 'COORDINATOR EMAIL *',
    orgLeadPhoneLabel: 'COORDINATOR PHONE *',
    orgMembersTitle: 'Organization Member Roster',
    orgMembersDesc: 'Add individual athletes, employees, or participants registered under this corporate pass.',
    addMemberBtn: '+ Add Person',
    memberNameLabel: 'MEMBER FULL NAME',
    memberNamePlaceholder: 'e.g. Sarah Jenkins',
    memberContactLabel: 'EMAIL / PHONE',
    memberContactPlaceholder: 'sarah@company.com / 555-0199',
    memberRoleLabel: 'ROLE / DEPARTMENT',
    memberRolePlaceholder: 'e.g. Senior Developer / Team Captain',
    noMembersYet: 'No team members added to this organization roster yet. Click "+ Add Person" below.',
    totalMembersInRoster: (count: number) => `${count} ${count === 1 ? 'Person' : 'People'} in Roster`,
    removeMemberTooltip: 'Remove Person',
    firstNameLabel: 'FIRST NAME *',
    firstNamePlaceholder: 'e.g. Jordan',
    lastNameLabel: 'LAST NAME *',
    lastNamePlaceholder: 'e.g. Vance',
    emailLabel: 'EMAIL ADDRESS *',
    emailPlaceholderField: 'jordan.vance@example.com',
    phoneLabel: 'PHONE NUMBER *',
    phonePlaceholder: '(555) 234-5678',
    dobLabel: 'DATE OF BIRTH',
    genderLabel: 'GENDER',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderNonBinary: 'Non-Binary',
    genderPreferNot: 'Prefer not to say',
    addressLabel: 'ADDRESS',
    addressPlaceholder: 'Residential Address',
    emergencyNotesLabel: 'EMERGENCY CONTACT & MEDICAL NOTES',
    emergencyPlaceholder: 'Emergency Contact Name & Phone',
    medicalPlaceholder: 'Injuries / Physical Conditions (e.g. Past shoulder surgery, asthma)...',

    // Photo
    profilePhotoTitle: 'ATHLETE PROFILE PHOTO',
    noPhoto: 'No Photo',
    webcamTitle: 'Webcam Profile Capture',
    webcamDesc: 'Take a live webcam shot for front-desk athlete visual verification.',
    takePhotoBtn: 'Take Photo',
    retakeBtn: 'Retake',
    webcamModalTitle: 'Webcam Snapshot',
    cancelBtn: 'Cancel',
    captureBtn: 'Capture',

    // Section 2
    sec2Title: '2. SELECT AVAILABLE MEMBERSHIP PLAN',
    sec2Subtitle: 'Choose from admin-configured membership categories and custom packages.',
    badgeUnder18: 'Under 18',
    badgeOver18: 'Over 18',
    badgeOrg: 'Organization',
    defaultBase: 'Base Duration',
    noPlansYet: 'No active membership plans available.',
    goToInventoryBtn: 'Create in Inventory',

    // Section 3
    sec3Title: '3. SELECT DURATION',
    customStepper: 'Custom Stepper',
    membershipDurationTitle: 'Membership Duration',
    adjustInIncrements: 'Adjust in 1-month increments',
    selectedPlanLabel: 'Selected Plan:',
    startDateLabel: 'Start Date:',
    expirationDateLabel: 'Expiration Date:',
    calculatedFeeLabel: 'Calculated Fee',

    // Payment
    paymentStatusTitle: 'Payment Status',
    paymentReceivedBadge: 'Payment Received',
    paymentMethodLabel: 'PAYMENT METHOD',
    payCard: 'Card',
    payCash: 'Cash',
    payTransfer: 'Transfer',
    confirmRegisterBtn: 'CONFIRM & REGISTER ATHLETE',
    registeringState: 'Registering Athlete...',

    // Success
    successTitle: 'Athlete Registered',
    successDesc: (name, plan, duration) =>
      `${name || 'Athlete'} is now active on the ${plan} (${duration}).`,
    registerAnotherBtn: 'Done & Register Another',

    // Inventory - Locker
    lockerCapTitle: 'Locker Capacity Management',
    lockerCapSubtitle: 'Set the total available locker inventory for the entire facility.',
    totalGymLockersLabel: 'TOTAL GYM LOCKERS INVENTORY',
    saveLockerBtn: 'Save Locker Inventory',
    lockerSavedNotice: 'Locker inventory updated successfully',

    // Inventory - Plan Builder
    planBuilderTitle: 'Membership Plan Builder',
    planBuilderSubtitle: 'Construct structured membership categories with customized specializations and prices.',

    // Block 1
    block1Title: '1. SELECT BLOCK 1 (CATEGORY TARGET)',
    catUnder18Num: '1. UNDER 18',
    catUnder18Title: 'Youth & Student Pass',
    catUnder18Desc: 'For members aged under 18',
    catOver18Num: '2. OVER 18',
    catOver18Title: 'Adult Full Access Pass',
    catOver18Desc: 'Standard adult athlete membership',
    catOrgNum: '3. ORGANIZATION',
    catOrgTitle: 'Corporate & Group',
    catOrgDesc: 'Company/Team institutional plan',

    // Block 2
    block2Title: '2. BLOCK 2 (CUSTOM TITLE & SPECIALIZED TRAINING LESSONS)',
    customPlanTitleLabel: 'CUSTOM PLAN TITLE (OPTIONAL)',
    customPlanTitlePlaceholder: 'e.g. Executive Pro Pass (or leave blank for standard category name)',
    specializedLessonsLabel: 'SPECIALIZED LESSONS / MODULES (CAN BE EMPTY)',
    specializedLessonsPlaceholder: 'e.g. Includes Personal Trainer + Swimming & Boxing Lessons',

    // Block 3
    block3Title: '3. BLOCK 3 (DURATION & PRICING)',
    durationMonthsLabel: 'DURATION (MONTHS)',
    priceUsdLabel: 'PRICE (₮ MNT)',
    buildSavePlanBtn: '+ Build & Save Plan',

    // Active Inventory
    activeBuiltPlansTitle: (count) => `ACTIVE BUILT PLANS INVENTORY (${count})`,
    planPriceLabel: 'Plan Price:',
    planCreatedToast: 'Membership plan created and available in Registration',
    planDeletedToast: 'Membership plan removed',
    monthUnit: 'Month',
    monthsUnit: 'Months',

    // Check-In Desk
    lookupAthleteTitle: 'LOOKUP ATHLETE ID / NAME',
    searchAthletePlaceholder: 'Search by ID, name, or phone number...',
    clearSearchBtn: 'Clear',
    athletePhotoIdTitle: 'ATHLETE PHOTO IDENTIFICATION',
    showQrScannerBtn: 'Show QR Scanner',
    showCameraBtn: 'Live Camera / Photo',
    membershipPlanLabel: 'Membership Plan:',
    expirationDateShortLabel: 'Expiration Date:',
    floorOccupancyLabel: 'Floor Occupancy:',
    occupancyCheckedIn: 'Checked In',
    occupancyCheckedOut: 'Checked Out',
    assignedLockerKeyLabel: 'Assigned Locker Key:',
    emergencyContactShortLabel: 'Emergency Contact:',
    btnCheckOutAndReturnKey: 'Check Out & Return Locker Key',
    btnCheckInAndAssignKey: 'Check In & Assign Locker Key',
    btnCheckInSimple: 'Check In',
    btnCheckedInBadge: 'Checked In',
    noAthletesFoundText: 'No athletes found matching your search query.',
    selectLockerModalTitle: 'Assign Locker Key',
    selectLockerPrompt: 'Choose an available locker from facility inventory:',
    noLockerAssigned: 'N/A (Unassigned)',
  },
  mn: {
    // Login
    brandSubtitle: 'АЙРОНПАЛС ФИТНЕССИЙН УДИРДЛАГЫН СИСТЕМ',
    emailOrRegIdLabel: 'И-МЭЙЛ ХАЯГ ЭСВЭЛ БҮРТГЭЛИЙН ДУГААР',
    emailPlaceholder: 'admin@archegym.com',
    passwordLabel: 'НУУЦ ҮГ',
    passwordPlaceholder: 'Нууц үгээ оруулна уу',
    signInButton: 'Системд Нэвтрэх',
    signingIn: 'Нэвтэрч байна...',
    authSuccess: 'Амжилттай нэвтэрлээ',
    hidePassword: 'Нууц үг нуух',
    showPassword: 'Нууц үг харах',

    // Sidebar
    brandManagement: 'IRONPULSE УДИРДЛАГА',
    checkInMember: 'Ирц бүртгэх',
    navDashboard: 'Хяналтын самбар',
    navCheckInDesk: 'Ирц бүртгэл & Шүүгээ',
    navLockerUsage: 'Шүүгээний ашиглалт',
    navRegistration: 'Шинэ гишүүн бүртгэх',
    navMemberDirectory: 'Гишүүдийн нэгдсэн сан',
    navAnalytics: 'Тайлан & Статистик',
    navInventory: 'Багцын тохиргоо & Шүүгээ',
    navStaffApprovals: 'Ажилтны удирдлага',
    ownerAdmin: 'Эзэмшигч (Админ)',
    signOut: 'Системээс гарах',

    // Registration Switch & Types
    regTypeIndividual: 'Хувь хүн (Ганцаарчилсан)',
    regTypeOrganization: 'Байгууллага / Хамт олон (Групп)',
    regTypeDescIndividual: 'Хувь тамирчин, үйлчлүүлэгчийг хувийн мэдээлэл, цээж зураг, эрүүл мэндийн тэмдэглэлтэйгээр бүртгэх.',
    regTypeDescOrganization: 'Байгууллага, компани, спортын багийн хамт олныг нэгдсэн багцаар бүртгэх.',

    // Section 1
    sec1Title: '1. ТАМИРЧНЫ ХУВИЙН МЭДЭЭЛЭЛ',
    sec1TitleOrg: '1. БАЙГУУЛЛАГА, ХАМТ ОЛНЫ МЭДЭЭЛЭЛ',
    orgNameLabel: 'БАЙГУУЛЛАГА / КОМПАНИЙН НЭР *',
    orgNamePlaceholder: 'Жишээ: Апекс Динамикс ХХК / Сагсан бөмбөгийн баг',
    orgTaxIdLabel: 'РЕГИСТРИЙН ДУГААР / ТТД',
    orgTaxIdPlaceholder: 'Жишээ: 1234567',
    orgLeadLabel: 'ХАРИУЦСАН АЖИЛТАН / ЗОХИЦУУЛАГЧ *',
    orgLeadPlaceholder: 'Жишээ: Б.Энхжин',
    orgLeadEmailLabel: 'ЗОХИЦУУЛАГЧИЙН И-МЭЙЛ *',
    orgLeadPhoneLabel: 'ЗОХИЦУУЛАГЧИЙН УТАС *',
    orgMembersTitle: 'Байгууллагын гишүүдийн нэрсийн жагсаалт',
    orgMembersDesc: 'Энэхүү байгууллагын багцад хамрагдах ажилтнууд, тамирчдыг нэмж бүртгэнэ үү.',
    addMemberBtn: '+ Гишүүн нэмэх',
    memberNameLabel: 'ГИШҮҮНИЙ БҮТЭН НЭР',
    memberNamePlaceholder: 'Жишээ: С.Болд',
    memberContactLabel: 'И-МЭЙЛ ЭСВЭЛ УТАС',
    memberContactPlaceholder: 'bold@company.com / 9911-0011',
    memberRoleLabel: 'АЛБАН ТУШААЛ / АНГИЛАЛ',
    memberRolePlaceholder: 'Жишээ: Ахлах инженер / Довтлогч',
    noMembersYet: 'Жагсаалтад одоогоор гишүүн нэмэгдээгүй байна. Доорх "+ Гишүүн нэмэх" товчийг дарна уу.',
    totalMembersInRoster: (count: number) => `Нийт ${count} гишүүн бүртгэгдсэн`,
    removeMemberTooltip: 'Гишүүнийг хасах',
    firstNameLabel: 'НЭР *',
    firstNamePlaceholder: 'Жишээ: Тэмүүлэн',
    lastNameLabel: 'ОВОГ *',
    lastNamePlaceholder: 'Жишээ: Батболд',
    emailLabel: 'И-МЭЙЛ ХАЯГ *',
    emailPlaceholderField: 'athlete@archegym.com',
    phoneLabel: 'УТАСНЫ ДУГААР *',
    phonePlaceholder: '9911-2233',
    dobLabel: 'ТӨРСӨН ОГНОО',
    genderLabel: 'ХҮЙС',
    genderMale: 'Эрэгтэй',
    genderFemale: 'Эмэгтэй',
    genderNonBinary: 'Бусад',
    genderPreferNot: 'Нууцлах',
    addressLabel: 'ОРШИН СУУГАА ХАЯГ',
    addressPlaceholder: 'Улаанбаатар хот, Сүхбаатар дүүрэг...',
    emergencyNotesLabel: 'ЯАРАЛТАЙ ҮЕД ХОЛБОО БАРИХ ХҮН & ЭРҮҮЛ МЭНДИЙН ТЭМДЭГЛЭЛ',
    emergencyPlaceholder: 'Холбоо барих хүний нэр & утас (Жишээ: Ээж 9900-1122)',
    medicalPlaceholder: 'Гэмтэл, харшил, архаг хууч өвчин, анхаарах зүйлс...',

    // Photo
    profilePhotoTitle: 'ТАМИРЧНЫ ЦЭЭЖ ЗУРАГ',
    noPhoto: 'Зураггүй',
    webcamTitle: 'Вебкамераар зураг авах',
    webcamDesc: 'Ресепшн дээр тамирчны царайг таних цээж зураг дарах.',
    takePhotoBtn: 'Зураг авах',
    retakeBtn: 'Дахин дарах',
    webcamModalTitle: 'Камерын цонх',
    cancelBtn: 'Цуцлах',
    captureBtn: 'Зураг дарах',

    // Section 2
    sec2Title: '2. ГИШҮҮНЧЛЭЛИЙН БАГЦ СОНГОХ',
    sec2Subtitle: 'Админы үүсгэсэн идэвхтэй багцууд болон тусгай хөтөлбөрүүдээс сонгоно уу.',
    badgeUnder18: '18-аас доош нас',
    badgeOver18: '18+ Насанд хүрэгчид',
    badgeOrg: 'Байгууллага / Хамт олон',
    defaultBase: 'Үндсэн хугацаа',
    noPlansYet: 'Идэвхтэй гишүүнчлэлийн багц бүртгэгдээгүй байна.',
    goToInventoryBtn: 'Багц үүсгэх рүү очих',

    // Section 3
    sec3Title: '3. ХУГАЦАА & ТӨЛБӨРИЙН ХЭЛБЭР СОНГОХ',
    customStepper: 'Хугацаа тохируулагч',
    membershipDurationTitle: 'Гишүүнчлэлийн хугацаа',
    adjustInIncrements: '1 сарын алхмаар тохируулах',
    selectedPlanLabel: 'Сонгосон багц:',
    startDateLabel: 'Эхлэх огноо:',
    expirationDateLabel: 'Дуусах огноо:',
    calculatedFeeLabel: 'Нийт төлбөрийн дүн',

    // Payment
    paymentStatusTitle: 'Төлбөрийн төлөв',
    paymentReceivedBadge: 'Төлбөр төлөгдсөн',
    paymentMethodLabel: 'ТӨЛБӨРИЙН ХЭЛБЭР',
    payCard: 'Карт',
    payCash: 'Бэлнээр',
    payTransfer: 'Дансаар шилжүүлэх',
    confirmRegisterBtn: 'ТАМИРЧНЫГ БАТАЛГААЖУУЛЖ БҮРТГЭХ',
    registeringState: 'Бүртгэж байна...',

    // Success
    successTitle: 'Тамирчин амжилттай бүртгэгдлээ',
    successDesc: (name, plan, duration) =>
      `${name || 'Тамирчин'} амжилттай бүртгэгдэж, ${plan} (${duration}) идэвхжлээ.`,
    registerAnotherBtn: 'Дуусгах & Дараагийн гишүүнийг бүртгэх',

    // Inventory - Locker
    lockerCapTitle: 'Шүүгээний Багтаамж & Тохиргоо',
    lockerCapSubtitle: 'Фитнесс төвийн нийт шүүгээний тоо хэмжээг тохируулах.',
    totalGymLockersLabel: 'НИЙТ ШҮҮГЭЭНИЙ ТОО ХЭМЖЭЭ',
    saveLockerBtn: 'Шүүгээний тоог хадгалах',
    lockerSavedNotice: 'Шүүгээний тоо амжилттай хадгалагдлаа',

    // Inventory - Plan Builder
    planBuilderTitle: 'Гишүүнчлэлийн Багц Үүсгэгч',
    planBuilderSubtitle: 'Тусгай сургалт, үнэ, хугацаа бүхий гишүүнчлэлийн шинэ багцуудыг үүсгэх.',

    // Block 1
    block1Title: '1. ЗОРИЛТОТ БҮЛЭГ / АНГИЛАЛ СОНГОХ',
    catUnder18Num: '1. 18-аас ДООШ НАС',
    catUnder18Title: 'Хүүхэд & Оюутны багц',
    catUnder18Desc: '18-аас доош насны өсвөр үе, сурагчдад зориулсан',
    catOver18Num: '2. 18-аас ДЭЭШ НАС',
    catOver18Title: 'Насанд хүрэгчдийн үндсэн багц',
    catOver18Desc: '18 ба түүнээс дээш насныханд зориулсан бүрэн эрхтэй багц',
    catOrgNum: '3. БАЙГУУЛЛАГА',
    catOrgTitle: 'Байгууллага & Баг хамт олон',
    catOrgDesc: 'Албан байгууллага, компани, баг хамт олонд зориулсан',

    // Block 2
    block2Title: '2. БАГЦЫН НЭР & ТУСГАЙ СУРГАЛТУУД',
    customPlanTitleLabel: 'БАГЦЫН ТУСГАЙ НЭР (СОНГОЛТООР)',
    customPlanTitlePlaceholder: 'Жишээ: VIP Про Багц (хоосон үлдээвэл үндсэн нэрээр хадгалагдана)',
    specializedLessonsLabel: 'БАГЦАД БАГТСАН ТУСГАЙ ХИЧЭЭЛҮҮД (СОНГОЛТООР)',
    specializedLessonsPlaceholder: 'Жишээ: Хувийн багштай 12 удаагийн бэлтгэл + Саун, усан бассейн эрхтэй',

    // Block 3
    block3Title: '3. ХУГАЦАА & ҮНЭ',
    durationMonthsLabel: 'ХУГАЦАА (САРААР)',
    priceUsdLabel: 'ҮНЭ (₮ MNT)',
    buildSavePlanBtn: '+ Багц үүсгэж хадгалах',

    // Active Inventory
    activeBuiltPlansTitle: (count) => `ИДЭВХТЭЙ БАГЦУУДЫН ЖАГСААЛТ (${count})`,
    planPriceLabel: 'Багцын үнэ:',
    planCreatedToast: 'Гишүүнчлэлийн шинэ багц амжилттай үүсгэгдлээ',
    planDeletedToast: 'Гишүүнчлэлийн багц устгагдлаа',
    monthUnit: 'Сар',
    monthsUnit: 'Сар',

    // Check-In Desk
    lookupAthleteTitle: 'ТАМИРЧНЫГ НЭР, ДУГААР, УТСААР ХАЙХ',
    searchAthletePlaceholder: 'Нэр, гишүүний дугаар, утасны дугаараар хайх...',
    clearSearchBtn: 'Цэвэрлэх',
    athletePhotoIdTitle: 'ТАМИРЧНЫ ЦЭЭЖ ЗУРАГ & ТАНИЛТ',
    showQrScannerBtn: 'QR Сканнер нээх',
    showCameraBtn: 'Зураг / Камер харах',
    membershipPlanLabel: 'Гишүүнчлэлийн багц:',
    expirationDateShortLabel: 'Дуусах огноо:',
    floorOccupancyLabel: 'Танхимд байгаа эсэх:',
    occupancyCheckedIn: 'Танхимд бэлтгэл хийж буй (Орсон)',
    occupancyCheckedOut: 'Бэлтгэл дууссан (Гарсан)',
    assignedLockerKeyLabel: 'Олгосон шүүгээний түлхүүр:',
    emergencyContactShortLabel: 'Яаралтай үед холбогдох:',
    btnCheckOutAndReturnKey: 'Танхимаас гаргах & Түлхүүр хүлээн авах',
    btnCheckInAndAssignKey: 'Танхимд оруулах & Шүүгээ олгох',
    btnCheckInSimple: 'Танхимд оруулах',
    btnCheckedInBadge: 'Танхимд орсон',
    noAthletesFoundText: 'Таны хайлтад тохирох тамирчин олдсонгүй.',
    selectLockerModalTitle: 'Шүүгээний түлхүүр олгох',
    selectLockerPrompt: 'Чөлөөтэй байгаа шүүгээнээс сонгоно уу:',
    noLockerAssigned: 'Шүүгээ олгоогүй',
  },
};

