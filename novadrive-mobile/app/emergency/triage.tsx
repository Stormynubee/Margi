import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { AnswerChips } from '../../src/components/AnswerChips';
import { EmergencyStepShell } from '../../src/components/EmergencyStepShell';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { useApp, getQuestion } from '../../src/context/AppContext';
import {
  EMERGENCY_ACTIVATION_PATH,
  EMERGENCY_RESPONSE_PATH,
  shouldGateTriageWithoutIncident,
} from '../../src/lib/emergency/emergencyNavigation';
import { MedicalDisclaimerBanner } from '../../src/components/MedicalDisclaimerBanner';
import { speakFsmPrompt } from '../../src/lib/tts/narrator';
import { tokens } from '../../src/theme/tokens';

function triagePromptForLanguage(
  question: NonNullable<ReturnType<typeof getQuestion>>,
  language: string
): string {
  if (language === 'hi' && question.promptHi) return question.promptHi;
  if (language === 'ta' && question.promptTa) return question.promptTa;
  return question.prompt;
}

function triageOptionForLanguage(
  option: { label: string; labelHi?: string; labelTa?: string },
  language: string
): string {
  if (language === 'hi' && option.labelHi) return option.labelHi;
  if (language === 'ta' && option.labelTa) return option.labelTa;
  return option.label;
}

const TRIAGE_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    step: "Triage",
    title: "START assessment",
    subtitle: "Answer each question for triage color tagging.",
    completeTitle: "Triage complete",
    completeSubtitle: "Routing to trauma response.",
    completeCard: "Assessment recorded. Proceed to response.",
    continue: "Continue",
  },
  hi: {
    step: "ट्राइएज",
    title: "START मूल्यांकन",
    subtitle: "ट्राइएज रंग टैगिंग के लिए प्रत्येक प्रश्न का उत्तर दें।",
    completeTitle: "मूल्यांकन पूर्ण",
    completeSubtitle: "ट्रॉमा रिस्पॉन्स पर निर्देशित किया जा रहा है।",
    completeCard: "मूल्यांकन दर्ज किया गया। आगे बढ़ें।",
    continue: "आगे बढ़ें",
  },
  ta: {
    step: "ட்ரைஏஜ்",
    title: "START மதிப்பீடு",
    subtitle: "ட்ரைஏஜ் வண்ணக் குறியீட்டுக்கு ஒவ்வொரு கேள்விக்கும் பதிலளிக்கவும்.",
    completeTitle: "மதிப்பீடு முடிந்தது",
    completeSubtitle: "அதிர்ச்சி பதிலுக்கு வழிநடத்துகிறது.",
    completeCard: "மதிப்பீடு பதிவு செய்யப்பட்டது. தொடரவும்.",
    continue: "தொடரவும்",
  }
};

/**
 * START triage FSM — spoken prompts when accessibility TTS is enabled.
 */
export default function TriageScreen() {
  const {
    session,
    triageState,
    triageResult,
    answerTriage,
    a11y,
    settings,
  } = useApp();

  const question = getQuestion(triageState);
  const langKey = settings.language === 'hi' || settings.language === 'ta' ? settings.language : 'en';
  const t = TRIAGE_TRANSLATIONS[langKey];

  useEffect(() => {
    if (shouldGateTriageWithoutIncident(session.incidentType)) {
      router.replace(EMERGENCY_ACTIVATION_PATH as Href);
      return;
    }
    if (triageResult) {
      router.replace(EMERGENCY_RESPONSE_PATH as Href);
      return;
    }
  }, [session.incidentType, triageResult]);

  useEffect(() => {
    if (!question || triageResult) return;
    speakFsmPrompt(triageState, (settings.language === 'hi' || settings.language === 'ta') ? settings.language : 'en', { ttsEnabled: a11y.ttsEnabled });
  }, [triageState, question, a11y.ttsEnabled, settings.language, triageResult]);

  if (shouldGateTriageWithoutIncident(session.incidentType) || triageResult) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.background }} />
    );
  }

  if (!question) {
    return (
      <EmergencyStepShell
        step={t.step}
        title={t.completeTitle}
        subtitle={t.completeSubtitle}
        showBack
        footer={
          <MargiButton
            label={t.continue}
            large
            onPress={() => router.replace(EMERGENCY_RESPONSE_PATH as Href)}
          />
        }
      >
        <HudCard accent="tertiary">
          <HudText variant="bodyMd">{t.completeCard}</HudText>
        </HudCard>
      </EmergencyStepShell>
    );
  }

  return (
    <EmergencyStepShell
      step={t.step}
      title={t.title}
      subtitle={t.subtitle}
      showBack
    >
      <MedicalDisclaimerBanner compact />
      <HudCard accent="primary">
        <HudText variant="headlineMd" style={{ color: tokens.primary, marginBottom: 8 }}>
          {triagePromptForLanguage(question, settings.language)}
        </HudText>
        {a11y.ttsEnabled ? (
          <HudText variant="mono" style={{ color: tokens.secondary, marginBottom: 12 }}>
            TTS narrator on
          </HudText>
        ) : null}
        <AnswerChips
          options={question.options.map((o) => ({
            ...o,
            label: triageOptionForLanguage(o, settings.language),
          }))}
          onSelect={(value) => answerTriage(value)}
        />
      </HudCard>
    </EmergencyStepShell>
  );
}
