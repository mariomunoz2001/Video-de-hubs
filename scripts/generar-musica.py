"""Genera una base ambiental suave (pad + bajo + pulso) para el video de análisis.
Uso: python3 scripts/generar-musica.py analisis/musica.wav [segundos]   (luego se pasa a mp3 con ffmpeg)"""
import sys, wave
import numpy as np

SR = 44100
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 62
n = int(SR * dur)
t = np.arange(n) / SR
bpm = 96
beat = 60 / bpm
acorde_dur = beat * 8  # 2 compases por acorde
nota = lambda m: 440 * 2 ** ((m - 69) / 12)
# Am – F – C – G (voicings abiertos)
acordes = [[57, 64, 69, 72], [53, 60, 65, 69], [48, 55, 64, 67], [55, 62, 67, 71]]
bajos = [33, 29, 36, 31]

pad = np.zeros(n); bajo = np.zeros(n)
for k in range(int(dur / acorde_dur) + 1):
    i0 = int(k * acorde_dur * SR); i1 = min(n, int((k + 1) * acorde_dur * SR + SR * 1.2))
    if i0 >= n: break
    tt = t[i0:i1] - t[i0]
    L = (i1 - i0) / SR
    env = np.minimum(1, tt / 1.4) * np.clip((L - tt) / 1.6, 0, 1)
    ch = acordes[k % 4]
    for m in ch:
        f = nota(m)
        for det in (-0.25, 0.25):
            pad[i0:i1] += env * np.sin(2 * np.pi * (f + det) * tt) * 0.06
        pad[i0:i1] += env * np.sin(2 * np.pi * f * 2 * tt) * 0.012
    fb = nota(bajos[k % 4])
    benv = np.minimum(1, tt / 0.05) * np.exp(-((tt % (beat * 2)) / 1.4)) * np.clip((L - tt) / 0.5, 0, 1)
    bajo[i0:i1] += benv * (np.sin(2 * np.pi * fb * tt) + 0.3 * np.sin(2 * np.pi * fb * 2 * tt)) * 0.16

# pulso tipo "tic" en corcheas, muy bajo
rng = np.random.default_rng(7)
pulso = np.zeros(n)
largo = int(0.03 * SR)
clic = rng.standard_normal(largo) * np.exp(-np.arange(largo) / (0.006 * SR))
clic = np.diff(clic, prepend=0)  # agudo
for j in range(int(dur / (beat / 2))):
    i = int(j * beat / 2 * SR)
    if i + largo < n and j >= 16:
        pulso[i:i + largo] += clic * (0.05 if j % 2 == 0 else 0.025)

# leve trémolo del pad para que respire
pad *= 0.85 + 0.15 * np.sin(2 * np.pi * t / (beat * 4))
mix = pad + bajo + pulso
fade = np.minimum(1, t / 2.5) * np.clip((dur - t) / 3, 0, 1)
mix *= fade
mix /= np.max(np.abs(mix)) / 0.5
st = np.stack([mix * (1 + 0.04 * np.sin(2 * np.pi * t / 7)), mix * (1 - 0.04 * np.sin(2 * np.pi * t / 7))], 1)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
