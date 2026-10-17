<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- UI talks to library data only through `src/services` (LibraryService interface); swap the binding there to plug in the C++ core via HTTP. Why: keeps pages backend-agnostic.
- Reservation/cancel/mark-read go through security-definer SQL functions, never direct table writes from users. Why: server-side rule enforcement.
- Signed-in pages live under the `_authenticated` pathless layout (client-only). Why: session is in browser storage.
