import type { Company } from '@fuel-carrier/shared-types'
import type { CreateCompanyDto } from '@fuel-carrier/shared-validation/company/create'
import {
  createCompany,
  removeCompanyLogo,
  replaceCompanyLogo,
  updateCompany,
} from '../../lib/api/companies'
import type { CompanyFormMode } from './companyFormValidation'

export async function saveCompanyRecord({
  mode,
  company,
  data,
}: {
  mode: CompanyFormMode
  company?: Company
  data: CreateCompanyDto
}): Promise<Company> {
  if (mode === 'edit' && company) {
    const nextLogoUrl = data.logoUrl ?? null
    const previousLogoUrl = company.logoUrl ?? null

    if (nextLogoUrl !== previousLogoUrl) {
      if (nextLogoUrl === null) {
        await removeCompanyLogo(company.id)
      } else {
        await replaceCompanyLogo(company.id, nextLogoUrl)
      }
    }

    return updateCompany(company.id, {
      name: data.name,
      nationalId: data.nationalId,
      phoneNumber: data.phoneNumber,
      address: data.address,
      note: data.note,
      petrolPricePerLiter: data.petrolPricePerLiter,
      feeThresholdX: data.feeThresholdX,
      feeThresholdY: data.feeThresholdY,
      feeThresholdZ: data.feeThresholdZ,
      feeUpToX: data.feeUpToX,
      feeXToY: data.feeXToY,
      feeYToZ: data.feeYToZ,
      feeAboveZ: data.feeAboveZ,
    })
  }

  return createCompany(data)
}
