from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ── FUZZY MEMBERSHIP FUNCTIONS ──

def trapezoid(x, a, b, c, d):
    if x <= a or x >= d:
        return 0
    if b <= x <= c:
        return 1
    if x < b:
        return (x - a) / (b - a)
    return (d - x) / (d - c)

def triangle(x, a, b, c):
    if x <= a or x >= c:
        return 0
    if x == b:
        return 1
    if x < b:
        return (x - a) / (b - a)
    return (c - x) / (c - b)


# ── FUZZIFIKASI ──

def fuzzify_air(air):
    return {
        'sedikit': trapezoid(air, 0,    0,    500,  1200),
        'cukup':   trapezoid(air, 600,  1200, 1600, 2200),
        'banyak':  trapezoid(air, 1800, 2400, 3000, 3000),
    }

def fuzzify_aktivitas(a):
    return {
        'ringan': trapezoid(a, 1, 1, 3, 5),
        'sedang': triangle(a,  3, 5, 8),
        'berat':  trapezoid(a, 6, 8, 10, 10),
    }

def fuzzify_suhu(s):
    return {
        'sejuk':  trapezoid(s, 15, 15, 22, 27),
        'normal': triangle(s,  22, 27, 33),
        'panas':  trapezoid(s, 28, 33, 40, 40),
    }

def fuzzify_bak(b):
    return {
        'jarang': trapezoid(b, 0, 0, 2, 4),
        'normal': triangle(b,  2, 5, 8),
        'sering': trapezoid(b, 6, 8, 12, 12),
    }


# ── RULES & DEFUZZIFIKASI (Weighted Average) ──

def infer(air, aktivitas, suhu, bak):
    A  = fuzzify_air(air)
    Ak = fuzzify_aktivitas(aktivitas)
    S  = fuzzify_suhu(suhu)
    B  = fuzzify_bak(bak)

    # (bobot_rule, nilai_crisp_output)
    # Semakin tinggi nilai crisp → semakin parah dehidrasi (0-100)
    rules = [
        # Normal (0-24)
        (min(A['banyak'], Ak['ringan'], S['sejuk'],  B['normal']), 10),
        (min(A['banyak'], Ak['ringan']),                           15),
        (min(A['cukup'],  Ak['ringan'], S['sejuk']),               15),
        (min(A['banyak'], Ak['sedang'], S['normal'], B['normal']), 20),
        # Ringan (25-49)
        (min(A['cukup'],  Ak['sedang'], S['normal']),              30),
        (min(A['sedikit'],Ak['ringan'], S['sejuk']),               35),
        (min(A['cukup'],  Ak['berat'],  S['normal'], B['jarang']), 40),
        (min(A['cukup'],  Ak['sedang'], S['panas']),               45),
        # Sedang (50-74)
        (min(A['sedikit'],Ak['sedang'], S['normal']),              55),
        (min(A['cukup'],  Ak['berat'],  S['panas'],  B['jarang']), 60),
        (min(A['sedikit'],Ak['ringan'], S['panas'],  B['jarang']), 60),
        (min(A['sedikit'],Ak['sedang'], S['panas']),               65),
        # Berat (75-100)
        (min(A['sedikit'],Ak['berat'],  S['normal'], B['jarang']), 75),
        (min(A['sedikit'],Ak['berat'],  S['panas']),               85),
        (min(A['sedikit'],Ak['berat'],  S['panas'],  B['jarang']), 95),
    ]

    num = sum(w * v for w, v in rules)
    den = sum(w     for w, _ in rules)
    return round(num / den, 2) if den > 0 else 15.0


# ── INTERPRETASI HASIL ──

def interpret(score, air, aktivitas, suhu):
    base_need = (
        2000
        + (600 if aktivitas > 6 else 300 if aktivitas > 3 else 0)
        + (400 if suhu > 32     else 200 if suhu > 27     else 0)
    )
    kekurangan = max(0, base_need - air)

    if score < 25:
        return {
            'level':      'Terhidrasi Baik',
            'severity':   'normal',
            'score':      score,
            'desc':       'Tubuhmu dalam kondisi hidrasi yang baik. Cairan dalam tubuh cukup untuk mendukung fungsi organ dan aktivitas harian. Pertahankan pola minum yang sudah baik ini.',
            'rec_minum':  'Cukup',
            'rec_target': base_need,
            'bar_pct':    12,
        }
    elif score < 50:
        return {
            'level':      'Dehidrasi Ringan',
            'severity':   'ringan',
            'score':      score,
            'desc':       'Tubuhmu mulai kehilangan lebih banyak cairan dari yang masuk. Gejala awal seperti mulut sedikit kering atau urin agak gelap mungkin mulai terasa. Segera minum air secukupnya.',
            'rec_minum':  f'+{int(kekurangan)} ml',
            'rec_target': base_need,
            'bar_pct':    40,
        }
    elif score < 72:
        return {
            'level':      'Dehidrasi Sedang',
            'severity':   'sedang',
            'score':      score,
            'desc':       'Dehidrasi sedang dapat menyebabkan sakit kepala, lemas, sulit konsentrasi, dan urin berwarna kuning gelap. Minum air segera secara bertahap, jangan langsung banyak sekaligus.',
            'rec_minum':  f'+{int(kekurangan)} ml',
            'rec_target': base_need,
            'bar_pct':    66,
        }
    else:
        return {
            'level':      'Dehidrasi Berat',
            'severity':   'berat',
            'score':      score,
            'desc':       'Kondisi ini serius. Dehidrasi berat dapat menyebabkan pusing parah, jantung berdebar, dan pingsan. Minum air atau minuman elektrolit segera dan pertimbangkan untuk berkonsultasi ke dokter.',
            'rec_minum':  f'+{int(kekurangan)} ml',
            'rec_target': base_need,
            'bar_pct':    92,
        }


# ── ROUTES ──

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    data      = request.get_json()
    air       = float(data.get('air',       1000))
    aktivitas = float(data.get('aktivitas', 1))
    suhu      = float(data.get('suhu',      28))
    bak       = float(data.get('bak',       4))

    score  = infer(air, aktivitas, suhu, bak)
    result = interpret(score, air, aktivitas, suhu)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
