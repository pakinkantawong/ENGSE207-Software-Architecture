# Week 6 N-Tier + Redis TaskBoard

โปรเจกต์นี้เป็นระบบตัวอย่างสถาปัตยกรรมแบบ N-Tier บน Docker Compose ประกอบด้วย:
- `frontend` (Static Web)
- `nginx` (Reverse Proxy + Load Balancer)
- `app` (Node.js API, scale ได้หลาย instance)
- `db` (PostgreSQL)
- `redis` (Cache)

เป้าหมายหลักของงานสัปดาห์นี้คือทดลอง:
- High Availability เมื่อ API บางตัวล่ม
- Scalability เมื่อเพิ่มจำนวน API instances

## โครงสร้างบริการ

- Frontend เรียก API ผ่าน Nginx ที่เส้นทาง `/api/*`
- Nginx กระจายโหลดไปยัง `app` instances
- API เชื่อม PostgreSQL และใช้ Redis cache

## การเริ่มระบบ

```bash
docker compose up -d --build --scale app=3
docker compose ps
