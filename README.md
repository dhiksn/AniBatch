# Alqanime REST API

REST API JSON yang mengambil data katalog anime dari halaman publik [alqanime.net](https://alqanime.net).

Dibangun dengan **Node.js**, **Express.js**, **Axios**, dan **Cheerio**.

---

## Struktur Project

```
alqanime-api/
├── src/
│   ├── controllers/
│   │   ├── home.controller.js
│   │   ├── anime.controller.js
│   │   ├── search.controller.js
│   │   ├── genre.controller.js
│   │   ├── popular.controller.js
│   │   ├── popular-sidebar.controller.js
│   │   ├── schedule.controller.js
│   │   ├── list.controller.js
│   │   ├── advanced-search.controller.js
│   │   ├── season.controller.js
│   │   └── cast.controller.js
│   ├── routes/
│   │   ├── home.routes.js
│   │   ├── anime.routes.js
│   │   ├── search.routes.js
│   │   ├── genre.routes.js
│   │   ├── popular.routes.js
│   │   ├── popular-sidebar.routes.js
│   │   ├── schedule.routes.js
│   │   ├── list.routes.js
│   │   ├── advanced-search.routes.js
│   │   ├── season.routes.js
│   │   └── cast.routes.js
│   ├── services/
│   │   └── scraper.js
│   └── utils/
│       ├── http.js
│       ├── parser.js
│       └── response.js
├── app.js
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## Instalasi

```bash
npm install
cp .env.example .env
```

---

## Menjalankan

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:3000` secara default.

---

## Konfigurasi `.env`

| Variable               | Default                | Keterangan                             |
|------------------------|------------------------|----------------------------------------|
| `PORT`                 | `3000`                 | Port server                            |
| `NODE_ENV`             | `development`          | Mode environment                       |
| `BASE_URL`             | `https://alqanime.net` | URL target scraping                    |
| `CORS_ORIGIN`          | `*`                    | Origin yang diizinkan (koma-separated) |
| `RATE_LIMIT_WINDOW_MS` | `900000`               | Window rate limit (ms), default 15 mnt |
| `RATE_LIMIT_MAX`       | `100`                  | Max request per window                 |
| `HTTP_TIMEOUT`         | `10000`                | Timeout HTTP ke target (ms)            |
| `HTTP_MAX_REDIRECTS`   | `5`                    | Max redirect yang diikuti              |

---

## Endpoint API

### Welcome / Daftar Endpoint

```
GET /
```

---

### Health Check

```
GET /api/health
```

```json
{
  "success": true,
  "author": "dhiksn",
  "service": "Alqanime REST-API",
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

### Homepage

```
GET /api/home
```

```json
{
  "success": true,
  "author": "dhiksn",
  "data": {
    "hot": [],
    "latest": [],
    "completed": [],
    "movies": [],
    "popular": {
      "weekly": [],
      "monthly": [],
      "alltime": []
    }
  }
}
```

---

### Anime Populer (Halaman /popular)

```
GET /api/popular
GET /api/popular?page=2
```

```json
{
  "success": true,
  "author": "dhiksn",
  "data": [],
  "pagination": {
    "page": 1,
    "hasPrev": false,
    "hasNext": true,
    "totalPages": 208
  }
}
```

---

### Anime Populer Sidebar (Top 5 per kategori)

```
GET /api/popular-sidebar
```

```json
{
  "success": true,
  "author": "dhiksn",
  "data": {
    "weekly": [
      { "rank": "1", "title": "...", "slug": "...", "url": "...", "thumbnail": "...", "score": "7.15", "genres": [] }
    ],
    "monthly": [],
    "alltime": []
  }
}
```

---

### Jadwal Rilis

```
GET /api/schedule
```

```json
{
  "success": true,
  "author": "dhiksn",
  "data": [
    {
      "day": "Minggu",
      "animes": []
    },
    { "day": "Senin",   "animes": [] },
    { "day": "Selasa",  "animes": [] },
    { "day": "Rabu",    "animes": [] },
    { "day": "Kamis",   "animes": [] },
    { "day": "Jum'at",  "animes": [] },
    { "day": "Sabtu",   "animes": [] }
  ]
}
```

---

### Daftar Semua Anime (A-Z)

```
GET /api/list
GET /api/list?letter=N
```

Parameter `letter` opsional — satu karakter A-Z, 0-9, atau `#`.

```json
{
  "success": true,
  "author": "dhiksn",
  "data": [
    {
      "letter": "N",
      "animes": [
        { "title": "Naruto", "slug": "naruto", "url": "https://alqanime.net/naruto/" }
      ]
    }
  ]
}
```

---

### Anime per Musim

```
GET /api/season/:slug
```

Format slug: `fall-2013`, `summer-2026`, `winter-2024`, `spring-2025`

```json
{
  "success": true,
  "author": "dhiksn",
  "season": "Fall 2013",
  "slug": "fall-2013",
  "data": [
    {
      "title": "...",
      "alternativeTitle": "...",
      "slug": "...",
      "url": "...",
      "thumbnail": "...",
      "studio": "...",
      "type": "Series",
      "episodes": "12 episodes",
      "status": "Completed",
      "score": "7.39",
      "synopsis": "...",
      "genres": []
    }
  ]
}
```

---

### Anime berdasarkan Cast

```
GET /api/cast/:slug
GET /api/cast/:slug?page=2
```

Contoh: `GET /api/cast/miki-shinichiro`

```json
{
  "success": true,
  "author": "dhiksn",
  "cast": {
    "name": "Miki Shinichiro",
    "slug": "miki-shinichiro"
  },
  "data": [],
  "pagination": {
    "page": 1,
    "hasPrev": false,
    "hasNext": true,
    "totalPages": 5
  }
}
```

---

### Detail Anime

```
GET /api/anime/:slug
```

Contoh: `GET /api/anime/naruto-shippuuden`

```json
{
  "success": true,
  "author": "dhiksn",
  "data": {
    "title": "...",
    "alternativeTitle": "...",
    "thumbnail": "...",
    "description": "...",
    "status": "Completed",
    "type": "TV",
    "studio": "...",
    "released": "2007",
    "season": "Winter 2007",
    "rating": "8.5",
    "genres": [
      { "name": "Action", "slug": "action", "url": "https://alqanime.net/tag/action/" }
    ],
    "cast": [
      { "name": "Aiba, Nanami", "slug": "aiba-nanami", "url": "https://alqanime.net/cast/aiba-nanami/" }
    ],
    "downloads": [
      {
        "episode": "Batch",
        "qualities": [
          {
            "resolution": "720p",
            "mirrors": [
              { "label": "MediaFire", "url": "https://..." },
              { "label": "PixelDrain", "url": "https://..." }
            ]
          }
        ]
      },
      {
        "episode": "Episode 01",
        "qualities": []
      }
    ]
  }
}
```

---

### Pencarian

```
GET /api/search?q=<query>
GET /api/search?q=naruto&page=2
```

| Parameter | Wajib | Keterangan                    |
|-----------|-------|-------------------------------|
| `q`       | Ya    | Kata kunci, minimal 2 karakter |
| `page`    | Tidak | Nomor halaman, default 1      |

```json
{
  "success": true,
  "author": "dhiksn",
  "query": "naruto",
  "data": [],
  "pagination": {
    "page": 1,
    "hasPrev": false,
    "hasNext": true,
    "totalPages": 2
  }
}
```

---

### Pencarian Lanjutan

```
GET /api/advanced-search
GET /api/advanced-search?title=naruto
GET /api/advanced-search?genre[]=action&genre[]=fantasy
GET /api/advanced-search?status=ongoing&order=popular
GET /api/advanced-search?type[]=movie&order=rating&page=2
GET /api/advanced-search?genre[]=action&status=completed&order=rating
```

| Parameter  | Tipe              | Nilai yang diizinkan                                                  |
|------------|-------------------|-----------------------------------------------------------------------|
| `title`    | string            | Judul anime (partial match)                                           |
| `genre[]`  | string (multi)    | Slug genre, contoh: `action`, `fantasy`, `romance`                   |
| `season[]` | string (multi)    | Slug musim, contoh: `summer-2026`, `fall-2013`                        |
| `studio[]` | string (multi)    | Slug studio, contoh: `mappa`, `bones`                                 |
| `status`   | string            | `ongoing` \| `upcoming` \| `completed`                               |
| `type[]`   | string (multi)    | `tv` \| `movie` \| `bd` \| `ova` \| `ona` \| `special` \| `series`  |
| `order`    | string            | `title` \| `titlereverse` \| `update` \| `added` \| `popular` \| `rating` |
| `page`     | number            | Nomor halaman, default 1                                              |

Semua parameter opsional. Tanpa parameter mengembalikan semua anime.

```json
{
  "success": true,
  "author": "dhiksn",
  "filters": {
    "title": "",
    "genres": ["action"],
    "seasons": [],
    "studios": [],
    "types": [],
    "status": "completed",
    "order": ""
  },
  "data": [],
  "pagination": {
    "page": 1,
    "hasPrev": false,
    "hasNext": true,
    "totalPages": 58
  }
}
```

---

### Daftar Genre

```
GET /api/genre
```

```json
{
  "success": true,
  "author": "dhiksn",
  "data": [
    { "name": "Action", "slug": "action", "url": "https://alqanime.net/tag/action/" }
  ]
}
```

---

### Anime berdasarkan Genre

```
GET /api/genre/:slug
GET /api/genre/:slug?page=2
```

Contoh: `GET /api/genre/action`

```json
{
  "success": true,
  "author": "dhiksn",
  "genre": {
    "name": "Action",
    "slug": "action"
  },
  "data": [],
  "pagination": {
    "page": 1,
    "hasPrev": false,
    "hasNext": true,
    "totalPages": 99
  }
}
```

---

## Format Error

Semua error menggunakan format konsisten:

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
| 404         | `NOT_FOUND`             | Halaman/data tidak ditemukan          |
| 408         | `TIMEOUT`               | Koneksi ke target timeout             |
| 429         | `TOO_MANY_REQUESTS`     | Rate limit tercapai                   |
| 500         | `INTERNAL_SERVER_ERROR` | Kesalahan internal server             |
| 502         | `BAD_GATEWAY`           | Target website merespons dengan error |
| 503         | `SERVICE_UNAVAILABLE`   | Target website tidak dapat diakses    |

---

## Cache

| Endpoint                   | TTL      |
|----------------------------|----------|
| `/api/home`                | 5 menit  |
| `/api/popular`             | 5 menit  |
| `/api/popular-sidebar`     | 5 menit  |
| `/api/schedule`            | 5 menit  |
| `/api/search`              | 3 menit  |
| `/api/advanced-search`     | 3 menit  |
| `/api/cast/:slug`          | 3 menit  |
| `/api/anime/:slug`         | 10 menit |
| `/api/genre`               | 30 menit |
| `/api/genre/:slug`         | 30 menit |
| `/api/list`                | 30 menit |
| `/api/season/:slug`        | 30 menit |

---

## Response Order

Semua response mengikuti urutan field:

```
success → author → [metadata: query/genre/cast/season/filters] → data → pagination
```

---

## Catatan Parser

Semua selector HTML terpusat di `src/utils/parser.js`. Jika alqanime.net memperbarui markup-nya, cukup update file tersebut.

Fungsi parser yang tersedia:

| Fungsi                  | Kegunaan                                  |
|-------------------------|-------------------------------------------|
| `parseAnimeCard`        | Kartu anime (homepage, genre, search)     |
| `parseAnimeDetail`      | Halaman detail anime                      |
| `parseGenres`           | Daftar genre dari `/genre/`               |
| `parsePagination`       | Informasi paginasi                        |
| `parseHomePage`         | Seksi-seksi di homepage                   |
| `parseSearchResults`    | Hasil pencarian                           |
| `parseSeasonPage`       | Halaman season `/season/:slug`            |
| `parsePopularSidebar`   | Widget "Anime Populer" sidebar            |

---

## Author

**dhiksn**
