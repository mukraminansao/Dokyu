import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { createSoundGate } from '../lib/soundGate';
import { SOUND_CUES, SOUND_SAMPLE_RATE, renderSound, type SoundCue } from '../lib/soundCues';

test('sound starts disabled, mute blocks every cue, and re-enabling allows immediate feedback', () => {
  const gate = createSoundGate();
  assert.equal(gate.accept('tap', 100), false);
  gate.setEnabled(true);
  assert.equal(gate.accept('tap', 100), true);
  gate.setEnabled(false);
  for (const cue of Object.keys(SOUND_CUES) as SoundCue[])
    assert.equal(gate.accept(cue, 101), false);
  gate.setEnabled(true);
  assert.equal(gate.accept('tap', 102), true);
});

test('nested taps produce one cue, while tour feedback remains independent', () => {
  const gate = createSoundGate();
  gate.setEnabled(true);
  assert.equal(gate.accept('tap', 100), true);
  assert.equal(gate.accept('tap', 101), false);
  assert.equal(gate.accept('hello', 101), true);
  assert.equal(gate.accept('tap', 169), false);
  assert.equal(gate.accept('tap', 170), true);
});

test('background state suppresses feedback and has no replay queue', () => {
  const gate = createSoundGate();
  gate.setEnabled(true);
  gate.setForeground(false);
  assert.equal(gate.accept('complete', 100), false);
  assert.equal(gate.canPlay(), false);
  gate.setForeground(true);
  assert.equal(gate.canPlay(), true);
  assert.equal(gate.accept('tap', 101), true);
});

test('all cues are short, quiet, finite and have silence at their boundaries', () => {
  for (const cue of Object.keys(SOUND_CUES) as SoundCue[]) {
    const pcm = renderSound(cue);
    assert.ok(pcm.length > 0 && pcm.length < SOUND_SAMPLE_RATE * 0.5, cue);
    assert.equal(pcm[0], 0, cue);
    assert.equal(pcm[pcm.length - 1], 0, cue);
    let peak = 0;
    for (const sample of pcm) {
      assert.ok(Number.isFinite(sample), cue);
      peak = Math.max(peak, Math.abs(sample));
    }
    assert.ok(peak > 0.01 && peak < 0.25, cue + ' peak ' + peak);
  }
});

test('bundled native WAVs have valid PCM headers and match the shared sound score', () => {
  for (const cue of Object.keys(SOUND_CUES) as SoundCue[]) {
    const wav = readFileSync(new URL('../assets/sounds/' + cue + '.wav', import.meta.url));
    const pcm = renderSound(cue);
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
    assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
    assert.equal(wav.readUInt16LE(20), 1);
    assert.equal(wav.readUInt16LE(22), 1);
    assert.equal(wav.readUInt32LE(24), SOUND_SAMPLE_RATE);
    assert.equal(wav.length, 44 + pcm.length * 2);
    for (let i = 0; i < pcm.length; i += 100)
      assert.equal(wav.readInt16LE(44 + i * 2), Math.round((pcm[i] ?? 0) * 32767) || 0);
  }
});
