/**
 * Piwowar (Brewcraft) — Recipes Screen (DEC-02, BR-XML-001..002, BR-REC-001)
 * Recipe library, BeerXML import/export, and instant volume scaling.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { openAppDatabase } from '../../lib/db/database';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  deleteRecipe
} from '../../lib/db/repositories/recipeRepository';
import { parseBeerXml, exportRecipeToBeerXml } from '../../lib/beerxml';
import { scaleRecipe } from '../../lib/brewing/recipeScaling';
import { useUndoStore } from '../../lib/store/undoStore';
import { CraftHeader } from '../../components/CraftHeader';
import { CraftCard } from '../../components/CraftCard';
import { CraftButton } from '../../components/CraftButton';
import { CraftInput } from '../../components/CraftInput';
import { CraftModal } from '../../components/CraftModal';
import { Recipe, FullRecipe } from '../../lib/types/domain';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

const SAMPLE_IMPORT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Grodziskie Legend</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <BATCH_SIZE>20.0</BATCH_SIZE>
    <BOIL_SIZE>24.0</BOIL_SIZE>
    <BOIL_TIME>60.0</BOIL_TIME>
    <EST_OG>1.031</EST_OG>
    <EST_FG>1.008</EST_FG>
    <IBU>25.0</IBU>
    <EST_COLOR>2.5</EST_COLOR>
    <EST_ABV>3.0</EST_ABV>
    <NOTES>Tradycyjne polskie piwo wędzone dębem.</NOTES>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Słód Pszeniczny Wędzony Dębem</NAME>
        <AMOUNT>2.600</AMOUNT>
        <COLOR>2.0</COLOR>
        <POTENTIAL>1.036</POTENTIAL>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>Tomyski</NAME>
        <ALPHA>4.0</ALPHA>
        <AMOUNT>0.0300</AMOUNT>
        <USE>Boil</USE>
        <TIME>60.0</TIME>
        <FORM>Pellet</FORM>
      </HOP>
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>WLP036 Grodziskie</NAME>
        <FORM>Liquid</FORM>
        <ATTENUATION>76.0</ATTENUATION>
        <MIN_TEMPERATURE>18.0</MIN_TEMPERATURE>
        <MAX_TEMPERATURE>22.0</MAX_TEMPERATURE>
      </YEAST>
    </YEASTS>
  </RECIPE>
</RECIPES>`;

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [xmlInput, setXmlInput] = useState(SAMPLE_IMPORT_XML);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportedXml, setExportedXml] = useState('');
  const [scaleModalVisible, setScaleModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [targetVolumeStr, setTargetVolumeStr] = useState('10.0');

  const { showUndo } = useUndoStore();

  const loadAll = async () => {
    const db = await openAppDatabase();
    const list = await getAllRecipes(db);
    setRecipes(list);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleImportXml = async () => {
    try {
      const parsedRecipes = parseBeerXml(xmlInput);
      if (parsedRecipes.length === 0) {
        Alert.alert('Błąd', 'Nie znaleziono poprawnych znaczników <RECIPE> w pliku BeerXML.');
        return;
      }

      const db = await openAppDatabase();
      for (const r of parsedRecipes) {
        await createRecipe(db, r);
      }

      setImportModalVisible(false);
      await loadAll();
      Alert.alert('Sukces', `Pomyślnie zaimportowano ${parsedRecipes.length} recepturę(y).`);
    } catch (err: any) {
      Alert.alert('Błąd importu', err.message || 'Niepoprawny format XML.');
    }
  };

  const handleExportRecipe = async (r: Recipe) => {
    const db = await openAppDatabase();
    const full = await getRecipeById(db, r.id);
    if (!full) return;

    const xml = exportRecipeToBeerXml(full);
    setExportedXml(xml);
    setExportModalVisible(true);
  };

  const handleOpenScale = async (r: Recipe) => {
    const db = await openAppDatabase();
    const full = await getRecipeById(db, r.id);
    if (!full) return;

    setSelectedRecipe(full);
    setTargetVolumeStr(String(full.target_volume_l / 2));
    setScaleModalVisible(true);
  };

  const handleExecuteScale = async () => {
    if (!selectedRecipe) return;
    const newVol = parseFloat(targetVolumeStr);
    if (isNaN(newVol) || newVol <= 0) return;

    const scaled = scaleRecipe(selectedRecipe, newVol);
    scaled.id = `rec-scaled-${Date.now()}`;
    scaled.name = `${selectedRecipe.name} (${newVol} L)`;

    const db = await openAppDatabase();
    await createRecipe(db, scaled);
    setScaleModalVisible(false);
    await loadAll();
    Alert.alert('Przeskalowano', `Utworzono przeskalowaną kopię receptury: ${scaled.name}`);
  };

  const handleDeleteRecipe = async (r: Recipe) => {
    const db = await openAppDatabase();
    const full = await getRecipeById(db, r.id);
    if (!full) return;

    await deleteRecipe(db, r.id);
    await loadAll();

    showUndo(`Usunięto ${r.name}`, async () => {
      await createRecipe(db, full);
      await loadAll();
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CraftHeader
        title={t('recipes_title')}
        actionButton={{
          label: 'Import BeerXML',
          accessibilityLabel: 'Importuj BeerXML',
          onPress: () => setImportModalVisible(true)
        }}
      />

      <View style={styles.content}>
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('recipes_empty')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CraftCard>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeTitle}>{item.name}</Text>
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceText}>{item.source.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.specsRow}>
                <Text style={styles.specItem}>Objętość: {item.target_volume_l} L</Text>
                <Text style={styles.specItem}>OG: {item.target_og_sg}</Text>
                <Text style={styles.specItem}>IBU: {item.target_ibu}</Text>
                <Text style={styles.specItem}>SRM: {item.target_srm}</Text>
                <Text style={styles.specItem}>ABV: {item.target_abv}%</Text>
              </View>

              {item.notes && <Text style={styles.recipeNotes}>{item.notes}</Text>}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionLink}
                  onPress={() => handleExportRecipe(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Eksportuj BeerXML"
                >
                  <Text style={styles.actionLinkText}>Eksport XML</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionLink}
                  onPress={() => handleOpenScale(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Skaluj objętość warki"
                >
                  <Text style={styles.actionLinkText}>Skaluj objętość</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionLink}
                  onPress={() => handleDeleteRecipe(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń recepturę ${item.name}`}
                >
                  <Text style={styles.deleteText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            </CraftCard>
          )}
        />
      </View>

      {/* Import BeerXML Modal */}
      <CraftModal
        visible={importModalVisible}
        title="Importuj BeerXML 1.0"
        submitLabel="Importuj"
        onCancel={() => setImportModalVisible(false)}
        onSubmit={handleImportXml}
        isDirty={xmlInput.length > 0}
      >
        <Text style={styles.modalHelper}>
          Wklej treść pliku BeerXML wyeksportowanego z Brewfather, BeerSmith lub Grainfather:
        </Text>
        <CraftInput
          label="Treść XML"
          value={xmlInput}
          onChangeText={setXmlInput}
          multiline
          numberOfLines={8}
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
      </CraftModal>

      {/* Export BeerXML Modal */}
      <CraftModal
        visible={exportModalVisible}
        title="Eksport BeerXML 1.0"
        submitLabel="Zamknij"
        onCancel={() => setExportModalVisible(false)}
        onSubmit={() => setExportModalVisible(false)}
      >
        <Text style={styles.modalHelper}>
          Skopiuj poniższy plik XML zgodny ze standardem BeerXML 1.0:
        </Text>
        <CraftInput
          label="Wygenerowany plik XML"
          value={exportedXml}
          multiline
          numberOfLines={10}
          editable={false}
          style={{ minHeight: 160, textAlignVertical: 'top' }}
        />
      </CraftModal>

      {/* Recipe Scaling Modal */}
      <CraftModal
        visible={scaleModalVisible}
        title="Skaluj Objętość Warki"
        submitLabel="Przelicz"
        onCancel={() => setScaleModalVisible(false)}
        onSubmit={handleExecuteScale}
      >
        <Text style={styles.modalHelper}>
          Podaj nową objętość warki. Gramatury słodów i chmieli zostaną automatycznie
          przeliczone proporcjonalnie, z zachowaniem docelowej gęstości OG oraz goryczki IBU.
        </Text>
        <CraftInput
          label="Nowa objętość warki"
          unit="L"
          value={targetVolumeStr}
          onChangeText={setTargetVolumeStr}
          keyboardType="numeric"
        />
      </CraftModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgCanvas
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center'
  },
  emptyText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center'
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  recipeTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    flex: 1
  },
  sourceBadge: {
    backgroundColor: THEME.colors.bgElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle
  },
  sourceText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700'
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6
  },
  specItem: {
    color: THEME.colors.accentPrimary,
    fontSize: 12,
    fontWeight: '700'
  },
  recipeNotes: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle
  },
  actionLink: {
    paddingVertical: 4
  },
  actionLinkText: {
    color: THEME.colors.accentPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  deleteText: {
    color: THEME.colors.statusDanger,
    fontSize: 13,
    fontWeight: '600'
  },
  modalHelper: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18
  }
});
