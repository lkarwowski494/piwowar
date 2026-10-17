/**
 * Piwowar (Brewcraft) — Brew Day Active Session Store (Zustand)
 * Manages timers, multi-stage mashing & boiling steps, hop addition alerts, and Thumb Zone state.
 */

import { create } from 'zustand';
import { FullRecipe, MashStep, RecipeHop } from '../types/domain';

export type BrewStage = 'idle' | 'mashing' | 'boiling' | 'whirlpool' | 'done';

export interface BrewStepItem {
  id: string;
  name: string;
  tempC?: number;
  durationMins: number;
  type: 'mash' | 'boil' | 'whirlpool';
  hopAddition?: { name: string; weightG: number };
}

export interface BrewState {
  isActive: boolean;
  stage: BrewStage;
  recipe: FullRecipe | null;
  currentStepIndex: number;
  steps: BrewStepItem[];
  secondsRemaining: number;
  isRunning: boolean;
  hopAlert: { name: string; weightG: number } | null;

  startBrew: (recipe: FullRecipe) => void;
  pauseResume: () => void;
  nextStep: () => void;
  prevStep: () => void;
  adjustSeconds: (deltaSeconds: number) => void;
  tick: () => void;
  dismissHopAlert: () => void;
  stopBrew: () => void;
}

export const useBrewStore = create<BrewState>((set, get) => ({
  isActive: false,
  stage: 'idle',
  recipe: null,
  currentStepIndex: 0,
  steps: [],
  secondsRemaining: 0,
  isRunning: false,
  hopAlert: null,

  startBrew: (recipe: FullRecipe) => {
    const steps: BrewStepItem[] = [];

    // 1. Add Mash steps
    const mashSteps: MashStep[] = recipe.mash_profile?.steps || [
      { name: 'Zacieranie główne', step_temp_c: 67, step_time_mins: 60 },
      { name: 'Wygrzew (Mash Out)', step_temp_c: 78, step_time_mins: 10 }
    ];

    mashSteps.forEach((s, idx) => {
      steps.push({
        id: `step-mash-${idx}`,
        name: s.name,
        tempC: s.step_temp_c,
        durationMins: s.step_time_mins,
        type: 'mash'
      });
    });

    // 2. Add Boil step (with hops)
    const boilHops = recipe.hops.filter((h) => h.use_stage === 'boil');
    steps.push({
      id: 'step-boil-main',
      name: 'Gotowanie brzeczki (60 min)',
      tempC: 100,
      durationMins: 60,
      type: 'boil'
    });

    // 3. Add Whirlpool step if any whirlpool hops
    const whirlpoolHops = recipe.hops.filter((h) => h.use_stage === 'whirlpool');
    if (whirlpoolHops.length > 0) {
      steps.push({
        id: 'step-whirlpool',
        name: 'Chłodzenie & Whirlpool (80°C)',
        tempC: 80,
        durationMins: 20,
        type: 'whirlpool'
      });
    }

    const firstStep = steps[0];
    const initialSeconds = (firstStep?.durationMins || 60) * 60;

    set({
      isActive: true,
      stage: 'mashing',
      recipe,
      currentStepIndex: 0,
      steps,
      secondsRemaining: initialSeconds,
      isRunning: false,
      hopAlert: null
    });
  },

  pauseResume: () => {
    set((state) => ({ isRunning: !state.isRunning }));
  },

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    const nextIdx = currentStepIndex + 1;

    if (nextIdx >= steps.length) {
      set({ stage: 'done', isRunning: false, secondsRemaining: 0 });
      return;
    }

    const nextStepItem = steps[nextIdx];
    const nextStage: BrewStage =
      nextStepItem.type === 'mash'
        ? 'mashing'
        : nextStepItem.type === 'boil'
        ? 'boiling'
        : 'whirlpool';

    set({
      currentStepIndex: nextIdx,
      stage: nextStage,
      secondsRemaining: nextStepItem.durationMins * 60,
      isRunning: false,
      hopAlert: null
    });
  },

  prevStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex <= 0) return;

    const prevIdx = currentStepIndex - 1;
    const prevItem = steps[prevIdx];
    const prevStage: BrewStage =
      prevItem.type === 'mash'
        ? 'mashing'
        : prevItem.type === 'boil'
        ? 'boiling'
        : 'whirlpool';

    set({
      currentStepIndex: prevIdx,
      stage: prevStage,
      secondsRemaining: prevItem.durationMins * 60,
      isRunning: false,
      hopAlert: null
    });
  },

  adjustSeconds: (deltaSeconds: number) => {
    set((state) => ({
      secondsRemaining: Math.max(0, state.secondsRemaining + deltaSeconds)
    }));
  },

  tick: () => {
    const { isRunning, secondsRemaining, stage, recipe } = get();
    if (!isRunning) return;

    if (secondsRemaining <= 1) {
      get().nextStep();
      return;
    }

    // Check for boil hop alert (e.g. at 15 minutes left, etc.)
    if (stage === 'boiling' && recipe) {
      const minutesLeft = Math.round((secondsRemaining - 1) / 60);
      const matchingHop = recipe.hops.find(
        (h) => h.use_stage === 'boil' && h.boil_time_mins === minutesLeft
      );
      if (matchingHop && (secondsRemaining - 1) % 60 === 0) {
        set({ hopAlert: { name: matchingHop.name, weightG: matchingHop.weight_g } });
      }
    }

    set({ secondsRemaining: secondsRemaining - 1 });
  },

  dismissHopAlert: () => set({ hopAlert: null }),

  stopBrew: () =>
    set({
      isActive: false,
      stage: 'idle',
      recipe: null,
      currentStepIndex: 0,
      steps: [],
      secondsRemaining: 0,
      isRunning: false,
      hopAlert: null
    })
}));
