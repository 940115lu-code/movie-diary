from pathlib import Path

POSTERS = Path("posters")

rename_map = {
    "IMG_1268.jpeg": "toy-story-5.jpeg",
    "IMG_1269.jpeg": "disclosure-day.jpeg",
    "IMG_1270.jpeg": "supergirl.jpeg",
    "IMG_1271.jpeg": "minions-and-monsters.jpeg",
    "IMG_1272.jpeg": "verity.jpeg",
    "IMG_1273.jpeg": "the-end-of-oak-street.jpeg",
    "IMG_1274.jpeg": "deeper.jpeg",
    "IMG_1275.jpeg": "avengers-doomsday.jpeg",
    "IMG_1276.jpeg": "obsession.jpeg",
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