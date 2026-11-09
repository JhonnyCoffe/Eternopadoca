# Design: Mercearia Eterno — Layout Redesenhado

Problema: site sem layout, fotos grandes, texto sem formatação, sem botões.

Abordagem: Aplicar `impeccable` com modo Persuade. Design moderno, tema escuro, detalhes em vermelho (`#e11d48`), focado em delivery de alimentos.

Componentes afetados:
- `StoreFront` — layout com container centralizado, imagens limitadas (`max-h-[240px]`), botões visíveis
- `globals.css` — `box-sizing`, `img` limit, `layout-fix`, animações
- `CartDrawer` — layout básico
- `TrackingView` — `text-white`
- `AdminShell` — layout básico

Chamadas: Manter tema escuro existente (`#08080a`), manter Tailwind v4.
