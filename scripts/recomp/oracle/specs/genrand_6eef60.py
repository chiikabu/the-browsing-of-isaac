"""0x006eef60 -- Isaac::genrand_int32, MT19937 core only.

The function is NOT pure end to end.  After the twist+temper it memsets a
0x10c-byte local, `operator new`s a 0x118-byte record and links it into a
global doubly-linked list at [0xc79864] -- an RNG call-trace recorder.  That
list head is 0 in the file image (the real process initialises it at
runtime), so the full function dereferences NULL at 0x006ef12b and the
oracle reports `read-unmapped @ 0x00000004`.  That is a true statement about
the binary in this state, not an emulator limitation.

UNTIL stops after tempering, at 0x006ef0b2, where the drawn value is live in
ECX.  That prefix is fully pure: no stub, no model, no fault.

State (mt[] at 0xc7ac70, mti at 0xc34f04) lives in .data and is carried
across calls on purpose, so successive vectors form the real MT sequence.
"""
from __future__ import annotations

VA = 0x006EEF60
CC = "cdecl"
UNTIL = 0x006EF0B2          # after tempering, before the trace recorder
CARRY_STATE = True          # do NOT roll back .data between vectors


def build(o, rng):
    return {"ecx": 0, "edx": 0, "args": [], "note": {}}
