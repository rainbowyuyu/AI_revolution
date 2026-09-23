"""Generate the revised series overview voice for the V8 opening.

The body narration remains the measured V7 narration.  This file only creates
the new opening clips so the opening can be timed from real audio durations.
"""
from voice import *
import argparse, gc, time, subprocess

P = argparse.ArgumentParser()
P.add_argument("mode", choices=["voice"])
args = P.parse_args()

OUT_V8 = OUT / "v8"
RAW = OUT_V8 / "raw"
RAW.mkdir(parents=True, exist_ok=True)

clips = [
    {
        "id": 0,
        "text": "我想用六章，讲清人工智能怎样一步步走到今天。第一章，我们先从最基础的问题开始：计算机怎样看见，怎样控制，又怎样选择？",
        "spoken": "我想用六章，讲清人工智能怎样一步步走到今天。第一章，我们先从最基础的问题开始：计算机怎样看见，怎样控制，又怎样选择？",
        "start": 0.70,
        "seed": 881001,
    },
    {
        "id": 1,
        "text": "从看见与选择，到生成与创造；从理解语言，到重建空间；再到推理、使用工具，最后走进真实世界。六章，串起一条人工智能能力不断扩展的路线。",
        "spoken": "从看见与选择，到生成与创造；从理解语言，到重建空间；再到推理、使用工具，最后走进真实世界。六章，串起一条人工智能能力不断扩展的路线。",
        "start": 11.85,
        "seed": 881002,
    },
    {
        "id": 2,
        "text": "先看一张图片。卷积神经网络把像素变成特征，再给出判断。我们会跟着一次真实训练，看它为什么认对，也看它为什么会认错。",
        "spoken": "先看一张图片。卷积神经网络把像素变成特征，再给出判断。我们会跟着一次真实训练，看它为什么认对，也看它为什么会认错。",
        "start": 25.08,
        "seed": 881003,
    },
    {
        "id": 3,
        "text": "再把问题交给一根平衡杆。深度强化学习让小车根据反馈决定向左还是向右，目标不是猜答案，而是让下一秒不要倒下。",
        "spoken": "再把问题交给一根平衡杆。深度强化学习让小车根据反馈决定向左还是向右，目标不是猜答案，而是让下一秒不要倒下。",
        "start": 35.91,
        "seed": 881004,
    },
    {
        "id": 4,
        "text": "最后，把棋盘摆在桌上。树搜索会展开几种可能，比较落子之后的后果。三次实验，带我们从看见，走到行动。现在，先把第一张图片交给计算机。",
        "spoken": "最后，把棋盘摆在桌上。树搜索会展开几种可能，比较落子之后的后果。三次实验，带我们从看见，走到行动。现在，先把第一张图片交给计算机。",
        "start": 46.82,
        "seed": 881005,
    },
]

if args.mode == "voice":
    ref = T / "work/clone-reference.wav"
    reference = json.loads((T / "work/clone-reference.json").read_text("utf8"))
    model = Qwen3TTSModel.from_pretrained(
        str(T / "models/Qwen3-TTS-0.6B"),
        device_map="cuda:0",
        dtype=torch.bfloat16,
        attn_implementation="sdpa",
    )
    prompt = model.create_voice_clone_prompt(ref_audio=str(ref), ref_text=reference["text"])
    records = []
    for c in clips:
        spoken = c["spoken"].replace("AlphaGo", "Alpha Go").replace("ReLU", "reloo")
        fingerprint = hashlib.sha256((spoken + str(c["seed"]) + "v8-overview-whole-sentence").encode()).hexdigest()[:16]
        raw_name = f"{fingerprint}-raw.wav"
        clean_name = f"{fingerprint}.wav"
        raw_path = RAW / raw_name
        clean_path = OUT_V8 / clean_name
        if not raw_path.exists():
            torch.manual_seed(c["seed"])
            started = time.time()
            wave, sr = model.generate_voice_clone(
                text=spoken,
                language="Chinese",
                voice_clone_prompt=prompt,
                non_streaming_mode=True,
                temperature=.52,
                top_p=.86,
                repetition_penalty=1.06,
                max_new_tokens=1536,
            )
            sf.write(raw_path, np.asarray(wave[0]), sr, subtype="PCM_24")
            print("VOICE", c["id"], round(sf.info(raw_path).duration, 2), "seconds; compute", round(time.time() - started, 1), flush=True)
        if not clean_path.exists():
            subprocess.run([
                "ffmpeg", "-v", "error", "-y", "-i", str(raw_path),
                "-af", "apad=pad_dur=0.30,highpass=f=65,lowpass=f=10500,afftdn=nr=9:nf=-46:tn=1:gs=6",
                "-c:a", "pcm_s24le", str(clean_path),
            ], check=True)
        info = sf.info(clean_path)
        records.append({
            **c,
            "spoken": spoken,
            "fingerprint": fingerprint,
            "raw": str(raw_path.relative_to(R / "public")).replace("\\", "/"),
            "file": str(clean_path.relative_to(R / "public")).replace("\\", "/"),
            "duration": info.duration,
            "sampleRate": info.samplerate,
        })
    (R / "research/voice-v8-opening.json").write_text(json.dumps(records, ensure_ascii=False, indent=2), "utf8")
    del model, prompt
    gc.collect()
    torch.cuda.empty_cache()
    print("V8 OPENING VOICE COMPLETE", sum(c["duration"] for c in records), flush=True)
