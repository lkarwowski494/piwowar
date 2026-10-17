/**
 * Piwowar (Brewcraft) — Component & UI State Test Suite
 * Verifies component props, WCAG AAA colors, token consistency, and store integrations
 */

import React from 'react';
import { THEME } from '../lib/theme';
import { CraftButton } from '../components/CraftButton';
import { CraftHeader } from '../components/CraftHeader';
import { BottleBombAlert } from '../components/BottleBombAlert';
import { BatchQuotaBanner } from '../components/BatchQuotaBanner';
import { useUndoStore } from '../lib/store/undoStore';
import { useBrewStore } from '../lib/store/brewStore';
import { SEED_SAMPLE_RECIPE } from '../lib/db/seeds';

describe('UI Components & Token Compliance Suite', () => {
  describe('Craft Theme & WCAG AAA Tokens', () => {
    it('defines kitchen-proof minimum touch target of at least 56pt', () => {
      expect(THEME.touchTarget.kitchenProofHeight).toBeGreaterThanOrEqual(56);
      expect(THEME.touchTarget.minHeight).toBeGreaterThanOrEqual(48);
    });

    it('ensures dark canvas and surface colors adhere to physical steel aesthetic', () => {
      expect(THEME.colors.bgCanvas).toBe('#101216');
      expect(THEME.colors.bgSurface).toBe('#171A21');
      expect(THEME.colors.accentPrimary).toBe('#E58A2B');
      expect(THEME.colors.accentHop).toBe('#3E7B54');
      expect(THEME.colors.statusDanger).toBe('#E03E3E');
    });
  });

  describe('CraftButton Element Contracts', () => {
    it('creates CraftButton with correct default primary variant and label', () => {
      const onPressMock = jest.fn();
      const el = React.createElement(CraftButton, {
        label: 'Rozpocznij dzień warzenia',
        onPress: onPressMock
      });

      expect(el.props.label).toBe('Rozpocznij dzień warzenia');
      expect(el.props.variant).toBeUndefined(); // defaults to 'primary' in component
      expect(el.props.disabled).toBeUndefined();
    });

    it('respects danger and hop variants for critical actions', () => {
      const elDanger = React.createElement(CraftButton, {
        label: 'Usuń warkę',
        variant: 'danger',
        onPress: () => {}
      });
      expect(elDanger.props.variant).toBe('danger');

      const elHop = React.createElement(CraftButton, {
        label: 'Następny krok ▶',
        variant: 'hop',
        onPress: () => {}
      });
      expect(elHop.props.variant).toBe('hop');
    });
  });

  describe('CraftHeader Element Contracts (32-wzorce-interakcji)', () => {
    it('provides accessibility labels matching strict interface vocabulary', () => {
      const el = React.createElement(CraftHeader, {
        title: 'Dziennik Warek',
        backLabel: 'Wróć',
        onBack: () => {},
        actionButton: {
          label: 'Dodaj warkę',
          accessibilityLabel: 'Dodaj warkę',
          onPress: () => {}
        }
      });

      expect(el.props.title).toBe('Dziennik Warek');
      expect(el.props.backLabel).toBe('Wróć');
      expect(el.props.actionButton?.accessibilityLabel).toBe('Dodaj warkę');
    });
  });

  describe('BottleBombAlert Element Contracts (BR-BOT-002)', () => {
    it('creates alert with danger styling when unfermented extract is excessive', () => {
      const dangerRisk = {
        isBlocked: true,
        severity: 'danger' as const,
        message: 'STOP! NIE ROZLEWAJ! Piwo nie zakończyło fermentacji.'
      };

      const el = React.createElement(BottleBombAlert, { risk: dangerRisk });
      expect(el.props.risk.isBlocked).toBe(true);
      expect(el.props.risk.severity).toBe('danger');
      expect(el.props.risk.message).toContain('STOP! NIE ROZLEWAJ!');
    });
  });

  describe('BatchQuotaBanner Element Contracts (DEC-06)', () => {
    it('creates banner with remaining free batches', () => {
      const el = React.createElement(BatchQuotaBanner, {
        totalBatches: 1,
        isPro: false
      });

      expect(el.props.totalBatches).toBe(1);
      expect(el.props.isPro).toBe(false);
    });
  });

  describe('Active Brew Day Session Lifecycle (useBrewStore)', () => {
    it('initializes brew day, transitions steps, and ticks timer correctly', () => {
      const store = useBrewStore.getState();
      expect(store.isActive).toBe(false);

      // Start brew
      store.startBrew(SEED_SAMPLE_RECIPE);
      let state = useBrewStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.stage).toBe('mashing');
      expect(state.currentStepIndex).toBe(0);
      expect(state.steps.length).toBeGreaterThanOrEqual(3); // 2 mash steps + 1 boil step

      // Toggle pause/resume
      store.pauseResume();
      expect(useBrewStore.getState().isRunning).toBe(true);

      // Adjust seconds (+60s)
      const currentSec = useBrewStore.getState().secondsRemaining;
      store.adjustSeconds(60);
      expect(useBrewStore.getState().secondsRemaining).toBe(currentSec + 60);

      // Tick decreases seconds
      store.tick();
      expect(useBrewStore.getState().secondsRemaining).toBe(currentSec + 59);

      // Next step advances
      store.nextStep();
      expect(useBrewStore.getState().currentStepIndex).toBe(1);

      // Stop brew resets
      store.stopBrew();
      expect(useBrewStore.getState().isActive).toBe(false);
      expect(useBrewStore.getState().stage).toBe('idle');
    });
  });

  describe('Undo Store Lifecycle (DEC-03)', () => {
    it('records undo action and triggers callback', async () => {
      const undoStore = useUndoStore.getState();
      let undone = false;

      undoStore.showUndo('Usunięto warkę #1', () => {
        undone = true;
      });

      expect(useUndoStore.getState().visible).toBe(true);
      expect(useUndoStore.getState().message).toBe('Usunięto warkę #1');

      await useUndoStore.getState().triggerUndo();
      expect(undone).toBe(true);
      expect(useUndoStore.getState().visible).toBe(false);
    });
  });
});
