# Image manifest — HINTERHOF COFFEE

All files here are **placeholders from Unsplash** (free to use under the Unsplash
License, including commercially, no attribution required). They exist to lock the
*formats*. Swap each file 1:1 with the real shoot — keep the filename and the
target dimensions and nothing in the code needs to change.

## Important: everything is rendered duotone

Photographs are run through a two-colour treatment (`.duotone` in
`src/app/globals.css`): shadows go to the ink blue, highlights to the pale ground.
So the real shoot does **not** need to be on-brand in colour — it needs **strong
tonal contrast and a clear silhouette**. A flat, low-contrast, or very pale image
turns to mush. That is exactly why the original "beans on white" placeholder was
replaced.

## Files in use

| File | Role | Ratio | Target size | Notes for the real shoot |
|---|---|---|---|---|
| `products/goerli.jpg` | Shop card, **circular** frame | 1:1 | 1200×1200 | Subject dead centre — the corners are cropped away by the circle. |
| `products/kanal.jpg` | Shop card, circular | 1:1 | 1200×1200 | Same. Keep light and background consistent across all four. |
| `products/nachtschicht.jpg` | Shop card, circular | 1:1 | 1200×1200 | Same. |
| `products/kalt-achtzehn.jpg` | Shop card, circular | 1:1 | 1200×1200 | Same. |
| `roastery.jpg` | Story section, rounded 4:5 frame with an offset outline behind it | 4:5 (shot 1:1, cover-cropped) | 1400×1400 | The roaster drum mid-batch. Centred subject — the file is square and `object-fit: cover` crops it into the 4:5 frame, so keep the subject centred rather than filling the square edge-to-edge. Reshoot at 4:5 (e.g. 1200×1500) for a more deliberate crop once the frame stabilises. |
| `street.jpg` | Visit section, **arch** frame | 4:5 | 1200×1500 | The actual Oranienstraße passage. The top ~25% is rounded off by the arch — keep it free of anything important. |
| `og.jpg` | Open Graph / social card | 1.91:1 | 1200×630 | Rendered in full colour, not duotone — it is a social preview, outside the page. |

## Product file → product slug

| File | Product |
|---|---|
| `products/goerli.jpg` | Görli |
| `products/kanal.jpg` | Kanal |
| `products/nachtschicht.jpg` | Nachtschicht |
| `products/kalt-achtzehn.jpg` | Kalt 18 |

## Replacing an image

```bash
cp ~/shoot/roaster-final.jpg public/images/roastery.jpg
```

Keep the ratio. If a replacement has a different one, update the `aspect-*` class
at the matching `<Image>` call site so the layout does not shift.

## Restoring a placeholder

Every placeholder is an Unsplash photo ID. To re-pull one at a given size:

```bash
curl -o public/images/roastery.jpg \
  "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=1400&h=1400&fit=crop&crop=entropy&q=82&fm=jpg"
```

| File | Unsplash photo ID |
|---|---|
| `products/goerli.jpg` | `1511920170033-f8396924c348` |
| `products/kanal.jpg` | `1447753072467-2f56032d1d48` |
| `products/nachtschicht.jpg` | `1580933073521-dc49ac0d4e6a` |
| `products/kalt-achtzehn.jpg` | `1561641377-f7456d23aa9b` |
| `roastery.jpg` | `1511537190424-bbbab87ac5eb` |
| `street.jpg` | `1482350325005-eda5e677279b` |
| `og.jpg` | `1494346480775-936a9f0d0877` |

## Not photographs

The kettle, cone, carafe, cup and bean are **vector line drawings**, not assets —
they live in `src/components/Illustration.tsx`. The pencil wobble comes from an
SVG turbulence filter, so they stay editable and cost nothing to load. Edit the
paths there rather than replacing them with images.
