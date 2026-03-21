mkdir -p docs && cat > docs/ANALYSIS.md << 'EOF'
# การวิเคราะห์เปรียบเทียบ: VM vs Docker Deployment
## ENGSE207 - Week 6 N-Tier Architecture

**ชื่อ-นามสกุล:** [กรอกชื่อนักศึกษา]  
**รหัสนักศึกษา:** [กรอกรหัส]  
**วันที่:** [กรอกวันที่]

---

## 1. ตารางเปรียบเทียบ Setup Process

| ขั้นตอน | Version 1 (VM) | Version 2 (Docker) |
|---------|----------------|-------------------|
| ติดตั้ง PostgreSQL | ติดตั้งผ่าน `apt`/`yum`, ตั้งค่า service และ user ด้วยตนเอง | ใช้ image `postgres` จาก Docker Hub และกำหนดผ่าน `docker-compose.yml` |
| ติดตั้ง Node.js | ติดตั้ง runtime และ package manager บนเครื่อง VM | ใช้ `node` image หรือ build จาก `Dockerfile` พร้อม dependency |
| ติดตั้ง Nginx | ติดตั้งด้วย package manager แล้วแก้ไฟล์ config บน VM | รัน Nginx เป็น container แยก service และ mount config |
| Configure Database | แก้ `.conf`, สร้าง DB/user, เปิด port, ตั้งสิทธิ์เอง | ตั้งค่า DB ผ่าน environment variables และ init script |
| Configure SSL | ติดตั้ง certbot/ใบรับรองและผูกกับ Nginx เอง | ใช้ volume เก็บ cert และกำหนดใน reverse-proxy container |
| Start Services | เริ่มทีละ service (`systemctl start ...`) และตรวจสถานะทีละตัว | สั่ง `docker compose up -d` เพื่อเริ่มทุก service พร้อมกัน |
| **เวลาทั้งหมด** | **45-90 นาที** | **10-25 นาที** |

---

## 2. ตารางเปรียบเทียบ Resource Usage

| Resource | Version 1 (VM) | Version 2 (Docker) |
|----------|----------------|-------------------|
| Memory Usage | สูงกว่า เพราะมี guest OS เต็มรูปแบบ (ตรวจด้วย `free -h`) | ต่ำกว่า VM เพราะแชร์ kernel ร่วมกัน (ตรวจด้วย `docker stats`) |
| Disk Usage | ใช้พื้นที่มากจาก OS + package แต่ละเครื่อง (ตรวจด้วย `df -h`) | ใช้น้อยกว่าและแชร์ image layers ได้ (ตรวจด้วย `docker system df`) |
| CPU Usage | มี overhead จาก virtualization มากกว่า | overhead ต่ำกว่า VM โดยทั่วไป |
| Startup Time | ระดับนาที | ระดับวินาทีถึงหลักสิบวินาที |

---

## 3. ข้อดีของ Docker Deployment (เขียน 5 ข้อ)

1. **Deploy ได้เร็วและสม่ำเสมอ:** ใช้ `Dockerfile`/`docker-compose.yml` ทำให้ environment เหมือนกันทุกเครื่อง  
2. **แยก service ชัดเจน:** API, DB, Nginx แยก container ดูแลง่าย  
3. **Scale ได้ง่าย:** เพิ่มจำนวน instance ได้สะดวกกว่า VM  
4. **เหมาะกับ CI/CD:** build-test-deploy ซ้ำได้และ version ชัดเจน  
5. **ย้ายสภาพแวดล้อมง่าย:** dev/staging/prod ทำงานใกล้เคียงกันมาก

---

## 4. ข้อเสียของ Docker Deployment (เขียน 3 ข้อ)

1. **มี learning curve:** ต้องเข้าใจ image, volume, network  
2. **network/storage ซับซ้อนขึ้น:** โดยเฉพาะ persistent data  
3. **ต้องวางแผน security เพิ่ม:** image vulnerabilities, secrets, privileges

---

## 5. เมื่อไหร่ควรใช้ VM vs Docker?

### ควรใช้ VM เมื่อ:
- ต้องการแยก kernel/OS ระดับสูง หรือ compliance เข้มงวด
- ต้องรันระบบ legacy ที่ผูกกับ OS เฉพาะ
- ต้องทดสอบในระดับเครื่องเต็มรูปแบบ

### ควรใช้ Docker เมื่อ:
- ทำ microservices หลาย service
- ต้องการ setup/deploy เร็วและทำซ้ำได้
- ต้องการใช้ทรัพยากรคุ้มค่าและ scale เร็ว

---

## 6. สิ่งที่ได้เรียนรู้จาก Lab นี้

Lab นี้ทำให้เห็นความต่างชัดเจนระหว่าง VM และ Docker ทั้งเวลา setup และการจัดการระบบหลายชั้น. Docker ช่วยให้ deployment เป็นมาตรฐานมากขึ้นผ่าน config เดียว. อีกทั้งยังได้ฝึกแนวคิด N-Tier, การแยก service, และการจัดการ dependency ให้ทำซ้ำได้. สุดท้ายคือเห็นความสำคัญของ monitoring และ security ตั้งแต่เริ่มออกแบบ deployment.

---

## 7. คำสั่ง Docker ที่ใช้บ่อย (Quick Reference)

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose down
docker stats
docker system df
docker exec -it <container_name> sh
docker system prune -f
