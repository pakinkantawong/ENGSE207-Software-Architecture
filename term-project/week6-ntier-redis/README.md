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
```

## สรุปผลการทดลอง (Part 6)

### Availability

- ก่อนปรับ Nginx (ปิด app 1 instance แล้วทดสอบ 30 requests): ล้ม `8/30`
- หลังปรับ `nginx/conf.d/default.conf` และ reload โดยไม่ restart container: ล้ม `0/30`

สรุป: ระบบยังตอบสนองได้ต่อเนื่องแม้มี API instance ล่มบางตัว (failover ดีขึ้นชัดเจน)

### Scalability

เงื่อนไขทดสอบโหลดเท่ากัน: `wrk -t4 -c50 -d20s http://nginx/api/tasks`

| Case | #App Instances | Avg Latency | Requests/sec | ผลลัพธ์ |
|---|---:|---:|---:|---|
| A | 1 | 10.22 ms | 5469.37 | Baseline |
| B | 3 | 5.34 ms | 10630.28 | Scale-out |

สรุป:
- Latency ลดลงประมาณ `47.7%` (10.22 → 5.34 ms)
- Throughput เพิ่มขึ้นประมาณ `94.4%` (5469.37 → 10630.28 req/s)
- ผลไม่เพิ่มแบบเส้นตรง 3 เท่า เพราะยังมี bottleneck ร่วม เช่น Nginx, DB, Redis และ network/timeout
