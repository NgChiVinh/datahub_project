# Admin Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa 12 lỗi được tìm thấy qua code review admin pages, bao gồm 3 lỗi bảo mật nghiêm trọng, 4 lỗi crash/logic, và 5 lỗi UX/performance.

**Architecture:** Fixes phân bố trên 7 frontend files (Next.js "use client") và 2 backend files (Express). Mỗi task là một nhóm fix liên quan, commit riêng. Không thêm abstraction mới — chỉ sửa đúng chỗ cần sửa.

**Tech Stack:** Next.js App Router (use client), React hooks, Express.js, MongoDB/Mongoose, react-hot-toast

---

## Files bị ảnh hưởng

| File | Thay đổi |
|------|----------|
| `frontend/src/app/admin/layout.js` | Sửa guard condition line 32 |
| `frontend/src/app/admin/user/page.js` | Thêm self-guard, array check, res.ok |
| `frontend/src/app/admin/comment/page.js` | Array check + res.ok trong handleDelete |
| `frontend/src/app/admin/category/page.js` | res.ok trong handleDelete |
| `frontend/src/app/admin/material/page.js` | res.ok, pagination fix, confirm dialog |
| `frontend/src/app/admin/page.js` | Thay window.location.href bằng Link |
| `frontend/src/app/admin/report/page.js` | Truyền status filter lên backend |
| `Backend/routes/commentRoutes.js` | Xóa duplicate authMiddleware |
| `Backend/controllers/categoryController.js` | Cascade null categoryId trong Materials |

---

### Task 1: Sửa auth guard trong layout.js (Critical security)

**Files:**
- Modify: `frontend/src/app/admin/layout.js:32`

**Vấn đề:** Khi `loading=false` và `user=null` (chưa đăng nhập), điều kiện `loading || (user && user.role !== "admin")` trả về `false` → spinner không hiện → toàn bộ admin layout render rồi mới redirect.

**Fix:** Thêm `!user` vào guard condition.

- [ ] **Step 1: Sửa điều kiện guard**

File: `frontend/src/app/admin/layout.js`, line 32.

Thay:
```js
if (loading || (user && user.role !== "admin")) {
```
Thành:
```js
if (loading || !user || user.role !== "admin") {
```

- [ ] **Step 2: Kiểm tra thủ công**

Mở browser tab ẩn danh → truy cập `/admin` → phải thấy spinner rồi redirect về `/`, KHÔNG thấy sidebar/header admin.

- [ ] **Step 3: Commit**

```bash
git add data_hub/frontend/src/app/admin/layout.js
git commit -m "fix(admin): block admin layout render for unauthenticated users

Guard condition `loading || (user && user.role !== 'admin')` evaluates
false when user=null, exposing full admin UI before redirect fires.
Change to `!user || user.role !== 'admin'` to correctly block render."
```

---

### Task 2: Ngăn admin tự xóa/hạ quyền bản thân (Critical security)

**Files:**
- Modify: `frontend/src/app/admin/user/page.js`

**Vấn đề:**
- `handleDelete`: không có guard, admin xóa được chính mình → mất account
- Role `<select>`: `onChange` bắn ngay không cần xác nhận → admin tự demote

**Fix:** Thêm `useAuth` để lấy `currentUser._id`, so sánh trước khi cho phép thao tác.

- [ ] **Step 1: Thêm import useAuth**

File: `frontend/src/app/admin/user/page.js`, thêm vào đầu file sau `import toast from "react-hot-toast";`:

```js
import { useAuth } from "@/context/AuthContext";
```

- [ ] **Step 2: Lấy currentUser từ context**

Trong component body, sau `const [users, setUsers] = useState([]);`:

```js
const { user: currentUser } = useAuth();
```

- [ ] **Step 3: Guard trong handleDelete**

File: `frontend/src/app/admin/user/page.js`, hàm `handleDelete` (line 58). Thêm guard ngay sau dòng `if (!confirm(...)) return;`:

```js
const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc muốn xoá user này?")) return;

  if (id === currentUser?._id?.toString()) {
    toast.error("Không thể xóa tài khoản của chính bạn!");
    return;
  }

  try {
    // ... phần còn lại giữ nguyên
```

- [ ] **Step 4: Guard trong JSX — disable select nếu là chính mình**

Trong phần render `<select>` (khoảng line 134-145), thêm `disabled` và `title`:

```jsx
<select
  value={u.role}
  onChange={(e) => handleChangeRole(u._id, e.target.value)}
  disabled={u._id === currentUser?._id?.toString()}
  title={u._id === currentUser?._id?.toString() ? "Không thể đổi role của chính bạn" : ""}
  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border focus:outline-none transition-all ${
    u._id === currentUser?._id?.toString()
      ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
      : u.role === "admin"
      ? "bg-primary/5 text-primary border-primary/20 cursor-pointer"
      : "bg-slate-100 text-slate-500 border-slate-200 cursor-pointer"
  }`}
>
  <option value="student">Student</option>
  <option value="admin">Admin</option>
</select>
```

- [ ] **Step 5: Guard trong handleDelete button — disable nếu là chính mình**

Trong phần render nút xóa (khoảng line 147-155):

```jsx
<button
  onClick={() => handleDelete(u._id)}
  disabled={u._id === currentUser?._id?.toString()}
  className={`p-2 rounded-xl transition-all ${
    u._id === currentUser?._id?.toString()
      ? "text-slate-200 cursor-not-allowed"
      : "text-slate-300 hover:text-red-500 hover:bg-red-50"
  }`}
  title={u._id === currentUser?._id?.toString() ? "Không thể xóa tài khoản của chính bạn" : "Xóa người dùng"}
>
```

- [ ] **Step 6: Kiểm tra thủ công**

Đăng nhập admin → vào `/admin/user` → tìm hàng của chính mình → select phải bị grayed out, nút xóa phải bị disabled. Thử xóa/đổi role user khác vẫn hoạt động bình thường.

- [ ] **Step 7: Commit**

```bash
git add data_hub/frontend/src/app/admin/user/page.js
git commit -m "fix(admin/user): prevent admin from deleting or demoting their own account

Admin could accidentally delete themselves or change their own role to
student via the user management table. Added currentUser comparison to
disable both the role select and delete button for the admin's own row."
```

---

### Task 3: Sửa crash khi API trả error object thay vì array

**Files:**
- Modify: `frontend/src/app/admin/user/page.js`
- Modify: `frontend/src/app/admin/comment/page.js`

**Vấn đề:** `setUsers(data)` và `setComments(data)` gọi trực tiếp không kiểm tra `res.ok` hay `Array.isArray` → nếu server trả `{ message: "..." }`, `.map()` crash toàn bộ trang.

- [ ] **Step 1: Fix fetchUsers trong user/page.js**

Hàm `fetchUsers` (lines 10-28), thay phần sau fetch:

```js
const fetchUsers = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Lỗi tải danh sách user");
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      toast.error("Lỗi tải danh sách user");
      return;
    }
    setUsers(data);
  } catch (err) {
    toast.error("Lỗi tải danh sách user");
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 2: Fix fetchComments trong comment/page.js**

Hàm `fetchComments` (lines 13-31), thay phần sau fetch:

```js
const fetchComments = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Lỗi tải bình luận");
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      toast.error("Lỗi tải bình luận");
      return;
    }
    setComments(data);
  } catch (err) {
    toast.error("Lỗi tải comment");
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add data_hub/frontend/src/app/admin/user/page.js data_hub/frontend/src/app/admin/comment/page.js
git commit -m "fix(admin): prevent crash when API returns error object instead of array

setUsers/setComments called without Array.isArray check caused
'.map is not a function' crash when server returned error JSON.
Added res.ok + Array.isArray guards in both fetch handlers."
```

---

### Task 4: Sửa res.ok thiếu trong các handleDelete (Logic bug)

**Files:**
- Modify: `frontend/src/app/admin/comment/page.js`
- Modify: `frontend/src/app/admin/category/page.js`

**Vấn đề:** `fetch()` chỉ throw khi lỗi mạng, không throw khi server trả 4xx/5xx → `toast.success` bắn kể cả khi xóa thất bại.

- [ ] **Step 1: Fix handleDelete trong comment/page.js**

Hàm `handleDelete` (lines 36-51), thay nội dung try block:

```js
const handleDelete = async (id) => {
  if (!confirm("Xóa comment này?")) return;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/comments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Xóa bình luận thất bại");
      return;
    }

    toast.success("Xóa bình luận thành công!");
    fetchComments();
  } catch (err) {
    toast.error("Xóa bình luận thất bại");
  }
};
```

- [ ] **Step 2: Fix handleDelete trong category/page.js**

Hàm `handleDelete` (lines 127-147), thay nội dung try block:

```js
const handleDelete = async (id) => {
  if (!confirm("Xóa danh mục này?")) return;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${baseUrl}/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      toast.error(errData.message || "Xóa thất bại");
      return;
    }

    toast.success("Xóa thành công");
    fetchData();
  } catch {
    toast.error("Lỗi khi xóa");
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add data_hub/frontend/src/app/admin/comment/page.js data_hub/frontend/src/app/admin/category/page.js
git commit -m "fix(admin): add res.ok check in handleDelete for comment and category pages

fetch() does not throw on HTTP 4xx/5xx — missing res.ok check caused
toast.success to fire even when delete failed. Now correctly shows
error message when server returns non-2xx status."
```

---

### Task 5: Sửa double authMiddleware trong commentRoutes.js (Backend)

**Files:**
- Modify: `Backend/routes/commentRoutes.js:29`

**Vấn đề:** `router.use(authMiddleware)` ở line 18 đã apply cho tất cả routes. Line 29 gọi lại `authMiddleware` inline → mỗi `GET /api/comments` gây 2 DB query (`User.findById`) thay vì 1.

- [ ] **Step 1: Xóa authMiddleware inline ở route GET "/"**

File: `Backend/routes/commentRoutes.js`, line 29.

Thay:
```js
router.get("/", authMiddleware, isAdmin, getAllComments);
```
Thành:
```js
router.get("/", isAdmin, getAllComments);
```

- [ ] **Step 2: Kiểm tra**

Start backend → `curl -H "Authorization: Bearer <admin_token>" http://localhost:5000/api/comments` → phải trả về danh sách comments, không lỗi.

- [ ] **Step 3: Commit**

```bash
git add data_hub/Backend/routes/commentRoutes.js
git commit -m "fix(backend): remove duplicate authMiddleware on GET /api/comments

router.use(authMiddleware) at line 18 already applies to all routes.
Inline authMiddleware on GET '/' caused double DB query per request."
```

---

### Task 6: Sửa fetchMaterials thiếu res.ok, fix pagination lag, thêm confirm

**Files:**
- Modify: `frontend/src/app/admin/material/page.js`

**3 vấn đề trong cùng file:**
1. `fetchMaterials` không check `res.ok` → HTML error → SyntaxError im lặng
2. `useEffect` gọi `fetchMaterials(1)` nhưng không reset `currentPage` state → header lag
3. Nút "Từ chối" và "Tạm ẩn" không có `confirm()` → misclick nguy hiểm

- [ ] **Step 1: Fix fetchMaterials — thêm res.ok check**

Trong hàm `fetchMaterials` (lines 32-68), thay phần sau `const res = await fetch(...)`:

```js
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/materials?${params.toString()}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

if (!res.ok) {
  toast.error("Lỗi tải danh sách tài liệu");
  return;
}

const data = await res.json();
if (data && data.materials) {
  setAllMaterials(data.materials);
  setTotalPages(data.pagination?.totalPages || 1);
  setCurrentPage(data.pagination?.currentPage || 1);
}
```

- [ ] **Step 2: Fix pagination lag — reset currentPage trước khi fetch**

Trong `useEffect` (lines 96-101), thêm `setCurrentPage(1)`:

```js
useEffect(() => {
  setCurrentPage(1);
  const t = setTimeout(() => {
    fetchMaterials(1);
  }, 350);
  return () => clearTimeout(t);
}, [activeStatus, activeTab, searchTerm]);
```

- [ ] **Step 3: Thêm confirm cho nút Từ chối và Tạm ẩn**

Hàm `handleUpdateStatus` (lines 142-164), thêm confirm cho các status nguy hiểm:

```js
const handleUpdateStatus = async (id, status) => {
  if (status === "rejected") {
    if (!window.confirm("Từ chối tài liệu này? Hành động này sẽ thông báo cho người đăng.")) return;
  }
  if (status === "hidden") {
    if (!window.confirm("Ẩn tài liệu này khỏi hệ thống?")) return;
  }

  const token = localStorage.getItem("token");
  // ... phần còn lại giữ nguyên
```

- [ ] **Step 4: Commit**

```bash
git add data_hub/frontend/src/app/admin/material/page.js
git commit -m "fix(admin/material): res.ok check, pagination state reset, confirm before reject/hide

- fetchMaterials now shows error toast on non-2xx instead of silent SyntaxError
- currentPage state now resets to 1 immediately when filters change
- reject and hide actions now require confirmation to prevent misclicks"
```

---

### Task 7: Sửa window.location.href trong dashboard (Code quality)

**Files:**
- Modify: `frontend/src/app/admin/page.js`

**Vấn đề:** `window.location.href` gây full page reload thay vì SPA navigation. `useRouter` đã available qua layout.

- [ ] **Step 1: Thêm import useRouter**

File: `frontend/src/app/admin/page.js`, line 2. Thêm:

```js
import { useRouter } from "next/navigation";
```

- [ ] **Step 2: Khởi tạo router trong component**

Trong `AdminDashboard()`, sau `const [loading, setLoading] = useState(true);`:

```js
const router = useRouter();
```

- [ ] **Step 3: Thay window.location.href bằng router.push**

Lines 233-234, thay:

```jsx
<button onClick={() => window.location.href='/admin/material'} ...>
  Kiểm duyệt ngay
</button>
<button onClick={() => window.location.href='/admin/user'} ...>
  Quản lý User
</button>
```

Thành:

```jsx
<button onClick={() => router.push('/admin/material')} ...>
  Kiểm duyệt ngay
</button>
<button onClick={() => router.push('/admin/user')} ...>
  Quản lý User
</button>
```

- [ ] **Step 4: Commit**

```bash
git add data_hub/frontend/src/app/admin/page.js
git commit -m "fix(admin/dashboard): replace window.location.href with router.push

Hard navigation caused full page reload and Chart.js re-registration.
useRouter already available in the app context."
```

---

### Task 8: Sửa report page — truyền status filter lên backend

**Files:**
- Modify: `frontend/src/app/admin/report/page.js`

**Vấn đề:** Fetch toàn bộ reports rồi filter client-side → lãng phí bandwidth khi có nhiều reports. Backend `/api/reports` hỗ trợ query param `status`.

- [ ] **Step 1: Kiểm tra backend có nhận query param status không**

```bash
grep -n "status" data_hub/Backend/controllers/reportController.js
```

Nếu chưa có, cần sửa `getReports`. Nếu đã có, bỏ qua bước này.

- [ ] **Step 2: Sửa getReports controller để nhận query param (nếu cần)**

File: `Backend/controllers/reportController.js`, hàm `getReports`:

```js
const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};

    const reports = await Report.find(filter)
      .populate("reporterId", "fullName email")
      .populate("materialId", "title fileUrl status")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
```

- [ ] **Step 3: Sửa fetchReports trong report/page.js để truyền status lên backend**

Thay `fetchReports`:

```js
const fetchReports = async () => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    if (activeStatus !== "all") params.set("status", activeStatus);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      toast.error("Lỗi tải danh sách báo cáo");
      return;
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      setReports(data);
    }
  } catch (err) {
    toast.error("Lỗi tải danh sách báo cáo");
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 4: Thêm `activeStatus` vào dependency của useEffect**

Thêm `useEffect` để gọi lại khi status filter thay đổi:

```js
useEffect(() => {
  fetchReports();
}, [activeStatus]);
```

Và xóa `filtered` variable (không cần client-side filter nữa), dùng `reports` thẳng trong render.

Thay:
```js
const filtered = reports.filter((report) => {
  if (activeStatus === "all") return true;
  return report.status === activeStatus;
});
```
thành xóa luôn dòng này, và trong JSX thay `filtered.map(...)` thành `reports.map(...)` và `filtered.length === 0` thành `reports.length === 0`.

- [ ] **Step 5: Cập nhật phần hiển thị count**

Dòng `({reports.length})` trong header đúng rồi (giờ `reports` đã là filtered từ server).

- [ ] **Step 6: Commit**

```bash
git add data_hub/Backend/controllers/reportController.js data_hub/frontend/src/app/admin/report/page.js
git commit -m "fix(admin/report): move status filter to server-side query param

Previously fetched all reports then filtered client-side, wasting
bandwidth as report count grows. Backend now accepts ?status=pending
query param and report page re-fetches on filter change."
```

---

### Task 9: Cascade null categoryId trong Materials khi xóa category (Data integrity)

**Files:**
- Modify: `Backend/controllers/categoryController.js`

**Vấn đề:** Khi xóa category, các `Material` document vẫn giữ `categoryId` trỏ đến ObjectId đã bị xóa → dangling reference, filter theo category không trả về tài liệu đó.

Controller đã xử lý child categories (`Category.updateMany`), nhưng chưa xử lý Materials.

- [ ] **Step 1: Thêm import Material**

File: `Backend/controllers/categoryController.js`, line 1:

```js
const Category = require("../models/Category");
const Material = require("../models/Material");  // thêm dòng này
const slugify = require("slugify");
```

- [ ] **Step 2: Null out categoryId trong Materials trước khi xóa**

Trong hàm `deleteCategory` (line 105+), sau `await Category.updateMany(...)` và trước `findByIdAndDelete`:

```js
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Orphan child categories
    await Category.updateMany({ parentId: categoryId }, { parentId: null });

    // Null out categoryId on all Materials referencing this category
    await Material.updateMany({ categoryId: categoryId }, { categoryId: null });

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.status(200).json({ message: "Xóa thành công và đã gỡ liên kết các danh mục con" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ message: "Lỗi khi xóa danh mục", error: error.message });
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add data_hub/Backend/controllers/categoryController.js
git commit -m "fix(backend/category): null out categoryId on Materials when category deleted

Deleting a category left dangling categoryId references on Material
documents, making those materials invisible in category filters.
Now nulls Material.categoryId for all affected documents atomically."
```

---

## Thứ tự thực hiện (ưu tiên)

1. **Task 1** → Task 2 → Task 3 (security + crash)
2. **Task 4** → Task 5 → Task 6 (logic bugs)
3. **Task 7** → Task 8 → Task 9 (quality + integrity)

## Verification sau khi xong tất cả

- [ ] Mở tab ẩn danh → `/admin` → phải thấy spinner rồi redirect
- [ ] Đăng nhập admin → `/admin/user` → select và nút xóa của chính mình phải disabled
- [ ] Vào `/admin/comment` → token hết hạn (xóa khỏi localStorage) → không crash, hiện toast error
- [ ] Xóa comment không tồn tại → toast error, không toast success
- [ ] Xóa category → tài liệu thuộc category đó có `categoryId = null` trong DB
- [ ] Backend: `curl GET /api/comments` → chỉ 1 DB query trong logs (không double)
