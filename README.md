# Movie List / Cinema Diary

這版保留原本結構，新增兩件事：

1. 自動抓本機海報
2. 手機版版面優化

## 怎麼放海報

把圖片放到 `posters/` 資料夾。

建議命名：

```text
posters/sorry-baby.jpg
posters/project-hail-mary.jpg
posters/backroom.jpg
```

## 怎麼指定海報

打開 `movies.js`，在電影資料裡加：

```js
{
  title: "Sorry, Baby",
  poster: "posters/sorry-baby.jpg",
  date: "6/5",
  rating: 9.5,
  review: "master piece"
}
```

## 如果沒有寫 poster

網站會根據電影名稱自動猜圖片檔名，例如：

```text
Project Hail Mary → posters/project-hail-mary.jpg
Backroom → posters/backroom.jpg
```

找不到圖片時會自動退回原本的漸層卡片，不會壞掉。

## 更新網站

改完後：

```bash
git add .
git commit -m "Update movie diary"
git push
```

Netlify 會自動重新部署。
