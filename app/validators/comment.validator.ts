import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCommentValidator {
  @IsString({ message: "Nội dung bình luận phải là chuỗi ký tự" })
  @IsNotEmpty({ message: "Nội dung bình luận không được để trống" })
  content!: string;

  @IsString({ message: "Tên người dùng phải là chuỗi ký tự" })
  @IsNotEmpty({ message: "Tên người dùng không được để trống" })
  userName!: string;

  @IsEmail({}, { message: "Email không đúng định dạng" })
  @IsOptional()
  userEmail?: string;

  @IsString({ message: "Slug bài viết phải là chuỗi ký tự" })
  @IsNotEmpty({ message: "Slug bài viết không được để trống" })
  slug!: string;
}

export class UpdateCommentValidator {
  @IsString({ message: "Nội dung bình luận phải là chuỗi ký tự" })
  @IsNotEmpty({ message: "Nội dung bình luận không được để trống" })
  content!: string;
}
