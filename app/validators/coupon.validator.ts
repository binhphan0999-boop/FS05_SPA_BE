import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

enum DiscountType {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
}

export class CouponCreateValidator {
  @IsNotEmpty({ message: "Mã coupon không được để trống" })
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: "Loại giảm giá không được để trống" })
  @IsEnum(DiscountType, { message: "Loại giảm giá phải là PERCENT hoặc FIXED" })
  discountType!: string;

  @IsNotEmpty({ message: "Giá trị giảm giá không được để trống" })
  @IsNumber()
  @Min(0, { message: "Giá trị giảm giá phải lớn hơn 0" })
  discountValue!: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Giá trị tối thiểu đơn hàng phải lớn hơn 0" })
  minOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Giảm giá tối đa phải lớn hơn 0" })
  maxDiscount?: number;

  @IsNotEmpty({ message: "Số lượng coupon không được để trống" })
  @IsNumber()
  @Min(1, { message: "Số lượng coupon phải lớn hơn 0" })
  quantity!: number;

  @IsNotEmpty({ message: "Ngày bắt đầu không được để trống" })
  @IsDateString()
  startDate!: string;

  @IsNotEmpty({ message: "Ngày kết thúc không được để trống" })
  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CouponUpdateValidator {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DiscountType, { message: "Loại giảm giá phải là PERCENT hoặc FIXED" })
  discountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Giá trị giảm giá phải lớn hơn 0" })
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Giá trị tối thiểu đơn hàng phải lớn hơn 0" })
  minOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Giảm giá tối đa phải lớn hơn 0" })
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: "Số lượng coupon phải lớn hơn 0" })
  quantity?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
