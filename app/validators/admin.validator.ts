import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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
    staffId: "string",
    staffScheduleId: "string",
    serviceId: "string",
    room: "string",
    appointmentDate: "string",
    startTime: "string",
    endTime: "string",
    status: "string",
    note: "string",
    cancellationReason: "string",
    createdById: "string",
  } as const;

  static required = [
    "customerName",
    "customerPhone",
    "appointmentDate",
    "startTime",
    "endTime",
    "status",
  ] as const;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  appointmentCode?: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value),
  )
  @MinLength(1)
  customerName!: string;

  @IsString()
  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value).trim(),
  )
  customerPhone!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === null ? undefined : String(value),
  )
  staffId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === null ? undefined : String(value),
  )
  staffScheduleId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === null ? undefined : String(value),
  )
  serviceId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value).trim(),
  )
  room?: string;

  @IsString()
  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value).trim(),
  )
  appointmentDate!: string;

  @IsString()
  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value).trim(),
  )
  startTime!: string;

  @IsString()
  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value).trim(),
  )
  endTime!: string;

  @IsString()
  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value).trim(),
  )
  status!: string;

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
  createdById?: string;
}

export class UpdateAppointmentValidator {
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value).trim(),
  )
  appointmentCode?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value).trim(),
  )
  customerName?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value),
  )
  staffId?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value).trim(),
  )
  customerPhone?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value),
  )
  staffScheduleId?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value),
  )
  serviceId?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value),
  )
  room?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value).trim(),
  )
  appointmentDate?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value).trim(),
  )
  startTime?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value).trim(),
  )
  endTime?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value).trim(),
  )
  status?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value),
  )
  note?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value),
  )
  cancellationReason?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === "" || value === undefined || value === null
      ? undefined
      : String(value),
  )
  createdById?: string;
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

export class CreateServiceValidator {
  @IsString()
  @MinLength(1, { message: "Name is required" })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateServiceValidator {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
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

export class CreateProductValidator {
  static schema = {
    name: "string",
    description: "string",
    content: "string",
    price: "number",
    stock: "number",
    sku: "string",
    categoryId: "string",
    imgUrl: "string",
    status: "string",
  } as const;

  static required = ["name", "price", "stock", "sku"] as const;

  @IsString()
  @MinLength(1, { message: "Tên sản phẩm là bắt buộc" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  name!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  description?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  content?: string;

  @IsNumber()
  @Min(0, { message: "Giá phải lớn hơn hoặc bằng 0" })
  price!: number;

  @IsNumber()
  @Min(0, { message: "Số lượng phải lớn hơn hoặc bằng 0" })
  stock!: number;

  @IsString()
  @MinLength(1, { message: "SKU là bắt buộc" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  sku!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  categoryId?: string;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
  status?: string;
}

export class UpdateProductValidator {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (value === "" ? undefined : value))
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  description?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  content?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (value === "" ? undefined : value))
  sku?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  categoryId?: string;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
  status?: string;
}

export class CreateNewsValidator {
  static schema = {
    title: "string",
    summary: "string",
    content: "string",
    thumbnail: "string",
  } as const;

  static required = ["title", "content"] as const;

  @IsString()
  @MinLength(1, { message: "Tiêu đề tin tức là bắt buộc" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  title!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  summary?: string;

  @IsString()
  @MinLength(1, { message: "Nội dung tin tức là bắt buộc" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  content!: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class UpdateNewsValidator {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (value === "" ? undefined : value))
  title?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" ? undefined : value))
  summary?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (value === "" ? undefined : value))
  content?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class CreateCommentValidator {
  static schema = {
    content: "string",
    userName: "string",
    userEmail: "string",
  } as const;

  static required = ["content", "userName"] as const;

  @IsString()
  @MinLength(1, { message: "Nội dung bình luận là bắt buộc" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  content!: string;

  @IsString()
  @MinLength(1, { message: "Tên người bình luận là bắt buộc" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  userName!: string;

  @IsOptional()
  @IsEmail({}, { message: "Email không hợp lệ" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  userEmail?: string;
}

export class UpdateCommentValidator {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (value === "" ? undefined : value))
  content?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (value === "" ? undefined : value))
  userName?: string;

  @IsOptional()
  @IsEmail({}, { message: "Email không hợp lệ" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  userEmail?: string;
}
