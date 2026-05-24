import axios from "axios";
import { ApiController } from "./api.controller";

export class ChatController extends ApiController {
  async ask() {
    try {
      const { message } = this.req.body;
      const apiUrl = process.env.GEMMA_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"; // Default to a working model
      const apiKey = process.env.GEMMA_API_KEY;

      // Kiểm tra cấu hình môi trường trước khi gọi API
      if (!apiUrl || !apiKey) {
        return this.res.status(500).json({
          success: false,
          message: "Chưa cấu hình API Key hoặc URL trong file .env",
        });
      }

      if (!message) {
        return this.res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const systemPrompt = `
Bạn là chuyên gia spa và chăm sóc da.

Nhiệm vụ:
- Tư vấn skincare
- Chăm sóc da dầu, da khô, da mụn
- Routine sáng/tối
- Chăm sóc sức khỏe cơ bản

Quy tắc:
- Không chẩn đoán bệnh.
- Không kê đơn thuốc.
- Nếu tình trạng nghiêm trọng hãy khuyên gặp bác sĩ da liễu.
- Trả lời ngắn gọn, dễ hiểu, chuyên nghiệp.
`;

      const response = await axios.post(
        `${apiUrl}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}

Người dùng hỏi:
${message}`,
                },
              ],
            },
          ],
        }
      );

      const answer =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Xin lỗi, hiện tại AI chưa phản hồi.";

      return this.res.json({
        success: true,
        data: answer,
      });
    } catch (error: any) {
      console.error("AI API Error:", error.response?.data || error.message);

      return this.res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.error?.message || "AI Service Error",
      });
    }
  }
}