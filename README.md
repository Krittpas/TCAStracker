# TCAS70 Tracker
Deploy: push โฟลเดอร์นี้ขึ้น GitHub → Vercel → Import Project (Framework: Other, ไม่ต้อง build) หรือรัน `npx vercel` ในโฟลเดอร์นี้

## โครงสร้าง
- `index.html` หน้าเว็บ · `data/programs.json` ข้อมูล+ลิงก์ประกาศทางการ · `api/check.js` ดึงหน้าประกาศมาเทียบวันที่ (แคช 1 ชม.)

## วิธีอัปเดตข้อมูล
1. แก้ `data/programs.json` (วันที่ปิดรับ `close` เป็น YYYY-MM-DD ค.ศ., ลิงก์ประกาศ)
2. ใส่วันที่ที่ปรากฏในประกาศจริงลง `sources[].expect` เช่น "12 พฤศจิกายน 2569" — ถ้าประกาศเปลี่ยน หน้าเว็บจะขึ้น 🟡
3. หน้า JavaScript / PDF อ่านอัตโนมัติไม่ได้ จะขึ้น ⚪ ให้เปิดลิงก์ตรวจเอง
