import type { TriageColor, TriageState } from './types';

export interface FSMContext {
  canWalk?: boolean;
  breathing?: boolean;
  airwayOk?: boolean;
  respiratoryRateOver30?: boolean;
  capillaryRefillOk?: boolean;
  followsCommands?: boolean;
}

export interface FSMQuestion {
  state: TriageState;
  prompt: string;
  promptHi?: string;
  promptTa?: string;
  options: {
    id: string;
    label: string;
    labelHi?: string;
    labelTa?: string;
    value: Partial<FSMContext>;
  }[];
}

export function getQuestion(state: TriageState): FSMQuestion | null {
  switch (state) {
    case 'AMBULATORY':
      return {
        state,
        prompt: 'Can the injured person walk on their own?',
        promptHi: 'क्या घायल व्यक्ति खुद चल सकता है?',
        promptTa: 'காயமடைந்த நபரால் தானாகவே நடக்க முடியுமா?',
        options: [
          { id: 'yes', label: 'Yes — can walk', labelHi: 'हाँ — चल सकता है', labelTa: 'ஆம் — நடக்க முடியும்', value: { canWalk: true } },
          { id: 'no', label: 'No — cannot walk', labelHi: 'नहीं — नहीं चल सकता', labelTa: 'இல்லை — நடக்க முடியாது', value: { canWalk: false } },
          { id: 'unsure', label: 'Not sure', labelHi: 'पता नहीं', labelTa: 'நிச்சயமில்லை', value: { canWalk: false } },
        ],
      };
    case 'BREATHING_CHECK':
      return {
        state,
        prompt: 'Are they breathing normally right now?',
        promptHi: 'क्या वे अभी सामान्य रूप से सांस ले रहे हैं?',
        promptTa: 'அவர்கள் இப்போது சாதாரணமாக சுவாசிக்கிறார்களா?',
        options: [
          { id: 'yes', label: 'Yes, breathing', labelHi: 'हाँ, सांस ले रहे हैं', labelTa: 'ஆம், சுவாசிக்கிறார்கள்', value: { breathing: true } },
          { id: 'no', label: 'No / not sure', labelHi: 'नहीं / पता नहीं', labelTa: 'இல்லை / நிச்சயமில்லை', value: { breathing: false } },
        ],
      };
    case 'AIRWAY_REPOSITION':
      return {
        state,
        prompt: 'After tilting head / opening airway — are they breathing now?',
        promptHi: 'सिर झुकाने / वायुमार्ग खोलने के बाद — क्या वे अब सांस ले रहे हैं?',
        promptTa: 'தலையை சாய்த்த பிறகு / சுவாசப்பாதையை திறந்த பிறகு — இப்போது சுவாசிக்கிறார்களா?',
        options: [
          { id: 'yes', label: 'Yes, breathing now', labelHi: 'हाँ, अब सांस ले रहे हैं', labelTa: 'ஆம், இப்போது சுவாசிக்கிறார்கள்', value: { airwayOk: true, breathing: true } },
          { id: 'no', label: 'Still not breathing', labelHi: 'अभी भी सांस नहीं ले रहे हैं', labelTa: 'இன்னும் சுவாசிக்கவில்லை', value: { airwayOk: false, breathing: false } },
        ],
      };
    case 'RESPIRATORY_RATE':
      return {
        state,
        prompt: 'Is breathing very fast (over 30 breaths per minute)?',
        promptHi: 'क्या सांस बहुत तेज है (प्रति मिनट 30 से अधिक)?',
        promptTa: 'சுவாசம் மிகவும் வேகமாக உள்ளதா (நிமிடத்திற்கு 30 முறைக்கு மேல்)?',
        options: [
          { id: 'yes', label: 'Yes — very fast', labelHi: 'हाँ — बहुत तेज़', labelTa: 'ஆம் — மிக வேகம்', value: { respiratoryRateOver30: true } },
          { id: 'no', label: 'No — not that fast', labelHi: 'नहीं — उतनी तेज़ नहीं', labelTa: 'இல்லை — அவ்வளவு வேகமில்லை', value: { respiratoryRateOver30: false } },
        ],
      };
    case 'PERFUSION_CHECK':
      return {
        state,
        prompt: 'Radial pulse strong? Capillary refill under 2 seconds?',
        promptHi: 'क्या नाड़ी मजबूत है? केशिका पुनर्भरण 2 सेकंड से कम है?',
        promptTa: 'நாடித் துடிப்பு வலுவாக உள்ளதா? 2 வினாடிகளுக்குள் ரத்த ஓட்டம் சீராகிறதா?',
        options: [
          { id: 'yes', label: 'Yes — pulse OK', labelHi: 'हाँ — नाड़ी ठीक है', labelTa: 'ஆம் — நாடி சீராக உள்ளது', value: { capillaryRefillOk: true } },
          { id: 'no', label: 'No / weak / slow refill', labelHi: 'नहीं / कमजोर / धीमा', labelTa: 'இல்லை / பலவீனமான / மெதுவான ஓட்டம்', value: { capillaryRefillOk: false } },
        ],
      };
    case 'MENTAL_STATUS':
      return {
        state,
        prompt: 'Can they follow simple commands (e.g. squeeze my hand)?',
        promptHi: 'क्या वे सरल निर्देशों का पालन कर सकते हैं (जैसे मेरा हाथ दबाएं)?',
        promptTa: 'அவர்களால் எளிய கட்டளைகளைப் பின்பற்ற முடியுமா (எ.கா. என் கையை அழுத்தவும்)?',
        options: [
          { id: 'yes', label: 'Yes — follows commands', labelHi: 'हाँ — निर्देशों का पालन कर रहे हैं', labelTa: 'ஆம் — கட்டளைகளைப் பின்பற்றுகிறார்', value: { followsCommands: true } },
          { id: 'no', label: 'No / confused / unconscious', labelHi: 'नहीं / भ्रमित / बेहोश', labelTa: 'இல்லை / குழப்பமடைந்த / மயக்கமுற்ற நிலை', value: { followsCommands: false } },
        ],
      };
    default:
      return null;
  }
}

export function initialState(): TriageState {
  return 'AMBULATORY';
}

export function applyAnswer(
  state: TriageState,
  ctx: FSMContext,
  value: Partial<FSMContext>
): { next: TriageState; result?: TriageColor; ctx: FSMContext } {
  const merged = { ...ctx, ...value };

  if (state === 'AMBULATORY') {
    if (merged.canWalk) return { next: 'TAGGED', result: 'GREEN', ctx: merged };
    return { next: 'BREATHING_CHECK', ctx: merged };
  }

  if (state === 'BREATHING_CHECK') {
    if (merged.breathing) return { next: 'RESPIRATORY_RATE', ctx: merged };
    return { next: 'AIRWAY_REPOSITION', ctx: merged };
  }

  if (state === 'AIRWAY_REPOSITION') {
    if (!merged.airwayOk) return { next: 'TAGGED', result: 'BLACK', ctx: merged };
    return { next: 'RESPIRATORY_RATE', ctx: merged };
  }

  if (state === 'RESPIRATORY_RATE') {
    if (merged.respiratoryRateOver30) return { next: 'TAGGED', result: 'RED', ctx: merged };
    return { next: 'PERFUSION_CHECK', ctx: merged };
  }

  if (state === 'PERFUSION_CHECK') {
    if (!merged.capillaryRefillOk) return { next: 'TAGGED', result: 'RED', ctx: merged };
    return { next: 'MENTAL_STATUS', ctx: merged };
  }

  if (state === 'MENTAL_STATUS') {
    if (!merged.followsCommands) return { next: 'TAGGED', result: 'RED', ctx: merged };
    return { next: 'TAGGED', result: 'YELLOW', ctx: merged };
  }

  return { next: 'TAGGED', ctx: merged };
}

export const TRIAGE_META: Record<
  TriageColor,
  { label: string; sub: string; color: string }
> = {
  RED: { label: 'IMMEDIATE', sub: 'Trauma center routing', color: '#FB7185' },
  YELLOW: { label: 'DELAYED', sub: 'Hospital with ER', color: '#FBBF24' },
  GREEN: { label: 'MINOR', sub: 'Walking wounded', color: '#6EE7B7' },
  BLACK: { label: 'DECEASED', sub: 'Notify 108 / police', color: '#64748B' },
};
