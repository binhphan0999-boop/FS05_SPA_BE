import { GoogleGenAI } from "@google/genai";
import { ApiController } from "./api.controller";

export class ChatController extends ApiController {
  async ask() {
    try {
      const { message } = this.req.body;

      if (!message) {
        return this.res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY;
      if (!apiKey) {
        return this.res.status(500).json({
          success: false,
          message: "Chưa cấu hình API Key trong file .env",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `
Bạn là chuyên gia spa và chăm sóc da.
Nhiệm vụ: Tư vấn skincare, chăm sóc da dầu/khô/mụn, routine sáng/tối.
Quy tắc: Không chẩn đoán bệnh, không kê đơn thuốc. Ngắn gọn, chuyên nghiệp.
`;

      // 1. Định nghĩa danh sách các model theo thứ tự ưu tiên từ cao xuống thấp
      const modelList = [
        "gemma-4-31b-it",
        "gemma-4-26b-a4b-it",
        "gemini-2.5-flash", // Ưu tiên số 1: Nhanh, rẻ, thông minh nhất hiện tại
      ];

      let answer = "";
      let successModel = "";
      let lastError: any = null;

      // 2. Vòng lặp thử từng model cho đến khi thành công
      for (const modelName of modelList) {
        try {
          console.log(`Đang thử gọi AI với model: ${modelName}...`);

          const response = await ai.models.generateContent({
            model: modelName,
            contents: message,
            config: {
              systemInstruction: systemPrompt,
            },
          });

          // Nếu gọi thành công, lưu kết quả và thoát khỏi vòng lặp
          if (response && response.text) {
            answer = response.text;
            successModel = modelName;
            break; 
          }
        } catch (error: any) {
          // Nếu lỗi, log lại để theo dõi và tiếp tục vòng lặp sang model tiếp theo
          console.warn(`Model ${modelName} thất bại. Lỗi: ${error.message || error}`);
          lastError = error; // Lưu lại lỗi cuối cùng để phản hồi nếu tất cả đều fail
        }
      }

      // 3. Kiểm tra xem có model nào chạy thành công không
      if (!answer) {
        return this.res.status(500).json({
          success: false,
          message: "Tất cả các model trong danh sách đều gọi thất bại.",
          error: lastError?.message || lastError,
        });
      }

      // Trả về kết quả kèm theo tên model đã chạy thành công (để bạn tiện debug)
      return this.res.json({
        success: true,
        modelUsed: successModel,
        data: answer,
      });

    } catch (error: any) {
      console.error("Hệ thống gặp lỗi nghiêm trọng:", error);
      return this.res.status(500).json({
        success: false,
        message: error.message || "AI Service Error",
      });
    }
  }
}