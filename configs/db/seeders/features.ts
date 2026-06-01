/**
 * Danh sách features - khi thêm tính năng mới, thêm vào đây.
 * Chạy: yarn db:seed
 */
import {
  assignPermissionToRole,
  ensureRole,
  registerFeature,
  setFeatureParents,
} from "./registerFeature";

export const FEATURES = [
  {
    code: "AM",
    name: "Administration Management",
    description: "Quản lý users, permissions, roles",
    type: "MENU_GROUP",
    parentCode: null as string | null,
    sortOrder: 0,
  },
  {
    code: "UM",
    name: "User Management",
    description: "Quản lý tài khoản người dùng",
    type: "FEATURE",
    parentCode: "AM",
    sortOrder: 0,
  },
  {
    code: "APPOINTMENT",
    name: "Appointment Management",
    description: "Quản lý lịch hẹn",
    type: "FEATURE",
    parentCode: "AM",
    sortOrder: 0,
  },
  {
    code: "TASK",
    name: "Task",
    description: "Quản lý công việc",
    type: "MENU_GROUP",
    parentCode: null as string | null,
    sortOrder: 1,
  },
  {
    code: "TASK_TYPE",
    name: "Task Type",
    description: "Loại công việc",
    type: "FEATURE",
    parentCode: "TASK",
    sortOrder: 0,
  },
  {
    code: "CHAT",
    name: "Chat",
    description: "Real-time chat",
    type: "FEATURE",
    parentCode: null as string | null,
    sortOrder: 2,
  },
  {
    code: "NEWS",
    name: "News Management",
    description: "Quản lý bài viết và bình luận",
    type: "FEATURE",
    parentCode: "AM",
    sortOrder: 3,
  },
  {
    code: "STAFFSCHEDULE",
    name: "Staff Schedule Management",
    description: "Quản lý lịch nhân viên",
    type: "FEATURE",
    parentCode: "AM",
    sortOrder: 0,
  },
  {
    code: "SERVICE",
    name: "Service Management",
    description: "Quản lý gói dịch vụ spa",
    type: "FEATURE",
    parentCode: "AM",
    sortOrder: 4,
  },
];

export async function seedFeatures() {
  for (const def of FEATURES) {
    await registerFeature(def);
  }
  await setFeatureParents(FEATURES);

  // Role ADMIN phải tồn tại trước khi gán permission (tạo nếu chưa có)
  await ensureRole(
    "ADMIN",
    "Administrator",
    "Full access to admin and user management",
  );

  // ADMIN role có full quyền AM và UM
  await assignPermissionToRole("ADMIN", "AM");
  await assignPermissionToRole("ADMIN", "UM");
  await assignPermissionToRole("ADMIN", "CHAT");
  await assignPermissionToRole("ADMIN", "NEWS");
  await assignPermissionToRole("ADMIN", "SERVICE");
  await assignPermissionToRole("ADMIN", "APPOINTMENT");
  await assignPermissionToRole("ADMIN", "STAFFSCHEDULE");
  console.log("[seedFeatures] Done");
}
