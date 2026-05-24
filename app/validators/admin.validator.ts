import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";


const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v : v ? [String(v)] : [];

export { PaginationValidator } from "./common.validator";

/** Schema cho Swagger - @ApiDoc({ body: CreateUserValidator }) */
export class CreateUserValidator {
  static schema = {
    firstName: "string",
    middleName: "string",
    lastName: "string",
    email: "string",
    password: "string",
    avatarUrl: "string",
    roleIds: "string[]",
    role: "string",
  } as const;

  static required = ["firstName", "lastName", "email"] as const;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  // @MinLength(1, { message: "First name is required" })
  firstName!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  middleName?: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  // @MinLength(1, { message: "Last name is required" })
  lastName!: string;

  @IsEmail({}, { message: "Invalid email" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  email!: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.password !== "" && o.password !== undefined)
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  roleIds?: string[];

  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateUserValidator {
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["personal", "roles", "permissions"], {
    message: "Section must be personal, roles or permissions",
  })
  section?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  // @MinLength(1)
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  // @MinLength(1)
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsEmail({}, { message: "Invalid email" })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["ACTIVE", "INACTIVE", "PENDING"], {
    message: "Status must be ACTIVE, INACTIVE or PENDING",
  })
  status?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  address?: string;

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  roleIds?: string[];

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  permissionIds?: string[];
}

export class CreateStaffValidator {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  firstName!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  lastName!: string;

  @IsEmail({}, { message: "Invalid email" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  email!: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["ACTIVE", "INACTIVE"])
  status?: string;
}

export class UpdateStaffValidator {
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["ACTIVE", "INACTIVE"])
  status?: string;
}

export class CreateCustomerValidator {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  firstName!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  lastName!: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  middleName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsEmail({}, { message: "Invalid email" })
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["MALE", "FEMALE", "OTHER"])
  gender?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  address?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  birthday?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["ACTIVE", "INACTIVE"])
  status?: string;
}

export class UpdateCustomerValidator {
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  middleName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsEmail({}, { message: "Invalid email" })
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["MALE", "FEMALE", "OTHER"])
  gender?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  address?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  birthday?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["ACTIVE", "INACTIVE"])
  status?: string;
}

export class RoleCreateValidator {
  @IsString()
  @MinLength(1, { message: "Code is required" })
  code!: string;

  @IsString()
  @MinLength(1, { message: "Name is required" })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class RoleUpdateValidator {
  static schema = {
    permissionIds: "string[]",
    code: "string",
    name: "string",
    description: "string",
  } as const;

  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  permissionIds?: string[];
}

export class FeatureCreateValidator {
  @IsString()
  @MinLength(1, { message: "Code is required" })
  code!: string;

  @IsString()
  @MinLength(1, { message: "Name is required" })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["MENU_GROUP", "FEATURE", "SYSTEM"])
  type?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  sortOrder?: number;
}

export class FeatureUpdateValidator {
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(["MENU_GROUP", "FEATURE", "SYSTEM"])
  type?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  sortOrder?: number;
}

export class CreateAppointmentValidator {
  static schema = {
    appointmentCode: "string",
    customerName: "string",
    customerPhone: "string",
    staffName: "string",
    serviceName: "string",
    roomName: "string",
    appointmentDate: "string",
    startTime: "string",
    endTime: "string",
    status: "string",
    note: "string",
    cancellationReason: "string",
    createdBy: "string",
  } as const;

  static required = [
    "appointmentCode",
    "customerName",
    "customerPhone",
    "appointmentDate",
    "startTime",
    "endTime",
    "status",
  ] as const;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  appointmentCode!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  customerName!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  customerPhone!: string;

  @IsOptional()
  @IsString()
  staffName?: string;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsString()
  roomName?: string;

  @IsString()
  appointmentDate!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateAppointmentValidator {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  appointmentCode?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  customerName?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  customerPhone?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  staffName?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  serviceName?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  roomName?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  appointmentDate?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  startTime?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  endTime?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  status?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  note?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  cancellationReason?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  createdBy?: string;
}


export class CreateStaffScheduleValidator {
  @IsString()
  staffId!: string;

  @IsDateString()
  workDate!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  shiftType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateStaffScheduleValidator {
  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsDateString()
  workDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  shiftType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  note?: string;
}