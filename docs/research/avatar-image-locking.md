# Research: does PinballY lock or cache an image file while it shows it? (issue #41)

Date: 2026-09-24. Sources: PinballY source at commit `d84763e32f089317db405798d83ea26f77a18606` (cited as `https://github.com/mjrgh/PinballY/blob/d84763e/<path>#Lnn`), the local help (`C:\vPinball\PinballY\Help\*.html`, cited as `Help/<file>:<line>`). **Fact** = read in a primary source. **Inference** = my reading, not verified at runtime.

## Verdict

| API | Keeps the file open while shown? | Caches the decoded image by path? |
|---|---|---|
| `dc.drawImage(file, ...)` | **No.** Opened, drawn, closed inside the call. | **No.** Decoded again from disk on each call. |
| `dc.getImageSize(file)` | **No.** Reads the header, closes the file inside the call. | **No.** |
| `layer.loadImage(file)`: still JPEG / PNG / BMP | **No.** Read once, on a worker thread, then closed. | **No.** Decoded again on each call. |
| `layer.loadImage(file)`: **animated GIF or APNG** (also any GIF) | **Yes.** The file stays open for frame decoding until the layer is cleared or loads something else. | **No.** |

No path-keyed image cache sits behind these APIs. The only path-keyed image cache in PinballY belongs to the litehtml host (HTML layout rendering), which these APIs do not use.

So replacing `avatar.png` on disk and calling `loadImage` / redrawing again **shows the new picture**. No cache-busting is needed. What stays "old" is the pixels already on screen: PinballY does not watch the file, so the script must redraw or reload after it replaces the file.

## 1. `dc.drawImage` (custom drawing)

**Facts**
- The JS binding is `PlayfieldView::JsDrawDrawImage`, registered at `PinballY/PlayfieldView.cpp#L977`.
- Relative paths are resolved against the program folder (`GetDeployedFilePath`), `PlayfieldView.cpp#L6780-L6787`. This matches `Help/CustomDrawing.html:260` ("absolute path, or ... relative to the PinballY program folder"; "JPEG and PNG formats are supported").
- The image is loaded with `std::unique_ptr<Gdiplus::Image> image(new Gdiplus::Image(path));` (`PlayfieldView.cpp#L6794`), drawn with `jsDC->g.DrawImage(...)` (`#L6835-L6837`), and the `unique_ptr` is a local variable. It is destroyed when the function returns (`#L6838`). Nothing stores the `Image` or the path anywhere else.
- The failure check `if (image == nullptr)` (`#L6795-L6796`) tests the pointer returned by `new`. It does not call `image->GetLastStatus()`.

**Inferences**
- GDI+ keeps a file open for the whole life of an `Image` built from a file name. Here that life ends inside the `drawImage` call, so the file is locked only during the call. Outside the call, the file can be replaced or deleted.
- Because the failure check never fires for an unreadable, missing or half-written file, `drawImage` probably **draws nothing and does not throw**: a failed GDI+ `Image` reports width and height 0. So an avatar that is being replaced at the moment of a redraw gives an empty square, not an exception.
- The custom-drawing result is rasterized into the layer or popup's bitmap. Once drawn, it shows the old pixels until the script draws again.

## 2. `dc.getImageSize`

**Facts**
- Binding: `PlayfieldView::JsDrawGetImageSize`, registered at `PlayfieldView.cpp#L978`, body at `#L6840-L6870`. It uses the same relative-path resolution (`#L6847-L6853`) and then calls `GetImageFileInfo(path, desc)` (`#L6857`).
- `GetImageFileInfo` (`Utilities/GraphicsUtil.cpp#L630-L648`) opens the file with `_tfopen_s(..., "rb")` in a local `Reader` object. The destructor calls `fclose` (`#L637-L640`), so the file is closed when the call returns. It only reads header bytes (the `ImageDimensionsReader::GetInfo` parser).
- The call throws `"Image file can't be loaded"` if the header can't be read (`PlayfieldView.cpp#L6857-L6858`).

**Inference**
- `getImageSize` does not lock beyond the call and caches nothing. Unlike `drawImage`, it throws on a missing or unreadable file, so it can be used as a "is the avatar readable?" check inside a try/catch.

## 3. `layer.loadImage` (drawing layer)

**Facts**
- Binding: `BaseView::JsDrawingLayerLoadImage`, registered at `PlayfieldView.cpp#L1403-L1404`, body at `PinballY/BaseView.cpp#L1185-L1230`. It first calls `sprite->Clear()` (`#L1196`), which releases whatever the layer was showing. Then it reads the size with `GetImageFileInfo` (`#L1203`, same open-and-close reader as above) and calls `sprite->Load(filename, ...)` (`#L1218-L1220`). The path is **not** resolved against the program folder here. `Help/DrawingLayer.html:491` says the file name "must be a fully qualified Windows path".
- `Sprite::Clear` (`PinballY/Sprite.cpp#L1895-L1916`) drops the animation loader, the frames, and the `loadContext`.
- `Sprite::Load(const WCHAR *filename, ...)` (`Sprite.cpp#L61-L119`) sniffs the type with `GetImageFileInfo(filename, desc, true, true)` (`#L73`), then branches:
  - **Still images (JPEG, PNG, etc.)** go to `LoadWICTexture` (`#L118`, `#L122-L185`). It starts a **worker thread** (`#L170-L178`) that calls DirectXTK's `CreateWICTextureFromFileEx` (`#L147-L149`). That function holds the WIC decoder and frame in local `ComPtr`s (`DirectXTK/src/WICTextureLoader.cpp#L1061-L1069`), uploads the pixels to a D3D texture, and returns. The COM objects, and with them the file, are released on return. The texture lives in the sprite and has no link to the path.
  - **JPEG with an EXIF orientation** is drawn through a local `std::unique_ptr<Gdiplus::Bitmap>(Gdiplus::Bitmap::FromFile(filename))` inside a drawing callback (`Sprite.cpp#L89-L112`). The bitmap is freed when the lambda returns.
  - **Any GIF** goes to `LoadGIF` (`#L81-L82`, `#L1053-L1180`). It opens an `IWICBitmapDecoder` with `CreateDecoderFromFilename(filename, ..., GENERIC_READ, ...)` (`#L1072-L1074`), decodes only the first frame (`#L1161`), and hands the decoder to a `GIFLoaderState` that the sprite keeps (`#L1155-L1156`, `#L1177`). Later frames are decoded on demand (`Sprite.h#L386-L391`, called from `Sprite.cpp#L1757`). The decoder is released only by `GIFLoaderState::Clear()` (`Sprite.h#L406-L414`). That runs on a decode error (`Sprite.cpp#L1191-L1201`) or when the loader is destroyed by `Sprite::Clear` (`#L1902`). Nothing releases it after the last frame.
  - **Animated PNG (APNG)** is detected only when an `acTL` chunk comes before the first `IDAT` (`Utilities/GraphicsUtil.cpp#L549-L562`). It goes to `LoadAPNG` (`Sprite.cpp#L371-L405`), whose `APNGLoaderState` opens the file with `_tfopen_s(&fp, filename, "rb")` (`#L411`) and keeps it in a `FILEPtrHolder fp` member (`Sprite.h#L487`) to read frames incrementally (`Sprite.cpp#L448-L453`, `#L525-L550`). It is closed when the loader is destroyed, i.e. on `Sprite::Clear`. If the PNG turns out not to be animated, the loader is discarded **before** the WIC load "to make sure we don't have an open handle to the file" (`#L396-L403`).
- `Help/DrawingLayer.html:355` and `:491` say that each loader call (`loadImage`, `loadVideo`, `drawDMDText`, `draw`) replaces what the layer showed before. The help says nothing about locking or caching.

**Inferences**
- A still PNG or JPEG avatar shown with `loadImage` does **not** keep the file locked. The file is read on a background thread that starts during the `loadImage` call, so there is a short window right after the call when the file is still being read. Replacing it in that window could fail (sharing violation) or give a broken texture (logged as `IDS_ERR_IMGLOAD` by `Sprite.cpp#L151-L158`).
- An **animated GIF/APNG avatar keeps the file open** for as long as it is shown. A plain `.gif` avatar goes through the same GIF path even if it has one frame. Windows would then refuse to delete or overwrite it (the CRT `fopen_s` and WIC's read handle do not share write access; this is Windows behavior, not checked in PinballY's code). To replace it, first call `layer.clear()` or load something else into the layer.

## 4. The only path-keyed cache: litehtml (not used here)

**Facts**
- `PinballY/LitehtmlHost.cpp#L695-L760` keeps an `imageCache` keyed by URL (`GetImageCacheKey`, `GetImageCacheEntryByKey`, `FindOrLoadImage`). It serves images referenced from HTML rendered by the litehtml layout engine (`LitehtmlHost.h` header comment), created in `PlayfieldView.cpp#L7426`.
- `drawImage`, `getImageSize` and `loadImage` don't go through `LitehtmlHost` (see sections 1 to 3).

**Inference**
- If a later design shows the avatar through an `<img>` in HTML layout (`HtmlLayout`, see `Help/CustomDrawing.html` "See HtmlLayout and StyledText"), that path **may** cache by URL. Not verified further. A changing file name would then be the way to force a reload.

## 5. Forcing a reload

- **Not needed** for `drawImage`, `getImageSize` or `loadImage`: each call reads the file again. After replacing the file, call `loadImage(path)` again or redraw the custom drawing (fact, from sections 1 to 3).
- A query suffix such as `avatar.png?v=2` **will not work**. These APIs pass the string to Win32/CRT file functions, not to a URL loader (fact), and `?` is not a valid Windows file-name character (inference: the open fails).
- If a unique name is ever needed (animated avatars, or the litehtml path), write to a new file name, e.g. `avatar-<timestamp>.png` (inference).

## Practical recommendations (inferences)

1. Prefer a still PNG/JPEG avatar. Treat GIF as "locked while shown".
2. Replace the file with write-to-temp-then-rename, so a redraw never sees a half-written file. Retry if the rename fails.
3. After replacing, reload the layer (`loadImage`) or redraw. Nothing watches the file.
4. Before replacing a GIF/APNG shown in a layer, `layer.clear()` it first.
5. Use `dc.getImageSize` in a try/catch to check the file before drawing it, since `drawImage` fails silently.
