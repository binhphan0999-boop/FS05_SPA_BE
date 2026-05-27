import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class OrderItemValidator {
  @IsNotEmpty({ message: "Product ID is required" })
  @IsString()
  productId!: string;

  @IsNotEmpty({ message: "Quantity is required" })
  @IsNumber()
  @Min(1, { message: "Quantity must be greater than 0" })
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Price must be greater than or equal to 0" })
  price?: number;
}

export class CreateOrderValidator {
  @IsNotEmpty({ message: "User ID is required" })
  @IsString()
  userId!: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsString()
  couponId?: string;

  @IsNotEmpty({ message: "Delivery phone is required" })
  @IsString()
  deliveryPhone!: string;

  @IsNotEmpty({ message: "Delivery address is required" })
  @IsString()
  deliveryAddress!: string;

  @IsOptional()
  @IsString()
  deliveryNote?: string;

  @IsNotEmpty({ message: "Items are required" })
  @IsArray({ message: "Items must be an array" })
  @ArrayMinSize(1, { message: "Items must contain at least 1 item" })
  @ValidateNested({ each: true })
  @Type(() => OrderItemValidator)
  items!: OrderItemValidator[];
}
