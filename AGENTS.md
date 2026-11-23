<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- App content (clips, movies, anime, cartoons, manga) lives in `src/lib/content.ts` as static data, including the short-video length rule; pages import it directly.
- Messaging is the only backend feature: Lovable Cloud tables (profiles, conversations, conversation_participants, messages) guarded by RLS via `is_participant`; one-to-one chats are created only through the `start_conversation` RPC so duplicates can't happen.
- Live chat updates use a private per-user broadcast topic `user:<id>` rung by a trigger on new messages (not postgres_changes), so each client keeps one channel; the client just refetches the affected queries.
- Chat data helpers and query keys live in `src/lib/chat.ts`; the Mesaje page reads data in the browser because it needs the signed-in session.
- Top-menu sections share `SectionLayout` + `TopTabs`; list rows use `PosterRow` with lazy images so long lists stay light.
- The home feed (`src/components/VideoFeed.tsx`) owns playback: one active slide chosen by IntersectionObserver, every other `<video>` stays `preload="none"` and paused, so phones never decode more than one video.
- Sample videos are self-hosted in `public/videos/` and images are small WebP files in `src/assets/`, to keep the app light.
