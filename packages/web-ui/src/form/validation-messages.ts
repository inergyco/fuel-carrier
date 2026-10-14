import type { TranslationFunctions } from '@fuel-carrier/i18n'
import {
  CAR_LICENSE_PLATE_MAX_LENGTH,
  CAR_NOTE_MAX_LENGTH,
  type CarValidationMessages,
} from '@fuel-carrier/shared-validation/car/create'
import {
  COMPANY_USER_EMAIL_MAX_LENGTH,
  COMPANY_USER_FIRST_NAME_MAX_LENGTH,
  COMPANY_USER_LAST_NAME_MAX_LENGTH,
  type CompanyUserValidationMessages,
} from '@fuel-carrier/shared-validation/company-user/create'
import {
  DRIVER_FIRST_NAME_MAX_LENGTH,
  DRIVER_LAST_NAME_MAX_LENGTH,
  type DriverValidationMessages,
} from '@fuel-carrier/shared-validation/driver/create'
import { IMAGE_UPLOAD_URL_MAX_LENGTH } from '@fuel-carrier/shared-validation/image-upload/constants'
import { PASSWORD_MIN_LENGTH } from '@fuel-carrier/shared-validation/password'

export const toDriverValidationMessages = (
  LL: TranslationFunctions,
): DriverValidationMessages => ({
  firstNameRequired: LL.validation.firstNameRequired(),
  firstNameTooLong: LL.validation.firstNameTooLong({
    max: DRIVER_FIRST_NAME_MAX_LENGTH,
  }),
  lastNameRequired: LL.validation.lastNameRequired(),
  lastNameTooLong: LL.validation.lastNameTooLong({
    max: DRIVER_LAST_NAME_MAX_LENGTH,
  }),
  nationalIdInvalid: LL.validation.nationalIdInvalid(),
  mobileNumberRequired: LL.validation.mobileNumberRequired(),
  mobileNumberInvalid: LL.validation.mobileNumberInvalid(),
  imageUrlTooLong: LL.validation.driverImageUrlTooLong({
    max: IMAGE_UPLOAD_URL_MAX_LENGTH,
  }),
  imageUrlInvalid: LL.validation.driverImageUrlInvalid(),
})

export const toCompanyUserValidationMessages = (
  LL: TranslationFunctions,
): CompanyUserValidationMessages => ({
  firstNameRequired: LL.validation.firstNameRequired(),
  firstNameTooLong: LL.validation.firstNameTooLong({
    max: COMPANY_USER_FIRST_NAME_MAX_LENGTH,
  }),
  lastNameRequired: LL.validation.lastNameRequired(),
  lastNameTooLong: LL.validation.lastNameTooLong({
    max: COMPANY_USER_LAST_NAME_MAX_LENGTH,
  }),
  usernameRequired: LL.validation.usernameRequired(),
  usernameInvalid: LL.validation.usernameInvalid(),
  nationalIdInvalid: LL.validation.nationalIdInvalid(),
  emailTooLong: LL.validation.emailTooLong({
    max: COMPANY_USER_EMAIL_MAX_LENGTH,
  }),
  passwordRequired: LL.validation.passwordRequired(),
  passwordStrength: {
    minLength: LL.validation.passwordMinLength({ min: PASSWORD_MIN_LENGTH }),
    uppercase: LL.validation.passwordUppercase(),
    lowercase: LL.validation.passwordLowercase(),
    digit: LL.validation.passwordDigit(),
    special: LL.validation.passwordSpecial(),
  },
})

export const toCarValidationMessages = (
  LL: TranslationFunctions,
): CarValidationMessages => ({
  licensePlateRequired: LL.validation.licensePlateRequired(),
  licensePlateTooLong: LL.validation.licensePlateTooLong({
    max: CAR_LICENSE_PLATE_MAX_LENGTH,
  }),
  licensePlateInvalid: LL.validation.licensePlateInvalid(),
  driverRequired: LL.validation.driverRequired(),
  noteTooLong: LL.validation.noteTooLong({ max: CAR_NOTE_MAX_LENGTH }),
})
