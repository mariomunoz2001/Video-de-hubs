"""Genera una base lo-fi tranquila pero con pulso (bombo suave, shaker, acordes tipo Rhodes,
arpegio de marimba y bajo) para el video de análisis. Sin samples: todo es síntesis, sin derechos.

Uso: python3 scripts/generar-musica.py salida.wav [segundos]
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 80
N = int(SR * DUR)
BPM = 92
BEAT = 60 / BPM
COMPAS = BEAT * 4
rng = np.random.default_rng(11)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
mix = np.zeros((N, 2))


def poner(señal, t0, gan=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    s = señal[: N - i0] * gan
    mix[i0 : i0 + len(s), 0] += s * (1 - pan) ** 0.5
    mix[i0 : i0 + len(s), 1] += s * (1 + pan) ** 0.5


def env_adsr(n, a=0.01, d=0.2, s=0.6, r=0.3):
    t = np.arange(n) / SR
    L = n / SR
    e = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    return e * np.clip((L - t) / r, 0, 1)


def lowpass(x, corte):
    # filtro de un polo, suficiente para suavizar
    a = np.exp(-2 * np.pi * corte / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


# ---------- instrumentos ----------
def rhodes(nota, largo):
    n = int(largo * SR)
    t = np.arange(n) / SR
    f = hz(nota)
    mod = np.sin(2 * np.pi * f * t) * 1.2 * np.exp(-t * 3)
    x = np.sin(2 * np.pi * f * t + mod) * 0.7 + np.sin(2 * np.pi * f * 2 * t) * 0.08 * np.exp(-t * 2)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.2 * t)
    return x * env_adsr(n, 0.008, 0.9, 0.45, 0.5) * trem


def marimba(nota):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = hz(nota)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 22)
    return x * np.minimum(1, t / 0.002)


def bajo(nota, largo):
    n = int(largo * SR)
    t = np.arange(n) / SR
    f = hz(nota)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
    return np.tanh(x * 1.4) * env_adsr(n, 0.01, 0.3, 0.7, 0.12)


def bombo():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t * 28)
    fase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(fase) * np.exp(-t * 7) * np.minimum(1, t / 0.003)


def aro():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    ruido = rng.standard_normal(n)
    tono = np.sin(2 * np.pi * 820 * t) * 0.5
    return (np.diff(ruido, prepend=0) * 0.5 + tono) * np.exp(-t * 45)


def shaker():
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    r = np.diff(rng.standard_normal(n), prepend=0)
    return r * np.minimum(1, t / 0.012) * np.exp(-t * 60)


# ---------- armonía: Dm9 – Bbmaj7 – F/A – C (cálido, en loop) ----------
ACORDES = [[62, 65, 69, 72, 76], [58, 62, 65, 69, 74], [57, 60, 65, 69, 72], [55, 60, 64, 67, 71]]
BAJOS = [38, 34, 33, 36]
# arpegio de marimba (grados del acorde, en corcheas; None = silencio)
PATRON = [0, None, 2, 3, None, 2, 4, None]

compases = int(DUR / COMPAS) + 1
for c in range(compases):
    t0 = c * COMPAS
    k = (c // 1) % 4
    ac = ACORDES[k]
    entra_ritmo = c >= 2  # los dos primeros compases solo acordes
    # acordes: golpe en 1 y un empuje suave en el "y" del 3
    for nota in ac:
        poner(rhodes(nota, COMPAS * 0.62), t0, 0.06, pan=rng.uniform(-0.3, 0.3))
        poner(rhodes(nota, COMPAS * 0.3), t0 + BEAT * 2.5, 0.035)
    # bajo
    if entra_ritmo:
        poner(bajo(BAJOS[k], BEAT * 1.6), t0, 0.16)
        poner(bajo(BAJOS[k] + 12 if c % 2 else BAJOS[k], BEAT * 0.8), t0 + BEAT * 2.5, 0.12)
    # batería
    if entra_ritmo:
        poner(bombo(), t0, 0.42)
        poner(bombo(), t0 + BEAT * 2.5, 0.3)
        if c % 4 == 3:
            poner(bombo(), t0 + BEAT * 3.5, 0.22)
        for b in (1, 3):
            poner(aro(), t0 + BEAT * b + 0.012, 0.12, pan=0.2)
    if c >= 4:
        for s in range(16):
            swing = 0.018 if s % 2 else 0
            poner(shaker(), t0 + s * BEAT / 4 + swing, 0.05 if s % 2 else 0.028, pan=-0.35)
    # marimba: entra a los 4 compases y descansa cada 8
    if c >= 4 and (c // 8) % 2 == 0 or c >= 12:
        for j, g in enumerate(PATRON):
            if g is None:
                continue
            nota = ac[g % len(ac)] + 12
            poner(marimba(nota), t0 + j * BEAT / 2 + (0.02 if j % 2 else 0), 0.07, pan=0.35 if j % 2 else -0.1)

# ---------- master: cálido y sin picos ----------
for ch in range(2):
    mix[:, ch] = lowpass(mix[:, ch], 7000)
mix = np.tanh(mix * 1.6) / 1.6
t = np.arange(N) / SR
fade = np.minimum(1, t / 1.5) * np.clip((DUR - t) / 3, 0, 1)
mix *= fade[:, None]
# ruido de cinta muy bajo
mix += rng.standard_normal((N, 2)) * 0.0015 * fade[:, None]
mix /= np.max(np.abs(mix)) / 0.6
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('✔', sys.argv[1], f'{DUR:.0f} s')
