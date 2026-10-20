import { DesignDocument, DocumentType } from '../types/design';
import { 
  STARTER_PITCH_DECK, 
  STARTER_BROCHURE, 
  STARTER_ONE_PAGER, 
  STARTER_FLYER 
} from './templates';

const STORAGE_KEY = 'prearn_gamma_projects_v4';
const INITIALIZED_KEY = 'prearn_gamma_seeded_v4';

export const storageService = {
  loadAll(): DesignDocument[] {
    try {
      const isInitialized = localStorage.getItem(INITIALIZED_KEY);
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!isInitialized) {
        // First run: seed defaults and mark initialized
        const defaults = [
          STARTER_PITCH_DECK, 
          STARTER_BROCHURE, 
          STARTER_ONE_PAGER, 
          STARTER_FLYER
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        localStorage.setItem(INITIALIZED_KEY, 'true');
        return defaults;
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (err) {
      console.error('Failed to load projects from storage:', err);
      return [STARTER_PITCH_DECK];
    }
  },

  save(doc: DesignDocument): void {
    try {
      const all = this.loadAll();
      const existingIdx = all.findIndex(d => d.id === doc.id);
      const updatedDoc = { ...doc, updatedAt: new Date().toISOString() };

      if (existingIdx !== -1) {
        all[existingIdx] = updatedDoc;
      } else {
        all.unshift(updatedDoc);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  },

  delete(id: string): DesignDocument | null {
    try {
      const all = this.loadAll();
      const toDelete = all.find(d => d.id === id) || null;
      const filtered = all.filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return toDelete;
    } catch (err) {
      console.error('Failed to delete project:', err);
      return null;
    }
  },

  duplicate(id: string): DesignDocument | null {
    try {
      const all = this.loadAll();
      const target = all.find(d => d.id === id);
      if (!target) return null;

      const cloned: DesignDocument = {
        ...JSON.parse(JSON.stringify(target)),
        id: `deck-${Date.now()}`,
        title: `${target.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      all.unshift(cloned);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return cloned;
    } catch (err) {
      console.error('Failed to duplicate project:', err);
      return null;
    }
  },

  restore(doc: DesignDocument): void {
    try {
      const all = this.loadAll();
      all.unshift(doc);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.error('Failed to restore project:', err);
    }
  }
};
