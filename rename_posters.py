from pathlib import Path

POSTERS = Path("posters")

rename_map = {
    "IMG_1213.JPG": "colony.jpg",
    "IMG_1214.JPG": "the-devil-wears-prada-2.jpg",
    "IMG_1215.JPG": "michael.jpg",
    "IMG_1216.JPG": "backroom.jpg",
    "IMG_1217.JPG": "the-drama.jpg",
    "IMG_1218.JPG": "the-drama-alt.jpg",
    "IMG_1219.JPG": "wuthering-heights.jpg",
    "IMG_1220.JPG": "mother-mary.jpg",
    "IMG_1221.JPG": "sunny-girls.jpg",
    "IMG_1222.JPG": "lee-cronins-the-mummy.jpg",
    "IMG_1224.JPG": "top-gun.jpg",
    "IMG_1225.JPG": "couture.jpg",
    "IMG_1226.JPG": "project-hail-mary.jpg",
}

for old, new in rename_map.items():
    old_path = POSTERS / old
    new_path = POSTERS / new

    if old_path.exists():
        old_path.rename(new_path)
        print(f"{old} -> {new}")
    else:
        print(f"找不到 {old}")

print("完成")