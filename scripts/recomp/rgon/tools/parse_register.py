"""The game's own Lua registration (0x00866960, v1.9.7.17) as a table: for every
class, the methods it registers and the function each one is bound to.
luabridge's addFunction("Name", &Class::Method) compiles to
    push <method VA> ; push <"Name"> ; mov ecx, eax ; call <addFunction<...>>
so the method's address in THIS executable is right there, with no signature.
Properties push a getter (and a setter); data members push an offset.

  python scripts/decomp/tools/pequery.py body 0x00866960 > output/recomp/rgon/register_body.txt
  python scripts/recomp/rgon/tools/parse_register.py output/recomp/rgon/register_body.txt output/recomp/rgon/bindings-17.json
"""
import io, json, re, struct, sys

src, out = sys.argv[1], sys.argv[2]
EXE = io.open('tools/isaac-ng.unpacked.exe', 'rb').read()
_pe = struct.unpack_from('<I', EXE, 0x3c)[0]
_nsec = struct.unpack_from('<H', EXE, _pe + 6)[0]
_opt = struct.unpack_from('<H', EXE, _pe + 20)[0]
_base = struct.unpack_from('<I', EXE, _pe + 24 + 28)[0]
SECS = []
for _i in range(_nsec):
    _o = _pe + 24 + _opt + 40 * _i
    _vs, _va, _rs, _ro = struct.unpack_from('<IIII', EXE, _o + 8)
    SECS.append((_base + _va, _rs, _ro))
NAME = re.compile(r'^[A-Za-z_][A-Za-z0-9_]*$')


def cstr_at(va):
    for a, rs, ro in SECS:
        if a <= va < a + rs:
            o = ro + (va - a)
            e = EXE.find(b'\0', o, o + 64)
            if e < 0:
                return None
            try:
                t = EXE[o:e].decode('ascii')
            except UnicodeDecodeError:
                return None
            return t if NAME.match(t) else None
    return None


ins = []
for line in io.open(src, encoding='utf8', errors='replace'):
    m = re.match(r'^0x([0-9a-f]{8})\s+(\S+)\s*(.*?)\s*(?:;\s*(.*))?$', line.rstrip('\n'))
    if m:
        ins.append((int(m.group(1), 16), m.group(2), m.group(3), m.group(4) or ''))


def imm(op):
    m = re.match(r'^(-?)(0x[0-9a-f]+|\d+)$', op.strip())
    if not m:
        return None
    v = int(m.group(2), 0)
    return -v if m.group(1) else v


def string_of(com, op=None):
    m = re.search(r'"([^"]*)"', com)
    if m:
        return m.group(1)
    if op is not None and '.text' not in com:        # short names are not in the index's string table
        v = imm(op)
        if v is not None and 0xb18000 <= v < 0xc80000:
            return cstr_at(v)
    return None


classes, cur = {}, None
for i, (va, mn, op, com) in enumerate(ins):
    if mn != 'push':
        continue
    s = string_of(com, op)
    if s is None or not NAME.match(s):
        continue
    args, j = [], i - 1
    while j >= 0 and ins[j][1] == 'push' and len(args) < 3:
        v = imm(ins[j][2])
        if v is None:
            break
        args.append((v, 'text' if '.text' in ins[j][3] else ('str' if string_of(ins[j][3], ins[j][2]) else 'imm')))
        j -= 1
    k, call = i + 1, None
    while k < len(ins) and k < i + 6:
        if ins[k][1] == 'call':
            call = ins[k][2].split()[0]
            break
        k += 1
    nxt = ins[i + 1] if i + 1 < len(ins) else None
    if nxt is not None and nxt[1] == 'lea' and nxt[2].startswith('ecx, [ebp'):
        cur = s
        classes.setdefault(cur, {'at': '0x%08x' % va, 'functions': {}, 'properties': {}, 'data': {}, 'other': {}})
        continue
    if cur is None:
        continue
    c = classes[cur]
    texts = [a for a, k2 in args if k2 == 'text']
    imms = [a for a, k2 in args if k2 == 'imm']
    rec = {'at': '0x%08x' % va, 'via': call}
    if len(texts) == 1 and not imms:
        rec['fn'] = '0x%08x' % texts[0]
        c['functions'].setdefault(s, rec)
    elif len(texts) >= 2:
        rec['get'] = '0x%08x' % texts[0]
        rec['set'] = '0x%08x' % texts[1]
        c['properties'].setdefault(s, rec)
    elif len(texts) == 1 and imms:
        rec['fn'] = '0x%08x' % texts[0]
        rec['imm'] = imms
        c['other'].setdefault(s, rec)
    elif imms:
        rec['offset'] = '0x%x' % (imms[0] & 0xffffffff)
        rec['extra'] = imms[1:]
        c['data'].setdefault(s, rec)
    else:
        c['other'].setdefault(s, rec)
json.dump(classes, io.open(out, 'w', encoding='utf8'), indent=1)
print('%d classes, %d functions, %d properties, %d data members' % (
    len(classes), sum(len(c['functions']) for c in classes.values()),
    sum(len(c['properties']) for c in classes.values()), sum(len(c['data']) for c in classes.values())))
print(' '.join(sorted(classes)))
for n in ('EntityPlayer', 'Entity', 'Level', 'Room', 'Game', 'EntityPickup', 'HUD', 'Sprite', 'Isaac'):
    c = classes.get(n)
    if c:
        print('  %-14s %3d fns %3d props %3d data  e.g. %s' % (n, len(c['functions']), len(c['properties']), len(c['data']),
              ', '.join('%s=%s' % (k, v['fn']) for k, v in list(c['functions'].items())[:3])))
