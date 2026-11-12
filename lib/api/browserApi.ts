import { ApiClient } from "@/lib/api/ApiClient";
import { MarkdownReaderApi } from "@/lib/api/MarkdownReaderApi";
import { getSupabase } from "@/lib/auth/supabaseBrowser";

let api: MarkdownReaderApi | undefined;

// Shared API instance; the access token always comes from the supabase-js session.
export function getApi(): MarkdownReaderApi {
  api ??= new MarkdownReaderApi(
    new ApiClient({
      baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      getToken: async () => {
        try {
          return (await getSupabase().auth.getSession()).data.session?.access_token;
        } catch {
          return undefined;
        }
      },
    }),
  );
  return api;
}
