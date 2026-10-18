/**
 * Piwowar (Brewcraft) — Recipes Screen (DEC-02, BR-XML-001..002, BR-REC-001)
 * Recipe library, BeerXML import/export, P2P QR Recipe sharing (Z-049), and instant volume scaling.
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
import { encodeRecipeToQrPayload, decodeRecipeFromQrPayload } from '../../lib/brewing/recipeQr';
import { useUndoStore } from '../../lib/store/undoStore';
import { CraftHeader } from '../../components/CraftHeader';
import { CraftCard } from '../../components/CraftCard';
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

  // P2P QR state (Z-049)
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrPayloadString, setQrPayloadString] = useState('');
  const [qrImportInput, setQrImportInput] = useState('');
  const [qrImportModalVisible, setQrImportModalVisible] = useState(false);

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
    if (!xmlInput.trim()) return;

    try {
      const parsedRecipes = parseBeerXml(xmlInput);
      if (parsedRecipes.length === 0) {
        Alert.alert('Błąd', 'Nie znaleziono poprawnych receptur w podanym pliku XML.');
        return;
      }

      const db = await openAppDatabase();
      for (const r of parsedRecipes) {
        await createRecipe(db, r);
      }

      setImportModalVisible(false);
      await loadAll();
      Alert.alert('Sukces', `Zaimportowano ${parsedRecipes.length} receptur BeerXML.`);
    } catch {
      Alert.alert('Błąd parsera', 'Nie udało się przetworzyć pliku BeerXML.');
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

  // Z-049: Share Recipe via P2P QR
  const handleShareQr = async (r: Recipe) => {
    const db = await openAppDatabase();
    const full = await getRecipeById(db, r.id);
    if (!full) return;

    const qrPayload = encodeRecipeToQrPayload(full);
    setQrPayloadString(qrPayload);
    setQrModalVisible(true);
  };

  // Z-049: Import Recipe via P2P QR
  const handleImportQr = async () => {
    if (!qrImportInput.trim()) return;

    const recipe = decodeRecipeFromQrPayload(qrImportInput.trim());
    if (!recipe) {
      Alert.alert('Błąd', 'Nieprawidłowy kod lub link receptury P2P.');
      return;
    }

    const db = await openAppDatabase();
    await createRecipe(db, recipe);
    setQrImportModalVisible(false);
    setQrImportInput('');
    await loadAll();
    Alert.alert('Sukces', `Zaimportowano recepturę z kodu QR: ${recipe.name}`);
  };

  const handleOpenScale = async (r: Recipe) => {
    const db = await openAppDatabase();
    const full = await getRecipeById(db, r.id);
    if (!full) return;

    setSelectedRecipe(full);
    setTargetVolumeStr(String(full.target_volume_l));
    setScaleModalVisible(true);
  };

  const handleExecuteScale = async () => {
    if (!selectedRecipe) return;

    const newVol = parseFloat(targetVolumeStr);
    if (isNaN(newVol) || newVol <= 0) {
      Alert.alert('Błąd', 'Podaj prawidłową objętość w litrach (większą od zera).');
      return;
    }

    const scaled = scaleRecipe(selectedRecipe, newVol);
    scaled.id = `recipe-${Date.now()}`;
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
          label: 'Importuj',
          accessibilityLabel: 'Importuj recepturę',
          onPress: () => setImportModalVisible(true)
        }}
      />

      <View style={styles.content}>
        {/* Secondary action row */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.p2pButton}
            onPress={() => setQrImportModalVisible(true)}
          >
            <Text style={styles.p2pButtonText}>📥 Import z kodu QR (P2P)</Text>
          </TouchableOpacity>
        </View>

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
                  onPress={() => handleShareQr(item)}
                >
                  <Text style={[styles.actionLinkText, { color: THEME.colors.primary }]}>
                    📱 Kod QR (P2P)
                  </Text>
                </TouchableOpacity>

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
                  <Text style={styles.actionLinkText}>Skaluj</Text>
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

      {/* P2P QR Share Modal (Z-049) */}
      <CraftModal
        visible={qrModalVisible}
        title="Udostępnij przez Kod QR (P2P)"
        submitLabel="Gotowe"
        onCancel={() => setQrModalVisible(false)}
        onSubmit={() => setQrModalVisible(false)}
      >
        <Text style={styles.modalHelper}>
          Pokaż ten ciąg lub kod drugiemu piwowarowi na spotkaniu, aby zaimportował pełną recepturę w 100% offline:
        </Text>
        <CraftInput
          label="Ciąg wymiany P2P"
          value={qrPayloadString}
          multiline
          numberOfLines={6}
          editable={false}
          style={{ minHeight: 100, textAlignVertical: 'top', fontSize: 11 }}
        />
      </CraftModal>

      {/* P2P QR Import Modal (Z-049) */}
      <CraftModal
        visible={qrImportModalVisible}
        title="Importuj z Kodu QR (P2P)"
        submitLabel="Zaimportuj"
        onCancel={() => setQrImportModalVisible(false)}
        onSubmit={handleImportQr}
        isDirty={qrImportInput.length > 0}
      >
        <Text style={styles.modalHelper}>
          Wklej ciąg receptury (zaczynający się od piwowar://recipe?d=...):
        </Text>
        <CraftInput
          label="Ciąg P2P QR"
          value={qrImportInput}
          onChangeText={setQrImportInput}
          placeholder="piwowar://recipe?d=..."
          multiline
          numberOfLines={6}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
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
  secondaryRow: {
    marginBottom: 12
  },
  p2pButton: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center'
  },
  p2pButtonText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
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
    gap: 12,
    marginVertical: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.colors.borderSubtle
  },
  specItem: {
    color: THEME.colors.accentPrimary,
    fontSize: 12,
    fontWeight: '600'
  },
  recipeNotes: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 6
  },
  actionLink: {
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  actionLinkText: {
    color: THEME.colors.accentPrimary,
    fontSize: 12,
    fontWeight: '600'
  },
  deleteText: {
    color: THEME.colors.statusDanger,
    fontSize: 12,
    fontWeight: '600'
  },
  modalHelper: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18
  }
});
