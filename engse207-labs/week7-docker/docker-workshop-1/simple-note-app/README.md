## 📝 คำอธิบาย 
ภาพทั้งหมดแสดงการรันโปรเจกต์ Simple Note App ผ่าน Docker Compose ตั้งแต่ขั้นตอน build และ start จนถึงการตรวจสอบสถานะและ logs ของบริการ

สรุปสิ่งที่เห็นจากภาพ:
- 🚀 รัน `docker compose up -d` เพื่อ build และ start service ต่าง ๆ พร้อมข้อความเตือนว่า `version` ใน `docker-compose.yml` ล้าสมัยและถูกละเว้น
- 🧩 ระบบสร้าง image `simple-note-app-api:latest` และตั้งค่า network/volume สำหรับฐานข้อมูล
- 🔎 ใช้ `docker compose ps` เพื่อตรวจสอบสถานะ พบ `note-api` (พอร์ต 3000) และ `note-db` (PostgreSQL) อยู่ในสถานะ Up/Healthy
- 🗄️ logs ของฐานข้อมูลแสดงการ initdb, สร้างฐานข้อมูล, แล้วเริ่มรับการเชื่อมต่อ
- 🟢 logs ของ API แสดงว่า Database initialized และเซิร์ฟเวอร์รันที่พอร์ต 3000 โดยใช้ Storage: PostgreSQL และ DB Host: `db`

## 🧱 ภาพประกอบ: ขั้นตอนรันและ Build
<img width="954" height="746" alt="Screenshot 2026-01-26 150720" src="https://github.com/user-attachments/assets/0e477a25-b306-41fd-aeea-faf5abfc1d82" />

## ✅ ภาพประกอบ: ตรวจสอบสถานะบริการ
<img width="958" height="263" alt="Screenshot 2026-01-26 150726" src="https://github.com/user-attachments/assets/e9b9f60f-886a-465d-a367-f7ed106603f9" />

## 🧾 ภาพประกอบ: Logs และสถานะระบบ
<img width="952" height="988" alt="Screenshot 2026-01-26 150735" src="https://github.com/user-attachments/assets/3c2581de-b13b-4617-bef0-6cccc43ad734" />
##
<img width="954" height="308" alt="Screenshot 2026-01-26 150740" src="https://github.com/user-attachments/assets/16f30a73-6323-4525-a1e5-1d59827ed6f9" />
##
<img width="949" height="942" alt="Screenshot 2026-01-26 150748" src="https://github.com/user-attachments/assets/62a01432-6079-4a77-b33a-c70a9711d121" />
##
<img width="961" height="973" alt="Screenshot 2026-01-26 150756" src="https://github.com/user-attachments/assets/5300fdf1-4106-4836-b258-9c8f368ca686" />
##
<img width="956" height="339" alt="Screenshot 2026-01-26 150803" src="https://github.com/user-attachments/assets/e58325c1-d213-4973-b09d-ccebf7ba2a41" />
##
<img width="954" height="101" alt="Screenshot 2026-01-26 150812" src="https://github.com/user-attachments/assets/c0a957ca-96f5-4f24-8d69-2922942086f8" />
##
<img width="941" height="144" alt="Screenshot 2026-01-26 150818" src="https://github.com/user-attachments/assets/01563ca1-3776-4db3-ab8c-e7eb2b4794dc" />
##
<img width="933" height="113" alt="Screenshot 2026-01-26 150820" src="https://github.com/user-attachments/assets/b31c2647-1dca-4e50-a940-ebc65ace87de" />
