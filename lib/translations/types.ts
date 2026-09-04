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

  // Photo
  profilePhotoTitle: string;
  noPhoto: string;
  webcamTitle: string;
  webcamDesc: string;
  takePhotoBtn: string;
  retakeBtn: string;
  webcamModalTitle: string;
  cancelBtn: string;
  captureBtn: string;

  // Registration Section 2: Plan
  sec2Title: string;
  sec2Subtitle: string;
  badgeUnder18: string;
  badgeOver18: string;
  badgeOrg: string;
  defaultBase: string;
  noPlansYet: string;
  goToInventoryBtn: string;

  // Registration Section 3: Duration
  sec3Title: string;
  customStepper: string;
  membershipDurationTitle: string;
  adjustInIncrements: string;
  selectedPlanLabel: string;
  startDateLabel: string;
  expirationDateLabel: string;
  calculatedFeeLabel: string;

  // Payment
  paymentStatusTitle: string;
  paymentReceivedBadge: string;
  paymentMethodLabel: string;
  payCard: string;
  payCash: string;
  payTransfer: string;
  confirmRegisterBtn: string;
  registeringState: string;

  // Success
  successTitle: string;
  successDesc: (name: string, plan: string, duration: string) => string;
  registerAnotherBtn: string;

  // Inventory - Locker
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
