# -*- coding: utf-8 -*-
"""生成 5 张剧照占位 SVG：舞台聚光灯 + 灰尘 + 序号。"""
import os, random

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'stills')
PLAYS = [
    ('01', '东南大学',   '#9ecbb8'),
    ('02', '南京航空航天大学', '#93b2c9'),
    ('03', '南京理工大学', '#cf9573'),
    ('04', '河海大学',   '#a8c19a'),
    ('05', '南京农业大学', '#c6b98c'),
]

TPL = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img" aria-label="{school}剧照占位图">
  <defs>
    <linearGradient id="bg{n}" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#123039"/>
      <stop offset="0.5" stop-color="#0d2126"/>
      <stop offset="1" stop-color="#081417"/>
    </linearGradient>
    <radialGradient id="spot{n}" cx="0.5" cy="0.02" r="0.78">
      <stop offset="0" stop-color="{acc}" stop-opacity="0.55"/>
      <stop offset="0.42" stop-color="{acc}" stop-opacity="0.13"/>
      <stop offset="1" stop-color="{acc}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cone{n}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="0.75" stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="veil{n}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.55"/>
      <stop offset="0.16" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.84" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#bg{n})"/>
  <rect width="800" height="500" fill="url(#spot{n})"/>
  <polygon points="400,-60 656,500 144,500" fill="url(#cone{n})"/>
{dust}
  <g opacity="0.5">
{curtain}
  </g>
  <path d="M0 434 H800" stroke="{acc}" stroke-opacity="0.22"/>
  <ellipse cx="400" cy="436" rx="252" ry="24" fill="{acc}" opacity="0.13"/>
  <rect x="17" y="17" width="766" height="466" fill="none" stroke="{acc}" stroke-opacity="0.30"/>
  <rect x="26" y="26" width="748" height="448" fill="none" stroke="#ffffff" stroke-opacity="0.06"/>

  <text x="744" y="478" text-anchor="end" font-family="Georgia, 'Songti SC', serif" font-size="186" font-weight="700"
        fill="{acc}" fill-opacity="0.12" letter-spacing="-6">{n}</text>

  <text x="46" y="446" font-family="'Songti SC', 'SimSun', serif" font-size="17" letter-spacing="6"
        fill="{acc}" fill-opacity="0.82">剧照占位</text>
  <text x="46" y="472" font-family="Georgia, 'Songti SC', serif" font-size="10.5" letter-spacing="3.4"
        fill="#ffffff" fill-opacity="0.34">STILL / {n} — {school}</text>

  <rect width="800" height="500" fill="url(#veil{n})"/>
</svg>
'''

for n, school, acc in PLAYS:
    random.seed(int(n))
    dust = []
    for _ in range(46):
        x = random.uniform(210, 590)
        y = random.uniform(40, 470)
        r = random.uniform(0.6, 1.9)
        o = random.uniform(0.10, 0.42)
        dust.append('  <circle cx="%.1f" cy="%.1f" r="%.1f" fill="#ffffff" opacity="%.2f"/>' % (x, y, r, o))
    curtain = []
    for i, x in enumerate([40, 760]):
        for k in range(1, 7):
            xx = x + (k * 9 if i == 0 else -k * 9)
            curtain.append('    <path d="M%.0f 0 V500" stroke="#ffffff" stroke-opacity="%.2f" stroke-width="1.4"/>' % (xx, 0.09 - k * 0.01))
    svg = TPL.format(n=n, school=school, acc=acc, dust='\n'.join(dust), curtain='\n'.join(curtain))
    path = os.path.join(OUT, 'still-%s.svg' % n)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print('wrote', path, len(svg))
