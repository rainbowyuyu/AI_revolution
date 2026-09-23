"""Mix the new opening narration with the shifted, already verified V7 body."""
from pathlib import Path
import json, math, re, subprocess
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

R = Path(__file__).resolve().parents[1]
OUT = R / "public/audio/v8"
OUT.mkdir(parents=True, exist_ok=True)
cfg = json.loads((R / "src/timeline-v8.json").read_text("utf8"))
opening = json.loads((R / "research/voice-v8-opening.json").read_text("utf8"))
body = json.loads((R / "research/voice-timeline-v8.json").read_text("utf8"))
rows = opening + body
sr = 48000

chords = [
    [146.832,220,293.665,349.228],
    [130.813,196,261.626,329.628],
    [116.541,174,233.082,293.665],
    [130.813,196,261.626,349.228],
]
master = OUT / "premaster.wav"
with sf.SoundFile(master, "w", samplerate=sr, channels=2, subtype="PCM_24") as out:
    for frame in range(0, cfg["duration"], 600):
        count = min(600, cfg["duration"] - frame)
        n = count * 1600
        t = np.arange(n, dtype=np.float32) / sr + frame / 30
        voice = np.zeros(n, np.float32)
        duck = np.ones(n, np.float32)
        for c in rows:
            start = float(c["start"])
            end = float(c.get("end", start + c["duration"]))
            if start >= float(t[-1]) or end <= float(t[0]):
                continue
            wave, fs = sf.read(R / "public" / c["file"], dtype="float32")
            if wave.ndim > 1:
                wave = wave.mean(axis=1)
            if fs != sr:
                wave = resample_poly(wave, sr, fs)
            offset = round((start - float(t[0])) * sr)
            lo = max(0, offset)
            hi = min(n, offset + len(wave))
            if hi > lo:
                voice[lo:hi] += wave[lo-offset:hi-offset]
            distance = np.maximum(start - t, t - end)
            duck = np.minimum(duck, .22 + .78 * np.clip(distance / .45, 0, 1))
        score = np.zeros((n, 2), np.float32)
        for block in range(max(0, int(t[0] // 12) - 1), int(t[-1] // 12) + 1):
            u = t - block * 12
            env = np.clip(u / 2, 0, 1) * np.clip((15 - u) / 3, 0, 1)
            for j, freq in enumerate(chords[block % len(chords)]):
                wave = (np.sin(2*np.pi*freq*t) + .12*np.sin(2*np.pi*freq*2.001*t)) * env * .006
                pan = -.6 + j * .4
                score[:, 0] += wave * np.sqrt((1-pan)/2)
                score[:, 1] += wave * np.sqrt((1+pan)/2)
        score *= duck[:, None] * np.minimum(t / 2, 1)[:, None] * np.minimum((cfg["duration"] / 30 - t) / 3, 1)[:, None]
        out.write(score + voice[:, None] * .93)

probe = subprocess.run([
    "ffmpeg", "-hide_banner", "-i", str(master), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"
], capture_output=True, text=True, encoding="utf8", check=True)
stats = json.loads(re.search(r'\{\s*"input_i"[\s\S]*?\}', probe.stderr).group())
filt = f'loudnorm=I=-14:TP=-1.5:measured_I={stats["input_i"]}:measured_TP={stats["input_tp"]}:measured_LRA={stats["input_lra"]}:measured_thresh={stats["input_thresh"]}:offset={stats["target_offset"]}:linear=true'
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(master), "-af", filt, "-ar", "48000", "-c:a", "pcm_s24le", str(OUT / "master.wav")], check=True)
(R / "research/audio-v8-loudness.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), "utf8")
print("V8 MIX COMPLETE", cfg["duration"], "frames", stats["input_i"], "input LUFS", flush=True)
