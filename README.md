This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Instalasi Dependencies

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   # atau jika menggunakan venv:
   # .\venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

### Menjalankan Aplikasi

**Opsi 1: Jalankan sekaligus (Recommended)**
```bash
npm run dev:all
```
Ini akan menjalankan Next.js (port 3000) dan backend FastAPI (port 8000) secara bersamaan menggunakan Python dari venv.

**Opsi 2: Jalankan terpisah (untuk debugging)**
```bash
# Terminal 1: Backend FastAPI (menggunakan venv)
.\venv\Scripts\python.exe sdr_backend_service.py

# Terminal 2: Next.js
npm run dev
```

Backend FastAPI tersedia di `http://localhost:8000` dengan endpoint utama:

- `GET /status` — status terkini masing-masing SDR (power, overload, timestamp)
- `POST /control` — start/stop loop monitoring (`{"action": "start"}` atau `{"action": "stop"}`)

Dashboard berada di [http://localhost:3000/dashboard](http://localhost:3000/dashboard) dan otomatis membaca hasil dari file `public/data.json` dan `public/data2.json` yang diperbarui backend.

## Troubleshooting

### Error "access violation" atau "rtlsdr_write_reg failed" saat PTT aktif

Error ini terjadi karena sinyal RF terlalu kuat saat HT transmit, menyebabkan SDR overload. Backend sudah dilengkapi dengan:

- **Auto-recovery**: Deteksi access violation dan auto-reinitialize SDR setelah beberapa error
- **Cooldown mechanism**: Skip pembacaan sementara saat overload terdeteksi
- **Proteksi overload**: Deteksi sinyal kuat dan skip pembacaan untuk mencegah crash

**Tips untuk mengurangi overload:**
1. Gunakan attenuator RF antara HT dan SDR jika sinyal terlalu kuat
2. Jaga jarak antara HT dan SDR saat transmit
3. Pastikan gain SDR di set ke 0 dB (sudah default)
4. Backend akan otomatis recover setelah PTT dilepas

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
