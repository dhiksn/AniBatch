# AniBatch

Platform streaming dan download anime batch subtitle Indonesia. Terdiri dari **REST API backend** (Node.js + Express) dan **frontend** (Next.js + Tailwind CSS).

Data diambil dari halaman publik [alqanime.net](https://alqanime.net) menggunakan **Cheerio**.

---

## Struktur Project

```
anibatch/
├── src/                          # Backend source
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   │   └── scraper.js
│   └── utils/
│       ├── http.js
│       ├── parser.js
│       └── response.js
├── client/                       # Frontend Next.js
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── app.js
├── .env.example
├── package.json
└── README.md
```

---

## Backend

### Instalasi

```bash
npm install
cp .env.example .env
```

### Menjalankan

```bash
# Development
npm run dev

# Production
npm start
```

### Konfigurasi `.env`

| Variable              | Default                | Keterangan                             |
|-----------------------|------------------------|----------------------------------------|
| `SERVER_PORT`         | —                      | Port dari panel hosting (Pterodactyl)  |
| `PORT`                | `3000`                 | Port fallback jika SERVER_PORT tidak ada |
| `NODE_ENV`            | `development`          | Mode environment                       |
| `BASE_URL`            | `https://alqanime.net` | URL target scraping                    |
| `CORS_ORIGIN`         | `*`                    | Origin yang diizinkan (koma-separated) |
| `HTTP_TIMEOUT`        | `12000`                | Timeout HTTP ke target (ms)            |
| `HTTP_MAX_REDIRECTS`  | `5`                    | Max redirect yang diikuti              |

---

## Frontend

### Instalasi

```bash
cd client
npm install
```

### Menjalankan

```bash
npm run dev    # Development di http://localhost:3001
npm run build  # Build production
```

### Environment Variables

```bash
# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Di production (Vercel), set `NEXT_PUBLIC_API_URL` ke URL backend.

---

## Deploy

### Backend (Pterodactyl)

1. Upload semua file kecuali `node_modules/` dan `client/`
2. Set env variable `SERVER_PORT` sesuai port yang di-assign panel
3. Install: `npm install`
4. Start: `node app.js`

### Frontend (Vercel)

1. Push repo ke GitHub
2. Import di [vercel.com](https://vercel.com) → set **Root Directory** ke `client`
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   ```
4. Deploy

> **Catatan:** Vercel pakai HTTPS. Jika backend HTTP, gunakan `rewrites` di `next.config.ts` agar request di-proxy melalui Vercel (sudah dikonfigurasi).

---

## Halaman Frontend

| Route               | Deskripsi                         |
|---------------------|-----------------------------------|
| `/`                 | Homepage + rilisan terbaru        |
| `/anime/[slug]`     | Detail anime + download links     |
| `/anime-list`       | Daftar semua anime A-Z            |
| `/genre-list`       | Daftar semua genre                |
| `/genre/[slug]`     | Anime berdasarkan genre           |
| `/popular`          | Anime terpopuler                  |
| `/advanced-search`  | Pencarian dengan filter           |
| `/schedule`         | Jadwal rilis mingguan             |
| `/season/[slug]`    | Anime berdasarkan musim           |
| `/cast/[slug]`      | Anime berdasarkan cast            |
| `/search`           | Hasil pencarian                   |

---

## Endpoint API

### Health Check

```
GET /api/health
```

### Homepage

```
GET /api/home
GET /api/home?page=2
```

### Anime Detail

```
GET /api/anime/:slug
```

### Pencarian

```
GET /api/search?q=<query>&page=<n>
```

### Pencarian Lanjutan

```
GET /api/advanced-search?genre[]=action&status=ongoing&order=popular&page=1
```

| Parameter  | Nilai yang diizinkan                                                        |
|------------|-----------------------------------------------------------------------------|
| `title`    | string                                                                      |
| `genre[]`  | slug genre (multi)                                                          |
| `season[]` | slug musim (multi)                                                          |
| `status`   | `ongoing` \| `upcoming` \| `completed`                                     |
| `type[]`   | `tv` \| `movie` \| `bd` \| `ova` \| `ona` \| `special` \| `series`        |
| `order`    | `title` \| `titlereverse` \| `update` \| `added` \| `popular` \| `rating` |
| `page`     | number                                                                      |

### Genre

```
GET /api/genre
GET /api/genre/:slug?page=<n>
```

### Jadwal

```
GET /api/schedule
```

### Daftar Anime

```
GET /api/list
GET /api/list?letter=A
```

### Musim

```
GET /api/season/:slug
```

### Cast

```
GET /api/cast/:slug?page=<n>
```

### Popular

```
GET /api/popular?page=<n>
GET /api/popular-sidebar
```

### Daftar Musim

```
GET /api/seasons
```

---

## Format Response

```json
{
  "success": true,
  "author": "dhiksn",
  "data": [],
  "pagination": {
    "page": 1,
    "hasPrev": false,
    "hasNext": true,
    "totalPages": 10
  }
}
```

### Format Error

```json
{
  "success": false,
  "author": "dhiksn",
  "error": {
    "code": "NOT_FOUND",
    "message": "Anime tidak ditemukan"
  }
}
```

| HTTP Status | Code                    | Keterangan                            |
|-------------|-------------------------|---------------------------------------|
| 400         | `BAD_REQUEST`           | Parameter tidak valid                 |
| 404         | `NOT_FOUND`             | Data tidak ditemukan                  |
| 408         | `TIMEOUT`               | Koneksi ke target timeout             |
| 500         | `INTERNAL_SERVER_ERROR` | Kesalahan internal server             |
| 502         | `BAD_GATEWAY`           | Target website error                  |
| 503         | `SERVICE_UNAVAILABLE`   | Target website tidak dapat diakses    |

---

## Cache

| Endpoint               | TTL      |
|------------------------|----------|
| `/api/home`            | 5 menit  |
| `/api/popular`         | 5 menit  |
| `/api/schedule`        | 5 menit  |
| `/api/search`          | 3 menit  |
| `/api/advanced-search` | 3 menit  |
| `/api/cast/:slug`      | 3 menit  |
| `/api/anime/:slug`     | 10 menit |
| `/api/genre`           | 30 menit |
| `/api/genre/:slug`     | 30 menit |
| `/api/list`            | 30 menit |
| `/api/season/:slug`    | 30 menit |

---

## Author

**dhiksn**
