import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SourcingProspect, SourcingRunRecord, SourcingStoreData } from "../types.js";
import { createEmptyStore, LocalSourcingStore, normalizeStore, type SourcingStore } from "./jsonStore.js";

const STORE_TABLE = "sourcing_dashboard_store";

type StoreRow = {
  id: string;
  data: Partial<SourcingStoreData>;
  updated_at: string;
};

export class SupabaseSourcingStore implements SourcingStore {
  private readonly client: SupabaseClient;
  private readonly storeId: string;

  constructor(url: string, serviceRoleKey: string, storeId = process.env.SUPABASE_STORE_ID ?? "default") {
    this.storeId = storeId;
    this.client = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  async read(): Promise<SourcingStoreData> {
    const { data, error } = await this.client.from(STORE_TABLE).select("data").eq("id", this.storeId).maybeSingle<StoreRow>();
    if (error) throw new Error(`Supabase store read failed: ${error.message}`);
    if (!data) return this.write(createEmptyStore());
    return normalizeStore(data.data);
  }

  async write(data: SourcingStoreData): Promise<SourcingStoreData> {
    const next = normalizeStore({
      ...data,
      updatedAt: new Date().toISOString()
    });
    const { data: row, error } = await this.client
      .from(STORE_TABLE)
      .upsert(
        {
          id: this.storeId,
          data: next,
          updated_at: next.updatedAt
        },
        { onConflict: "id" }
      )
      .select("data")
      .single<StoreRow>();

    if (error) throw new Error(`Supabase store write failed: ${error.message}`);
    return normalizeStore(row.data);
  }

  async upsertRun(run: SourcingRunRecord, prospects: SourcingProspect[]): Promise<SourcingStoreData> {
    const current = await this.read();
    const prospectIds = new Set(prospects.map((prospect) => prospect.id));
    const preservedProspects = current.prospects.filter((prospect) => !prospectIds.has(prospect.id));
    const runs = [run, ...current.runs.filter((item) => item.id !== run.id)].slice(0, 25);
    const agentSteps = [...run.agentSteps, ...current.agentSteps].slice(0, 100);
    return this.write({
      ...current,
      runs,
      prospects: [...prospects, ...preservedProspects],
      agentSteps
    });
  }

  async updateProspect(prospect: SourcingProspect): Promise<SourcingStoreData> {
    const current = await this.read();
    return this.write({
      ...current,
      prospects: current.prospects.map((item) => (item.id === prospect.id ? prospect : item))
    });
  }
}

export function createSourcingStore(): SourcingStore {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (url && serviceRoleKey) {
    return new SupabaseSourcingStore(url, serviceRoleKey);
  }

  return new LocalSourcingStore();
}
