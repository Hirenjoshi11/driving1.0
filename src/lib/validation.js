import { z } from 'zod';
import { calculateAge } from './age.js';

// 1. Applicant Details Schema
export function getApplicantSchema() {
  return z
    .object({
      firstName: z.string().trim().min(1, 'First name is required'),
      lastName: z.string().trim().min(1, 'Last name is required'),
      middleName: z.string().optional(),
      relationType: z.enum(['Father', 'Mother', 'Husband', 'Guardian'], {
        required_error: 'Relation type is required',
      }),
      relationName: z.string().trim().min(1, 'Relative / Father full name is required'),
      gender: z.enum(['Male', 'Female', 'Other'], {
        required_error: 'Gender is required',
      }),
      dob: z
        .string()
        .min(1, 'Date of birth is required')
        .refine(
          (val) => {
            const age = calculateAge(val);
            return age !== null && age >= 16;
          },
          {
            message:
              'Applicant must be at least 16 years of age under Section 4 of the Motor Vehicles Act',
          }
        ),
      mobile: z
        .string()
        .regex(
          /^[6-9]\d{9}$/,
          'Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9'
        ),
      email: z.string().email('Invalid email address').optional().or(z.literal('')),
      identityType: z.string().optional().default('aadhaar'),
      identityNumber: z.string().min(1, 'Identity / Aadhaar number is required'),
      bloodGroup: z.string().optional(),
      education: z.string().optional(),
      identificationMark: z.string().optional(),
      guardianName: z.string().optional(),
      guardianRelation: z.string().optional(),
      guardianMobile: z.string().optional(),
      guardianAadhaar: z.string().optional(),
      guardianConsent: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      // Aadhaar 12-digit check
      if ((data.identityType || 'aadhaar').toLowerCase() === 'aadhaar') {
        const cleanAadhaar = (data.identityNumber || '').replace(/\s/g, '');
        if (!/^\d{12}$/.test(cleanAadhaar)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identityNumber'],
            message: 'Aadhaar number must be exactly 12 digits',
          });
        }
      }

      // Minor rules (age 16-17)
      const age = calculateAge(data.dob);
      if (age !== null && age < 18) {
        if (!data.guardianName || !data.guardianName.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guardianName'],
            message: 'Parent or legal guardian full name is required for minors',
          });
        }
        if (!data.guardianRelation) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guardianRelation'],
            message: 'Guardian relationship is required',
          });
        }
        if (!data.guardianMobile || !/^[6-9]\d{9}$/.test(data.guardianMobile)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guardianMobile'],
            message:
              'Valid 10-digit guardian mobile number is required for minors',
          });
        }
        if (!data.guardianConsent) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guardianConsent'],
            message:
              'Parent/guardian consent under Section 4(1) of the Motor Vehicles Act must be confirmed',
          });
        }
      }
    });
}

// 2. Address Schema
export function getAddressSchema() {
  return z
    .object({
      currentHouse: z.string().trim().min(1, 'House / Flat / Door number is required'),
      currentStreet: z.string().trim().min(1, 'Street / Locality is required'),
      currentCity: z.string().trim().min(1, 'City / Town / Village is required'),
      districtId: z
        .union([z.number().positive(), z.string().min(1)])
        .refine((v) => Number(v) > 0, { message: 'District is required' }),
      currentTaluka: z.string().optional(),
      currentPincode: z
        .string()
        .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
      sameAsCurrent: z.boolean().optional().default(true),
      permanentHouse: z.string().optional(),
      permanentStreet: z.string().optional(),
      permanentCity: z.string().optional(),
      permanentPincode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.sameAsCurrent === false) {
        if (!data.permanentHouse || !data.permanentHouse.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentHouse'],
            message: 'Permanent house number is required',
          });
        }
        if (!data.permanentStreet || !data.permanentStreet.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentStreet'],
            message: 'Permanent street / locality is required',
          });
        }
        if (!data.permanentCity || !data.permanentCity.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentCity'],
            message: 'Permanent city is required',
          });
        }
        if (!data.permanentPincode || !/^\d{6}$/.test(data.permanentPincode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentPincode'],
            message: 'Permanent PIN code must be exactly 6 digits',
          });
        }
      }
    });
}

// 3. Vehicle Classes Schema
export function getVehicleSchema(dob = null) {
  return z
    .object({
      selectedVehicleClasses: z
        .array(z.any())
        .min(1, 'Please select at least one vehicle class to endorse'),
    })
    .superRefine((data, ctx) => {
      if (dob) {
        const age = calculateAge(dob);
        if (age !== null && age < 18) {
          // Under 18: Only MCWOG (or vehicle class 1 / code MCWOG) is permitted
          const classes = data.selectedVehicleClasses || [];
          const hasInvalidClass = classes.some((c) => {
            const code = typeof c === 'string' ? c : c?.code;
            return code && code.toUpperCase() !== 'MCWOG';
          });

          if (hasInvalidClass) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['selectedVehicleClasses'],
              message:
                'Minors aged 16-17 are only permitted to apply for Motorcycle Without Gear (MCWOG) under Section 4(1) of the Motor Vehicles Act.',
            });
          }
        }
      }
    });
}

// 4. Licence Details Schema (for New DL, Renewal, etc.)
export function getLicenceSchema(serviceSlug = '', service = null) {
  const isNewDl =
    serviceSlug === 'new-driving-licence' ||
    service?.slug === 'new-driving-licence' ||
    service?.id === 2 ||
    service?.requires_learner_licence === 1;

  return z.object({
    learnerLicenceNumber: isNewDl
      ? z
          .string()
          .trim()
          .min(1, 'A valid Learner Licence number is mandatory to apply for a New Driving Licence')
      : z.string().optional(),
    existingDlNumber: z.string().optional(),
  });
}

// 5. RTO Selection Schema
export function getRtoSchema() {
  return z.object({
    rtoId: z
      .union([z.number().positive(), z.string().min(1)])
      .refine((v) => Number(v) > 0, { message: 'Please select a designated RTO office' }),
    testCentreId: z.union([z.number().positive(), z.string().min(1)]).optional(),
  });
}

// 6. Documents Step Schema
export function getDocumentsSchema() {
  return z
    .object({
      uploadedDocuments: z.record(z.any()).optional(),
      documentFiles: z.record(z.any()).optional(),
    })
    .superRefine((data, ctx) => {
      const hasUploaded =
        (data.uploadedDocuments && Object.keys(data.uploadedDocuments).length > 0) ||
        (data.documentFiles && Object.keys(data.documentFiles).length > 0);

      if (!hasUploaded) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['uploadedDocuments'],
          message: 'Please upload at least one required supporting document',
        });
      }
    });
}

// 7. Review & Declaration Schema
export function getReviewSchema(isMinor = false) {
  return z
    .object({
      consentUnified: z.boolean().refine((v) => v !== false, {
        message: 'Please agree to the service communications and policy terms to continue',
      }).optional(),
      declared: z.literal(true, {
        errorMap: () => ({
          message:
            'You must accept the statutory declaration and undertaking under the Motor Vehicles Act',
        }),
      }),
      guardianConsent: isMinor
        ? z.literal(true, {
            errorMap: () => ({
              message:
                'Parent/guardian consent under Section 4(1) must be agreed to for applicants under 18',
            }),
          })
        : z.boolean().optional(),
    });
}

// 8. Full Application Schema (combines all step rules for submission)
export function getFullApplicationSchema(serviceSlug = '', service = null) {
  const isNewDl =
    serviceSlug === 'new-driving-licence' ||
    service?.slug === 'new-driving-licence' ||
    service?.id === 2 ||
    service?.requires_learner_licence === 1;

  return z
    .object({
      // Applicant
      firstName: z.string().trim().min(1, 'First name is required'),
      lastName: z.string().trim().min(1, 'Last name is required'),
      middleName: z.string().optional(),
      relationType: z.enum(['Father', 'Mother', 'Husband', 'Guardian'], {
        required_error: 'Relation type is required',
      }),
      relationName: z.string().trim().min(1, 'Relative / Father full name is required'),
      gender: z.enum(['Male', 'Female', 'Other']),
      dob: z
        .string()
        .min(1, 'Date of birth is required')
        .refine(
          (val) => {
            const age = calculateAge(val);
            return age !== null && age >= 16;
          },
          {
            message:
              'Applicant must be at least 16 years of age under Section 4 of the Motor Vehicles Act',
          }
        ),
      mobile: z
        .string()
        .regex(
          /^[6-9]\d{9}$/,
          'Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9'
        ),
      email: z.string().email('Invalid email address').optional().or(z.literal('')),
      identityType: z.string().optional().default('aadhaar'),
      identityNumber: z.string().min(1, 'Identity / Aadhaar number is required'),
      bloodGroup: z.string().optional(),
      education: z.string().optional(),
      identificationMark: z.string().optional(),

      // Minor details
      guardianName: z.string().optional(),
      guardianRelation: z.string().optional(),
      guardianMobile: z.string().optional(),
      guardianAadhaar: z.string().optional(),
      guardianConsent: z.boolean().optional(),

      // Address
      currentHouse: z.string().trim().min(1, 'House / Flat number is required'),
      currentStreet: z.string().trim().min(1, 'Street / Locality is required'),
      currentCity: z.string().trim().min(1, 'City / Town / Village is required'),
      districtId: z
        .union([z.number().positive(), z.string().min(1)])
        .refine((v) => Number(v) > 0, { message: 'District is required' }),
      currentTaluka: z.string().optional(),
      currentPincode: z
        .string()
        .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
      sameAsCurrent: z.boolean().optional().default(true),
      permanentHouse: z.string().optional(),
      permanentStreet: z.string().optional(),
      permanentCity: z.string().optional(),
      permanentPincode: z.string().optional(),

      // RTO
      rtoId: z
        .union([z.number().positive(), z.string().min(1)])
        .refine((v) => Number(v) > 0, { message: 'Designated RTO is required' }),
      testCentreId: z.union([z.number().positive(), z.string().min(1)]).optional(),

      // Licence & Vehicle
      selectedVehicleClasses: z
        .array(z.any())
        .optional(),
      learnerLicenceNumber: isNewDl
        ? z
            .string()
            .trim()
            .min(1, 'Learner Licence number is mandatory for a New Driving Licence')
        : z.string().optional(),
      existingDlNumber: z.string().optional(),

      // Declaration
      declared: z.literal(true, {
        errorMap: () => ({
          message: 'The statutory declaration under the Motor Vehicles Act must be accepted',
        }),
      }),
    })
    .superRefine((data, ctx) => {
      // Aadhaar check
      if ((data.identityType || 'aadhaar').toLowerCase() === 'aadhaar') {
        const cleanAadhaar = (data.identityNumber || '').replace(/\s/g, '');
        if (!/^\d{12}$/.test(cleanAadhaar)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identityNumber'],
            message: 'Aadhaar number must be exactly 12 digits',
          });
        }
      }

      // Minor checks
      const age = calculateAge(data.dob);
      if (age !== null && age < 18) {
        if (!data.guardianName || !data.guardianName.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guardianName'],
            message: 'Guardian name is required for minors',
          });
        }
        if (!data.guardianMobile || !/^[6-9]\d{9}$/.test(data.guardianMobile)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guardianMobile'],
            message: 'Valid 10-digit guardian mobile number is required for minors',
          });
        }
        if (!data.guardianConsent) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guardianConsent'],
            message:
              'Parent/guardian consent under Section 4(1) of the Motor Vehicles Act is required',
          });
        }

        // Check vehicle classes for minor
        const classes = data.selectedVehicleClasses || [];
        const hasDisallowed = classes.some((c) => {
          const code = typeof c === 'string' ? c : c?.code;
          return code && code.toUpperCase() !== 'MCWOG';
        });
        if (hasDisallowed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['selectedVehicleClasses'],
            message:
              'Minors aged 16-17 are only permitted to apply for Motorcycle Without Gear (MCWOG)',
          });
        }
      }

      // Permanent address checks
      if (data.sameAsCurrent === false) {
        if (!data.permanentHouse || !data.permanentHouse.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentHouse'],
            message: 'Permanent house number is required',
          });
        }
        if (!data.permanentStreet || !data.permanentStreet.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentStreet'],
            message: 'Permanent street / locality is required',
          });
        }
        if (!data.permanentCity || !data.permanentCity.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentCity'],
            message: 'Permanent city is required',
          });
        }
        if (!data.permanentPincode || !/^\d{6}$/.test(data.permanentPincode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentPincode'],
            message: 'Permanent PIN code must be exactly 6 digits',
          });
        }
      }
    });
}

// 9. Step-by-step validator used by handleNext
export function validateStep(stepKey, formData, context = {}) {
  let schema;
  const isMinor = calculateAge(formData?.dob) !== null && calculateAge(formData?.dob) < 18;

  switch (stepKey) {
    case 'applicant':
      schema = getApplicantSchema();
      break;
    case 'address':
      schema = getAddressSchema();
      break;
    case 'vehicle':
      schema = getVehicleSchema(formData?.dob);
      break;
    case 'licence':
      schema = getLicenceSchema(context.serviceSlug, context.service);
      break;
    case 'rto':
      schema = getRtoSchema();
      break;
    case 'documents':
      schema = getDocumentsSchema();
      break;
    case 'review':
      schema = getReviewSchema(isMinor);
      break;
    default:
      return { success: true, errors: {} };
  }

  const result = schema.safeParse(formData);
  if (result.success) {
    return { success: true, errors: {} };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] || 'general';
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { success: false, errors };
}
