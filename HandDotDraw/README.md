# Hand Dot Draw

A Python/OpenCV hand-tracking drawing app.

- Index finger only: draw a close dotted trail.
- Index and middle fingers: lift the pen so you can reposition.
- Dot placement is smoothed through quadratic Bezier interpolation.

## Setup

```powershell
cd "C:\Users\NuRuL AzAm\Documents\SHIHAB\HandDotDraw"
py -m pip install -r requirements.txt
```

If `py` is not connected to a Python install, install Python 3.11 or 3.12 from python.org and run the command again.

## Run

```powershell
.\run.bat
```

The app scans for the first working webcam automatically.

Controls:

- `q` or `Esc`: quit
- `c`: clear drawing
- `s`: save the ink layer to `drawing.png`

On this machine, the detected webcam is camera `0`. If the wrong camera opens or the feed is black, list available indexes:

```powershell
.\run.bat --list-cameras
```

Then choose one:

```powershell
.\run.bat --camera 0
```

## Test Drawing Logic

```powershell
.\test.bat
```

Without pytest installed, run the built-in smoke test:

```powershell
py smoke_test.py
```
