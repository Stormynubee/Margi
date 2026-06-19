import * as Speech from 'expo-speech';
import { getQuestion } from '../startTriageFSM';
import type { Lang, TriageState } from '../types';
import { notifyTtsPlayback } from '../voice/voicePolicyBridge';

export type NarratorLang = Lang;

const LOCALE: Record<NarratorLang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
};

export function triagePromptForLang(
  state: TriageState,
  lang: NarratorLang
): { prompt: string; options: string[] } | null {
  const q = getQuestion(state);
  if (!q) return null;
  
  const prompt =
    lang === 'hi' && q.promptHi
      ? q.promptHi
      : lang === 'ta' && q.promptTa
      ? q.promptTa
      : q.prompt;
      
  const options = q.options.map((o) => {
    if (lang === 'hi' && o.labelHi) return o.labelHi;
    if (lang === 'ta' && o.labelTa) return o.labelTa;
    return o.label;
  });
  
  return {
    prompt,
    options,
  };
}

export function speakFsmPrompt(
  state: TriageState,
  lang: NarratorLang,
  opts?: { ttsEnabled?: boolean; onStart?: () => void; onDone?: () => void }
): void {
  if (opts?.ttsEnabled === false) return;
  const copy = triagePromptForLang(state, lang);
  if (!copy) return;
  const message = `${copy.prompt}. Options: ${copy.options.join(', ')}`;
  notifyTtsPlayback(message);
  opts?.onStart?.();
  Speech.stop();
  Speech.speak(message, {
    language: LOCALE[lang] ?? LOCALE.en,
    rate: 0.9,
    onDone: () => opts?.onDone?.(),
  });
}

export function stopNarrator(): void {
  Speech.stop();
}
